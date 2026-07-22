export interface Holiday { name: string; month: number; day: number }

export const US_HOLIDAYS: Holiday[] = [
  { name: "New Year's Day",    month: 1,  day: 1  },
  { name: "Valentine's Day",   month: 2,  day: 14 },
  { name: "St. Patrick's Day", month: 3,  day: 17 },
  { name: "Easter",            month: 4,  day: 5  },
  { name: "Mother's Day",      month: 5,  day: 11 },
  { name: "Memorial Day",      month: 5,  day: 26 },
  { name: "Juneteenth",        month: 6,  day: 19 },
  { name: "Independence Day",  month: 7,  day: 4  },
  { name: "Labor Day",         month: 9,  day: 1  },
  { name: "Columbus Day",      month: 10, day: 13 },
  { name: "Halloween",         month: 10, day: 31 },
  { name: "Veterans Day",      month: 11, day: 11 },
  { name: "Thanksgiving",      month: 11, day: 27 },
  { name: "Christmas Eve",     month: 12, day: 24 },
  { name: "Christmas",         month: 12, day: 25 },
  { name: "New Year's Eve",    month: 12, day: 31 },
];

export function getHolidaysForDate(date: Date): Holiday[] {
  const m = date.getMonth() + 1;
  const d = date.getDate();
  return US_HOLIDAYS.filter(h => h.month === m && h.day === d);
}

export function getHolidaysForMonth(year: number, month: number): Map<number, Holiday[]> {
  const map = new Map<number, Holiday[]>();
  US_HOLIDAYS.filter(h => h.month === month).forEach(h => {
    map.set(h.day, [...(map.get(h.day) || []), h]);
  });
  return map;
}

export function getAutoSkinForDate(date: Date): string {
  const m = date.getMonth() + 1;
  const d = date.getDate();

  // Check upcoming holidays within 14 days
  const upcoming = US_HOLIDAYS.find(h => {
    const hDay = new Date(date.getFullYear(), h.month - 1, h.day);
    const diff = (hDay.getTime() - date.getTime()) / 86400000;
    return diff >= 0 && diff <= 14;
  });

  // Also check if we're within a holiday window now
  const current = US_HOLIDAYS.find(h => {
    const hDay = new Date(date.getFullYear(), h.month - 1, h.day);
    const diff = Math.abs((hDay.getTime() - date.getTime()) / 86400000);
    return diff <= 3;
  });

  const target = current || upcoming;
  if (target) {
    const name = target.name;
    // Winter holidays → snow
    if (name.includes('Christmas') || name.includes("New Year"))   return 'winter-snow';
    // Spring/love holidays → cherry blossom
    if (name.includes('Valentine') || name.includes('Easter') || name.includes('Mother')) return 'cherry-blossom';
    // Patriotic / summer holidays → tropical beach
    if (name.includes('Independence') || name.includes('Memorial') || name.includes('Juneteenth')) return 'tropical-beach';
    // Fall/spooky → amber color
    if (name.includes('Halloween'))   return 'amber';
    if (name.includes('Thanksgiving') || name.includes('Labor') || name.includes('Veterans')) return 'forest';
    if (name.includes('Patrick'))     return 'forest';
    if (name.includes('Columbus'))    return 'mountain';
  }

  // Season-based fallback
  if (m === 12 || m === 1 || (m === 2 && d < 14)) return 'winter-snow';
  if (m >= 3 && m <= 5)   return 'cherry-blossom';
  if (m >= 6 && m <= 8)   return 'tropical-beach';
  if (m >= 9 && m <= 11)  return 'forest';
  return 'violet';
}
