import postgres from "postgres";

type Sql = postgres.Sql;

const globalForSql = globalThis as unknown as { __sql?: Sql };

/** Lazy, so `next build` doesn't need a database. Dates stay as "YYYY-MM-DD" strings; columns are camelCased. */
export function db(): Sql {
  if (globalForSql.__sql) return globalForSql.__sql;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set. Copy .env.example to .env and fill it in.");
  const sql = postgres(url, {
    max: 10,
    transform: postgres.camel,
    types: {
      date: { to: 1082, from: [1082], serialize: (x: unknown) => String(x), parse: (x: string) => x },
    },
  }) as unknown as Sql;
  globalForSql.__sql = sql;
  return sql;
}
