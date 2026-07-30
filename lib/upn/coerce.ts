import { normalizeAscii } from "./ascii";
import { normalizeIban } from "./iban";
import type { PaymentFields } from "./types";

const TEXT_LIMITS: Partial<Record<keyof PaymentFields, number>> = {
  payerName: 33,
  payerAddress: 33,
  payerCity: 33,
  recipientName: 33,
  recipientAddress: 33,
  recipientCity: 33,
  purpose: 42
};

export function coercePaymentFields(input: PaymentFields): PaymentFields {
  return {
    ...input,
    payerName: coerceText(input.payerName, TEXT_LIMITS.payerName),
    payerAddress: coerceText(input.payerAddress, TEXT_LIMITS.payerAddress),
    payerCity: coerceText(input.payerCity, TEXT_LIMITS.payerCity),
    recipientName: coerceText(input.recipientName, TEXT_LIMITS.recipientName),
    recipientAddress: coerceText(input.recipientAddress, TEXT_LIMITS.recipientAddress),
    recipientCity: coerceText(input.recipientCity, TEXT_LIMITS.recipientCity),
    iban: normalizeIban(input.iban),
    reference: coerceReference(input.reference),
    purposeCode: input.purposeCode.trim().toUpperCase() || "OTHR",
    purpose: coerceText(input.purpose, TEXT_LIMITS.purpose)
  };
}

export function coerceReference(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return trimmed;
  if (/^(SI|RF)/i.test(trimmed)) return trimmed.toUpperCase();
  if (/^\d{2}[\s-]?[A-Z0-9][A-Z0-9\s-]*$/i.test(trimmed)) {
    return `SI${trimmed}`.toUpperCase();
  }
  return trimmed.toUpperCase();
}

function coerceText(input: string, limit = Number.POSITIVE_INFINITY): string {
  const trimmed = input.trim().replace(/\s+/g, " ");
  if (normalizeAscii(trimmed).length <= limit) return trimmed;

  const withoutCompanySuffix = trimmed
    .replace(/\s*,?\s*(poslovno\s+svetovanje|svetovanje|trgovina|storitve)\s*,?/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (normalizeAscii(withoutCompanySuffix).length <= limit) return withoutCompanySuffix;

  return shortenAtWordBoundary(withoutCompanySuffix, limit);
}

function shortenAtWordBoundary(input: string, limit: number): string {
  const words = input.split(/\s+/);
  let candidate = "";
  for (const word of words) {
    const next = candidate ? `${candidate} ${word}` : word;
    if (normalizeAscii(next).length > limit) break;
    candidate = next;
  }
  if (candidate) return candidate;

  let result = "";
  for (const char of input) {
    if (normalizeAscii(`${result}${char}`).length > limit) break;
    result += char;
  }
  return result.trim();
}
