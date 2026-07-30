"use client";

import type { PaymentFields, ValidationIssue } from "../lib/upn";

type Props = {
  value: PaymentFields;
  issues: ValidationIssue[];
  onChange: (next: PaymentFields) => void;
  onGenerate: () => void;
};

const FIELDS: Array<{ section: "Payer" | "Recipient" | "Payment"; name: keyof PaymentFields; label: string; placeholder?: string }> = [
  { section: "Payer", name: "payerName", label: "Name" },
  { section: "Payer", name: "payerAddress", label: "Address" },
  { section: "Payer", name: "payerCity", label: "City" },
  { section: "Recipient", name: "recipientName", label: "Name" },
  { section: "Recipient", name: "recipientAddress", label: "Address" },
  { section: "Recipient", name: "recipientCity", label: "City" },
  { section: "Payment", name: "amount", label: "Amount", placeholder: "160.38" },
  { section: "Payment", name: "iban", label: "IBAN", placeholder: "SI56 ..." },
  { section: "Payment", name: "reference", label: "Reference", placeholder: "SI00 44-614" },
  { section: "Payment", name: "purposeCode", label: "Purpose code", placeholder: "OTHR" },
  { section: "Payment", name: "purpose", label: "Purpose", placeholder: "RACUN 44-25" },
  { section: "Payment", name: "dueDate", label: "Due date", placeholder: "DD.MM.YYYY" }
];

export function PaymentForm({ value, issues, onChange, onGenerate }: Props) {
  const issueByField = new Map(issues.map((issue) => [issue.field, issue.message]));

  function updateField(name: keyof PaymentFields, fieldValue: string) {
    onChange({ ...value, [name]: fieldValue });
  }

  return (
    <section className="panel formPanel">
      {(["Payer", "Recipient", "Payment"] as const).map((section) => (
        <div className="formSection" key={section}>
          <h2>{section}</h2>
          <div className="formGrid">
            {FIELDS.filter((field) => field.section === section).map((field) => (
              <label className="field" key={field.name}>
                <span>{field.label}</span>
                <input
                  value={value[field.name]}
                  placeholder={field.placeholder}
                  onChange={(event) => updateField(field.name, event.target.value)}
                />
                {issueByField.get(field.name) ? <small>{issueByField.get(field.name)}</small> : null}
              </label>
            ))}
          </div>
        </div>
      ))}

      <button className="generateButton" onClick={onGenerate} disabled={issues.length > 0}>
        Generate QR
      </button>
    </section>
  );
}
