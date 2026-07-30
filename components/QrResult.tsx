"use client";

import { displayAmount, formatIbanForDisplay, type PaymentFields } from "../lib/upn";

type Props = {
  fields: PaymentFields;
  svg: string;
  payload: string;
};

export function QrResult({ fields, svg, payload }: Props) {
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
    <section className="panel resultPanel">
      <div className="paymentSummary">
        <strong>{fields.recipientName}</strong>
        <b>{displayAmount(fields.amount)}</b>
        <span>Due: {fields.dueDate}</span>
        <span>IBAN: {formatIbanForDisplay(fields.iban)}</span>
        <span>Reference: {fields.reference}</span>
        <span>Purpose: {fields.purpose}</span>
      </div>

      <div className="qrFrame" dangerouslySetInnerHTML={{ __html: svg }} />

      <div className="resultActions">
        <button onClick={downloadPng}>Download PNG</button>
        <button onClick={() => void navigator.clipboard.writeText(paymentData)}>Copy payment data</button>
      </div>

      <details className="payloadDetails">
        <summary>UPN payload</summary>
        <pre>{payload}</pre>
      </details>
    </section>
  );
}
