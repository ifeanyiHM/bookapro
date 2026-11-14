import { SITE } from "@/config/site";
import type { Booking, Enquiry } from "@/types";
import { escapeHtml as e } from "./html";
import { formatDayLong, formatNaira, windowLabel } from "./format";
import { ENQUIRY_PROJECT_TYPES, ENQUIRY_TRADES } from "./validation";
import type { Mail } from "./mail";

function shell(title: string, body: string): string {
  return `<!doctype html><html><body style="margin:0;background:#f5f2ea;font-family:Arial,Helvetica,sans-serif;color:#15181c;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border:1px solid #ddd7ca;border-radius:6px;">
<tr><td style="padding:20px 24px;border-bottom:1px dashed #b9b2a2;font-size:18px;font-weight:bold;color:#0f5e73;">${e(SITE.name)}</td></tr>
<tr><td style="padding:24px;font-size:15px;line-height:1.55;"><h1 style="margin:0 0 12px;font-size:20px;">${e(title)}</h1>${body}</td></tr>
</table></td></tr></table></body></html>`;
}

function rows(pairs: [string, string][]): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;border-top:1px solid #ddd7ca;">${pairs
    .map(
      ([k, v]) =>
        `<tr><td style="padding:8px 0;border-bottom:1px solid #ece8dd;color:#5b6068;width:36%;">${e(k)}</td><td style="padding:8px 0;border-bottom:1px solid #ece8dd;font-weight:bold;">${e(v)}</td></tr>`,
    )
    .join("")}</table>`;
}

function bookingPairs(b: Booking): [string, string][] {
  return [
    ["Reference", b.ref],
    ["Service", b.serviceName],
    ["Area", b.areaName],
    ["Date", formatDayLong(b.slotDate)],
    ["Arrival window", windowLabel(b.slotWindow)],
    ["Address", b.landmark ? `${b.address} (${b.landmark})` : b.address],
    ["Price", formatNaira(b.priceKobo)],
  ];
}

function text(pairs: [string, string][]): string {
  return pairs.map(([k, v]) => `${k}: ${v}`).join("\n");
}

export function bookingConfirmedEmail(b: Booking): Mail {
  const pairs = bookingPairs(b);
  const link = `${SITE.url}/booking`;
  return {
    to: b.customerEmail,
    subject: `Booking ${b.ref} confirmed: ${b.serviceName}`,
    html: shell(
      "Your booking is confirmed",
      `<p>Hello ${e(b.customerName)}, we have received your payment. A technician will be assigned and you will get another email when they are.</p>${rows(pairs)}<p>To check this booking, use the reference above and the phone number you booked with at <a href="${link}">${e(link)}</a>.</p>`,
    ),
    text: `Hello ${b.customerName}, we have received your payment.\n\n${text(pairs)}\n\nCheck your booking: ${link}`,
    replyTo: SITE.teamEmail || undefined,
  };
}

export function teamNewBookingEmail(b: Booking, to: string): Mail {
  const pairs: [string, string][] = [
    ...bookingPairs(b),
    ["Customer", `${b.customerName}, ${b.customerPhone}, ${b.customerEmail}`],
    ...(b.notes ? ([["Notes", b.notes]] as [string, string][]) : []),
  ];
  const link = `${SITE.url}/admin/bookings/${b.id}`;
  return {
    to,
    subject: `New paid booking ${b.ref}: ${b.serviceName}`,
    html: shell("New paid booking: assign a technician", `${rows(pairs)}<p><a href="${link}">Open in admin</a></p>`),
    text: `${text(pairs)}\n\nOpen in admin: ${link}`,
  };
}

export function technicianAssignedEmail(b: Booking, techName: string, to: string): Mail {
  const pairs: [string, string][] = [
    ...bookingPairs(b).filter(([k]) => k !== "Price"),
    ["Customer", `${b.customerName}, ${b.customerPhone}`],
    ...(b.notes ? ([["Notes", b.notes]] as [string, string][]) : []),
  ];
  const link = `${SITE.url}/technician`;
  return {
    to,
    subject: `New job ${b.ref}: ${b.serviceName}`,
    html: shell(`New job for ${techName}`, `${rows(pairs)}<p><a href="${link}">Open your jobs</a></p>`),
    text: `New job for ${techName}\n\n${text(pairs)}\n\nYour jobs: ${link}`,
  };
}

export function customerTechnicianAssignedEmail(b: Booking, techName: string): Mail {
  const pairs = bookingPairs(b).filter(([k]) => k !== "Price");
  return {
    to: b.customerEmail,
    subject: `Technician assigned to ${b.ref}`,
    html: shell(
      "A technician is assigned",
      `<p>${e(techName)} will visit during your arrival window.</p>${rows(pairs)}`,
    ),
    text: `${techName} will visit during your arrival window.\n\n${text(pairs)}`,
    replyTo: SITE.teamEmail || undefined,
  };
}

export function bookingCompletedEmail(b: Booking): Mail {
  return {
    to: b.customerEmail,
    subject: `Booking ${b.ref} completed`,
    html: shell("Job completed", `<p>Hello ${e(b.customerName)}, your ${e(b.serviceName)} job is marked completed.</p>${rows(bookingPairs(b))}`),
    text: `Your ${b.serviceName} job (${b.ref}) is marked completed.`,
    replyTo: SITE.teamEmail || undefined,
  };
}

export function bookingCancelledEmail(b: Booking): Mail {
  return {
    to: b.customerEmail,
    subject: `Booking ${b.ref} cancelled`,
    html: shell(
      "Booking cancelled",
      `<p>Hello ${e(b.customerName)}, booking ${e(b.ref)} was cancelled. If you paid, our team will contact you about your refund.</p>${rows(bookingPairs(b))}`,
    ),
    text: `Booking ${b.ref} was cancelled. If you paid, our team will contact you about your refund.`,
    replyTo: SITE.teamEmail || undefined,
  };
}

function enquiryPairs(q: Enquiry): [string, string][] {
  const type = ENQUIRY_PROJECT_TYPES.find((p) => p.id === q.projectType)?.label ?? q.projectType;
  const trades = q.trades.map((t) => ENQUIRY_TRADES.find((x) => x.id === t)?.label ?? t).join(", ");
  return [
    ["Name", q.name],
    ["Phone", q.phone],
    ["Email", q.email ?? "Not given"],
    ["Preferred contact", q.contactMethod],
    ["Project type", type],
    ["Trades", trades],
    ["Location", q.location],
    ["Size", q.sizeNote ?? "Not given"],
    ["Details", q.description],
  ];
}

export function teamEnquiryEmail(q: Enquiry, to: string): Mail {
  const link = `${SITE.url}/admin/enquiries/${q.id}`;
  return {
    to,
    subject: `New project enquiry from ${q.name}`,
    html: shell("New project enquiry", `${rows(enquiryPairs(q))}<p><a href="${link}">Open in admin</a></p>`),
    text: `${text(enquiryPairs(q))}\n\nOpen in admin: ${link}`,
    replyTo: q.email ?? undefined,
  };
}

export function customerEnquiryReceivedEmail(q: Enquiry): Mail | null {
  if (!q.email) return null;
  return {
    to: q.email,
    subject: "We have your project enquiry",
    html: shell(
      "We have your enquiry",
      `<p>Hello ${e(q.name)}, thank you. Our team will contact you by ${e(q.contactMethod)} about your project. Here is what you sent us:</p>${rows(enquiryPairs(q))}`,
    ),
    text: `Hello ${q.name}, thank you. Our team will contact you by ${q.contactMethod}.\n\n${text(enquiryPairs(q))}`,
    replyTo: SITE.teamEmail || undefined,
  };
}

// ---- Accounts and security ----------------------------------------------------------------------

function button(href: string, label: string): string {
  return `<p style="margin:20px 0;"><a href="${e(href)}" style="display:inline-block;background:#0f5e73;color:#ffffff;text-decoration:none;font-weight:bold;padding:12px 20px;border-radius:6px;">${e(label)}</a></p><p style="font-size:13px;color:#5b6068;">If the button does not work, copy this address into your browser:<br>${e(href)}</p>`;
}

export function verifyEmailEmail(to: string, link: string): Mail {
  return {
    to,
    subject: `Confirm your email for ${SITE.name}`,
    html: shell(
      "Confirm your email address",
      `<p>Use the button below to confirm this email address. The link works once and expires in 24 hours.</p>${button(link, "Confirm my email")}<p>If you did not create a ${e(SITE.name)} account, you can ignore this email. Nothing will happen.</p>`,
    ),
    text: `Confirm your email address for ${SITE.name}.\n\nOpen this link (works once, expires in 24 hours):\n${link}\n\nIf you did not create an account, ignore this email.`,
  };
}

export function accountExistsEmail(to: string): Mail {
  const login = `${SITE.url}/login`;
  const reset = `${SITE.url}/forgot-password`;
  return {
    to,
    subject: `You already have a ${SITE.name} account`,
    html: shell(
      "You already have an account",
      `<p>Someone, possibly you, tried to create a ${e(SITE.name)} account with this email address, but one already exists.</p><p><a href="${e(login)}">Sign in</a>, or <a href="${e(reset)}">reset your password</a> if you have forgotten it.</p><p>If this was not you, you can ignore this email.</p>`,
    ),
    text: `Someone tried to create a ${SITE.name} account with this email, but one already exists.\n\nSign in: ${login}\nReset your password: ${reset}\n\nIf this was not you, ignore this email.`,
  };
}

export function resetPasswordEmail(to: string, link: string): Mail {
  return {
    to,
    subject: `Reset your ${SITE.name} password`,
    html: shell(
      "Reset your password",
      `<p>We received a request to reset the password for this account. The link works once and expires in 1 hour.</p>${button(link, "Choose a new password")}<p>If you did not ask for this, ignore this email. Your password stays the same.</p>`,
    ),
    text: `Reset your ${SITE.name} password.\n\nOpen this link (works once, expires in 1 hour):\n${link}\n\nIf you did not ask for this, ignore this email.`,
  };
}

export function passwordChangedEmail(to: string): Mail {
  const reset = `${SITE.url}/forgot-password`;
  return {
    to,
    subject: `Your ${SITE.name} password was changed`,
    html: shell(
      "Your password was changed",
      `<p>The password for your ${e(SITE.name)} account was just changed, and you were signed out everywhere.</p><p>If this was you, there is nothing more to do. If it was not, <a href="${e(reset)}">reset your password now</a> and contact us${SITE.teamEmail ? ` at ${e(SITE.teamEmail)}` : ""}.</p>`,
    ),
    text: `The password for your ${SITE.name} account was just changed, and you were signed out everywhere.\n\nIf this was not you, reset it now: ${reset}`,
  };
}

export function technicianApplicationReceivedEmail(to: string, name: string): Mail {
  return {
    to,
    subject: `We received your ${SITE.name} technician application`,
    html: shell(
      "Application received",
      `<p>Hello ${e(name)}, thank you for applying to work with ${e(SITE.name)}.</p><p>Our team will review your details and documents. You will not receive bookings until you are approved, and we will email you as soon as there is a decision.</p>`,
    ),
    text: `Hello ${name}, thank you for applying to work with ${SITE.name}.\n\nOur team will review your details and documents. You will not receive bookings until you are approved. We will email you when there is a decision.`,
  };
}

export function teamTechnicianApplicationEmail(to: string, name: string, userId: string): Mail {
  const link = `${SITE.url}/admin/applications/${userId}`;
  return {
    to,
    subject: `New technician application: ${name}`,
    html: shell("New technician application", `<p>${e(name)} has applied and is waiting for review.</p><p><a href="${e(link)}">Open the application</a></p>`),
    text: `${name} has applied and is waiting for review.\n\nOpen the application: ${link}`,
  };
}

export function technicianApprovedEmail(to: string, name: string): Mail {
  const link = `${SITE.url}/technician`;
  return {
    to,
    subject: `You are approved on ${SITE.name}`,
    html: shell(
      "Your application is approved",
      `<p>Hello ${e(name)}, your technician application was approved. You can now see and carry out the jobs assigned to you.</p>${button(link, "Open my jobs")}`,
    ),
    text: `Hello ${name}, your technician application was approved. You can now see the jobs assigned to you: ${link}`,
  };
}

export function technicianRejectedEmail(to: string, name: string, note: string): Mail {
  const link = `${SITE.url}/onboarding/technician/status`;
  return {
    to,
    subject: `Update on your ${SITE.name} technician application`,
    html: shell(
      "Your application was not approved",
      `<p>Hello ${e(name)}, we could not approve your application this time.</p><p style="padding:12px 14px;background:#f5f2ea;border-radius:6px;">${e(note)}</p><p>If you can fix the points above, you can update your details and submit again.</p>${button(link, "See my application")}`,
    ),
    text: `Hello ${name}, we could not approve your application this time.\n\nReason: ${note}\n\nIf you can fix this, update your details and submit again: ${link}`,
  };
}

export function adminAccessGrantedEmail(to: string): Mail {
  return {
    to,
    subject: `Admin access was granted on ${SITE.name}`,
    html: shell(
      "Admin access granted",
      `<p>This account was given administrator access. Sign in as usual, then enter your separate admin password when asked. Your existing sessions were ended.</p><p>If you did not expect this, contact the site owner immediately.</p>`,
    ),
    text: `This account was given administrator access on ${SITE.name}. Sign in as usual, then enter your separate admin password when asked. Existing sessions were ended.\n\nIf you did not expect this, contact the site owner immediately.`,
  };
}
