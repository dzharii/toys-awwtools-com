import { createEvaluationError } from "./errors.js";
import {
  addPlainDateCalendar,
  addPlainDateDays,
  addZonedCalendar,
  addZonedTimeline,
  buildZonedFromTimestampParts,
  comparePlainDate,
  createPlainDate,
  createZonedDateTime,
  epochFromLocalPartsFixedOffset,
  epochFromLocalPartsInZone,
  formatOffsetMinutes,
  getRuntimeTimeZone,
  parseIsoDateLiteral,
  parseIsoTimestampLiteral,
  plainDateFromZoned,
  plainDateToEpochDay,
  startOfDayForPlainDate,
  startOfDayForZoned,
  validateIanaTimeZone,
  zonedDateTimeToLocalParts,
  zonedToIsoString,
} from "./timezone.js";
import { createBusinessCalendar, createDefaultBusinessCalendar, isBusinessDay } from "./business-calendar.js";
import { formatValue, getValueType } from "./format.js";
import { SUPPORTED_TRANSFORMS, supportedTransformList } from "./transform-names.js";
import { createUnitedStatesHolidayCalendar } from "./us-holidays.js";
import { resolveWeekday } from "./weekday.js";

const TIMELINE_UNIT_MILLISECONDS = {
  hours: 60 * 60 * 1000,
  minutes: 60 * 1000,
  seconds: 1000,
};

const CALENDAR_UNITS = new Set(["days", "weeks", "months", "years"]);
const TIME_UNITS = new Set(["hours", "minutes", "seconds"]);

function spanOrZero(span) {
  return span || { startIndex: 0, endIndex: 0 };
}

function toDuration(unit, amount) {
  return { kind: "Duration", unit, amount };
}

function evalError(runtime, code, message, span, hints, extras) {
  return createEvaluationError(runtime.input, code, message, spanOrZero(span), hints, extras);
}

function withPlainDateTimeZoneId(value, plainDateTimeZoneId) {
  if (value?.kind !== "PlainDate") {
    return value;
  }
  return { ...value, plainDateTimeZoneId };
}

function normalizeNowValue(nowValue, contextTimeZoneId) {
  if (nowValue?.kind === "ZonedDateTime") {
    return createZonedDateTime(nowValue.epochMs, contextTimeZoneId);
  }

  if (typeof nowValue === "string") {
    const parsed = parseIsoTimestampLiteral(nowValue);
    if (!parsed) {
      return null;
    }
    const value = buildZonedFromTimestampParts(parsed, contextTimeZoneId);
    return createZonedDateTime(value.epochMs, contextTimeZoneId);
  }

  if (nowValue instanceof Date) {
    return createZonedDateTime(nowValue.getTime(), contextTimeZoneId);
  }

  if (typeof nowValue === "number" && Number.isFinite(nowValue)) {
    return createZonedDateTime(nowValue, contextTimeZoneId);
  }

  return null;
}

export function createDefaultContext(overrides = {}) {
  const runtimeZone = getRuntimeTimeZone();
  const requestedZone = overrides.timeZoneId ?? runtimeZone;
  const validZone = validateIanaTimeZone(requestedZone) ? requestedZone : "UTC";

  const calendarInput = overrides.businessCalendar || createDefaultBusinessCalendar();
  const businessCalendar = calendarInput.weekendDays ? createBusinessCalendar(calendarInput) : calendarInput;

  const hasNowOverride = Object.hasOwn(overrides, "now");
  const defaultHolidayCalendar = createUnitedStatesHolidayCalendar();
  const holidayCalendar = Object.hasOwn(overrides, "holidayCalendar") ? overrides.holidayCalendar : defaultHolidayCalendar;
  const observanceCalendar = Object.hasOwn(overrides, "observanceCalendar") ? overrides.observanceCalendar : holidayCalendar;

  return {
    timeZoneId: validZone,
    now: hasNowOverride ? overrides.now : () => createZonedDateTime(Date.now(), validZone),
    businessCalendar,
    placeResolver: typeof overrides.placeResolver === "function" ? overrides.placeResolver : undefined,
    holidayCalendar,
    observanceCalendar,
    invalidTimeZoneId: validateIanaTimeZone(requestedZone) ? null : requestedZone,
  };
}

function resolveZoneOrPlace(runtime, text, span) {
  if (validateIanaTimeZone(text)) {
    return text;
  }

  const resolver = runtime.context.placeResolver;
  if (!resolver) {
    throw evalError(
      runtime,
      "E_EVAL_PLACE_RESOLVER_MISSING",
      `Place name '${text}' requires an enabled place resolver.`,
      span,
      ["Use an IANA zone id like America/Los_Angeles or enable place names."],
    );
  }

  let resolved;
  try {
    resolved = resolver(text);
  } catch (error) {
    throw evalError(runtime, "E_EVAL_PLACE_RESOLUTION_FAILED", "Place resolver failed to resolve the location.", span, [
      "Verify the place name and resolver mapping.",
    ]);
  }

  const zoneId =
    typeof resolved === "string"
      ? resolved
      : typeof resolved?.tzid === "string"
        ? resolved.tzid
        : typeof resolved?.timeZoneId === "string"
          ? resolved.timeZoneId
          : null;

  if (!zoneId || !validateIanaTimeZone(zoneId)) {
    throw evalError(runtime, "E_EVAL_PLACE_RESOLUTION_FAILED", `Could not resolve place '${text}' to a valid IANA zone id.`, span, [
      "Use a known place from the resolver map.",
    ]);
  }

  return zoneId;
}

function applyInModifier(runtime, value, zoneId) {
  if (value?.kind === "ZonedDateTime") {
    return createZonedDateTime(value.epochMs, zoneId);
  }
  if (value?.kind === "PlainDate") {
    return withPlainDateTimeZoneId(value, zoneId);
  }

  throw evalError(
    runtime,
    "E_EVAL_TYPE_MISMATCH",
    "The 'in' modifier applies only to date/time values.",
    runtime.currentSpan,
    ["Apply 'in' to now, a timestamp, or an anchor expression."],
  );
}

function shiftBusinessDays(dateValue, amount, runtime, zoneId) {
  let current = dateValue;
  let remaining = Math.abs(amount);
  const direction = amount >= 0 ? 1 : -1;

  while (remaining > 0) {
    current = addPlainDateDays(current, direction);
    if (isBusinessDay(current, zoneId, runtime.context.businessCalendar)) {
      remaining -= 1;
    }
  }

  return current;
}

function shiftZonedBusinessDays(value, amount, runtime) {
  const local = zonedDateTimeToLocalParts(value, runtime.context.timeZoneId);
  const originalDate = createPlainDate(local.year, local.month, local.day);
  const zoneId = value.zoneKind === "iana" ? value.timeZoneId : runtime.context.timeZoneId;
  const shiftedDate = shiftBusinessDays(originalDate, amount, runtime, zoneId);

  const nextLocal = {
    year: shiftedDate.year,
    month: shiftedDate.month,
    day: shiftedDate.day,
    hour: local.hour,
    minute: local.minute,
    second: local.second,
    millisecond: local.millisecond,
  };

  if (value.zoneKind === "offset") {
    return {
      kind: "ZonedDateTime",
      epochMs: epochFromLocalPartsFixedOffset(nextLocal, value.offsetMinutes),
      zoneKind: "offset",
      offsetMinutes: value.offsetMinutes,
    };
  }

  return createZonedDateTime(epochFromLocalPartsInZone(nextLocal, value.timeZoneId), value.timeZoneId);
}

function applyDuration(runtime, left, duration, sign, unitSpan) {
  const amount = duration.amount * sign;

  if (left?.kind === "PlainDate") {
    if (TIME_UNITS.has(duration.unit)) {
      throw evalError(
        runtime,
        "E_EVAL_TIME_UNIT_REQUIRES_TIME",
        "Time units require a time-of-day value; use now or a timestamp literal.",
        unitSpan,
        ["Use calendar units with PlainDate, like days or months."],
      );
    }

    if (duration.unit === "businessDays") {
      const zoneId = left.plainDateTimeZoneId || runtime.context.timeZoneId;
      const shifted = shiftBusinessDays(left, amount, runtime, zoneId);
      return withPlainDateTimeZoneId(shifted, left.plainDateTimeZoneId);
    }

    return withPlainDateTimeZoneId(addPlainDateCalendar(left, duration.unit, amount), left.plainDateTimeZoneId);
  }

  if (left?.kind === "ZonedDateTime") {
    if (CALENDAR_UNITS.has(duration.unit)) {
      return addZonedCalendar(left, duration.unit, amount, runtime.context.timeZoneId);
    }

    if (duration.unit === "businessDays") {
      return shiftZonedBusinessDays(left, amount, runtime);
    }

    if (TIME_UNITS.has(duration.unit)) {
      return addZonedTimeline(left, amount * TIMELINE_UNIT_MILLISECONDS[duration.unit]);
    }
  }

  throw evalError(runtime, "E_EVAL_TYPE_MISMATCH", "Duration arithmetic requires a date/time value.", unitSpan);
}

function compareValues(runtime, left, right, operator, span) {
  let comparison;

  if (left?.kind === "PlainDate" && right?.kind === "PlainDate") {
    comparison = comparePlainDate(left, right);
  } else if (left?.kind === "ZonedDateTime" && right?.kind === "ZonedDateTime") {
    comparison = left.epochMs - right.epochMs;
  } else if (typeof left === "number" && typeof right === "number") {
    comparison = left - right;
  } else if (typeof left === "boolean" && typeof right === "boolean") {
    comparison = Number(left) - Number(right);
  } else if (typeof left === "string" && typeof right === "string") {
    comparison = left.localeCompare(right);
  } else {
    throw evalError(runtime, "E_EVAL_TYPE_MISMATCH", "Comparison requires compatible value types.", span, [
      "Compare PlainDate with PlainDate or ZonedDateTime with ZonedDateTime.",
    ]);
  }

  switch (operator) {
    case "<":
      return comparison < 0;
    case "<=":
      return comparison <= 0;
    case ">":
      return comparison > 0;
    case ">=":
      return comparison >= 0;
    case "==":
      return comparison === 0;
    case "!=":
      return comparison !== 0;
    default:
      return false;
  }
}

function evaluateBinaryExpression(runtime, node) {
  const left = evaluateNode(runtime, node.left);
  const right = evaluateNode(runtime, node.right);

  if (node.operator === "+") {
    if (right?.kind === "Duration") {
      return applyDuration(runtime, left, right, 1, node.right.unitSpan || node.operatorSpan);
    }
    if (typeof left === "number" && typeof right === "number") {
      return left + right;
    }
    throw evalError(runtime, "E_EVAL_TYPE_MISMATCH", "Addition requires a duration on the right side.", node.operatorSpan);
  }

  if (node.operator === "-") {
    if (right?.kind === "Duration") {
      return applyDuration(runtime, left, right, -1, node.right.unitSpan || node.operatorSpan);
    }

    if (left?.kind === "PlainDate" && right?.kind === "PlainDate") {
      const days = plainDateToEpochDay(left) - plainDateToEpochDay(right);
      return toDuration("days", days);
    }

    if (left?.kind === "ZonedDateTime" && right?.kind === "ZonedDateTime") {
      const milliseconds = left.epochMs - right.epochMs;
      if (milliseconds % 1000 === 0) {
        return toDuration("seconds", milliseconds / 1000);
      }
      return toDuration("milliseconds", milliseconds);
    }

    if (typeof left === "number" && typeof right === "number") {
      return left - right;
    }

    throw evalError(runtime, "E_EVAL_TYPE_MISMATCH", "Subtraction requires compatible operands.", node.operatorSpan);
  }

  throw evalError(runtime, "E_EVAL_UNSUPPORTED_OPERATOR", `Unsupported operator '${node.operator}'.`, node.operatorSpan);
}

function evaluateAnchor(runtime, node, functionName) {
  const argument = node.argument ? evaluateNode(runtime, node.argument) : runtime.sampledNow;

  if (functionName === "startOfDay") {
    if (argument?.kind === "PlainDate") {
      const zoneId = argument.plainDateTimeZoneId || runtime.context.timeZoneId;
      return startOfDayForPlainDate(argument, zoneId);
    }
    if (argument?.kind === "ZonedDateTime") {
      return startOfDayForZoned(argument, runtime.context.timeZoneId);
    }
    throw evalError(runtime, "E_EVAL_TYPE_MISMATCH", "startOfDay requires a date/time value.", node.anchorSpan || node.span);
  }

  if (functionName === "endOfDay") {
    if (argument?.kind === "PlainDate") {
      const zoneId = argument.plainDateTimeZoneId || runtime.context.timeZoneId;
      const startNext = startOfDayForPlainDate(addPlainDateDays(argument, 1), zoneId);
      return addZonedTimeline(startNext, -1);
    }
    if (argument?.kind === "ZonedDateTime") {
      const start = startOfDayForZoned(argument, runtime.context.timeZoneId);
      const startNext = addZonedCalendar(start, "days", 1, runtime.context.timeZoneId);
      return addZonedTimeline(startNext, -1);
    }
    throw evalError(runtime, "E_EVAL_TYPE_MISMATCH", "endOfDay requires a date/time value.", node.anchorSpan || node.span);
  }

  throw evalError(runtime, "E_EVAL_UNKNOWN_FUNCTION", `Unknown anchor '${functionName}'.`, node.anchorSpan || node.span);
}

function toPlainDateForBusinessCount(value, runtime) {
  if (value?.kind === "PlainDate") {
    return value;
  }
  if (value?.kind === "ZonedDateTime") {
    return plainDateFromZoned(
      value.zoneKind === "iana" ? createZonedDateTime(value.epochMs, runtime.context.timeZoneId) : value,
      runtime.context.timeZoneId,
    );
  }

  throw evalError(runtime, "E_EVAL_TYPE_MISMATCH", "Business-day counting requires date/time values.", runtime.currentSpan);
}

function toPlainDateForDateLike(value, runtime, span, label) {
  if (value?.kind === "PlainDate") {
    return value;
  }
  if (value?.kind === "ZonedDateTime") {
    return plainDateFromZoned(value, runtime.context.timeZoneId);
  }
  throw evalError(runtime, "E_EVAL_TYPE_MISMATCH", `${label} requires a date-like value.`, span, [
    "Use an ISO date, timestamp, weekday, holiday, or observance expression.",
  ]);
}

function countBusinessDays(runtime, startValue, endValue) {
  const startDate = toPlainDateForBusinessCount(startValue, runtime);
  const endDate = toPlainDateForBusinessCount(endValue, runtime);
  const forward = comparePlainDate(startDate, endDate) <= 0;

  let cursor = forward ? startDate : endDate;
  const limit = forward ? endDate : startDate;
  let count = 0;

  while (comparePlainDate(cursor, limit) < 0) {
    if (isBusinessDay(cursor, runtime.context.timeZoneId, runtime.context.businessCalendar)) {
      count += 1;
    }
    cursor = addPlainDateDays(cursor, 1);
  }

  return forward ? count : -count;
}

function evaluateBusinessDayRelative(runtime, node) {
  const targetValue = evaluateNode(runtime, node.target);
  const targetDate = toPlainDateForDateLike(targetValue, runtime, node.target.span, "Business-day before/after");
  const direction = node.relation === "after" ? 1 : -1;
  let cursor = addPlainDateDays(targetDate, direction);
  while (!isBusinessDay(cursor, runtime.context.timeZoneId, runtime.context.businessCalendar)) {
    cursor = addPlainDateDays(cursor, direction);
  }
  return cursor;
}

function evaluateFunctionCall(runtime, node) {
  const name = node.canonicalName;
  if (name === "startofday") {
    return evaluateAnchor(runtime, { ...node, argument: node.args[0] ?? null, anchorSpan: node.span }, "startOfDay");
  }
  if (name === "endofday") {
    return evaluateAnchor(runtime, { ...node, argument: node.args[0] ?? null, anchorSpan: node.span }, "endOfDay");
  }

  throw evalError(runtime, "E_EVAL_UNKNOWN_FUNCTION", `Unknown function '${node.name}'.`, node.span, [
    "Supported functions: startOfDay(...), endOfDay(...).",
  ]);
}

function resolveHolidayYear(runtime, explicitYear) {
  return explicitYear?.value ?? plainDateFromZoned(runtime.sampledNow, runtime.context.timeZoneId).year;
}

function evaluateHolidayExpression(runtime, node) {
  const calendar = runtime.context.holidayCalendar;
  if (!calendar?.resolve) {
    throw evalError(runtime, "E_EVAL_HOLIDAY_CALENDAR_MISSING", "Holiday expressions require an enabled holiday calendar.", node.nameSpan || node.span, [
      "Enable a holiday calendar or use an ISO date literal.",
    ]);
  }

  const contextDate = plainDateFromZoned(runtime.sampledNow, runtime.context.timeZoneId);
  const hasExplicitYear = Boolean(node.year);
  let year = resolveHolidayYear(runtime, node.year);
  let result = calendar.resolve(node.holidayName, year, node.mode);
  if (!result) {
    throw evalError(runtime, "E_EVAL_UNKNOWN_HOLIDAY", `Unknown holiday or observance '${node.holidayName}'.`, node.nameSpan || node.span, [
      "Try Thanksgiving, Memorial Day, Independence Day, Easter, Mother's Day, or Black Friday.",
    ]);
  }
  if (!hasExplicitYear && comparePlainDate(result.date, contextDate) <= 0) {
    year += 1;
    result = calendar.resolve(node.holidayName, year, node.mode);
  }
  return result.date;
}

function evaluateHolidaySearchExpression(runtime, node) {
  const contextDate = plainDateFromZoned(runtime.sampledNow, runtime.context.timeZoneId);
  if (node.category === "observance") {
    const calendar = runtime.context.observanceCalendar;
    if (!calendar?.nextObservance) {
      throw evalError(runtime, "E_EVAL_OBSERVANCE_CALENDAR_MISSING", "Observance expressions require an enabled observance calendar.", node.span, [
        "Enable an observance calendar or use an ISO date literal.",
      ]);
    }
    if (node.direction !== "next") {
      throw evalError(runtime, "E_EVAL_UNSUPPORTED_HOLIDAY_SEARCH", "Only next observance is supported.", node.span);
    }
    return calendar.nextObservance(contextDate).date;
  }

  const calendar = runtime.context.holidayCalendar;
  if (!calendar?.nextFederal || !calendar?.lastFederal) {
    throw evalError(runtime, "E_EVAL_HOLIDAY_CALENDAR_MISSING", "Holiday expressions require an enabled holiday calendar.", node.span, [
      "Enable a holiday calendar or use an ISO date literal.",
    ]);
  }
  const result = node.direction === "last" ? calendar.lastFederal(contextDate, node.mode) : calendar.nextFederal(contextDate, node.mode);
  return result.date;
}

function evaluateNode(runtime, node) {
  runtime.currentSpan = node.span;

  switch (node.type) {
    case "GroupExpression":
      return evaluateNode(runtime, node.expression);
    case "Keyword": {
      if (node.name === "now") {
        return runtime.sampledNow;
      }
      if (node.name === "today") {
        return plainDateFromZoned(runtime.sampledNow, runtime.context.timeZoneId);
      }
      if (node.name === "yesterday") {
        return addPlainDateDays(plainDateFromZoned(runtime.sampledNow, runtime.context.timeZoneId), -1);
      }
      if (node.name === "tomorrow") {
        return addPlainDateDays(plainDateFromZoned(runtime.sampledNow, runtime.context.timeZoneId), 1);
      }
      throw evalError(runtime, "E_EVAL_UNKNOWN_KEYWORD", `Unknown keyword '${node.name}'.`, node.span);
    }
    case "PlainDateLiteral": {
      const parsed = parseIsoDateLiteral(node.value);
      if (!parsed) {
        throw evalError(runtime, "E_PARSE_INVALID_DATE_LITERAL", "Invalid ISO date literal.", node.span, [
          "Use ISO date YYYY-MM-DD, for example 2026-02-08.",
        ]);
      }
      return createPlainDate(parsed.year, parsed.month, parsed.day);
    }
    case "TimestampLiteral": {
      const parsed = parseIsoTimestampLiteral(node.value);
      if (!parsed) {
        throw evalError(runtime, "E_PARSE_INVALID_TIMESTAMP_LITERAL", "Invalid timestamp literal.", node.span);
      }
      if (parsed.bracketedZoneId && !validateIanaTimeZone(parsed.bracketedZoneId)) {
        throw evalError(runtime, "E_EVAL_INVALID_TIME_ZONE", `Invalid IANA time zone '${parsed.bracketedZoneId}'.`, node.span);
      }
      return buildZonedFromTimestampParts(parsed, runtime.context.timeZoneId);
    }
    case "DurationLiteral":
      return toDuration(node.unit, node.amount);
    case "NumberLiteral":
      return node.value;
    case "WeekdayExpression": {
      const baseDate = plainDateFromZoned(runtime.sampledNow, runtime.context.timeZoneId);
      return resolveWeekday(baseDate, node.weekdayName, node.direction);
    }
    case "HolidayExpression":
      return evaluateHolidayExpression(runtime, node);
    case "HolidaySearchExpression":
      return evaluateHolidaySearchExpression(runtime, node);
    case "WeekdayRelativeExpression": {
      const target = evaluateNode(runtime, node.target);
      const baseDate = toPlainDateForDateLike(target, runtime, node.target.span, "Weekday before/after");
      return resolveWeekday(baseDate, node.weekdayName, node.relation === "after" ? "next" : "last");
    }
    case "AnchorExpression":
      return evaluateAnchor(runtime, node, node.anchorName);
    case "InModifier": {
      const target = evaluateNode(runtime, node.target);
      const zoneId = resolveZoneOrPlace(runtime, node.zoneOrPlace, node.zoneSpan);
      return applyInModifier(runtime, target, zoneId);
    }
    case "TransformModifier": {
      const target = evaluateNode(runtime, node.target);
      if (!SUPPORTED_TRANSFORMS.has(node.transformName)) {
        throw evalError(runtime, "E_EVAL_UNKNOWN_TRANSFORM", `Unknown transform '${node.transformName}'.`, node.transformSpan, [
          `Supported transforms: ${supportedTransformList()}.`,
        ]);
      }
      if (node.transformName === "time" && target?.kind === "PlainDate") {
        throw evalError(runtime, "E_EVAL_TIME_FORMAT_REQUIRES_TIME", "Time formatting requires a time-of-day value.", node.transformSpan, [
          "Use now or start of day <date> before applying 'as time'.",
        ]);
      }
      try {
        return formatValue(target, node.transformName, { ...runtime.context, now: runtime.sampledNow });
      } catch (error) {
        throw evalError(runtime, "E_EVAL_TRANSFORM_FAILED", error.message, node.transformSpan);
      }
    }
    case "BusinessDaysBetween": {
      const startValue = evaluateNode(runtime, node.start);
      const endValue = evaluateNode(runtime, node.end);
      return countBusinessDays(runtime, startValue, endValue);
    }
    case "BusinessDayRelativeExpression":
      return evaluateBusinessDayRelative(runtime, node);
    case "BinaryExpression":
      return evaluateBinaryExpression(runtime, node);
    case "ComparisonExpression": {
      const left = evaluateNode(runtime, node.left);
      const right = evaluateNode(runtime, node.right);
      return compareValues(runtime, left, right, node.operator, node.operatorSpan);
    }
    case "FunctionCall":
      return evaluateFunctionCall(runtime, node);
    default:
      throw evalError(runtime, "E_EVAL_UNSUPPORTED_NODE", `Unsupported AST node '${node.type}'.`, node.span);
  }
}

export function evaluateAst(ast, contextInput = {}, input = "") {
  try {
    const context = createDefaultContext(contextInput);
    if (context.invalidTimeZoneId) {
      return {
        ok: false,
        error: createEvaluationError(
          input,
          "E_EVAL_INVALID_TIME_ZONE",
          `Invalid IANA time zone '${context.invalidTimeZoneId}'.`,
          { startIndex: 0, endIndex: 0 },
          ["Use a valid IANA zone id, for example America/Los_Angeles."],
        ),
      };
    }

    const nowRaw = typeof context.now === "function" ? context.now() : context.now;
    const sampledNow = normalizeNowValue(nowRaw, context.timeZoneId);
    if (!sampledNow) {
      return {
        ok: false,
        error: createEvaluationError(
          input,
          "E_EVAL_INVALID_NOW",
          "Configured now must be a ZonedDateTime value, ISO timestamp string, Date, or finite epoch millisecond number.",
          { startIndex: 0, endIndex: 0 },
          ["Provide a valid ISO timestamp like 2026-02-08T12:00:00-08:00[America/Los_Angeles]."],
        ),
      };
    }

    const runtime = {
      input,
      context,
      sampledNow,
      currentSpan: { startIndex: 0, endIndex: 0 },
    };

    const value = evaluateNode(runtime, ast);

    return {
      ok: true,
      value,
      valueType: getValueType(value),
      formatted: typeof value === "string" ? value : formatValue(value, null, context),
      diagnostics: {
        nowIso: zonedToIsoString(sampledNow),
        nowOffset: sampledNow.zoneKind === "iana" ? undefined : formatOffsetMinutes(sampledNow.offsetMinutes),
      },
    };
  } catch (error) {
    if (error && error.kind === "eval") {
      return { ok: false, error };
    }
    throw error;
  }
}
