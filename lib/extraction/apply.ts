import { coercePaymentFields, type PaymentFields } from "../upn";
import type { ExtractedInvoiceFields } from "./types";

export function paymentFieldsFromExtraction(extracted: ExtractedInvoiceFields): PaymentFields {
  return coercePaymentFields({
    payerName: extracted.payerName ?? "",
    payerAddress: extracted.payerAddress ?? "",
    payerCity: extracted.payerCity ?? "",
    recipientName: extracted.recipientName ?? "",
    recipientAddress: extracted.recipientAddress ?? "",
    recipientCity: extracted.recipientCity ?? "",
    amount: extracted.amount ?? "",
    iban: extracted.iban ?? "",
    reference: defaultMissingReference(extracted.reference),
    purposeCode: extracted.purposeCode ?? "OTHR",
    purpose: extracted.purpose ?? (extracted.invoiceNumber ? `RACUN ${extracted.invoiceNumber}` : ""),
    dueDate: extracted.dueDate ?? ""
  });
}

function defaultMissingReference(reference: string | null): string {
  const trimmed = reference?.trim();
  if (!trimmed) return "SI99";
  return trimmed;
}
