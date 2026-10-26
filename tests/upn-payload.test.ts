import { describe, expect, it } from "vitest";
import { buildUpnPayload, byteLength, formatAmount, normalizeReference, type PaymentFields } from "../lib/upn";

const defaultPayer = {
  payerName: "MATEJ JAKŠA",
  payerAddress: "KAMNIKARJEVA 13",
  payerCity: "1291 ŠKOFLJICA"
};

function payment(overrides: Partial<PaymentFields>): PaymentFields {
  return {
    ...defaultPayer,
    recipientName: "PREJEMNIK",
    recipientAddress: "NASLOV 1",
    recipientCity: "1000 LJUBLJANA",
    amount: "1.00",
    iban: "SI56 0475 0000 2256 950",
    reference: "SI00 1",
    purposeCode: "OTHR",
    purpose: "RACUN",
    dueDate: "01.01.2026",
    ...overrides
  };
}

describe("UPN payload", () => {
  it("formats amount and reference examples", () => {
    expect(formatAmount("1870.00")).toBe("00000187000");
    expect(formatAmount("2555.42")).toBe("00000255542");
    expect(formatAmount("13649.40")).toBe("00001364940");
    expect(formatAmount("13.649,40 EUR")).toBe("00001364940");
    expect(normalizeReference("SI00 44-614")).toBe("SI0044-614");
    expect(normalizeReference("SI00 26-900-0373")).toBe("SI0026-900-0373");
  });

  it("preserves the Rekar invoice reference in the generated QR", () => {
    const qr = buildUpnPayload(payment({
      reference: "SI00 122600162-39554228",
      amount: "571.81",
      iban: "SI56 6100 0001 0631 838"
    }));

    expect(qr.payload.split("\n")[15]).toBe("SI00122600162-39554228");
    const lines = qr.payload.split("\n");
    expect(Number(lines[19])).toBe(byteLength(lines.slice(0, 19).join("\n") + "\n"));
  });

  it("builds Triglav payload with ASCII text", () => {
    const built = buildUpnPayload(
      payment({
        payerName: "JAKŠA GROUP D.O.O.",
        payerAddress: "DOLENJSKA CESTA 324A",
        payerCity: "1291 ŠKOFLJICA",
        recipientName: "Zavarovalnica Triglav d.d.",
        recipientAddress: "Miklošičeva cesta 19",
        recipientCity: "1000 Ljubljana",
        amount: "160.38",
        iban: "SI56 0400 1004 8840 944",
        reference: "SI12 1400670113268",
        purposeCode: "HLTI",
        purpose: "ZAVAROVALNA PREMIJA",
        dueDate: "20.08.2026"
      })
    );

    expect(built.payload).toContain("JAKSA GROUP D.O.O.");
    expect(built.payload).toContain("1291 SKOFLJICA");
    expect(built.payload).toContain("MIKLOSICEVA CESTA 19");
    expect(built.normalized.amount).toBe("00000016038");
    expect(built.normalized.reference).toBe("SI121400670113268");
    expect(built.bodyLength).toBe(byteLength(built.fields.map((field) => `${field}\n`).join("")));
    expect(built.payload.endsWith(`${String(built.bodyLength).padStart(3, "0")}\n`)).toBe(true);
  });

  it("builds Aeroklub Postojna payload", () => {
    const built = buildUpnPayload(
      payment({
        recipientName: "AEROKLUB POSTOJNA",
        recipientAddress: "Rakitnik 1A",
        recipientCity: "6258 PRESTRANEK",
        iban: "SI56 0208 6001 6907 125",
        amount: "1870.00",
        reference: "SI00 015-2025",
        purpose: "RACUN 015-2025",
        dueDate: "20.07.2025"
      })
    );

    expect(built.normalized.amount).toBe("00000187000");
    expect(built.normalized.reference).toBe("SI00015-2025");
  });

  it("builds Strle Svetila payload", () => {
    const built = buildUpnPayload(
      payment({
        recipientName: "STRLE SVETILA D.O.O.",
        recipientAddress: "MAŠERA SPASIĆEVA ULICA 8",
        recipientCity: "1000 LJUBLJANA",
        iban: "SI56 3400 0102 0355 198",
        amount: "2555.42",
        reference: "SI00 26-900-0373",
        purpose: "RACUN 26-900-0373",
        dueDate: "22.07.2026"
      })
    );

    expect(built.payload).toContain("MASERA SPASICEVA ULICA 8");
    expect(built.normalized.amount).toBe("00000255542");
    expect(built.normalized.reference).toBe("SI0026-900-0373");
  });

  it("builds Gramat Kacic payload", () => {
    const built = buildUpnPayload(
      payment({
        recipientName: "GRAMAT KAČIČ D.O.O.",
        recipientAddress: "OPATJE SELO 78",
        recipientCity: "5291 MIREN",
        iban: "SI56 0475 0000 2256 950",
        amount: "13649.40",
        reference: "SI00 44-614",
        purpose: "RACUN 44-25",
        dueDate: "23.08.2025"
      })
    );

    expect(built.payload).toContain("MATEJ JAKSA");
    expect(built.payload).toContain("1291 SKOFLJICA");
    expect(built.payload).toContain("GRAMAT KACIC D.O.O.");
    expect(built.normalized.amount).toBe("00001364940");
    expect(built.normalized.iban).toBe("SI56047500002256950");
    expect(built.normalized.reference).toBe("SI0044-614");
  });
});
