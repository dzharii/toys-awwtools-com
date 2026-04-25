import {
  createBusinessCalendar,
  createDefaultBusinessCalendar,
  businessCalendarFromNagerHolidays,
  businessCalendarFromUnitedStatesFederalHolidays,
} from "./business-calendar.js";
import { evaluateAst, createDefaultContext } from "./evaluate.js";
import { formatValue, getValueType } from "./format.js";
import { createUnitedStatesHolidayCalendar } from "./us-holidays.js";
import { resolveWeekday } from "./weekday.js";
import { parse } from "./parse.js";
import { tokenize } from "./tokenize.js";
import { validateIanaTimeZone, zonedToIsoString } from "./timezone.js";

export {
  tokenize,
  parse,
  evaluateAst,
  formatValue,
  getValueType,
  resolveWeekday,
  createDefaultContext,
  createBusinessCalendar,
  createDefaultBusinessCalendar,
  businessCalendarFromNagerHolidays,
  businessCalendarFromUnitedStatesFederalHolidays,
  createUnitedStatesHolidayCalendar,
  validateIanaTimeZone,
  zonedToIsoString,
};

export function evaluateExpression(input, options = {}) {
  const text = String(input ?? "");
  const tokenized = tokenize(text);

  if (!tokenized.ok) {
    return {
      ok: false,
      error: tokenized.error,
      diagnostics: {
        tokens: tokenized.tokens,
      },
    };
  }

  const parsed = parse(tokenized.tokens, text);
  if (!parsed.ok) {
    return {
      ok: false,
      error: parsed.error,
      diagnostics: {
        tokens: tokenized.tokens,
      },
    };
  }

  const evaluated = evaluateAst(parsed.ast, options, text);
  if (!evaluated.ok) {
    return {
      ok: false,
      error: evaluated.error,
      ast: parsed.ast,
      diagnostics: {
        ...evaluated.diagnostics,
        tokens: tokenized.tokens,
      },
    };
  }

  return {
    ok: true,
    value: evaluated.value,
    valueType: evaluated.valueType,
    formatted: evaluated.formatted,
    ast: parsed.ast,
    diagnostics: {
      ...evaluated.diagnostics,
      tokens: tokenized.tokens,
    },
  };
}
