export function formatDateForStorage(date: Date): string {
  return `${date.getDate().toString().padStart(2, "0")}/${(
    date.getMonth() + 1
  ).toString().padStart(2, "0")}`;
}

export function parseStorageDate(dateStr: string): Date | null {
  const [day, month] = dateStr.split("/").map(Number);
  if (!day || !month) return null;
  const date = new Date(new Date().getFullYear(), month - 1, day);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function sortDatesAscending(dates: string[]): string[] {
  return [...dates].sort((a, b) => {
    const [dayA, monthA] = a.split("/").map(Number);
    const [dayB, monthB] = b.split("/").map(Number);
    if (monthA !== monthB) return monthA - monthB;
    return dayA - dayB;
  });
}

export function isoDateToStorageDate(isoDate: string): string | null {
  const date = new Date(isoDate + "T00:00");
  if (Number.isNaN(date.getTime())) return null;
  return formatDateForStorage(date);
}