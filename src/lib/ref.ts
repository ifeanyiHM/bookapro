import { randomInt } from "node:crypto";

/** No 0/O or 1/I so a reference read over the phone is hard to mishear. */
const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

export function newBookingRef(): string {
  let s = "";
  for (let i = 0; i < 6; i++) s += ALPHABET[randomInt(ALPHABET.length)];
  return `IC-${s}`;
}
