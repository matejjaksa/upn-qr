"use client";

import { useState } from "react";
import type { ExtractedInvoiceFields, ExtractionResponse } from "../lib/extraction/types";

type Props = {
  onExtracted: (fields: ExtractedInvoiceFields, notes: string[]) => void;
};

export function InvoiceUpload({ onExtracted }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState("Drop invoice PDF or image here");

  async function upload(file: File | undefined) {
    if (!file) return;
    setStatus(`Extracting ${file.name}...`);
    const data = new FormData();
    data.append("file", file);

    try {
      const response = await fetch("api/extract", { method: "POST", body: data });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json?.error ?? "Invoice extraction failed.");
      }
      const result = json as ExtractionResponse;
      onExtracted(result.fields, [`Source: ${result.source}`, ...result.notes]);
      setStatus("Extraction complete. Verify the form before generating.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Invoice extraction failed.");
    }
  }

  return (
    <section
      className={`uploadPanel ${isDragging ? "dragging" : ""}`}
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
      <strong>Drop invoice PDF or image here</strong>
      <span>{status}</span>
      <label>
        <input
          type="file"
          accept="application/pdf,image/png,image/jpeg"
          onChange={(event) => void upload(event.target.files?.[0])}
        />
        Choose file
      </label>
    </section>
  );
}
