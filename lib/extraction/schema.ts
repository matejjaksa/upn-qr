import type { ExtractedInvoiceFields } from "./types";

export const emptyExtractedFields: ExtractedInvoiceFields = {
  payerName: null,
  payerAddress: null,
  payerCity: null,
  recipientName: null,
  recipientAddress: null,
  recipientCity: null,
  amount: null,
  iban: null,
  reference: null,
  purposeCode: null,
  purpose: null,
  dueDate: null,
  invoiceNumber: null
};

const nullableString = { type: ["string", "null"] };

export const invoiceExtractionSchema = {
  type: "object",
  additionalProperties: false,
  required: Object.keys(emptyExtractedFields),
  properties: {
    payerName: nullableString,
    payerAddress: nullableString,
    payerCity: nullableString,
    recipientName: nullableString,
    recipientAddress: nullableString,
    recipientCity: nullableString,
    amount: nullableString,
    iban: nullableString,
    reference: nullableString,
    purposeCode: nullableString,
    purpose: nullableString,
    dueDate: nullableString,
    invoiceNumber: nullableString
  }
};
