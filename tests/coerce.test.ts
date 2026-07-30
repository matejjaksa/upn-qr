import { describe, expect, it } from "vitest";
import { coercePaymentFields, coerceReference, validatePaymentFields, type PaymentFields } from "../lib/upn";

const validFields: PaymentFields = {
  payerName: "MATEJ JAKŠA",
  payerAddress: "KAMNIKARJEVA 13",
  payerCity: "1291 ŠKOFLJICA",
  recipientName: "Recipient",
  recipientAddress: "Address 1",
  recipientCity: "1000 Ljubljana",
  amount: "325,00 EUR",
  iban: "SI56 0400 1010 9562 071",
  reference: "12 2026013603800",
  purposeCode: "OTHR",
  purpose: "RAČUN 15-26",
  dueDate: "01.01.2026"
};

describe("payment field coercion", () => {
  it("prefixes bare numeric Slovenian references with SI", () => {
    expect(coerceReference("12 2026013603800")).toBe("SI12 2026013603800");
  });

  it("shortens long recipient names before validation", () => {
    const coerced = coercePaymentFields({
      ...validFields,
      recipientName: "VMS, poslovno svetovanje, Vera Menard s.p."
    });

    expect(coerced.recipientName).toBe("VMS Vera Menard s.p.");
    expect(validatePaymentFields(coerced).issues.filter((issue) => issue.field === "recipientName")).toEqual([]);
    expect(validatePaymentFields(coerced).issues.filter((issue) => issue.field === "reference")).toEqual([]);
  });

  it("coerces old Slovenian TRR-style IBAN values", () => {
    const coerced = coercePaymentFields({
      ...validFields,
      iban: "SI56 02086-0016907125"
    });

    expect(coerced.iban).toBe("SI56020860016907125");
    expect(validatePaymentFields(coerced).issues.filter((issue) => issue.field === "iban")).toEqual([]);
  });
});
