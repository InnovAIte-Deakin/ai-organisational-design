import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast"; 
import { Mic, Square, Bot } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface TreatmentNotes {
  chief_complaint: string;
  examination: string;
  diagnosis: string;
  treatment_plan: string;
}

function dedupeAppend(prev: string, next: string, overlapWords = 8) {
  const p = prev.trim();
  const n = next.trim();
  if (!p) return n;
  const pWords = p.split(/\s+/);
  const tail = pWords.slice(-overlapWords).join(" ");
  const idx = n.toLowerCase().indexOf(tail.toLowerCase());
  if (idx === 0) return (p + " " + n.slice(tail.length)).trim();
  if (p.toLowerCase().includes(n.toLowerCase())) return p;
  return (p + " " + n).trim();
}

function pickBestMime(): { mimeType?: string; ext: "ogg" | "webm" } {
  const supports = (t: string) =>
    typeof MediaRecorder !== "undefined" &&
    typeof MediaRecorder.isTypeSupported === "function" &&
    MediaRecorder.isTypeSupported(t);

  if (supports("audio/ogg;codecs=opus")) return { mimeType: "audio/ogg;codecs=opus", ext: "ogg" };
  if (supports("audio/webm;codecs=opus")) return { mimeType: "audio/webm;codecs=opus", ext: "webm" };
  if (supports("audio/webm")) return { mimeType: "audio/webm", ext: "webm" };
  return { ext: "webm" };
}

// 🔧 Ensure both calls go to Flask (5002)
const API_BASE = import.meta?.env?.VITE_API_BASE ?? "http://127.0.0.1:5002";

export default function Transcription() {
  const [isRecording, setIsRecording] = useState(false);
  const [finalText, setFinalText] = useState("");
  const [treatmentNotes, setTreatmentNotes] = useState<TreatmentNotes | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const segTimerRef = useRef<number | null>(null);
  const chosenExtRef = useRef<"ogg" | "webm">("webm");
  const { mimeType } = pickBestMime(); 
  const { toast } = useToast();

  const processTranscriptionMutation = useMutation({
    mutationFn: async (transcription: string) => {
      const appointment: any = await apiRequest("POST", "/api/appointments", {
        patientId: "temp-patient",
        appointmentDate: new Date().toISOString(),
        type: "transcription",
        status: "completed",
      });
      const result = await apiRequest(
        `/api/appointments/${appointment.id}/transcription`,
        "POST",
        { transcription }
      );
      return result;
    },
    onSuccess: (data: any) => {
      if (data.treatmentNotes) {
        setTreatmentNotes(data.treatmentNotes);
        toast({ title: "Success", description: "Transcription processed and treatment notes generated" });
      } else {
        toast({ title: "Success", description: "Transcription processed" });
      }
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to process transcription", variant: "destructive" });
    },
  });

  
  const SLICE_MS = 5000; 

  const sendChunk = async (blob: Blob) => {
    if (!blob || !blob.size) return;
    const ext = chosenExtRef.current;
    const form = new FormData();
    form.append("file", blob, `chunk-${Date.now()}.${ext}`);

    try {
      const res = await fetch(`${API_BASE}/api/live-transcribe`, { method: "POST", body: form });
      const json = await res.json();
      if (json?.transcript && typeof json.transcript === "string" && json.transcript.trim()) {
        setFinalText(prev => dedupeAppend(prev, json.transcript));
      }
    } catch (err) {
      console.error("Live transcription error:", err);
    }
  };

  const startNewSegment = () => {
    const stream = streamRef.current!;
    // Decide extension on first successful recorder creation
    if (mimeType?.includes("ogg")) chosenExtRef.current = "ogg";
    else chosenExtRef.current = "webm";

    const rec = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
    recorderRef.current = rec;

    rec.ondataavailable = (e: BlobEvent) => {
      void sendChunk(e.data);
    };

    rec.onstart = () => {
      segTimerRef.current = window.setTimeout(() => {
        try { rec.requestData(); } catch {}
        try { rec.stop(); } catch {}
        startNewSegment(); 
      }, SLICE_MS) as unknown as number;
    };

    rec.onerror = (ev) => {
      console.error("Recorder error", ev);
      toast({ title: "Recording error", description: "An error occurred.", variant: "destructive" });
    };

    rec.start(); 
  };

  const startRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      toast({ title: "Microphone not supported", description: "Use Chrome/Edge.", variant: "destructive" });
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      setFinalText("");
      setIsRecording(true);
      toast({ title: "Recording Started", description: "Live transcription enabled." });

      startNewSegment();
    } catch (err) {
      console.error("getUserMedia error", err);
      toast({ title: "Microphone blocked", description: "Allow access.", variant: "destructive" });
    }
  };

  const stopRecording = () => {
    if (segTimerRef.current) { clearTimeout(segTimerRef.current); segTimerRef.current = null; }
    const rec = recorderRef.current;
    if (rec && rec.state !== "inactive") {
      try { rec.requestData(); } catch {}
      try { rec.stop(); } catch {}
    }
    recorderRef.current = null;

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }

    setIsRecording(false);
    toast({ title: "Recording Stopped", description: "Live transcription complete." });
  };

  const toggleRecording = () => (isRecording ? stopRecording() : startRecording());

  const handleProcessTranscription = () => {
    const transcript = finalText.trim();
    if (!transcript) {
      toast({ title: "Error", description: "Record audio first.", variant: "destructive" });
      return;
    }
    processTranscriptionMutation.mutate(transcript);
  };

  const handleFinalizeAndSave = async () => {
    const transcript = finalText.trim();
    if (!transcript) {
      toast({ title: "Error", description: "Record audio first.", variant: "destructive" });
      return;
    }
    const body = { transcription: transcript, treatmentNotes: treatmentNotes ?? undefined };

    try {
      setIsSaving(true);
      const res = await fetch(`${API_BASE}/api/save-to-onedrive`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await res.json();
      if (!res.ok || !json?.ok) throw new Error(json?.note || "Upload failed");

      if (json.provider === "onedrive") {
        toast({
          title: "Saved to OneDrive",
          description: `Folder: ${json.folder}\nFile: ${json.name}`,
          action: json.webUrl ? (
            <ToastAction
              altText="Open in OneDrive"
              onClick={() => window.open(json.webUrl, "_blank", "noopener,noreferrer")}
            >
              Open
            </ToastAction>
          ) : undefined,
        });
      } else {
        toast({
          title: "Saved locally",
          description: `File: ${json.filename} • ${json.where}${json.note ? `\nNote: ${json.note}` : ""}`,
        });
      }
    } catch (e: any) {
      toast({ title: "Save failed", description: e?.message || "Check server / Graph credentials.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    return () => {
      try { if (segTimerRef.current) clearTimeout(segTimerRef.current); } catch {}
      try {
        const rec = recorderRef.current;
        if (rec && rec.state !== "inactive") { rec.requestData(); rec.stop(); }
      } catch {}
      try { streamRef.current?.getTracks().forEach(t => t.stop()); } catch {}
    };
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Voice Recording */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Dental Appointment Notes</h3>
          <div className="text-center mb-6">
            <Button
              onClick={toggleRecording}
              className={`w-16 h-16 rounded-full text-2xl mb-4 ${isRecording ? "bg-red-700" : "bg-red-600"}`}
            >
              {isRecording ? <Square className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
            </Button>
            <p className="text-sm text-gray-600">{isRecording ? "Recording…" : "Click to start recording"}</p>
            <div className="border p-3 rounded bg-gray-50 min-h-24 mt-4 text-sm text-gray-700">
              {finalText || <span className="text-gray-400">Live transcription will appear here...</span>}
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleProcessTranscription} disabled={!finalText}>
              <Bot className="h-4 w-4 mr-2" /> Process with AI
            </Button>
            <Button onClick={handleFinalizeAndSave} disabled={!finalText || isSaving}>
              {isSaving ? "Saving…" : "Save to OneDrive"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI-generated Treatment Notes */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">AI-Generated Treatment Notes</h3>
          {["chief_complaint", "examination", "diagnosis", "treatment_plan"].map(field => (
            <div key={field} className="border p-4 rounded mb-4">
              <h4 className="text-sm font-semibold text-medical-blue-900 mb-2">
                {field.replace("_", " ").toUpperCase()}
              </h4>
              <div className="min-h-16 text-sm text-gray-700 bg-gray-50 p-3 rounded">
                {treatmentNotes?.[field as keyof TreatmentNotes] || <span className="text-gray-400">AI will generate...</span>}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
