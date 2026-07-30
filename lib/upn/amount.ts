export function formatAmount(input: string): string {
  const normalized = input.trim().replace(/\s/g, "").replace(/(?:EUR|€)$/i, "");
  const decimalComma = normalized.includes(",") && normalized.lastIndexOf(",") > normalized.lastIndexOf(".");
  const withoutThousands = decimalComma ? normalized.replace(/\./g, "").replace(",", ".") : normalized.replace(/,/g, "");

  if (!/^\d+(\.\d{1,2})?$/.test(withoutThousands)) {
    throw new Error("Amount must be a positive EUR amount with up to 2 decimals.");
  }

  const [euros, cents = ""] = withoutThousands.split(".");
  const centValue = BigInt(euros) * 100n + BigInt((cents + "00").slice(0, 2));
  if (centValue <= 0n) {
    throw new Error("Amount must be greater than 0.");
  }
  if (centValue > 99999999999n) {
    throw new Error("Amount does not fit the 11 digit UPN amount field.");
  }

  return centValue.toString().padStart(11, "0");
}

export function displayAmount(input: string): string {
  const payload = formatAmount(input);
  const cents = payload.slice(-2);
  const euros = String(Number(payload.slice(0, -2)));
  return `${euros}.${cents} EUR`;
}
