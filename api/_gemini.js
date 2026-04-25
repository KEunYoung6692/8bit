const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta";

export function getGoogleKey() {
  return (
    process.env.GOOGLE_AI_API_KEY ||
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.GOOGLEA_AI_API ||
    ""
  ).trim();
}

export function dataUrlToInlineData(dataUrl) {
  const match = /^data:([^;]+);base64,(.+)$/.exec(dataUrl || "");
  if (!match) return null;

  return {
    mimeType: match[1],
    data: match[2]
  };
}

export async function geminiGenerateContent({ model, key, body }) {
  const response = await fetch(`${GEMINI_API_BASE}/models/${model}:generateContent?key=${key}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = payload?.error?.message || `Gemini request failed with ${response.status}`;
    throw new Error(message);
  }

  return payload;
}

export function extractText(payload) {
  const parts = payload?.candidates?.[0]?.content?.parts || [];
  return parts.map((part) => part.text || "").join("").trim();
}

export function extractImageDataUrl(payload) {
  const parts = payload?.candidates?.[0]?.content?.parts || [];
  const imagePart = parts.find((part) => part.inlineData || part.inline_data);
  const inlineData = imagePart?.inlineData || imagePart?.inline_data;

  if (!inlineData?.data) return "";

  const mimeType = inlineData.mimeType || inlineData.mime_type || "image/png";
  return `data:${mimeType};base64,${inlineData.data}`;
}
