import "dotenv/config";
import bcrypt from "bcryptjs";
import postgres from "postgres";

/**
 * SAMPLE DATA. The areas are real Lagos neighbourhoods, but the services, descriptions and prices below
 * are placeholders so the site has something to show. Review and edit them in the admin before launch.
 * Existing rows are never overwritten, so your edits survive re-running this script.
 */
const AREAS = [
  "Lekki Phase 1",
  "Ajah",
  "Victoria Island",
  "Ikoyi",
  "Yaba",
  "Surulere",
  "Ikeja GRA",
  "Maryland",
  "Gbagada",
  "Magodo",
];

interface SeedService {
  slug: string;
  name: string;
  category: "ac" | "electrical" | "plumbing" | "cleaning";
  summary: string;
  description: string;
  includes: string[];
  naira: number;
  minutes: number;
}

const SERVICES: SeedService[] = [
  {
    slug: "split-ac-service",
    name: "Split AC service, 1 unit",
    category: "ac",
    summary: "Clean and check one split unit so it cools properly again.",
    description:
      "A routine service for one split air conditioner. The technician cleans the unit, checks it is cooling, and tells you if it needs a repair that is outside this price.",
    includes: ["Indoor unit and filter cleaning", "Outdoor unit wash", "Drain line check", "Cooling performance check"],
    naira: 15000,
    minutes: 90,
  },
  {
    slug: "split-ac-installation",
    name: "Split AC installation, 1 unit",
    category: "ac",
    summary: "Labour to mount and start up one split unit.",
    description:
      "Labour for fitting one split unit where the wall, power point and pipe route are already prepared. Materials such as brackets, pipes and cable are not included.",
    includes: ["Mounting indoor and outdoor units", "Pipe and cable connection", "Leak test and start-up"],
    naira: 35000,
    minutes: 180,
  },
  {
    slug: "ceiling-fan-installation",
    name: "Ceiling fan installation",
    category: "electrical",
    summary: "Fit one ceiling fan on an existing ceiling point.",
    description: "Installation of one ceiling fan that you supply, on a ceiling point that already has power.",
    includes: ["Mounting and wiring one fan", "Speed regulator connection", "Wobble and noise check"],
    naira: 8000,
    minutes: 60,
  },
  {
    slug: "socket-switch-replacement",
    name: "Socket or switch replacement, up to 3",
    category: "electrical",
    summary: "Swap damaged sockets or switches for new ones you supply.",
    description: "Replacement of up to three sockets or switches with new ones that you supply.",
    includes: ["Safe isolation of the circuit", "Replacement of up to 3 points", "Test of each point"],
    naira: 7000,
    minutes: 60,
  },
  {
    slug: "light-fitting-installation",
    name: "Light fitting installation, up to 3",
    category: "electrical",
    summary: "Fit up to three ceiling or wall lights you supply.",
    description: "Installation of up to three light fittings that you supply, on existing wiring points.",
    includes: ["Mounting and wiring up to 3 fittings", "Bulb and switch test"],
    naira: 8000,
    minutes: 60,
  },
  {
    slug: "tap-mixer-replacement",
    name: "Tap or mixer replacement",
    category: "plumbing",
    summary: "Replace one tap or mixer you supply.",
    description: "Removal of one old tap or mixer and fitting of a new one that you supply.",
    includes: ["Removal of the old tap", "Fitting and sealing the new tap", "Leak check"],
    naira: 9000,
    minutes: 60,
  },
  {
    slug: "water-heater-installation",
    name: "Water heater installation, 1 unit",
    category: "plumbing",
    summary: "Mount and connect one water heater you supply.",
    description: "Mounting and connecting one water heater that you supply, with the power and water points already in place.",
    includes: ["Wall mounting", "Water connection", "Pressure and leak check"],
    naira: 14000,
    minutes: 90,
  },
  {
    slug: "drain-clearing",
    name: "Blocked drain clearing, 1 drain",
    category: "plumbing",
    summary: "Clear one blocked sink, basin or floor drain.",
    description: "Clearing of one blocked sink, basin or floor drain. If the blockage is in the main line, the technician will tell you and the job needs a separate quote.",
    includes: ["Clearing of one drain", "Flow test"],
    naira: 12000,
    minutes: 90,
  },
  {
    slug: "home-cleaning-2-bedroom",
    name: "Home cleaning, up to 2 bedrooms",
    category: "cleaning",
    summary: "A standard clean for a flat of up to two bedrooms.",
    description: "A standard clean of a home with up to two bedrooms, one living area, a kitchen and up to two bathrooms.",
    includes: ["Floors, surfaces and dusting", "Kitchen and bathroom clean", "Rubbish bagged for removal"],
    naira: 35000,
    minutes: 240,
  },
  {
    slug: "sofa-mattress-cleaning",
    name: "Sofa or mattress cleaning",
    category: "cleaning",
    summary: "Deep clean for one sofa set or one mattress.",
    description: "Deep cleaning of one sofa set or one mattress. Drying time depends on the fabric and the weather.",
    includes: ["Vacuum and stain treatment", "Deep clean", "Deodorising"],
    naira: 25000,
    minutes: 120,
  },
];

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  const sql = postgres(url, { max: 1 });

  for (const [i, name] of AREAS.entries()) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    await sql`insert into areas (slug, name, sort) values (${slug}, ${name}, ${i}) on conflict (slug) do nothing`;
  }

  for (const [i, s] of SERVICES.entries()) {
    await sql`
      insert into services (slug, name, category, summary, description, includes, price_kobo, duration_minutes, sort)
      values (${s.slug}, ${s.name}, ${s.category}, ${s.summary}, ${s.description}, ${s.includes},
        ${s.naira * 100}, ${s.minutes}, ${i})
      on conflict (slug) do nothing
    `;
  }

  // Admin accounts are never created through the website. For a first install you can set the three variables
  // below and run the seed, or run `npm run admin:grant -- you@example.com` at any time. Both are server-side only.
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminVerify = process.env.ADMIN_VERIFY_PASSWORD;
  if (adminEmail && adminPassword && adminVerify) {
    if (adminPassword.length < 10) throw new Error("ADMIN_PASSWORD must be at least 10 characters");
    if (adminVerify.length < 12) throw new Error("ADMIN_VERIFY_PASSWORD must be at least 12 characters");
    if (adminVerify === adminPassword) throw new Error("ADMIN_VERIFY_PASSWORD must differ from ADMIN_PASSWORD");
    const hash = await bcrypt.hash(adminPassword, 12);
    const verifyHash = await bcrypt.hash(adminVerify, 12);
    await sql`
      insert into users (email, name, password_hash, role, email_verified_at, admin_password_hash)
      values (${adminEmail}, 'Admin', ${hash}, 'admin', now(), ${verifyHash})
      on conflict (email) do nothing
    `;
    console.log(`Admin account ready: ${adminEmail} (an existing account is left unchanged; use admin:grant to change it)`);
  } else {
    console.log("ADMIN_EMAIL, ADMIN_PASSWORD and ADMIN_VERIFY_PASSWORD not all set: no admin account was created.");
  }

  if (process.env.SEED_DEMO === "1") {
    const hash = await bcrypt.hash("demo-password-123", 12);
    const areas = await sql<{ id: number }[]>`select id from areas`;
    for (const t of [
      { email: "tech1@example.test", name: "Demo Technician One" },
      { email: "tech2@example.test", name: "Demo Technician Two" },
    ]) {
      const [u] = await sql<{ id: string }[]>`
        insert into users (email, name, phone, password_hash, role, skills, email_verified_at)
        values (${t.email}, ${t.name}, '+2348031234567', ${hash}, 'technician', ${["ac", "electrical", "plumbing", "cleaning"]}, now())
        on conflict (email) do update set name = excluded.name
        returning id
      `;
      await sql`insert into technician_profiles (user_id, full_name, phone, years_experience, bio) values (${u.id}, ${t.name}, '+2348031234567', 5, 'Demo account') on conflict do nothing`;
      await sql`insert into technician_applications (user_id, status, reviewed_at) values (${u.id}, 'approved', now()) on conflict do nothing`;
      for (const a of areas) {
        await sql`insert into technician_areas (user_id, area_id) values (${u.id}, ${a.id}) on conflict do nothing`;
      }
    }
    console.log("Demo technicians created (password: demo-password-123). Remove them before launch.");
  }

  await sql.end();
  console.log("Seed complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
