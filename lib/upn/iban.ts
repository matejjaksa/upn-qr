export function normalizeIban(input: string): string {
  return repairSlovenianIban(input) ?? input.trim().replace(/[\s-]+/g, "").toUpperCase();
}

export function formatIbanForDisplay(input: string): string {
  const iban = normalizeIban(input);
  if (/^SI\d{17}$/.test(iban)) {
    return `${iban.slice(0, 4)} ${iban.slice(4, 8)} ${iban.slice(8, 12)} ${iban.slice(12, 16)} ${iban.slice(16)}`;
  }
  return iban.replace(/(.{4})/g, "$1 ").trim();
}

export function validateIban(input: string): boolean {
  const iban = normalizeIban(input);
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{1,30}$/.test(iban)) {
    return false;
  }

  const rearranged = iban.slice(4) + iban.slice(0, 4);
  let remainder = 0;
  for (const char of rearranged) {
    const value = /[A-Z]/.test(char) ? String(char.charCodeAt(0) - 55) : char;
    for (const digit of value) {
      remainder = (remainder * 10 + Number(digit)) % 97;
    }
  }

  return remainder === 1;
}

export function repairSlovenianIban(input: string): string | null {
  const compact = input.trim().replace(/[\s-]+/g, "").toUpperCase();
  if (isValidIban(compact)) return compact;

  const trrMatch = /^(\d{5})(\d{10})$/.exec(compact);
  if (trrMatch) {
    const bban = `00${trrMatch[1]}${trrMatch[2]}`;
    const checkDigits = computeIbanCheckDigits("SI", bban);
    const repaired = `SI${checkDigits}${bban}`;
    if (isValidIban(repaired)) return repaired;
  }

  return null;
}

function isValidIban(iban: string): boolean {
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{1,30}$/.test(iban)) {
    return false;
  }

  return ibanMod97(iban.slice(4) + iban.slice(0, 4)) === 1;
}

function computeIbanCheckDigits(countryCode: string, bban: string): string {
  const remainder = ibanMod97(`${bban}${countryCode.toUpperCase()}00`);
  return String(98 - remainder).padStart(2, "0");
}

function ibanMod97(value: string): number {
  let remainder = 0;
  for (const char of value) {
    const expanded = /[A-Z]/.test(char) ? String(char.charCodeAt(0) - 55) : char;
    for (const digit of expanded) {
      remainder = (remainder * 10 + Number(digit)) % 97;
    }
  }
  return remainder;
}
