import { weekdayNameToIndex } from "./keywords.js";
import { addPlainDateDays, plainDateDayOfWeek } from "./timezone.js";

export function isWeekdayName(name) {
  return weekdayNameToIndex(name) != null;
}

export function resolveWeekday(baseDate, weekdayName, direction = "bare") {
  const target = weekdayNameToIndex(weekdayName);
  if (target == null) {
    return null;
  }

  const current = plainDateDayOfWeek(baseDate);
  if (direction === "last") {
    const delta = -(((current - target + 6) % 7) + 1);
    return addPlainDateDays(baseDate, delta);
  }

  if (direction === "this") {
    return addPlainDateDays(baseDate, (target - current + 7) % 7);
  }

  const delta = ((target - current + 6) % 7) + 1;
  return addPlainDateDays(baseDate, delta);
}
