const fs = require("fs");
const dotenv = require("dotenv");
dotenv.config({ path: ".env" });

const mask = (u) =>
  u ? u.replace(/:\/\/([^:]+):[^@]*@/, "://$1:***@") : "(not set)";
const local = fs.existsSync(".env.local")
  ? dotenv.parse(fs.readFileSync(".env.local"))
  : {};

console.log(".env       DATABASE_URL:", mask(process.env.DATABASE_URL));
console.log(".env.local DATABASE_URL:", mask(local.DATABASE_URL));

const postgres = require("postgres");
const sql = postgres(process.env.DATABASE_URL);
sql
  .unsafe("select email, role, active from users")
  .then((rows) => {
    console.table(rows);
    return sql.end();
  })
  .catch((e) => {
    console.error(e.message);
    process.exit(1);
  });
