import { getPool } from "./_db.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { cardId, questionType, question, response } = req.body || {};
    if (!cardId || !question || !response) {
      return res.status(400).json({ error: "cardId, question, and response are required" });
    }

    const pool = getPool();
    await pool.query(
      `insert into public.chat_events (card_id, question_type, question, response)
       values ($1, $2, $3, $4)`,
      [cardId, questionType || "CUSTOM", String(question).slice(0, 512), String(response).slice(0, 2000)]
    );

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message || "Chat event API failed" });
  }
}
