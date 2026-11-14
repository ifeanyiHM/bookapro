import { SITE } from "@/config/site";
import { sendMail, teamAddress } from "./mail";
import {
  accountExistsEmail,
  bookingCancelledEmail,
  bookingCompletedEmail,
  bookingConfirmedEmail,
  customerEnquiryReceivedEmail,
  customerTechnicianAssignedEmail,
  passwordChangedEmail,
  resetPasswordEmail,
  teamEnquiryEmail,
  teamNewBookingEmail,
  teamTechnicianApplicationEmail,
  technicianApplicationReceivedEmail,
  technicianApprovedEmail,
  technicianAssignedEmail,
  technicianRejectedEmail,
  verifyEmailEmail,
} from "./email-templates";
import type { Booking, Enquiry } from "@/types";

export async function notifyPaid(b: Booking) {
  await sendMail(bookingConfirmedEmail(b));
  const team = teamAddress();
  if (team) await sendMail(teamNewBookingEmail(b, team));
}

export async function notifyAssigned(b: Booking, tech: { name: string; email: string }) {
  await sendMail(technicianAssignedEmail(b, tech.name, tech.email));
  await sendMail(customerTechnicianAssignedEmail(b, tech.name));
}

export async function notifyCompleted(b: Booking) {
  await sendMail(bookingCompletedEmail(b));
}

export async function notifyCancelled(b: Booking) {
  await sendMail(bookingCancelledEmail(b));
}

export async function notifyEnquiry(q: Enquiry) {
  const team = teamAddress();
  if (team) await sendMail(teamEnquiryEmail(q, team));
  const ack = customerEnquiryReceivedEmail(q);
  if (ack) await sendMail(ack);
}

// ---- Accounts and security ----------------------------------------------------------------------

export const sendVerificationEmail = (to: string, token: string) =>
  sendMail(verifyEmailEmail(to, `${SITE.url}/verify-email?token=${token}`));
export const sendAccountExistsEmail = (to: string) => sendMail(accountExistsEmail(to));
export const sendResetEmail = (to: string, token: string) =>
  sendMail(resetPasswordEmail(to, `${SITE.url}/reset-password?token=${token}`));
export const sendPasswordChangedEmail = (to: string) => sendMail(passwordChangedEmail(to));

export async function notifyApplicationSubmitted(a: { userId: string; name: string; email: string }) {
  await sendMail(technicianApplicationReceivedEmail(a.email, a.name));
  const team = teamAddress();
  if (team) await sendMail(teamTechnicianApplicationEmail(team, a.name, a.userId));
}

export const notifyApplicationApproved = (a: { name: string; email: string }) =>
  sendMail(technicianApprovedEmail(a.email, a.name));
export const notifyApplicationRejected = (a: { name: string; email: string }, note: string) =>
  sendMail(technicianRejectedEmail(a.email, a.name, note));
