export type PaymentFields = {
  payerName: string;
  payerAddress: string;
  payerCity: string;
  recipientName: string;
  recipientAddress: string;
  recipientCity: string;
  amount: string;
  iban: string;
  reference: string;
  purposeCode: string;
  purpose: string;
  dueDate: string;
};

export type ValidationIssue = {
  field: keyof PaymentFields | "payload";
  message: string;
};

export type ValidationResult = {
  ok: boolean;
  issues: ValidationIssue[];
};

export type BuiltUpnPayload = {
  payload: string;
  bodyLength: number;
  fields: string[];
  normalized: {
    amount: string;
    iban: string;
    reference: string;
    dueDate: string;
  };
};
