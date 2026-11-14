# BookAPro

Book a plumber, electrician, AC technician or cleaner in Lagos by area and arrival window, and pay online with Paystack. Large or new-build jobs go through a separate "Contact our team" enquiry form that is independent of booking.

Stack: Next.js 16 (App Router, frontend and backend), TypeScript, Tailwind CSS v4, Postgres, Nodemailer, Paystack.

## Setup (PowerShell)

```powershell
copy .env.example .env
# edit .env (see below)
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

Open http://localhost:3000. Everyone signs in at /login. To get the first administrator, set `ADMIN_EMAIL`, `ADMIN_PASSWORD` and `ADMIN_VERIFY_PASSWORD` in `.env` before `npm run db:seed`, or run `npm run admin:grant -- you@example.com` (see Accounts below).

## Environment variables

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Postgres connection string |
| `NEXT_PUBLIC_SITE_URL` | Public URL, used in emails, Paystack callback, sitemap |
| `SESSION_SECRET` | 32+ random characters, signs sessions, admin proof and booking-access cookies |
| `PAYSTACK_SECRET_KEY` | Paystack secret key. If blank outside production, a demo payment page (`/dev/pay`) is used |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | Nodemailer. If `SMTP_HOST` is blank, emails are printed to the server console |
| `MAIL_FROM` | Sender, e.g. `BookAPro <no-reply@yourdomain.com>` |
| `MAIL_TEAM_TO` | Where enquiries and new-booking alerts go |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_VERIFY_PASSWORD` | First admin, created by `db:seed`. The verify password is the separate one asked for after sign-in |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Optional. The Google buttons appear only when both are set |

Paystack: set the webhook URL in your Paystack dashboard to `https://YOUR-DOMAIN/api/paystack/webhook`, and the callback is `/api/paystack/callback`.

## Before you go live

- **Services, prices and areas are sample data.** The ten areas are real Lagos areas; the ten services and their prices are placeholders. Edit them in Admin > Services. The seed never overwrites existing services.
- `SEED_DEMO=1 npm run db:seed` creates demo technicians (password `demo-password-123`). Never run it in production; delete them if you did.
- Cancellation and refund wording is minimal ("email us with your reference"). Decide your real policy and update the booking pages.
- Set a long random `SESSION_SECRET`, and use HTTPS.

## Accounts and sign-in

- **Register** with email and password (nothing else), or with Google. **Confirm the email** from the link we send (single-use, expires in 24 hours, stored hashed). The link opens a page with a confirm button, so email scanners that pre-open links cannot use it up.
- Then **choose a role**: customer or technician. Admin is not an option anywhere in the website. The role can be changed only until a profile has been completed.
- **Customers** add a name and phone number. Browsing and starting a booking need no account; paying needs a verified, role-chosen, profiled customer. The server enforces this on `/api/bookings`, not just the page.
- **Booking progress is kept** in a server-side draft (httpOnly cookie, also tied to the account after sign-in), so it survives sign-up, email confirmation and profile completion, even in another tab or device.
- **Technicians** submit a professional profile plus a government ID and a certificate or reference letter (PDF, JPG or PNG, 3 MB each, type checked from the file's own bytes). They then wait for an admin to approve or reject (Admin > Applications). Only **approved** technicians reach `/technician` and count towards availability or can be assigned jobs. A rejected applicant sees the reason and can resubmit. All steps send email through Nodemailer.
- **Admins** are made only on the server: `npm run admin:grant -- someone@example.com` prompts for a separate admin password (12+ characters, different from the sign-in password), hashes it, and signs that account out everywhere. After the normal sign-in, an admin must enter that password before any `/admin` page, action or download works (valid 2 hours). Non-admins sent to `/admin` are returned to the page they came from, or the homepage.
- **Forgot/reset password**: single-use link, 1 hour. Resetting signs the account out on every device and emails a notice.
- Every protected page, server action and route handler re-checks the account in the database, so a deactivated account, a demoted admin or a changed password loses access immediately. Rate limits (sign-in, register, reset, resend, admin password, uploads, booking) are stored in Postgres, so they hold across several server instances.

### Google sign-in setup

Create an OAuth client at console.cloud.google.com, add `<NEXT_PUBLIC_SITE_URL>/api/auth/google/callback` as an authorised redirect URI, and set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`. We accept only an email that Google itself reports as verified, and treat that as the email-verification step; people then go through role selection and profile completion like everyone else. If an existing account that never confirmed its email is linked this way, its password is removed.

## How booking works

- Three arrival windows per day (8-11, 11-2, 2-5, Lagos time), 3-hour minimum lead, 14-day horizon.
- Capacity for a slot = approved, active technicians who cover the service category and area, minus bookings holding that slot. Unpaid bookings hold a slot for 30 minutes. Capacity checks run under a Postgres advisory lock so two customers cannot take the last slot.
- Prices are computed on the server in kobo; the client never sends an amount, or the customer's name, phone or email (those come from the account). Payments are confirmed idempotently from both the callback and the webhook (HMAC-SHA512 verified).
- Customers see their bookings under My account. `/booking` (reference + phone lookup) still works for people who are not signed in.

## Known limitations

- Technician documents (IDs) are stored in Postgres and shown only to admins. They are personal data: add a privacy notice, decide how long you keep them, and check your obligations under the NDPR before going live.
- Google sign-in, real email delivery and real Paystack payments were not tested against the live services. The Google account-linking rules and the token rules were tested with the real database.
- There is no two-factor authentication beyond the separate admin password, and no "sign out everywhere" button (a password reset does it).
- Someone could register another person's email address and set a password before the owner does. The owner is protected if they use Google (the password is removed when it links) or reset the password, but an owner who simply clicks the verification link would share the account with that person. Account-takeover protection for this case would need an email-first sign-up (set the password only after confirming). Say if you want that.
- A payment can still arrive after a hold expired. It is flagged "paid late" in the booking history so an admin can refund or reassign.
- Refunds and technician payouts are manual.
- Inspect-then-quote jobs are not built. Large jobs use the enquiry form.
- Services, prices and areas are sample data; the cancellation and refund wording needs your real policy.
