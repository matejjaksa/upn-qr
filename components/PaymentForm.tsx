"use client";

import { CalendarDays, CircleAlert, QrCode } from "lucide-react";
import type { PaymentFields, ValidationIssue } from "../lib/upn";

type Props = {
  value: PaymentFields;
  issues: ValidationIssue[];
  onChange: (next: PaymentFields) => void;
  onGenerate: () => void;
};

const GROUPS: Array<{
  title: string;
  fields: Array<{ name: keyof PaymentFields; label: string; placeholder?: string; wide?: boolean }>;
}> = [
  {
    title: "Payer",
    fields: [
      { name: "payerName", label: "Name", wide: true },
      { name: "payerAddress", label: "Address" },
      { name: "payerCity", label: "City" }
    ]
  },
  {
    title: "Recipient",
    fields: [
      { name: "recipientName", label: "Name", wide: true },
      { name: "recipientAddress", label: "Address" },
      { name: "recipientCity", label: "City" }
    ]
  },
  {
    title: "Payment",
    fields: [
      { name: "amount", label: "Amount", placeholder: "160.38" },
      { name: "iban", label: "IBAN", placeholder: "SI56 ...", wide: true },
      { name: "reference", label: "Reference", placeholder: "SI00 44-614" },
      { name: "purposeCode", label: "Purpose code", placeholder: "OTHR" },
      { name: "purpose", label: "Purpose", placeholder: "RACUN 44-25" },
      { name: "dueDate", label: "Due date", placeholder: "DD.MM.YYYY" }
    ]
  }
];

export function PaymentForm({ value, issues, onChange, onGenerate }: Props) {
  const issueByField = new Map(issues.map((issue) => [issue.field, issue.message]));

  function updateField(name: keyof PaymentFields, fieldValue: string) {
    onChange({ ...value, [name]: fieldValue });
  }

  return (
    <section className="overflow-hidden rounded-md border border-slate-300 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 bg-[#1f3d63] px-5 py-3 text-white">
        <div>
          <h2 className="text-base font-semibold tracking-wide">Review Payment Fields</h2>
          <p className="text-xs text-blue-100">Edit extracted data before QR generation.</p>
        </div>
        <div className={`rounded px-2 py-1 text-xs font-semibold ${issues.length ? "bg-amber-500/20 text-amber-100" : "bg-emerald-500/20 text-emerald-100"}`}>
          {issues.length ? `${issues.length} field${issues.length > 1 ? "s" : ""} need attention` : "Ready"}
        </div>
      </div>

      <div className="grid gap-4 p-5">
        {GROUPS.map((group) => (
          <section key={group.title} className="overflow-hidden rounded-md border border-slate-200">
            <div className="border-b border-slate-200 bg-[#f8fafc] px-4 py-2 text-sm font-semibold text-slate-700">
              {group.title}
            </div>
            <div className="grid grid-cols-1 gap-x-4 gap-y-3 p-4 md:grid-cols-2">
              {group.fields.map((field) => {
                const issue = issueByField.get(field.name);
                return (
                  <label className={field.wide ? "grid gap-1 md:col-span-2" : "grid gap-1"} key={field.name}>
                    <span className="text-sm font-medium text-slate-600">{field.label}</span>
                    <div className="relative">
                      <input
                        className={`h-10 w-full rounded border bg-white px-3 text-[15px] font-semibold text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
                          issue ? "border-red-300 pr-9" : "border-slate-300"
                        }`}
                        value={value[field.name]}
                        placeholder={field.placeholder}
                        onChange={(event) => updateField(field.name, event.target.value)}
                      />
                      {field.name === "dueDate" ? (
                        <CalendarDays className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
                      ) : null}
                      {issue ? <CircleAlert className="absolute right-3 top-2.5 h-4 w-4 text-red-500" /> : null}
                    </div>
                    {issue ? <small className="text-xs font-medium text-red-600">{issue}</small> : null}
                  </label>
                );
              })}
            </div>
          </section>
        ))}

        <button
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#2b72bd] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#245f9d] disabled:cursor-not-allowed disabled:bg-slate-300"
          onClick={onGenerate}
          disabled={issues.length > 0}
        >
          <QrCode className="h-4 w-4" />
          Generate QR
        </button>
      </div>
    </section>
  );
}
