/** Normalises a Nigerian mobile number to +234XXXXXXXXXX, or returns null if it isn't one. */
export function normalizePhone(input: string): string | null {
  const digits = input.replace(/[^\d+]/g, "");
  let national: string;
  if (digits.startsWith("+234")) national = digits.slice(4);
  else if (digits.startsWith("234")) national = digits.slice(3);
  else if (digits.startsWith("0")) national = digits.slice(1);
  else national = digits;
  return /^[789]\d{9}$/.test(national) ? `+234${national}` : null;
}
