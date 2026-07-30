"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  HomeIcon,
  Landmark,
  QrCode,
  ReceiptText,
  Settings,
  ShieldCheck,
  UploadCloud
} from "lucide-react";
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

const navigation = [
  { label: "Home", icon: HomeIcon },
  { label: "Invoices", icon: ReceiptText, active: true },
  { label: "QR Generator", icon: QrCode },
  { label: "Validation", icon: ShieldCheck },
  { label: "Settings", icon: Settings }
];

export default function Home() {
  const [fields, setFields] = useState<PaymentFields>(initialFields);
  const [qr, setQr] = useState<{ svg: string; payload: string } | null>(null);
  const [status, setStatus] = useState("Phase 1: enter or edit payment data, validate, then generate a scan-ready UPN QR.");
  const [extractionNotes, setExtractionNotes] = useState<string[]>([]);
  const validation = useMemo(() => validatePaymentFields(fields), [fields]);
  const isValid = validation.issues.length === 0;

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
    <main className="min-h-screen bg-slate-100 text-slate-800">
      <div className="grid min-h-screen lg:grid-cols-[260px_1fr]">
        <aside className="hidden border-r border-[#152b47] bg-[#1f3d63] text-blue-50 lg:flex lg:flex-col">
          <div className="border-b border-blue-900/40 px-5 py-5">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-md bg-white text-sm font-black text-red-600 shadow-sm">
                UPN
              </div>
              <div>
                <strong className="block text-sm uppercase tracking-wide text-white">Payment Desk</strong>
                <span className="text-xs text-blue-200">Slovenian UPN QR</span>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-3 py-4">
            <label className="mb-4 block">
              <span className="sr-only">Search menu</span>
              <input
                className="h-10 w-full rounded border border-blue-200/50 bg-blue-950/20 px-3 text-sm text-white outline-none placeholder:text-blue-200/70"
                placeholder="Search menu..."
              />
            </label>
            <div className="grid gap-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    className={`flex h-11 items-center gap-3 rounded px-3 text-left text-sm font-semibold ${
                      item.active ? "bg-[#3674b0] text-white" : "text-blue-100 hover:bg-blue-950/20"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </nav>

          <div className="border-t border-blue-900/40 px-5 py-4 text-sm text-blue-100">
            <div className="flex items-center gap-2">
              <Landmark className="h-4 w-4" />
              Local app
            </div>
          </div>
        </aside>

        <section className="min-w-0">
          <header className="sticky top-0 z-10 border-b border-slate-300 bg-white/95 px-4 py-3 backdrop-blur sm:px-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-xl font-bold text-slate-900">UPN QR Generator</h1>
                <p className="mt-0.5 text-sm text-slate-500">{status}</p>
              </div>
              <div
                className={`inline-flex h-9 items-center gap-2 rounded border px-3 text-sm font-semibold ${
                  isValid
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-amber-200 bg-amber-50 text-amber-700"
                }`}
              >
                {isValid ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                {isValid ? "Ready to generate" : `${validation.issues.length} validation issue${validation.issues.length === 1 ? "" : "s"}`}
              </div>
            </div>
          </header>

          <div className="grid gap-4 p-4 xl:grid-cols-[340px_minmax(0,1fr)] 2xl:grid-cols-[340px_minmax(520px,1fr)_minmax(380px,520px)]">
            <div className="grid content-start gap-4">
              <InvoiceUpload onExtracted={applyExtracted} />

              <section className="rounded-md border border-slate-300 bg-white shadow-sm">
                <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">
                  <FileText className="h-4 w-4 text-blue-600" />
                  Extraction Notes
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
                      Upload an invoice to see extraction source and model notes.
                    </span>
                  )}
                </div>
              </section>

              <section className="rounded-md border border-slate-300 bg-white shadow-sm">
                <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">
                  <ShieldCheck className="h-4 w-4 text-blue-600" />
                  Validation
                </div>
                <div className="grid gap-2 p-4 text-sm">
                  {validation.issues.length ? (
                    validation.issues.slice(0, 6).map((issue) => (
                      <div key={`${issue.field}-${issue.message}`} className="rounded border border-red-100 bg-red-50 px-3 py-2 text-red-700">
                        {issue.message}
                      </div>
                    ))
                  ) : (
                    <div className="rounded border border-emerald-100 bg-emerald-50 px-3 py-2 text-emerald-700">
                      All required UPN fields are valid.
                    </div>
                  )}
                </div>
              </section>
            </div>

            <PaymentForm value={fields} issues={validation.issues} onChange={updateFields} onGenerate={() => void generate()} />

            {qr ? (
              <QrResult fields={fields} svg={qr.svg} payload={qr.payload} />
            ) : (
              <section className="overflow-hidden rounded-md border border-slate-300 bg-white shadow-sm">
                <div className="border-b border-slate-200 bg-[#1f3d63] px-5 py-3 text-white">
                  <div className="flex items-center gap-2 text-base font-semibold">
                    <QrCode className="h-5 w-5" />
                    QR Preview
                  </div>
                  <p className="text-xs text-blue-100">Generated code appears here after validation passes.</p>
                </div>
                <div className="grid min-h-[520px] place-items-center p-5 text-center">
                  <div className="max-w-xs">
                    <div className="mx-auto mb-4 grid h-20 w-20 place-items-center rounded-md border border-dashed border-slate-300 bg-slate-50">
                      <UploadCloud className="h-9 w-9 text-slate-400" />
                    </div>
                    <strong className="block text-lg text-slate-900">No QR generated</strong>
                    <span className="mt-1 block text-sm text-slate-500">
                      Verify the extracted invoice fields, then generate a scan-ready UPN QR.
                    </span>
                  </div>
                </div>
              </section>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
