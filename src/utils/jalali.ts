/**
 * =============================================================================
 *  Jalali (Persian/Solar Hijri) <-> Gregorian Calendar Converter
 * =============================================================================
 */

// ==================== Types ====================

/** A Jalali (Persian) calendar date */
export interface JalaliDate {
  jy: number; // year
  jm: number; // month (1-12)
  jd: number; // day
}

/** A Gregorian calendar date */
export interface GregorianDate {
  gy: number; // year
  gm: number; // month (1-12)
  gd: number; // day
}

// ==================== Basic math helpers ====================

function div(a: number, b: number): number {
  return Math.trunc(a / b);
}

function mod(a: number, b: number): number {
  return a - Math.trunc(a / b) * b;
}

// ==================== Jalali leap-cycle break-point table ====================

const JALALI_BREAKS: readonly number[] = [
  -61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210,
  1635, 2060, 2097, 2192, 2262, 2324, 2394, 2456, 3178,
];

const MIN_JALALI_YEAR = JALALI_BREAKS[0];
const MAX_JALALI_YEAR = JALALI_BREAKS[JALALI_BREAKS.length - 1] - 1;

interface JalCalInfo {
  leap: number;
  gy: number;
  march: number;
}

function jalCal(jy: number): JalCalInfo {
  if (jy < MIN_JALALI_YEAR || jy > MAX_JALALI_YEAR) {
    throw new Error(
      `Jalali year ${jy} is outside the valid range (${MIN_JALALI_YEAR} to ${MAX_JALALI_YEAR}).`
    );
  }

  const gy = jy + 621;
  let leapJ = -14;
  let jp = JALALI_BREAKS[0];
  let jump = 0;

  for (let i = 1; i < JALALI_BREAKS.length; i += 1) {
    const jm = JALALI_BREAKS[i];
    jump = jm - jp;
    if (jy < jm) break;
    leapJ += div(jump, 33) * 8 + div(mod(jump, 33), 4);
    jp = jm;
  }

  let n = jy - jp;
  leapJ += div(n, 33) * 8 + div(mod(n, 33) + 3, 4);

  if (mod(jump, 33) === 4 && jump - n === 4) {
    leapJ += 1;
  }

  const leapG = div(gy, 4) - div((div(gy, 100) + 1) * 3, 4) - 150;
  const march = 20 + leapJ - leapG;

  if (jump - n < 6) {
    n = n - jump + div(jump + 4, 33) * 33;
  }

  let leap = mod(mod(n + 1, 33) - 1, 4);
  if (leap === -1) leap = 4;

  return { leap, gy, march };
}

// ==================== Leap years ====================

export function isLeapJalaliYear(jy: number): boolean {
  return jalCal(jy).leap === 0;
}

export function isLeapGregorianYear(gy: number): boolean {
  return (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0;
}

// ==================== Month lengths ====================

export function jalaliMonthLength(jy: number, jm: number): number {
  if (jm < 1 || jm > 12) throw new Error(`Invalid month number: ${jm}`);
  if (jm <= 6) return 31;
  if (jm <= 11) return 30;
  return isLeapJalaliYear(jy) ? 30 : 29;
}

export function gregorianMonthLength(gy: number, gm: number): number {
  if (gm < 1 || gm > 12) throw new Error(`Invalid month number: ${gm}`);
  const lengths = [31, isLeapGregorianYear(gy) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return lengths[gm - 1];
}

// ==================== Validation ====================

export function isValidJalaliDate(jy: number, jm: number, jd: number): boolean {
  if (jy < MIN_JALALI_YEAR || jy > MAX_JALALI_YEAR) return false;
  if (jm < 1 || jm > 12) return false;
  if (jd < 1) return false;
  return jd <= jalaliMonthLength(jy, jm);
}

export function isValidGregorianDate(gy: number, gm: number, gd: number): boolean {
  if (gm < 1 || gm > 12) return false;
  if (gd < 1) return false;
  return gd <= gregorianMonthLength(gy, gm);
}

// ==================== Conversion to/from Julian Day Number (JDN) ====================

function gregorianToJdn(gy: number, gm: number, gd: number): number {
  let d =
    div((gy + div(gm - 8, 6) + 100100) * 1461, 4) +
    div(153 * mod(gm + 9, 12) + 2, 5) +
    gd -
    34840408;
  d = d - div(div(gy + 100100 + div(gm - 8, 6), 100) * 3, 4) + 752;
  return d;
}

function jdnToGregorian(jdn: number): GregorianDate {
  let j = 4 * jdn + 139361631;
  j += div(div(4 * jdn + 183187720, 146097) * 3, 4) * 4 - 3908;
  const i = div(mod(j, 1461), 4) * 5 + 308;
  const gd = div(mod(i, 153), 5) + 1;
  const gm = mod(div(i, 153), 12) + 1;
  const gy = div(j, 1461) - 100100 + div(8 - gm, 6);
  return { gy, gm, gd };
}

function jalaliToJdn(jy: number, jm: number, jd: number): number {
  const r = jalCal(jy);
  return gregorianToJdn(r.gy, 3, r.march) + (jm - 1) * 31 - div(jm, 7) * (jm - 7) + jd - 1;
}

function jdnToJalali(jdn: number): JalaliDate {
  const gy = jdnToGregorian(jdn).gy;
  let jy = gy - 621;
  const r = jalCal(jy);
  const jdn1f = gregorianToJdn(gy, 3, r.march);
  let k = jdn - jdn1f;
  let jm: number;
  let jd: number;

  if (k >= 0) {
    if (k <= 185) {
      jm = 1 + div(k, 31);
      jd = mod(k, 31) + 1;
      return { jy, jm, jd };
    }
    k -= 186;
  } else {
    jy -= 1;
    k += 179;
    if (r.leap === 1) k += 1;
  }

  jm = 7 + div(k, 30);
  jd = mod(k, 30) + 1;
  return { jy, jm, jd };
}

// ==================== Main conversion functions (public API) ====================

export function jalaliToGregorian(jy: number, jm: number, jd: number): GregorianDate {
  if (!isValidJalaliDate(jy, jm, jd)) {
    throw new Error(`Invalid Jalali date: ${jy}/${jm}/${jd}`);
  }
  return jdnToGregorian(jalaliToJdn(jy, jm, jd));
}

export function gregorianToJalali(gy: number, gm: number, gd: number): JalaliDate {
  if (!isValidGregorianDate(gy, gm, gd)) {
    throw new Error(`Invalid Gregorian date: ${gy}/${gm}/${gd}`);
  }
  return jdnToJalali(gregorianToJdn(gy, gm, gd));
}

// ==================== Interop with JS Date ====================

export function jalaliToDate(jy: number, jm: number, jd: number): Date {
  const g = jalaliToGregorian(jy, jm, jd);
  return new Date(g.gy, g.gm - 1, g.gd);
}

export function dateToJalali(date: Date): JalaliDate {
  return gregorianToJalali(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

export function todayJalali(): JalaliDate {
  return dateToJalali(new Date());
}

// ==================== Month and weekday names ====================

export const JALALI_MONTH_NAMES: readonly string[] = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند',
];

export const JALALI_WEEKDAY_NAMES_PERSIAN_ORDER: readonly string[] = [
  'ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'
];

export function jalaliWeekDayName(jy: number, jm: number, jd: number): string {
  const date = jalaliToDate(jy, jm, jd);
  const names = ['یکشنبه', 'دوشنبه', 'سهشنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'];
  return names[date.getDay()];
}

export function toPersianDigits(input: string | number): string {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(input).replace(/[0-9]/g, (digit) => persianDigits[Number(digit)]);
}

export function formatJalaliNumeric(
  date: JalaliDate,
  options: { separator?: string; persianDigits?: boolean } = {}
): string {
  const { separator = '/', persianDigits = false } = options;
  const pad = (n: number) => n.toString().padStart(2, '0');
  const result = `${date.jy}${separator}${pad(date.jm)}${separator}${pad(date.jd)}`;
  return persianDigits ? toPersianDigits(result) : result;
}

export function formatJalaliLong(
  date: JalaliDate,
  options: { withWeekDay?: boolean; persianDigits?: boolean } = {}
): string {
  const { withWeekDay = false, persianDigits = true } = options;
  const monthName = JALALI_MONTH_NAMES[date.jm - 1];
  const dayStr = persianDigits ? toPersianDigits(date.jd) : String(date.jd);
  const yearStr = persianDigits ? toPersianDigits(date.jy) : String(date.jy);
  const base = `${dayStr} ${monthName} ${yearStr}`;
  if (!withWeekDay) return base;
  return `${jalaliWeekDayName(date.jy, date.jm, date.jd)} ${base}`;
}

/**
 * Parses any incoming timestamp (numeric ms/seconds, numeric string, ISO string, Date object) to a JS Date.
 */
export function parseAnyTimestampToDate(val: any): Date | null {
  if (val === null || val === undefined || val === '') return null;
  if (val instanceof Date) return isNaN(val.getTime()) ? null : val;

  // If number or numeric string
  if (typeof val === 'number' || (typeof val === 'string' && /^\d+$/.test(val.trim()))) {
    const num = typeof val === 'number' ? val : Number(val.trim());
    if (isNaN(num)) return null;
    // If Unix timestamp in seconds (< 10,000,000,000), convert to ms
    const ms = num < 10000000000 ? num * 1000 : num;
    const d = new Date(ms);
    return isNaN(d.getTime()) ? null : d;
  }

  // String format (ISO date, YYYY-MM-DD, etc.)
  if (typeof val === 'string') {
    const d = new Date(val);
    if (!isNaN(d.getTime())) return d;
  }

  return null;
}
