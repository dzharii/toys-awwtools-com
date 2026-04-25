import { addPlainDateDays, comparePlainDate, createPlainDate, plainDateDayOfWeek, plainDateToString } from "./timezone.js";

function normalizeName(name) {
  return String(name).toLocaleLowerCase("en-US").replace(/['.]/g, "").replace(/\s+/g, " ").trim();
}

function nthWeekday(year, month, weekday, nth) {
  let date = createPlainDate(year, month, 1);
  const delta = (weekday - plainDateDayOfWeek(date) + 7) % 7;
  date = addPlainDateDays(date, delta + (nth - 1) * 7);
  return date;
}

function lastWeekday(year, month, weekday) {
  let date = createPlainDate(year, month + 1, 1);
  date = addPlainDateDays(date, -1);
  const delta = (plainDateDayOfWeek(date) - weekday + 7) % 7;
  return addPlainDateDays(date, -delta);
}

function observedDate(actualDate) {
  const weekday = plainDateDayOfWeek(actualDate);
  if (weekday === 6) {
    return addPlainDateDays(actualDate, -1);
  }
  if (weekday === 0) {
    return addPlainDateDays(actualDate, 1);
  }
  return actualDate;
}

function easterSunday(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return createPlainDate(year, month, day);
}

const FEDERAL = [
  {
    id: "newYearsDay",
    name: "New Year's Day",
    aliases: ["new year", "new years day", "new year's day"],
    actual: (year) => createPlainDate(year, 1, 1),
  },
  {
    id: "mlkDay",
    name: "Birthday of Martin Luther King, Jr.",
    aliases: ["mlk day", "martin luther king day", "martin luther king jr day"],
    actual: (year) => nthWeekday(year, 1, 1, 3),
  },
  {
    id: "washingtonsBirthday",
    name: "Washington's Birthday",
    aliases: ["washingtons birthday", "washington's birthday", "presidents day", "president's day"],
    actual: (year) => nthWeekday(year, 2, 1, 3),
  },
  { id: "memorialDay", name: "Memorial Day", aliases: ["memorial day"], actual: (year) => lastWeekday(year, 5, 1) },
  { id: "juneteenth", name: "Juneteenth National Independence Day", aliases: ["juneteenth"], actual: (year) => createPlainDate(year, 6, 19) },
  {
    id: "independenceDay",
    name: "Independence Day",
    aliases: ["independence day", "july 4", "fourth of july"],
    actual: (year) => createPlainDate(year, 7, 4),
  },
  { id: "laborDay", name: "Labor Day", aliases: ["labor day"], actual: (year) => nthWeekday(year, 9, 1, 1) },
  { id: "columbusDay", name: "Columbus Day", aliases: ["columbus day"], actual: (year) => nthWeekday(year, 10, 1, 2) },
  { id: "veteransDay", name: "Veterans Day", aliases: ["veterans day", "veteran's day"], actual: (year) => createPlainDate(year, 11, 11) },
  { id: "thanksgiving", name: "Thanksgiving Day", aliases: ["thanksgiving", "thanksgiving day"], actual: (year) => nthWeekday(year, 11, 4, 4) },
  { id: "christmasDay", name: "Christmas Day", aliases: ["christmas", "christmas day", "xmas"], actual: (year) => createPlainDate(year, 12, 25) },
];

const OBSERVANCES = [
  { id: "valentinesDay", name: "Valentine's Day", aliases: ["valentines day", "valentine's day"], actual: (year) => createPlainDate(year, 2, 14) },
  { id: "easter", name: "Easter", aliases: ["easter", "western easter"], actual: easterSunday },
  { id: "mothersDay", name: "Mother's Day", aliases: ["mothers day", "mother's day"], actual: (year) => nthWeekday(year, 5, 0, 2) },
  { id: "fathersDay", name: "Father's Day", aliases: ["fathers day", "father's day"], actual: (year) => nthWeekday(year, 6, 0, 3) },
  { id: "halloween", name: "Halloween", aliases: ["halloween"], actual: (year) => createPlainDate(year, 10, 31) },
  { id: "blackFriday", name: "Black Friday", aliases: ["black friday"], actual: (year) => addPlainDateDays(nthWeekday(year, 11, 4, 4), 1) },
  { id: "cyberMonday", name: "Cyber Monday", aliases: ["cyber monday"], actual: (year) => addPlainDateDays(nthWeekday(year, 11, 4, 4), 4) },
  { id: "christmasEve", name: "Christmas Eve", aliases: ["christmas eve", "xmas eve"], actual: (year) => createPlainDate(year, 12, 24) },
  { id: "newYearsEve", name: "New Year's Eve", aliases: ["new years eve", "new year's eve"], actual: (year) => createPlainDate(year, 12, 31) },
];

function buildAliasMap(rows) {
  const aliases = new Map();
  for (const row of rows) {
    for (const alias of row.aliases) {
      aliases.set(normalizeName(alias), row);
    }
  }
  return aliases;
}

const FEDERAL_ALIASES = buildAliasMap(FEDERAL);
const OBSERVANCE_ALIASES = buildAliasMap(OBSERVANCES);
const ALL_ALIASES = new Map([...FEDERAL_ALIASES, ...OBSERVANCE_ALIASES]);

function resultFor(row, year, mode = "default") {
  const actual = row.actual(year);
  const isFederal = FEDERAL.includes(row);
  const observed = isFederal ? observedDate(actual) : actual;
  const date = mode === "actual" ? actual : mode === "observed" ? observed : isFederal ? observed : actual;
  return {
    id: row.id,
    name: row.name,
    kind: isFederal ? "federal" : "observance",
    actualDate: actual,
    observedDate: observed,
    date,
  };
}

function nextFrom(rows, baseDate, mode, direction) {
  const years = [baseDate.year - 1, baseDate.year, baseDate.year + 1, baseDate.year + 2];
  const results = years.flatMap((year) => rows.map((row) => resultFor(row, year, mode)));
  const filtered =
    direction === "last"
      ? results.filter((item) => comparePlainDate(item.date, baseDate) < 0).sort((a, b) => comparePlainDate(b.date, a.date))
      : results.filter((item) => comparePlainDate(item.date, baseDate) > 0).sort((a, b) => comparePlainDate(a.date, b.date));
  return filtered[0] ?? null;
}

export function createUnitedStatesHolidayCalendar() {
  return {
    resolve(name, year, mode = "default") {
      const row = ALL_ALIASES.get(normalizeName(name));
      return row ? resultFor(row, year, mode) : null;
    },
    resolveFederal(name, year, mode = "default") {
      const row = FEDERAL_ALIASES.get(normalizeName(name));
      return row ? resultFor(row, year, mode) : null;
    },
    resolveObservance(name, year) {
      const row = OBSERVANCE_ALIASES.get(normalizeName(name));
      return row ? resultFor(row, year, "actual") : null;
    },
    nextFederal(baseDate, mode = "default") {
      return nextFrom(FEDERAL, baseDate, mode, "next");
    },
    lastFederal(baseDate, mode = "default") {
      return nextFrom(FEDERAL, baseDate, mode, "last");
    },
    nextObservance(baseDate) {
      return nextFrom(OBSERVANCES, baseDate, "actual", "next");
    },
    supportedNames() {
      return [...ALL_ALIASES.keys()].sort();
    },
    observedFederalHolidayDates(year) {
      return FEDERAL.map((row) => plainDateToString(resultFor(row, year, "observed").observedDate));
    },
  };
}

export function matchHolidayAlias(words) {
  const normalized = normalizeName(words.join(" "));
  return ALL_ALIASES.has(normalized) ? normalized : null;
}
