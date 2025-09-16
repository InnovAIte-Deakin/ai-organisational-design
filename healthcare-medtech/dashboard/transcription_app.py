# app.py
import os
import sys
import json
import tempfile
from datetime import datetime

from flask import Flask, request, jsonify
from flask_cors import CORS
from threading import Lock
import traceback

#  OneDrive / Graph deps
import requests
import msal
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()
GRAPH_BASE = "https://graph.microsoft.com/v1.0"
TENANT_ID = os.getenv("MS_TENANT_ID", "")
CLIENT_ID = os.getenv("MS_CLIENT_ID", "")
ONEDRIVE_FOLDER = os.getenv("ONEDRIVE_FOLDER", "dentaltranscripts")
TOKEN_CACHE_FILE = os.path.join(os.getcwd(), ".msal_token_cache.json")

transcribe_lock = Lock()
MIN_BYTES = 6000

# Whisper setup
print("[boot] Importing whisper...", flush=True)
try:
    import whisper
except Exception as e:
    print(f"[boot] Failed to import whisper: {e}", file=sys.stderr, flush=True)
    raise

MODEL_NAME = os.getenv("WHISPER_MODEL", "small")
print(f"[boot] Loading Whisper model: {MODEL_NAME}", flush=True)
try:
    model = whisper.load_model(MODEL_NAME)
    print("[boot] Whisper model loaded.", flush=True)
except Exception as e:
    print(f"[boot] Failed to load Whisper model: {e}", file=sys.stderr, flush=True)
    raise

app = Flask(__name__)
CORS(app)

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"ok": True, "time": datetime.utcnow().isoformat() + "Z"})

@app.route("/api/live-transcribe", methods=["POST"])
def live_transcribe():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    f = request.files["file"]
    mimetype = getattr(f, "mimetype", "")
    size_hdr = request.content_length
    print(f"[live] got chunk: mimetype={mimetype} content_length={size_hdr}", flush=True)


    if "webm" in (mimetype or "").lower():
        suffix = ".webm"
    elif "mp4" in (mimetype or "").lower() or "mpeg" in (mimetype or "").lower():
        suffix = ".mp4"
    else:
        suffix = ".bin"

    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        path = tmp.name
        f.save(path)

    try:
        file_bytes = os.path.getsize(path)
        print(f"[live] saved {file_bytes} bytes to {path}", flush=True)

        if file_bytes < MIN_BYTES:
            print("[live] chunk too small -> returning empty transcript", flush=True)
            return jsonify({"transcript": ""}), 200

        with transcribe_lock:
            result = model.transcribe(path, language="en", fp16=False)
        text = (result.get("text") or "").strip()
        print(f"[live] transcript='{text[:80]}'", flush=True)
        return jsonify({"transcript": text}), 200

    except Exception as e:
        print("[live] transcribe failed:", e, flush=True)
        traceback.print_exc()
        return jsonify({"error": f"transcribe failed: {e}"}), 200
    finally:
        try:
            os.remove(path)
        except Exception:
            pass


# MSAL / Graph helpers
def _load_cache():
    cache = msal.SerializableTokenCache()
    if os.path.exists(TOKEN_CACHE_FILE):
        try:
            cache.deserialize(open(TOKEN_CACHE_FILE, "r").read())
        except Exception:
            pass
    return cache

def _save_cache(cache: msal.SerializableTokenCache):
    if cache.has_state_changed:
        with open(TOKEN_CACHE_FILE, "w") as f:
            f.write(cache.serialize())

def _acquire_token(scopes=("Files.ReadWrite", "User.Read")) -> str:
    ...
    if not TENANT_ID or not CLIENT_ID:
        raise RuntimeError("MS_TENANT_ID / MS_CLIENT_ID not set in .env")

    cache = _load_cache()
    pca = msal.PublicClientApplication(
        CLIENT_ID,
        authority=f"https://login.microsoftonline.com/{TENANT_ID}",
        token_cache=cache,
    )


    accounts = pca.get_accounts() or []
    result = None
    if accounts:
        result = pca.acquire_token_silent(list(scopes), account=accounts[0])


    if not result:
        flow = pca.initiate_device_flow(scopes=list(scopes))
        if "user_code" not in flow:
            raise RuntimeError("Failed to create device flow (check tenant/client IDs).")
        print("\n=== Microsoft Sign-in ===")
        print(f"Visit: {flow['verification_uri']}")
        print(f"Enter code: {flow['user_code']}\n")
        result = pca.acquire_token_by_device_flow(flow)  # blocks until complete

    _save_cache(cache)

    if "access_token" not in result:
        raise RuntimeError(f"Token acquisition failed: {result}")
    return result["access_token"]

def _h(token: str):
    return {"Authorization": f"Bearer {token}"}

def _ensure_folder(token: str, folder_name: str) -> dict:
    r = requests.get(f"{GRAPH_BASE}/me/drive/root:/{folder_name}", headers=_h(token))
    if r.status_code == 200:
        return r.json()
    if r.status_code != 404:
        raise RuntimeError(f"Folder fetch failed: {r.status_code} {r.text}")

    payload = {"name": folder_name, "folder": {}, "@microsoft.graph.conflictBehavior": "rename"}
    rc = requests.post(
        f"{GRAPH_BASE}/me/drive/root/children",
        headers={**_h(token), "Content-Type": "application/json"},
        json=payload,
    )
    if rc.status_code in (200, 201):
        return rc.json()
    raise RuntimeError(f"Folder create failed: {rc.status_code} {rc.text}")

def _upload_json(token: str, folder_name: str, filename: str, data: dict) -> dict:
    url = f"{GRAPH_BASE}/me/drive/root:/{folder_name}/{filename}:/content"
    body = json.dumps(data, ensure_ascii=False, indent=2).encode("utf-8")
    r = requests.put(url, headers=_h(token), data=body)
    if r.status_code in (200, 201):
        return r.json()
    if r.status_code == 404:
        _ensure_folder(token, folder_name)
        r2 = requests.put(url, headers=_h(token), data=body)
        if r2.status_code in (200, 201):
            return r2.json()
        raise RuntimeError(f"Upload failed after creating folder: {r2.status_code} {r2.text}")
    raise RuntimeError(f"Upload failed: {r.status_code} {r.text}")


#  OneDrive save endpoint (Graph-first; fallback to local_out)
@app.route("/api/save-to-onedrive", methods=["POST"])
def save_to_onedrive():
    payload = request.get_json(silent=True) or {}
    transcription = (payload.get("transcription") or "").strip()
    treatment_notes = payload.get("treatmentNotes")

    if not transcription:
        return jsonify({"error": "Missing 'transcription'"}), 400

    doc = {
        "transcription": transcription,
        "treatmentNotes": treatment_notes,
        "generatedAt": datetime.utcnow().isoformat() + "Z",
    }
    fname = f"treatment-notes-{datetime.utcnow().strftime('%Y%m%dT%H%M%SZ')}.json"

    # Try OneDrive first
    try:
        token = _acquire_token()
        _ensure_folder(token, ONEDRIVE_FOLDER)
        item = _upload_json(token, ONEDRIVE_FOLDER, fname, doc)
        return jsonify({
            "ok": True,
            "provider": "onedrive",
            "folder": ONEDRIVE_FOLDER,
            "name": item.get("name"),
            "id": item.get("id"),
            "webUrl": item.get("webUrl"),
            "path": f"/{ONEDRIVE_FOLDER}/{item.get('name')}",
        }), 200

    except Exception as e:
        # Fallback to local so your app never crashes
        outdir = os.path.join(os.getcwd(), "local_out")
        os.makedirs(outdir, exist_ok=True)
        with open(os.path.join(outdir, fname), "w", encoding="utf-8") as fh:
            json.dump(doc, fh, ensure_ascii=False, indent=2)
        return jsonify({
            "ok": True,
            "provider": "local",
            "filename": fname,
            "where": "local_out/",
            "note": f"Graph upload failed: {e}",
        }), 200


if __name__ == "__main__":
    host = "0.0.0.0"
    port = int(os.getenv("PORT", "5002"))
    print(f"[boot] Starting Flask on http://{host}:{port}", flush=True)
    # Make sure you have ffmpeg installed; whisper uses it under the hood.
    app.run(host=host, port=port, debug=True)
