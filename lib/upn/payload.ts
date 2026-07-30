import { formatAmount } from "./amount";
import { isAscii, normalizeAscii } from "./ascii";
import { normalizeDueDate } from "./date";
import { normalizeIban } from "./iban";
import { normalizeReference } from "./reference";
import { validatePaymentFields } from "./validation";
import type { BuiltUpnPayload, PaymentFields } from "./types";

export function byteLength(value: string): number {
  return new TextEncoder().encode(value).byteLength;
}

export function buildUpnPayload(input: PaymentFields): BuiltUpnPayload {
  const validation = validatePaymentFields(input);
  if (!validation.ok) {
    throw new Error(validation.issues.map((issue) => `${issue.field}: ${issue.message}`).join(" "));
  }

  const normalized = {
    amount: formatAmount(input.amount),
    iban: normalizeIban(input.iban),
    reference: normalizeReference(input.reference),
    dueDate: normalizeDueDate(input.dueDate)
  };

  const fields = [
    "UPNQR",
    "",
    "",
    "",
    "",
    normalizeAscii(input.payerName),
    normalizeAscii(input.payerAddress),
    normalizeAscii(input.payerCity),
    normalized.amount,
    "",
    "",
    input.purposeCode.trim().toUpperCase(),
    normalizeAscii(input.purpose),
    normalized.dueDate,
    normalized.iban,
    normalized.reference,
    normalizeAscii(input.recipientName),
    normalizeAscii(input.recipientAddress),
    normalizeAscii(input.recipientCity)
  ];

  const body = fields.map((field) => `${field}\n`).join("");
  const bodyLength = byteLength(body);
  const payload = `${body}${String(bodyLength).padStart(3, "0")}\n`;

  if (!isAscii(payload)) {
    throw new Error("UPN QR payload must be ASCII.");
  }

  return { payload, bodyLength, fields, normalized };
}
