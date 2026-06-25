export function generateId(): string {
  return crypto.randomUUID();
}

export function calcDDay(deadlineStr: string | null): number | null {
  if (!deadlineStr) return null;
  // "2026. 06. 26.(금) 10:00" → "2026-06-26"
  const dateOnly = deadlineStr.match(/(\d{4})[.\s\-]+(\d{1,2})[.\s\-]+(\d{1,2})/);
  if (!dateOnly) return null;
  const normalized = `${dateOnly[1]}-${dateOnly[2].padStart(2,'0')}-${dateOnly[3].padStart(2,'0')}`;
  const date = new Date(normalized);
  if (isNaN(date.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  return Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function formatCurrency(value: string): string {
  return value;
}
