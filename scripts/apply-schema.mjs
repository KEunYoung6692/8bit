import { readFile } from "node:fs/promises";
import process from "node:process";
import pg from "pg";

const { Client } = pg;

function parseEnv(source) {
  const values = {};

  for (const rawLine of source.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#") || !line.includes("=")) continue;

    const [key, ...rest] = line.split("=");
    values[key.trim()] = rest.join("=").trim().replace(/^['"]|['"]$/g, "");
  }

  return values;
}

const envFile = await readFile(".env", "utf8");
const env = { ...process.env, ...parseEnv(envFile) };
const password = env.password || env.PGPASSWORD || env.SUPABASE_DB_PASSWORD;

const required = ["host", "port", "database", "user"];
const missing = required.filter((key) => !env[key]);
if (!password) missing.push("password");

if (missing.length > 0) {
  console.error(`Missing required DB env value(s): ${missing.join(", ")}`);
  console.error("Add the missing value(s) to .env, then run npm run db:push again.");
  process.exit(1);
}

const sql = await readFile("supabase/schema.sql", "utf8");
const client = new Client({
  host: env.host,
  port: Number(env.port),
  database: env.database,
  user: env.user,
  password,
  ssl: { rejectUnauthorized: false }
});

try {
  await client.connect();
  await client.query(sql);
  console.log("Supabase schema applied successfully.");
} finally {
  await client.end();
}
