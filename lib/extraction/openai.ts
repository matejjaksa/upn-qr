import { invoiceExtractionSchema } from "./schema";
import type { ExtractedInvoiceFields } from "./types";

const extractionPrompt = `Extract Slovenian UPN payment fields from this invoice.

Return only fields that are explicitly present or strongly implied by payment instructions.
If a value is uncertain, return null.

Rules:
- recipient/payee is the entity receiving payment, not the buyer/customer.
- payer is the buyer/customer from the invoice when present. Never use external defaults for payer fields.
- if the invoice contains both a person and a company as possible customers, prefer the entity named as the buyer/addressee/payer on the invoice.
- amount is the final amount to pay, not subtotal before prepayments.
- reference is the payment reference/sklic, not merely an invoice number unless the invoice instructs using it as reference.
- when an invoice says to use the invoice number or sklic but no SI/RF model is printed, return the reference as SI00 plus that number, for example SI00 011-2026.
- do not infer the SI model from the first two digits of an invoice number or sklic number. For example 26-80522-005385 should be SI00 26-80522-005385 unless another model is explicitly printed.
- preserve hyphens within the reference. An explicit two-digit model before the reference is the SI model: Sklic: 00 122600162-39554228 means SI00 122600162-39554228.
- dueDate must be DD.MM.YYYY when present.
- purpose should be short and conservative, e.g. RACUN 44-25.
- purposeCode defaults to OTHR only when no explicit purpose code is visible.
- Preserve normal display characters; deterministic QR code normalization happens elsewhere.`;

export async function extractFieldsFromText(text: string): Promise<ExtractedInvoiceFields> {
  return extractWithOpenAi([{ type: "input_text", text: `${extractionPrompt}\n\nInvoice text:\n${text}` }]);
}

export async function extractFieldsFromPdf(bytes: Buffer, filename: string): Promise<ExtractedInvoiceFields> {
  return extractWithOpenAi([
    {
      type: "input_file",
      filename,
      file_data: `data:application/pdf;base64,${bytes.toString("base64")}`,
      detail: "auto"
    },
    { type: "input_text", text: extractionPrompt }
  ]);
}

export async function extractFieldsFromImage(bytes: Buffer, mimeType: string): Promise<ExtractedInvoiceFields> {
  const dataUrl = `data:${mimeType};base64,${bytes.toString("base64")}`;
  return extractWithOpenAi([
    { type: "input_text", text: extractionPrompt },
    { type: "input_image", image_url: dataUrl }
  ]);
}

async function extractWithOpenAi(content: Array<Record<string, string>>): Promise<ExtractedInvoiceFields> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set. Add it to your local environment before extracting invoices.");
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: process.env.OPENAI_EXTRACTION_MODEL ?? "gpt-5.6-sol",
      input: [{ role: "user", content }],
      text: {
        format: {
          type: "json_schema",
          name: "invoice_payment_fields",
          strict: true,
          schema: invoiceExtractionSchema
        }
      }
    })
  });

  const json = await response.json();
  if (!response.ok) {
    throw new Error(json?.error?.message ?? "OpenAI invoice extraction failed.");
  }

  const outputText = extractOutputText(json);
  if (!outputText) {
    throw new Error("OpenAI response did not include structured invoice fields.");
  }

  return JSON.parse(outputText) as ExtractedInvoiceFields;
}

function extractOutputText(response: unknown): string | null {
  if (typeof response !== "object" || response === null) return null;
  const direct = (response as { output_text?: unknown }).output_text;
  if (typeof direct === "string") return direct;

  const output = (response as { output?: unknown }).output;
  if (!Array.isArray(output)) return null;

  for (const item of output) {
    if (typeof item !== "object" || item === null) continue;
    const content = (item as { content?: unknown }).content;
    if (!Array.isArray(content)) continue;
    for (const part of content) {
      if (typeof part !== "object" || part === null) continue;
      const text = (part as { text?: unknown }).text;
      if (typeof text === "string") return text;
    }
  }

  return null;
}
