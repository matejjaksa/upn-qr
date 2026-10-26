import { describe, expect, it } from "vitest";
import { paymentFieldsFromExtraction } from "../lib/extraction/apply";
import { emptyExtractedFields } from "../lib/extraction/schema";

describe("applying extracted invoice fields", () => {
  it("does not preserve stale payer defaults when extraction is uncertain", () => {
    const fields = paymentFieldsFromExtraction({
      ...emptyExtractedFields,
      recipientName: "GRAMAT KAČIČ D.O.O.",
      recipientAddress: "OPATJE SELO 78",
      recipientCity: "5291 MIREN",
      amount: "13649.40",
      iban: "SI56 0475 0000 2256 950",
      reference: "SI00 44-614",
      invoiceNumber: "44-25",
      dueDate: "23.08.2025"
    });

    expect(fields.payerName).toBe("");
    expect(fields.payerAddress).toBe("");
    expect(fields.payerCity).toBe("");
    expect(fields.purpose).toBe("RACUN 44-25");
  });

  it("uses payer fields when the invoice extractor returns them", () => {
    const fields = paymentFieldsFromExtraction({
      ...emptyExtractedFields,
      payerName: "JAKŠA GROUP D.O.O.",
      payerAddress: "DOLENJSKA CESTA 324A",
      payerCity: "1291 ŠKOFLJICA"
    });

    expect(fields.payerName).toBe("JAKŠA GROUP D.O.O.");
    expect(fields.payerAddress).toBe("DOLENJSKA CESTA 324A");
    expect(fields.payerCity).toBe("1291 ŠKOFLJICA");
  });

  it("preserves the explicit model and hyphen from the Rekar invoice", () => {
    expect(paymentFieldsFromExtraction({
      ...emptyExtractedFields,
      reference: "00 122600162-39554228"
    }).reference).toBe("SI00 122600162-39554228");
  });

  it("uses SI99 when the invoice has no reference", () => {
    const fields = paymentFieldsFromExtraction({
      ...emptyExtractedFields,
      reference: null
    });

    expect(fields.reference).toBe("SI99");
  });

  it("repairs invoice-style references returned by extraction", () => {
    expect(
      paymentFieldsFromExtraction({
        ...emptyExtractedFields,
        reference: "SI011-2026"
      }).reference
    ).toBe("SI00 011-2026");

    expect(
      paymentFieldsFromExtraction({
        ...emptyExtractedFields,
        reference: "SI26-80522-005385"
      }).reference
    ).toBe("SI00 26-80522-005385");
  });
});
