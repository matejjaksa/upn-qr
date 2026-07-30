"use client";

import { useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, FileText, QrCode, ShieldCheck, UploadCloud } from "lucide-react";
import { InvoiceUpload } from "../components/InvoiceUpload";
import { PaymentForm } from "../components/PaymentForm";
import { QrResult } from "../components/QrResult";
import { paymentFieldsFromExtraction } from "../lib/extraction/apply";
import type { ExtractedInvoiceFields } from "../lib/extraction/types";
import { coercePaymentFields, generateUpnQr, validatePaymentFields, type PaymentFields } from "../lib/upn";

const initialFields: PaymentFields = {
  payerName: "",
  payerAddress: "",
  payerCity: "",
  recipientName: "",
  recipientAddress: "",
  recipientCity: "",
  amount: "",
  iban: "",
  reference: "",
  purposeCode: "",
  purpose: "",
  dueDate: ""
};

export default function Home() {
  const [fields, setFields] = useState<PaymentFields>(initialFields);
  const [qr, setQr] = useState<{ svg: string; payload: string } | null>(null);
  const [status, setStatus] = useState("Upload an invoice, review the fields, generate QR.");
  const [extractionNotes, setExtractionNotes] = useState<string[]>([]);
  const [hasStarted, setHasStarted] = useState(false);
  const validation = useMemo(() => validatePaymentFields(fields), [fields]);
  const isValid = validation.issues.length === 0;
  const visibleIssues = hasStarted ? validation.issues : [];

  async function generate() {
    try {
      const nextQr = await generateUpnQr(fields);
      setQr(nextQr);
      setStatus("QR generated.");
    } catch (error) {
      setQr(null);
      setStatus(error instanceof Error ? error.message : "Could not generate QR.");
    }
  }

  function updateFields(next: PaymentFields) {
    setHasStarted(true);
    setFields(coercePaymentFields(next));
    setQr(null);
  }

  function applyExtracted(extracted: ExtractedInvoiceFields, notes: string[]) {
    setHasStarted(true);
    setFields(paymentFieldsFromExtraction(extracted));
    setQr(null);
    setExtractionNotes(notes);
    setStatus("Invoice extracted. Review the fields before generating QR.");
  }

  return (
    <main className="min-h-screen bg-[#e8edf3] text-slate-800">
      <header className="border-b border-slate-300 bg-[#1f3d63] text-white">
        <div className="mx-auto flex max-w-[1680px] flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-md bg-white text-sm font-black text-red-600 shadow-sm">
              UPN
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-wide">UPN QR Generator</h1>
              <p className="text-sm text-blue-100">{status}</p>
            </div>
          </div>
          <div
            className={`inline-flex h-9 items-center gap-2 rounded border px-3 text-sm font-semibold ${
              !hasStarted
                ? "border-blue-200/30 bg-white/10 text-blue-100"
                : isValid
                  ? "border-emerald-300/40 bg-emerald-500/15 text-emerald-100"
                  : "border-amber-300/40 bg-amber-500/15 text-amber-100"
            }`}
          >
            {!hasStarted ? <UploadCloud className="h-4 w-4" /> : isValid ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            {!hasStarted ? "Waiting for invoice" : isValid ? "Ready" : `${validation.issues.length} issue${validation.issues.length === 1 ? "" : "s"}`}
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1680px] gap-4 p-4 sm:p-6">
        <section className="grid overflow-hidden rounded-md border border-slate-300 bg-white shadow-sm lg:grid-cols-3">
          <div className="flex items-center gap-3 border-b border-slate-200 bg-[#f6f8fb] px-4 py-3 lg:border-b-0 lg:border-r">
            <span className="grid h-8 w-8 place-items-center rounded bg-[#2b72bd] text-sm font-bold text-white">1</span>
            <div>
              <strong className="block text-sm text-slate-900">Upload invoice</strong>
              <span className="text-xs text-slate-500">PDF, JPG or PNG</span>
            </div>
          </div>
          <div className="flex items-center gap-3 border-b border-slate-200 bg-[#f6f8fb] px-4 py-3 lg:border-b-0 lg:border-r">
            <span className="grid h-8 w-8 place-items-center rounded bg-[#2b72bd] text-sm font-bold text-white">2</span>
            <div>
              <strong className="block text-sm text-slate-900">Review fields</strong>
              <span className="text-xs text-slate-500">Payer, recipient and payment data</span>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-[#f6f8fb] px-4 py-3">
            <span className="grid h-8 w-8 place-items-center rounded bg-[#2b72bd] text-sm font-bold text-white">3</span>
            <div>
              <strong className="block text-sm text-slate-900">Scan QR</strong>
              <span className="text-xs text-slate-500">Use your banking app</span>
            </div>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[380px_minmax(0,1fr)] 2xl:grid-cols-[380px_minmax(560px,1fr)_minmax(400px,520px)]">
          <div className="grid content-start gap-4">
            <InvoiceUpload onExtracted={applyExtracted} />

            <section className="rounded-md border border-slate-300 bg-white shadow-sm">
              <div className="flex items-center gap-2 border-b border-slate-200 bg-[#f8fafc] px-4 py-3 text-sm font-semibold text-slate-700">
                <FileText className="h-4 w-4 text-blue-600" />
                Extraction
              </div>
              <div className="grid gap-2 p-4 text-sm text-slate-600">
                {extractionNotes.length ? (
                  extractionNotes.map((note) => (
                    <span key={note} className="rounded border border-slate-200 bg-slate-50 px-3 py-2">
                      {note}
                    </span>
                  ))
                ) : (
                  <span className="rounded border border-dashed border-slate-300 bg-slate-50 px-3 py-4 text-center">
                    No invoice extracted yet.
                  </span>
                )}
              </div>
            </section>

            <section className="rounded-md border border-slate-300 bg-white shadow-sm">
              <div className="flex items-center gap-2 border-b border-slate-200 bg-[#f8fafc] px-4 py-3 text-sm font-semibold text-slate-700">
                <ShieldCheck className="h-4 w-4 text-blue-600" />
                Validation
              </div>
              <div className="grid gap-2 p-4 text-sm">
                {!hasStarted ? (
                  <div className="rounded border border-dashed border-slate-300 bg-slate-50 px-3 py-4 text-center text-slate-600">
                    Upload an invoice to validate payment fields.
                  </div>
                ) : visibleIssues.length ? (
                  visibleIssues.slice(0, 6).map((issue) => (
                    <div key={`${issue.field}-${issue.message}`} className="rounded border border-red-100 bg-red-50 px-3 py-2 text-red-700">
                      {issue.message}
                    </div>
                  ))
                ) : (
                  <div className="rounded border border-emerald-100 bg-emerald-50 px-3 py-2 text-emerald-700">
                    All required fields are valid.
                  </div>
                )}
              </div>
            </section>
          </div>

          <PaymentForm
            value={fields}
            issues={visibleIssues}
            canGenerate={isValid}
            statusLabel={hasStarted ? undefined : "Waiting"}
            onChange={updateFields}
            onGenerate={() => void generate()}
          />

          {qr ? (
            <QrResult fields={fields} svg={qr.svg} payload={qr.payload} />
          ) : (
            <section className="overflow-hidden rounded-md border border-slate-300 bg-white shadow-sm">
              <div className="border-b border-slate-200 bg-[#1f3d63] px-5 py-3 text-white">
                <div className="flex items-center gap-2 text-base font-semibold">
                  <QrCode className="h-5 w-5" />
                  QR Output
                </div>
                <p className="text-xs text-blue-100">Waiting for a generated payment code.</p>
              </div>
              <div className="grid min-h-[520px] place-items-center p-5 text-center">
                <div className="max-w-xs">
                  <div className="mx-auto mb-4 grid h-20 w-20 place-items-center rounded-md border border-dashed border-slate-300 bg-slate-50">
                    <UploadCloud className="h-9 w-9 text-slate-400" />
                  </div>
                  <strong className="block text-lg text-slate-900">No QR yet</strong>
                  <span className="mt-1 block text-sm text-slate-500">
                    The QR appears here after the form is valid and generated.
                  </span>
                </div>
              </div>
            </section>
          )}
        </section>
      </div>
    </main>
  );
}
