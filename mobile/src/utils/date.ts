export function formatDateForStorage(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function dateToDayNumber(value: string): number {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return Number.NaN;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const timestamp = Date.UTC(year, month - 1, day);
  const parsed = new Date(timestamp);

  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    return Number.NaN;
  }

  return Math.floor(timestamp / 86_400_000);
}

export function shiftCalendarDate(value: string, days: number): string {
  const dayNumber = dateToDayNumber(value);
  if (!Number.isFinite(dayNumber) || !Number.isFinite(days)) return value;

  return new Date((dayNumber + Math.ceil(days)) * 86_400_000).toISOString().slice(0, 10);
}

export function parseDateForPicker(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  return Number.isNaN(date.getTime()) ? new Date() : date;
}
