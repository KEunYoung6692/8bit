import pg from "pg";

const { Pool } = pg;

let pool;

export function getPool() {
  if (pool) return pool;

  const password = process.env.password || process.env.PGPASSWORD || process.env.SUPABASE_DB_PASSWORD;
  const required = ["host", "port", "database", "user"];
  const missing = required.filter((key) => !process.env[key]);
  if (!password) missing.push("password");

  if (missing.length > 0) {
    throw new Error(`Missing DB env value(s): ${missing.join(", ")}`);
  }

  pool = new Pool({
    host: process.env.host,
    port: Number(process.env.port),
    database: process.env.database,
    user: process.env.user,
    password,
    ssl: { rejectUnauthorized: false },
    max: 3
  });

  return pool;
}

export function cardFromRow(row) {
  return {
    id: row.id,
    name: row.name,
    class: row.class_name,
    roleTitle: row.role_title,
    level: row.level,
    hp: row.hp,
    status: row.status,
    intent: row.intent,
    skills: row.skills || [],
    interests: row.interests || [],
    bio: row.bio,
    resumeText: row.resume_text || "",
    avatarDataUrl: row.avatar_data_url || "",
    stats: row.stats || {},
    createdAt: row.created_at
  };
}
