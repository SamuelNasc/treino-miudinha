// Door 5: dates are the device's local calendar date as "YYYY-MM-DD"; weeks start on Monday.

const pad = (n: number) => String(n).padStart(2, "0");

export function localDate(d: Date = new Date()): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function parse(date: string): Date {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(date: string, days: number): string {
  const d = parse(date);
  d.setDate(d.getDate() + days);
  return localDate(d);
}

/** Calendar days from `from` to `to`; negative when `to` is earlier. */
export function daysBetween(from: string, to: string): number {
  const utc = (date: string) => {
    const [y, m, d] = date.split("-").map(Number);
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((utc(to) - utc(from)) / 86_400_000);
}

/** 0 = Monday ... 6 = Sunday */
export function weekdayIndex(date: string): number {
  return (parse(date).getDay() + 6) % 7;
}

export function weekStart(date: string): string {
  return addDays(date, -weekdayIndex(date));
}

/** True for a real calendar date written as "YYYY-MM-DD". */
export function isLocalDate(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && localDate(parse(value)) === value;
}
