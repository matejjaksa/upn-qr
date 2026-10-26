"use client";

import { FileText, UploadCloud } from "lucide-react";
import { useRef, useState } from "react";
import type { ConversionCost, ExtractedInvoiceFields, ExtractionResponse } from "../lib/extraction/types";

type Props = {
  onExtracted: (fields: ExtractedInvoiceFields, notes: string[], cost: ConversionCost) => void;
};

export function InvoiceUpload({ onExtracted }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState("Drop invoice PDF or image here");
  const [isExtracting, setIsExtracting] = useState(false);

  function extractionEndpoint() {
    if (typeof window === "undefined") return "/api/extract";
    const path = window.location.pathname.replace(/\/$/, "");
    return path ? `${path}/api/extract` : "/api/extract";
  }

  async function upload(file: File | undefined) {
    if (!file) return;
    setIsExtracting(true);
    setStatus(`Extracting ${file.name}...`);
    const data = new FormData();
    data.append("file", file);

    try {
      const response = await fetch(extractionEndpoint(), { method: "POST", body: data });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json?.error ?? "Invoice extraction failed.");
      }
      const result = json as ExtractionResponse;
      onExtracted(result.fields, [`Source: ${result.source}`, ...result.notes], result.cost);
      setStatus("Extraction complete. Verify the form before generating.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Invoice extraction failed.");
    } finally {
      setIsExtracting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  return (
    <section
      className={`rounded-md border bg-white p-4 shadow-sm transition ${
        isDragging ? "border-blue-500 ring-4 ring-blue-100" : "border-slate-300"
      }`}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragging(false);
        void upload(event.dataTransfer.files[0]);
      }}
    >
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
        <FileText className="h-4 w-4 text-blue-600" />
        Invoice Upload
      </div>
      <div className="grid min-h-44 place-items-center rounded border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center">
        <UploadCloud className="mb-3 h-10 w-10 text-blue-500" />
        <strong className="text-lg text-slate-900">{status.startsWith("Drop ") ? "Drop invoice here" : status}</strong>
        <span className="mt-1 text-sm text-slate-500">PDF, JPG or PNG</span>
        <input
          ref={fileInputRef}
          className="sr-only"
          type="file"
          accept="application/pdf,image/png,image/jpeg"
          onChange={(event) => void upload(event.target.files?.[0])}
        />
        <button
          className="mt-5 inline-flex h-10 cursor-pointer items-center rounded bg-[#2b72bd] px-5 text-sm font-semibold text-white hover:bg-[#245f9d] disabled:cursor-not-allowed disabled:bg-slate-300"
          type="button"
          disabled={isExtracting}
          onClick={() => fileInputRef.current?.click()}
        >
          Choose file
        </button>
      </div>
    </section>
  );
}
