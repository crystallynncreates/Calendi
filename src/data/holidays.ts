export interface Holiday {
  name: string;
  month: number;
  day: number;
}

export const US_HOLIDAYS: Holiday[] = [
  { name: "New Year's Day", month: 1, day: 1 },
  { name: "Valentine's Day", month: 2, day: 14 },
  { name: "St. Patrick's Day", month: 3, day: 17 },
  { name: "Easter", month: 4, day: 5 },
  { name: "Mother's Day", month: 5, day: 11 },
  { name: "Memorial Day", month: 5, day: 26 },
  { name: "Juneteenth", month: 6, day: 19 },
  { name: "Independence Day", month: 7, day: 4 },
  { name: "Labor Day", month: 9, day: 1 },
  { name: "Columbus Day", month: 10, day: 13 },
  { name: "Halloween", month: 10, day: 31 },
  { name: "Veterans Day", month: 11, day: 11 },
  { name: "Thanksgiving", month: 11, day: 27 },
  { name: "Christmas Eve", month: 12, day: 24 },
  { name: "Christmas", month: 12, day: 25 },
  { name: "New Year's Eve", month: 12, day: 31 },
];

export function getHolidaysForDate(date: Date): Holiday[] {
  const m = date.getMonth() + 1;
  const d = date.getDate();
  return US_HOLIDAYS.filter(h => h.month === m && h.day === d);
}

export function getHolidaysForMonth(year: number, month: number): Map<number, Holiday[]> {
  const map = new Map<number, Holiday[]>();
  US_HOLIDAYS.filter(h => h.month === month).forEach(h => {
    const existing = map.get(h.day) || [];
    map.set(h.day, [...existing, h]);
  });
  return map;
}

export function getAutoSkinForDate(date: Date): 'violet' | 'cyan' | 'pink' | 'amber' {
  const m = date.getMonth() + 1;
  const d = date.getDate();

  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000
  );

  const upcoming = US_HOLIDAYS.find(h => {
    const hDay = new Date(date.getFullYear(), h.month - 1, h.day);
    const diff = (hDay.getTime() - date.getTime()) / 86400000;
    return diff >= 0 && diff <= 14;
  });

  if (upcoming) {
    const name = upcoming.name;
    if (name.includes('Valentine') || name.includes('Easter') || name.includes('Mother')) return 'pink';
    if (name.includes('Halloween') || name.includes('Thanksgiving') || name.includes('Christmas')) return 'amber';
    if (name.includes('Patrick') || name.includes('Memorial') || name.includes('Juneteenth')) return 'cyan';
    if (name.includes("New Year") || name.includes('Independence') || name.includes('Labor')) return 'violet';
  }

  if (m >= 3 && m <= 5) return 'cyan';
  if (m >= 6 && m <= 8) return 'amber';
  if (m >= 9 && m <= 11) return 'violet';
  return 'cyan';
}
