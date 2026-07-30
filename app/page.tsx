"use client";

import { useMemo, useState } from "react";
import { InvoiceUpload } from "../components/InvoiceUpload";
import { PaymentForm } from "../components/PaymentForm";
import { QrResult } from "../components/QrResult";
import { paymentFieldsFromExtraction } from "../lib/extraction/apply";
import type { ExtractedInvoiceFields } from "../lib/extraction/types";
import { coercePaymentFields, generateUpnQr, validatePaymentFields, type PaymentFields } from "../lib/upn";

const initialFields: PaymentFields = {
  payerName: "MATEJ JAKŠA",
  payerAddress: "KAMNIKARJEVA 13",
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
};

export default function Home() {
  const [fields, setFields] = useState<PaymentFields>(initialFields);
  const [qr, setQr] = useState<{ svg: string; payload: string } | null>(null);
  const [status, setStatus] = useState("Phase 1: enter or edit payment data, validate, then generate a scan-ready UPN QR.");
  const [extractionNotes, setExtractionNotes] = useState<string[]>([]);
  const validation = useMemo(() => validatePaymentFields(fields), [fields]);

  async function generate() {
    try {
      const nextQr = await generateUpnQr(fields);
      setQr(nextQr);
      setStatus("QR generated with UPN version 15, error correction M, LF-only ASCII payload.");
    } catch (error) {
      setQr(null);
      setStatus(error instanceof Error ? error.message : "Could not generate QR.");
    }
  }

  function updateFields(next: PaymentFields) {
    setFields(coercePaymentFields(next));
    setQr(null);
  }

  function applyExtracted(extracted: ExtractedInvoiceFields, notes: string[]) {
    setFields(paymentFieldsFromExtraction(extracted));
    setQr(null);
    setExtractionNotes(notes);
    setStatus("Invoice extracted. Verify every field before generating the QR.");
  }

  return (
    <main className="shell">
      <header className="pageHeader">
        <h1>UPN QR Generator</h1>
        <p>{status}</p>
      </header>

      <section className="topArea">
        <InvoiceUpload onExtracted={applyExtracted} />
        {extractionNotes.length ? (
          <div className="notesPanel">
            {extractionNotes.map((note) => (
              <span key={note}>{note}</span>
            ))}
          </div>
        ) : null}
      </section>

      <section className="workspace">
        <PaymentForm value={fields} issues={validation.issues} onChange={updateFields} onGenerate={() => void generate()} />
        {qr ? (
          <QrResult fields={fields} svg={qr.svg} payload={qr.payload} />
        ) : (
          <section className="panel emptyResult">
            <div>
              <strong>Scan result appears here</strong>
              <span>Validation must pass before QR generation.</span>
            </div>
          </section>
        )}
      </section>
    </main>
  );
}
