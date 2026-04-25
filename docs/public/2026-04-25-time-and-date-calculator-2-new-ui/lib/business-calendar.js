import { plainDateDayOfWeek, plainDateToString } from "./timezone.js";
import { weekdayNameToIndex } from "./keywords.js";

export function createDefaultBusinessCalendar() {
  return {
    weekendDays: new Set([0, 6]),
    holidays: new Set(),
    isBusinessDay: null,
    description: "Mon-Fri no holidays",
  };
}

export function createBusinessCalendar(input = {}) {
  if (typeof input.isBusinessDay === "function") {
    return {
      weekendDays: new Set([0, 6]),
      holidays: new Set(),
      isBusinessDay: input.isBusinessDay,
      description: "Custom predicate",
    };
  }

  const weekendDays = new Set();
  if (Array.isArray(input.weekendDays) && input.weekendDays.length > 0) {
    for (const day of input.weekendDays) {
      if (typeof day === "number" && day >= 0 && day <= 6) {
        weekendDays.add(day);
      } else if (typeof day === "string") {
        const index = weekdayNameToIndex(day);
        if (index != null) {
          weekendDays.add(index);
        }
      }
    }
  }
  if (weekendDays.size === 0) {
    weekendDays.add(0);
    weekendDays.add(6);
  }

  const holidays = new Set();
  if (Array.isArray(input.holidays)) {
    for (const value of input.holidays) {
      if (typeof value === "string") {
        holidays.add(value);
      } else if (value && typeof value.date === "string") {
        holidays.add(value.date);
      }
    }
  }

  return {
    weekendDays,
    holidays,
    isBusinessDay: null,
    description: input.description || "Structured calendar",
  };
}

export function businessCalendarFromNagerHolidays(holidayRows = []) {
  const holidays = holidayRows
    .filter((row) => Array.isArray(row.types) && row.types.includes("Public"))
    .map((row) => row.date);

  return createBusinessCalendar({
    weekendDays: ["SATURDAY", "SUNDAY"],
    holidays,
    description: "Mon-Fri with public holidays",
  });
}

export function isBusinessDay(plainDate, timeZoneId, calendar) {
  if (calendar?.isBusinessDay) {
    return Boolean(calendar.isBusinessDay(plainDate, timeZoneId));
  }

  const weekendDays = calendar?.weekendDays ?? new Set([0, 6]);
  const holidays = calendar?.holidays ?? new Set();
  const weekday = plainDateDayOfWeek(plainDate);

  if (weekendDays.has(weekday)) {
    return false;
  }

  return !holidays.has(plainDateToString(plainDate));
}
