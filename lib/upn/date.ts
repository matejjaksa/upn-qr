export function normalizeDueDate(input: string): string {
  const trimmed = input.trim();
  const sl = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(trimmed);
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  const parts = sl ? [sl[1], sl[2], sl[3]] : iso ? [iso[3], iso[2], iso[1]] : null;

  if (!parts) {
    throw new Error("Due date must be DD.MM.YYYY.");
  }

  const [day, month, year] = parts;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  if (
    date.getFullYear() !== Number(year) ||
    date.getMonth() !== Number(month) - 1 ||
    date.getDate() !== Number(day)
  ) {
    throw new Error("Due date is not a valid calendar date.");
  }

  return `${day}.${month}.${year}`;
}
