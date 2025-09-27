export async function callN8n({ sessionId, text }) {
  const url = import.meta.env.VITE_N8N_WEBHOOK_URL;
  if (!url) throw new Error("Missing VITE_N8N_WEBHOOK_URL in .env");

  const headers = { "Content-Type": "application/json" };
  const basic = import.meta.env.VITE_N8N_BASIC_AUTH;
  if (basic) headers["Authorization"] = basic;

  const body = {
    sessionId,
    text,
    source: "web",
    ts: new Date().toISOString(),
  };

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Webhook error ${res.status}: ${errText || res.statusText}`);
  }

  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
  const data = await res.json();

  // Nếu n8n trả về [ { reply, ... } ], lấy phần tử đầu
  const obj = Array.isArray(data) ? (data[0] || {}) : data;

  return (
    obj.reply ||
    obj.response ||
    obj.message ||
    obj.text ||
    JSON.stringify(data)
  );
}
  return await res.text();
}
