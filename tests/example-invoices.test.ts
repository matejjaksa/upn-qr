import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { buildUpnPayload, type PaymentFields } from "../lib/upn";

const exampleDir = join(process.cwd(), "examples");

const examples: Array<{
  file: string;
  anchors: RegExp[];
  imageOnly?: boolean;
  fields: PaymentFields;
  expected: {
    amount: string;
    iban: string;
    reference: string;
    recipient: string;
  };
}> = [
  {
    file: "Scanned Document 2.pdf",
    imageOnly: true,
    anchors: [],
    fields: {
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
    },
    expected: {
      amount: "00000016038",
      iban: "SI56040010048840944",
      reference: "SI121400670113268",
      recipient: "ZAVAROVALNICA TRIGLAV D.D."
    }
  },
  {
    file: "hangar postojna.pdf",
    imageOnly: true,
    anchors: [],
    fields: {
      payerName: "JAKŠA GROUP D.O.O.",
      payerAddress: "DOLENJSKA CESTA 324A",
      payerCity: "1291 ŠKOFLJICA",
      recipientName: "AEROKLUB POSTOJNA",
      recipientAddress: "RAKITNIK 1A",
      recipientCity: "6258 PRESTRANEK",
      amount: "1870.00",
      iban: "SI56 0208 6001 6907 125",
      reference: "SI00 015-2025",
      purposeCode: "OTHR",
      purpose: "RACUN 015-2025",
      dueDate: "20.07.2025"
    },
    expected: {
      amount: "00000187000",
      iban: "SI56020860016907125",
      reference: "SI000152025",
      recipient: "AEROKLUB POSTOJNA"
    }
  },
  {
    file: "NRACUN00000044.pdf",
    anchors: [/GRAMAT KA/i, /MATEJ JAK/i, /13\.649,40/, /SI00 44-614/],
    fields: {
      payerName: "MATEJ JAKŠA",
      payerAddress: "KAMNIKARJEVA 13",
      payerCity: "1291 ŠKOFLJICA",
      recipientName: "GRAMAT KAČIČ D.O.O.",
      recipientAddress: "OPATJE SELO 78",
      recipientCity: "5291 MIREN",
      amount: "13649.40",
      iban: "SI56 0475 0000 2256 950",
      reference: "SI00 44-614",
      purposeCode: "OTHR",
      purpose: "RACUN 44-25",
      dueDate: "23.08.2025"
    },
    expected: {
      amount: "00001364940",
      iban: "SI56047500002256950",
      reference: "SI0044614",
      recipient: "GRAMAT KACIC D.O.O."
    }
  }
];

describe("example invoice fixtures", () => {
  it.each(examples)("matches %s and builds a valid deterministic UPN payload", (fixture) => {
    const pdfPath = join(exampleDir, fixture.file);
    expect(existsSync(pdfPath), `${fixture.file} should exist`).toBe(true);

    const nativeText = extractNativePdfText(pdfPath);
    if (fixture.imageOnly) {
      expect(nativeText.trim().length, `${fixture.file} should be treated as image-only`).toBeLessThan(50);
    } else {
      for (const anchor of fixture.anchors) {
        expect(nativeText, `${fixture.file} should contain ${anchor}`).toMatch(anchor);
      }
    }

    const built = buildUpnPayload(fixture.fields);
    expect(built.normalized.amount).toBe(fixture.expected.amount);
    expect(built.normalized.iban).toBe(fixture.expected.iban);
    expect(built.normalized.reference).toBe(fixture.expected.reference);
    expect(built.payload).toContain(fixture.expected.recipient);
  });
});

function extractNativePdfText(pdfPath: string): string {
  return execFileSync("pdftotext", ["-layout", pdfPath, "-"], { encoding: "utf8" });
}
