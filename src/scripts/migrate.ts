import "dotenv/config";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import postgres from "postgres";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  const sql = postgres(url, { max: 1 });
  const schema = readFileSync(join(process.cwd(), "src/lib/db-schema.sql"), "utf8");
  await sql.unsafe(schema);
  await sql.end();
  console.log("Database schema is up to date.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
