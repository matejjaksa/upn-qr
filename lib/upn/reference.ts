export function normalizeReference(input: string): string {
  return input.trim().toUpperCase().replace(/[\s-]+/g, "");
}

export function validateReference(input: string): boolean {
  const normalized = normalizeReference(input);
  if (!/^(SI|RF)\d{2}[A-Z0-9]{0,22}$/.test(normalized)) {
    return false;
  }
  return normalized.length <= 26;
}
