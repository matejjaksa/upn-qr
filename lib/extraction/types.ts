export type ExtractedInvoiceFields = {
  payerName: string | null;
  payerAddress: string | null;
  payerCity: string | null;
  recipientName: string | null;
  recipientAddress: string | null;
  recipientCity: string | null;
  amount: string | null;
  iban: string | null;
  reference: string | null;
  purposeCode: string | null;
  purpose: string | null;
  dueDate: string | null;
  invoiceNumber: string | null;
};

export type ExtractionResponse = {
  fields: ExtractedInvoiceFields;
  source: "pdf-text" | "pdf-image" | "image";
  notes: string[];
  cost: ConversionCost;
};

export type ConversionCost = {
  model: string;
  inputTokens: number | null;
  cachedInputTokens: number;
  outputTokens: number | null;
  usd: number | null;
  currency: "USD";
  pricingDate: string;
};

export type InvoiceExtraction = { fields: ExtractedInvoiceFields; cost: ConversionCost };
