import {
  dataUrlToInlineData,
  extractImageDataUrl,
  geminiGenerateContent,
  getGoogleKey
} from "./_gemini.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const key = getGoogleKey();
  if (!key) {
    return res.status(500).json({
      error: "Missing AI API key. Set GOOGLE_AI_API_KEY (or GEMINI_API_KEY / GOOGLE_API_KEY) in server env."
    });
  }

  const { imageDataUrl, name, className, bio } = req.body || {};
  const inlineData = dataUrlToInlineData(imageDataUrl);
  if (!inlineData) {
    return res.status(400).json({ error: "imageDataUrl must be a base64 data URL" });
  }

  const prompt = [
    "Create a transparent-background 8-bit pixel art character portrait for a retro hacker RPG business card.",
    "Use the uploaded person image as the main identity reference.",
    "Keep recognizable high-level traits, but render as playful pixel art, not photorealistic.",
    "Style: black background compatible, crisp pixels, limited palette, Korean hackathon profile card asset.",
    `Name: ${name || "SYSTEM_USER"}.`,
    `Class: ${className || "Designer"}.`,
    `Profile note: ${bio || "interactive business card"}.`,
    "Return only the generated image."
  ].join(" ");

  const body = {
    contents: [
      {
        role: "user",
        parts: [
          { text: prompt },
          { inline_data: inlineData }
        ]
      }
    ]
  };

  const models = [
    "gemini-2.5-flash-image-preview",
    "gemini-2.0-flash-preview-image-generation"
  ];

  let lastError;
  for (const model of models) {
    try {
      const payload = await geminiGenerateContent({ model, key, body });
      const generatedImageDataUrl = extractImageDataUrl(payload);
      if (generatedImageDataUrl) {
        return res.status(200).json({ imageDataUrl: generatedImageDataUrl, model });
      }
      lastError = new Error("No image returned by Gemini");
    } catch (error) {
      lastError = error;
    }
  }

  return res.status(502).json({ error: lastError?.message || "Image generation failed" });
}
