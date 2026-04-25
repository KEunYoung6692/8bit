import { extractText, geminiGenerateContent, getGoogleKey } from "./_gemini.js";

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

  const { question, profile } = req.body || {};
  if (!question || !profile) {
    return res.status(400).json({ error: "question and profile are required" });
  }

  const context = {
    name: profile.name,
    class: profile.class,
    roleTitle: profile.roleTitle,
    skills: profile.skills,
    interests: profile.interests,
    bio: profile.bio,
    resumeText: profile.resumeText
  };

  const prompt = [
    "You are the terminal persona inside an 8-bit interactive business card.",
    "Answer in Korean, in first person as the profile owner, using only the provided profile/resume context.",
    "If the answer is not present, say that the data is not registered yet and suggest what could be asked instead.",
    "Keep it concise: 2-4 sentences. Prefix with > like a terminal response.",
    "",
    "PROFILE_CONTEXT:",
    JSON.stringify(context, null, 2),
    "",
    `VISITOR_QUESTION: ${question}`
  ].join("\n");

  const body = {
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }]
      }
    ],
    generationConfig: {
      temperature: 0.45,
      maxOutputTokens: 420
    }
  };

  const models = ["gemini-2.5-flash", "gemini-2.0-flash"];
  let lastError;

  for (const model of models) {
    try {
      const payload = await geminiGenerateContent({ model, key, body });
      const text = extractText(payload);
      if (text) return res.status(200).json({ answer: text, model });
      lastError = new Error("No text returned by Gemini");
    } catch (error) {
      lastError = error;
    }
  }

  return res.status(502).json({ error: lastError?.message || "Chat generation failed" });
}
