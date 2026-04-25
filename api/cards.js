import { cardFromRow, getPool } from "./_db.js";

const selectColumns = `
  id, name, class_name, role_title, level, hp, status, intent, skills,
  interests, bio, resume_text, avatar_data_url, stats, created_at
`;

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const id = req.query?.id || new URL(req.url, "http://localhost").searchParams.get("id");
      if (!id) return res.status(400).json({ error: "id is required" });

      const pool = getPool();
      const { rows } = await pool.query(
        `select ${selectColumns} from public.cards where id = $1 and is_public = true limit 1`,
        [id]
      );

      if (!rows[0]) return res.status(404).json({ error: "Card not found" });

      await pool.query("select public.increment_card_view($1)", [id]).catch(() => {});
      return res.status(200).json({ card: cardFromRow(rows[0]) });
    }

    if (req.method === "POST") {
      const card = req.body || {};
      const pool = getPool();
      const { rows } = await pool.query(
        `insert into public.cards (
          name, class_name, role_title, level, hp, status, intent, skills,
          interests, bio, resume_text, avatar_data_url, stats, preset_questions
        ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
        returning ${selectColumns}`,
        [
          card.name,
          card.class,
          card.roleTitle,
          card.level || 5,
          card.hp || "92/92",
          card.status || "ONLINE",
          card.intent || "",
          card.skills || [],
          card.interests || [],
          card.bio || "안녕하세요!",
          card.resumeText || "",
          card.avatarDataUrl || null,
          card.stats || {},
          ["HOBBIES", "FOOD", "PROJECTS", "WORK_STYLE"]
        ]
      );

      return res.status(200).json({ card: cardFromRow(rows[0]) });
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message || "Cards API failed" });
  }
}
