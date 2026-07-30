import { formatAmount } from "./amount";
import { normalizeAscii } from "./ascii";
import { normalizeDueDate } from "./date";
import { validateIban } from "./iban";
import { validateReference } from "./reference";
import type { PaymentFields, ValidationIssue, ValidationResult } from "./types";

const TEXT_LIMITS: Array<[keyof PaymentFields, number]> = [
  ["payerName", 33],
  ["payerAddress", 33],
  ["payerCity", 33],
  ["recipientName", 33],
  ["recipientAddress", 33],
  ["recipientCity", 33],
  ["purpose", 42]
];

const REQUIRED_FIELDS: Array<keyof PaymentFields> = [
  "payerName",
  "payerAddress",
  "payerCity",
  "recipientName",
  "recipientAddress",
  "recipientCity",
  "amount",
  "iban",
  "reference",
  "purposeCode",
  "purpose",
  "dueDate"
];

export function validatePaymentFields(input: PaymentFields): ValidationResult {
  const issues: ValidationIssue[] = [];

  for (const field of REQUIRED_FIELDS) {
    if (!input[field].trim()) {
      issues.push({ field, message: "Required." });
    }
  }

  for (const [field, limit] of TEXT_LIMITS) {
    if (normalizeAscii(input[field]).length > limit) {
      issues.push({ field, message: `Maximum ${limit} characters after QR ASCII normalization.` });
    }
  }

  try {
    formatAmount(input.amount);
  } catch (error) {
    issues.push({ field: "amount", message: error instanceof Error ? error.message : "Invalid amount." });
  }

  if (!validateIban(input.iban)) {
    issues.push({ field: "iban", message: "Invalid IBAN checksum or format." });
  }

  if (!validateReference(input.reference)) {
    issues.push({ field: "reference", message: "Reference must start with SI or RF plus two digits." });
  }

  if (!/^[A-Z]{4}$/.test(input.purposeCode.trim().toUpperCase())) {
    issues.push({ field: "purposeCode", message: "Purpose code must be exactly four uppercase letters." });
  }

  try {
    normalizeDueDate(input.dueDate);
  } catch (error) {
    issues.push({ field: "dueDate", message: error instanceof Error ? error.message : "Invalid due date." });
  }

  return { ok: issues.length === 0, issues };
}
