"use client";

import { ConversionCost } from "./ConversionCost";
import type { ConversionCost as Cost } from "../lib/extraction/types";
import { ClipboardCopy, Download, QrCode } from "lucide-react";
import { displayAmount, formatIbanForDisplay, type PaymentFields } from "../lib/upn";

type Props = {
  fields: PaymentFields;
  cost: Cost | null;
  svg: string;
  payload: string;
};

export function QrResult({ fields, svg, payload, cost }: Props) {
  const paymentData = [
    fields.recipientName,
    displayAmount(fields.amount),
    `Due: ${fields.dueDate}`,
    `IBAN: ${formatIbanForDisplay(fields.iban)}`,
    `Reference: ${fields.reference}`,
    `Purpose: ${fields.purpose}`
  ].join("\n");

  function downloadPng() {
    const image = new Image();
    const svgBlob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(svgBlob);
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 1024;
      canvas.height = 1024;
      const context = canvas.getContext("2d");
      if (!context) return;
      context.imageSmoothingEnabled = false;
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      const link = document.createElement("a");
      link.download = "upn-qr.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    image.src = url;
  }

  return (
    <section className="overflow-hidden rounded-md border border-slate-300 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-[#1f3d63] px-5 py-3 text-white">
        <div className="flex items-center gap-2 text-base font-semibold">
          <QrCode className="h-5 w-5" />
          Scan Payment
        </div>
        <p className="text-xs text-blue-100">Open the banking app and scan directly from this screen.</p>
      </div>

      <div className="p-5">
        {cost && <div className="mb-4"><ConversionCost cost={cost} /></div>}
        <div className="grid gap-1 rounded-md border border-slate-200 bg-slate-50 p-4">
          <strong className="text-lg text-slate-900">{fields.recipientName}</strong>
          <b className="text-3xl text-[#1f3d63]">{displayAmount(fields.amount)}</b>
          <span className="text-sm text-slate-600">Due: {fields.dueDate}</span>
          <span className="break-all text-sm text-slate-600">IBAN: {formatIbanForDisplay(fields.iban)}</span>
          <span className="text-sm text-slate-600">Reference: {fields.reference}</span>
          <span className="text-sm text-slate-600">Purpose: {fields.purpose}</span>
        </div>

        <div className="qrFrame mt-4 grid place-items-center rounded-md border border-slate-200 bg-white p-3 shadow-inner" dangerouslySetInnerHTML={{ __html: svg }} />

        <div className="mt-4 grid grid-cols-2 gap-3">
          <button className="inline-flex h-10 items-center justify-center gap-2 rounded border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50" onClick={downloadPng}>
            <Download className="h-4 w-4" />
            Download PNG
          </button>
          <button
            className="inline-flex h-10 items-center justify-center gap-2 rounded border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            onClick={() => void navigator.clipboard.writeText(paymentData)}
          >
            <ClipboardCopy className="h-4 w-4" />
            Copy data
          </button>
        </div>

        <details className="mt-4 border-t border-slate-200 pt-3">
          <summary className="cursor-pointer text-sm font-semibold text-blue-700">UPN payload</summary>
          <pre className="mt-2 whitespace-pre-wrap break-all rounded bg-slate-950 p-3 text-xs text-slate-100">{payload}</pre>
        </details>
      </div>
    </section>
  );
}
