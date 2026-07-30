const ASCII_MAP: Record<string, string> = {
  Č: "C",
  č: "c",
  Š: "S",
  š: "s",
  Ž: "Z",
  ž: "z",
  Ć: "C",
  ć: "c",
  Đ: "D",
  đ: "d"
};

export function normalizeAscii(value: string): string {
  return value
    .trim()
    .replace(/[ČčŠšŽžĆćĐđ]/g, (char) => ASCII_MAP[char] ?? char)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E]/g, "")
    .replace(/[“”„]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[–—−]/g, "-")
    .replace(/\s+/g, " ")
    .toUpperCase();
}

export function isAscii(value: string): boolean {
  return /^[\x00-\x7F]*$/.test(value);
}
