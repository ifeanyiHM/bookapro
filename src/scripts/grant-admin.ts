import "dotenv/config";
import bcrypt from "bcryptjs";
import postgres from "postgres";

/**
 * The ONLY way to make an account an administrator. It runs on the server (or any machine that can reach the
 * database), is never reachable from the website, and nothing a visitor can send ever calls it.
 *
 *   npm run admin:grant -- someone@example.com
 *
 * It asks for the admin password (typed, not shown). If the account does not exist yet it also asks for a sign-in
 * password. To run it without prompts (for example from a deployment script) set ADMIN_VERIFY_PASSWORD and, for a
 * new account, ADMIN_LOGIN_PASSWORD.
 *
 * Granting access also signs the account out everywhere, so the admin signs in again with the new role.
 */
const MIN_ADMIN = 12;
const MIN_LOGIN = 10;

function ask(question: string, hidden = false): Promise<string> {
  return new Promise((resolve) => {
    process.stdout.write(question);
    const stdin = process.stdin;
    if (!hidden || !stdin.isTTY) {
      stdin.setEncoding("utf8");
      stdin.once("data", (d) => resolve(String(d).replace(/\r?\n$/, "")));
      stdin.resume();
      return;
    }
    let value = "";
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");
    const onData = (ch: string) => {
      for (const c of ch) {
        if (c === "\u0003") process.exit(1);
        if (c === "\r" || c === "\n") {
          stdin.setRawMode(false);
          stdin.pause();
          stdin.off("data", onData);
          process.stdout.write("\n");
          resolve(value);
          return;
        }
        if (c === "\u007f" || c === "\b") value = value.slice(0, -1);
        else value += c;
      }
    };
    stdin.on("data", onData);
  });
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  const email = (process.argv[2] ?? process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    throw new Error("Usage: npm run admin:grant -- someone@example.com");
  }

  const sql = postgres(url, { max: 1 });
  try {
    const [existing] = await sql<{ id: string; passwordHash: string | null }[]>`
      select id, password_hash as "passwordHash" from users where email = ${email}
    `;
    const adminPassword = process.env.ADMIN_VERIFY_PASSWORD ?? (await ask("Admin password (separate from sign-in): ", true));
    if (adminPassword.length < MIN_ADMIN) throw new Error(`The admin password must be at least ${MIN_ADMIN} characters.`);
    if (new TextEncoder().encode(adminPassword).length > 72) throw new Error("The admin password must be 72 bytes or fewer.");

    let loginHash: string | null = existing?.passwordHash ?? null;
    if (existing) {
      if (loginHash && (await bcrypt.compare(adminPassword, loginHash))) {
        throw new Error("The admin password must be different from this account's sign-in password.");
      }
    } else {
      const loginPassword = process.env.ADMIN_LOGIN_PASSWORD ?? (await ask("This account does not exist yet. Sign-in password for it: ", true));
      if (loginPassword.length < MIN_LOGIN) throw new Error(`The sign-in password must be at least ${MIN_LOGIN} characters.`);
      if (loginPassword === adminPassword) throw new Error("The admin password must be different from the sign-in password.");
      loginHash = await bcrypt.hash(loginPassword, 12);
    }

    const adminHash = await bcrypt.hash(adminPassword, 12);
    await sql`
      insert into users (email, name, password_hash, role, email_verified_at, admin_password_hash)
      values (${email}, 'Admin', ${loginHash}, 'admin', now(), ${adminHash})
      on conflict (email) do update set role = 'admin', email_verified_at = coalesce(users.email_verified_at, now()),
        admin_password_hash = excluded.admin_password_hash, session_version = users.session_version + 1, active = true
    `;
    console.log(`${email} is now an administrator. They must sign in again and then enter the admin password.`);
  } finally {
    await sql.end();
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
