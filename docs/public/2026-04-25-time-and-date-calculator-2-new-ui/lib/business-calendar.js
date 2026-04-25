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
  const weekendInput = input.weekendDays instanceof Set ? [...input.weekendDays] : input.weekendDays;
  if (Array.isArray(weekendInput) && weekendInput.length > 0) {
    for (const day of weekendInput) {
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
  const holidayInput = input.holidays instanceof Set ? [...input.holidays] : input.holidays;
  if (Array.isArray(holidayInput)) {
    for (const value of holidayInput) {
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
