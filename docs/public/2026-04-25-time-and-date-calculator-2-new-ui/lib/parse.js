import { createParseError } from "./errors.js";
import { foldCase, normalizeUnitAlias } from "./keywords.js";
import { canonicalTransformName, supportedTransformList } from "./transform-names.js";
import { parseIsoDateLiteral, parseIsoTimestampLiteral } from "./timezone.js";
import { matchHolidayAlias } from "./us-holidays.js";
import { isWeekdayName } from "./weekday.js";

const PRECEDENCE = {
  TRANSFORM: 5,
  COMPARISON: 10,
  ADDITIVE: 20,
  POSTFIX: 30,
};

function spanFrom(startIndex, endIndex) {
  return { startIndex, endIndex };
}

function tokenSpan(token) {
  return spanFrom(token.start, token.end);
}

const RESERVED_AFTER_NUMBER = new Set(["and", "in", "as", "between"]);

class Parser {
  constructor(tokens, input) {
    this.tokens = tokens;
    this.input = input;
    this.index = 0;
  }

  peek(offset = 0) {
    return this.tokens[this.index + offset] || this.tokens[this.tokens.length - 1];
  }

  at(type) {
    return this.peek().type === type;
  }

  atWord(word) {
    const token = this.peek();
    return token.type === "WORD" && token.canonical === foldCase(word);
  }

  consume() {
    const token = this.peek();
    this.index += 1;
    return token;
  }

  consumeType(type, code, message, hints) {
    if (!this.at(type)) {
      throw this.errorAtToken(this.peek(), code, message, hints);
    }
    return this.consume();
  }

  consumeWord(word, code, message, hints) {
    if (!this.atWord(word)) {
      throw this.errorAtToken(this.peek(), code, message, hints);
    }
    return this.consume();
  }

  errorAtToken(token, code, message, hints, extras) {
    return createParseError(this.input, code, message, tokenSpan(token), hints, extras);
  }

  parse() {
    if (this.at("EOF")) {
      throw createParseError(
        this.input,
        "E_PARSE_EXPECTED_EXPRESSION",
        "Expression is empty.",
        spanFrom(0, 0),
        ["Try: now + 1d"],
      );
    }

    const expression = this.parseExpression(0);
    const trailing = this.peek();
    if (trailing.type !== "EOF") {
      throw this.errorAtToken(
        trailing,
        "E_PARSE_UNEXPECTED_TOKEN",
        `Unexpected token '${trailing.text}'.`,
        ["Check operators and unit spellings."],
      );
    }

    return expression;
  }

  parseExpression(minPrecedence) {
    let left = this.parsePrimary();

    while (true) {
      const token = this.peek();

      if (this.isInModifierStart(token) && PRECEDENCE.POSTFIX >= minPrecedence) {
        left = this.parsePostfix(left);
        continue;
      }

      if ((token.type === "PLUS" || token.type === "MINUS") && PRECEDENCE.ADDITIVE >= minPrecedence) {
        const operator = this.consume();
        const right = this.parseExpression(PRECEDENCE.ADDITIVE + 1);
        left = {
          type: "BinaryExpression",
          operator: operator.type === "PLUS" ? "+" : "-",
          left,
          right,
          span: spanFrom(left.span.startIndex, right.span.endIndex),
          operatorSpan: tokenSpan(operator),
        };
        continue;
      }

      const comparisonOperator = this.readComparisonOperator(token);
      if (comparisonOperator && PRECEDENCE.COMPARISON >= minPrecedence) {
        const operatorToken = this.consume();
        const right = this.parseExpression(PRECEDENCE.COMPARISON + 1);
        left = {
          type: "ComparisonExpression",
          operator: comparisonOperator,
          left,
          right,
          span: spanFrom(left.span.startIndex, right.span.endIndex),
          operatorSpan: tokenSpan(operatorToken),
        };
        continue;
      }

      if (this.isWeekdayRelativeOperator(token) && left.type === "WeekdayExpression" && PRECEDENCE.COMPARISON >= minPrecedence) {
        const operatorToken = this.consume();
        const target = this.parseExpression(PRECEDENCE.COMPARISON + 1);
        left = {
          type: "WeekdayRelativeExpression",
          weekdayName: left.weekdayName,
          relation: operatorToken.canonical,
          target,
          span: spanFrom(left.span.startIndex, target.span.endIndex),
          weekdaySpan: left.weekdaySpan,
          relationSpan: tokenSpan(operatorToken),
        };
        continue;
      }

      if (this.isTransformModifierStart(token) && PRECEDENCE.TRANSFORM >= minPrecedence) {
        left = this.parseTransformModifier(left);
        continue;
      }

      break;
    }

    return left;
  }

  readComparisonOperator(token) {
    switch (token.type) {
      case "LT":
        return "<";
      case "LTE":
        return "<=";
      case "GT":
        return ">";
      case "GTE":
        return ">=";
      case "EQ":
        return "==";
      case "NEQ":
        return "!=";
      default:
        return null;
    }
  }

  parsePostfix(left) {
    if (this.atWord("in")) {
      return this.parseInModifier(left);
    }
    if (this.atWord("as") || this.at("ARROW")) {
      return this.parseTransformModifier(left);
    }
    throw this.errorAtToken(this.peek(), "E_PARSE_UNEXPECTED_TOKEN", "Unexpected postfix modifier.");
  }

  parseInModifier(left) {
    const inToken = this.consumeWord(
      "in",
      "E_PARSE_EXPECTED_IN",
      "Expected keyword 'in'.",
      ["Use: <expr> in America/Los_Angeles"],
    );

    const first = this.peek();
    if (this.isZoneTerminator(first)) {
      throw this.errorAtToken(
        first,
        "E_PARSE_EXPECTED_ZONE_OR_PLACE",
        "Expected an IANA zone id or place name after 'in'.",
        ["Use an IANA id like America/New_York."],
      );
    }

    const startIndex = first.start;
    let last = first;
    while (true) {
      const token = this.peek();
      if (this.isZoneTerminator(token) && !this.isInlineZoneSign(token)) {
        break;
      }
      last = this.consume();
    }

    const zoneText = this.input.slice(startIndex, last.end).trim();
    return {
      type: "InModifier",
      target: left,
      zoneOrPlace: zoneText,
      span: spanFrom(left.span.startIndex, last.end),
      modifierSpan: tokenSpan(inToken),
      zoneSpan: spanFrom(startIndex, last.end),
    };
  }

  isInlineZoneSign(token) {
    if (token.type !== "PLUS" && token.type !== "MINUS") {
      return false;
    }

    const before = this.input[token.start - 1];
    const after = this.input[token.end];
    if (before == null || after == null) {
      return false;
    }

    return !/\s/.test(before) && !/\s/.test(after);
  }

  isZoneTerminator(token) {
    if (!token) {
      return true;
    }

    if (
      token.type === "EOF" ||
      token.type === "RPAREN" ||
      token.type === "COMMA" ||
      token.type === "PLUS" ||
      token.type === "MINUS" ||
      token.type === "LT" ||
      token.type === "LTE" ||
      token.type === "GT" ||
      token.type === "GTE" ||
      token.type === "EQ" ||
      token.type === "NEQ" ||
      token.type === "ARROW"
    ) {
      return true;
    }

    return token.type === "WORD" && (token.canonical === "as" || token.canonical === "and");
  }

  parseTransformModifier(left) {
    const operator = this.at("ARROW") ? this.consume() : this.consumeWord("as", "E_PARSE_EXPECTED_AS", "Expected keyword 'as'.");
    const firstTransformToken = this.peek();

    if (firstTransformToken.type !== "WORD") {
      throw this.errorAtToken(
        firstTransformToken,
        "E_PARSE_EXPECTED_TRANSFORM",
        "Expected a transform name after the modifier.",
        [`Supported transforms: ${supportedTransformList()}.`],
      );
    }

    const startIndex = firstTransformToken.start;
    let lastTransformToken = null;
    const words = [];
    let canonical = null;

    while (this.peek().type === "WORD" && !this.isTransformTerminator(this.peek()) && words.length < 2) {
      const token = this.consume();
      words.push(token.text);
      const maybeCanonical = canonicalTransformName(words.join(" "));
      if (maybeCanonical) {
        canonical = maybeCanonical;
        lastTransformToken = token;
      }
    }

    if (!canonical) {
      const endToken = this.tokens[this.index - 1] || firstTransformToken;
      throw createParseError(
        this.input,
        "E_PARSE_UNKNOWN_TRANSFORM",
        `Unknown transform '${this.input.slice(startIndex, endToken.end)}'.`,
        spanFrom(startIndex, endToken.end),
        [`Supported transforms: ${supportedTransformList()}.`],
      );
    }

    while (this.tokens[this.index - 1] !== lastTransformToken) {
      this.index -= 1;
    }

    return {
      type: "TransformModifier",
      target: left,
      transformName: canonical,
      transformText: this.input.slice(startIndex, lastTransformToken.end),
      operator: operator.type === "ARROW" ? "->" : "as",
      span: spanFrom(left.span.startIndex, lastTransformToken.end),
      modifierSpan: tokenSpan(operator),
      transformSpan: spanFrom(startIndex, lastTransformToken.end),
    };
  }

  isTransformTerminator(token) {
    return token.type !== "WORD" || ["as", "in", "and", "between"].includes(token.canonical);
  }

  isInModifierStart(token) {
    return token.type === "WORD" && token.canonical === "in";
  }

  isTransformModifierStart(token) {
    return token.type === "ARROW" || (token.type === "WORD" && token.canonical === "as");
  }

  isWeekdayRelativeOperator(token) {
    return token.type === "WORD" && (token.canonical === "after" || token.canonical === "before");
  }

  parsePrimary() {
    if (this.at("INVALID_DATE_SLASH")) {
      const token = this.consume();
      throw this.errorAtToken(token, "E_PARSE_INVALID_DATE_LITERAL", "Only ISO date format YYYY-MM-DD is supported.", [
        "Use ISO date YYYY-MM-DD, for example 2026-02-08.",
      ]);
    }

    if (this.tryBusinessDaysBetweenAhead()) {
      return this.parseBusinessDaysBetween();
    }

    if (this.tryBusinessDayRelativeAhead()) {
      return this.parseBusinessDayRelative();
    }

    if (this.tryAnchorPhraseAhead("start", "of", "day")) {
      return this.parseAnchorPhrase("startOfDay", 3);
    }

    if (this.tryAnchorPhraseAhead("end", "of", "day")) {
      return this.parseAnchorPhrase("endOfDay", 3);
    }

    if (this.at("LPAREN")) {
      const leftParen = this.consume();
      const expr = this.parseExpression(0);
      const rightParen = this.consumeType(
        "RPAREN",
        "E_PARSE_EXPECTED_RPAREN",
        "Expected ')' to close expression.",
        ["Add a closing parenthesis."],
      );
      return {
        type: "GroupExpression",
        expression: expr,
        span: spanFrom(leftParen.start, rightParen.end),
      };
    }

    if (this.at("DATE")) {
      const token = this.consume();
      if (!parseIsoDateLiteral(token.text)) {
        throw this.errorAtToken(token, "E_PARSE_INVALID_DATE_LITERAL", "Invalid ISO date literal.", [
          "Use ISO date YYYY-MM-DD, for example 2026-02-08.",
        ]);
      }
      return {
        type: "PlainDateLiteral",
        value: token.text,
        span: tokenSpan(token),
      };
    }

    if (this.at("TIMESTAMP")) {
      const token = this.consume();
      if (!parseIsoTimestampLiteral(token.text)) {
        throw this.errorAtToken(token, "E_PARSE_INVALID_TIMESTAMP_LITERAL", "Invalid timestamp literal.");
      }
      return {
        type: "TimestampLiteral",
        value: token.text,
        span: tokenSpan(token),
      };
    }

    if (this.at("NUMBER")) {
      return this.parseNumberOrDuration();
    }

    if (this.at("WORD")) {
      const word = this.peek();
      if (this.peek(1).type === "LPAREN") {
        return this.parseFunctionCall();
      }

      const holiday = this.tryParseHolidayExpression();
      if (holiday) {
        return holiday;
      }

      const weekday = this.tryParseWeekdayExpression();
      if (weekday) {
        return weekday;
      }

      if (["now", "today", "yesterday", "tomorrow"].includes(word.canonical)) {
        this.consume();
        return {
          type: "Keyword",
          name: word.canonical,
          span: tokenSpan(word),
        };
      }

      throw this.errorAtToken(
        word,
        "E_PARSE_UNEXPECTED_TOKEN",
        `Unexpected token '${word.text}'.`,
        ["Try an expression like: now + 1d"],
      );
    }

    const token = this.peek();
    throw this.errorAtToken(token, "E_PARSE_EXPECTED_EXPRESSION", "Expected an expression.", ["Try: start of day"]);
  }

  parseFunctionCall() {
    const identifier = this.consumeType("WORD", "E_PARSE_EXPECTED_IDENTIFIER", "Expected a function name.");
    this.consumeType("LPAREN", "E_PARSE_EXPECTED_LPAREN", "Expected '(' after function name.");
    const args = [];

    while (!this.at("RPAREN") && !this.at("EOF")) {
      args.push(this.parseExpression(0));
      if (this.at("COMMA")) {
        this.consume();
        continue;
      }
      break;
    }

    const close = this.consumeType("RPAREN", "E_PARSE_EXPECTED_RPAREN", "Expected ')' after function arguments.");
    return {
      type: "FunctionCall",
      name: identifier.text,
      canonicalName: identifier.canonical,
      args,
      span: spanFrom(identifier.start, close.end),
    };
  }

  tryParseWeekdayExpression() {
    const first = this.peek();
    if (first.type !== "WORD") {
      return null;
    }

    if (["next", "last", "this"].includes(first.canonical) && this.peek(1).type === "WORD" && isWeekdayName(this.peek(1).canonical)) {
      const direction = first.canonical;
      const weekday = this.peek(1);
      this.consume();
      this.consume();
      return {
        type: "WeekdayExpression",
        weekdayName: weekday.canonical,
        direction,
        span: spanFrom(first.start, weekday.end),
        weekdaySpan: tokenSpan(weekday),
      };
    }

    if (isWeekdayName(first.canonical)) {
      this.consume();
      return {
        type: "WeekdayExpression",
        weekdayName: first.canonical,
        direction: "bare",
        span: tokenSpan(first),
        weekdaySpan: tokenSpan(first),
      };
    }

    return null;
  }

  tryParseHolidayExpression() {
    const first = this.peek();
    if (first.type !== "WORD") {
      return null;
    }

    if (["next", "last"].includes(first.canonical)) {
      const second = this.peek(1);
      if (second.type === "WORD" && ["holiday", "observance"].includes(second.canonical)) {
        this.consume();
        this.consume();
        return {
          type: "HolidaySearchExpression",
          direction: first.canonical,
          category: second.canonical === "observance" ? "observance" : "federal",
          mode: "default",
          span: spanFrom(first.start, second.end),
        };
      }
      if (second.type === "WORD" && ["federal", "observed"].includes(second.canonical) && this.peek(2).type === "WORD" && this.peek(2).canonical === "holiday") {
        const third = this.peek(2);
        this.consume();
        this.consume();
        this.consume();
        return {
          type: "HolidaySearchExpression",
          direction: first.canonical,
          category: "federal",
          mode: second.canonical === "observed" ? "observed" : "default",
          span: spanFrom(first.start, third.end),
        };
      }
    }

    if (["actual", "observed"].includes(first.canonical)) {
      const parsed = this.parseHolidayNameAt(this.index + 1);
      if (!parsed) {
        return null;
      }
      this.consume();
      this.index = parsed.nextIndex;
      const year = this.consumeOptionalYear();
      return {
        type: "HolidayExpression",
        holidayName: parsed.name,
        mode: first.canonical,
        year,
        span: spanFrom(first.start, year?.span.endIndex ?? parsed.end),
        nameSpan: spanFrom(parsed.start, parsed.end),
      };
    }

    const parsed = this.parseHolidayNameAt(this.index);
    if (!parsed) {
      return null;
    }
    this.index = parsed.nextIndex;
    const year = this.consumeOptionalYear();
    return {
      type: "HolidayExpression",
      holidayName: parsed.name,
      mode: "default",
      year,
      span: spanFrom(parsed.start, year?.span.endIndex ?? parsed.end),
      nameSpan: spanFrom(parsed.start, parsed.end),
    };
  }

  parseHolidayNameAt(index) {
    const words = [];
    let best = null;
    for (let offset = 0; offset < 5; offset += 1) {
      const token = this.tokens[index + offset];
      if (!token || (token.type !== "WORD" && token.type !== "NUMBER")) {
        break;
      }
      words.push(token.text);
      const name = matchHolidayAlias(words);
      if (name) {
        best = {
          name,
          start: this.tokens[index].start,
          end: token.end,
          nextIndex: index + offset + 1,
        };
      }
    }
    return best;
  }

  consumeOptionalYear() {
    const token = this.peek();
    if (token.type !== "NUMBER" || !/^\d{4}$/.test(token.text)) {
      return null;
    }
    this.consume();
    return { value: Number(token.text), span: tokenSpan(token) };
  }

  parseAnchorPhrase(anchorName, consumedWords) {
    const phraseStart = this.peek();
    for (let i = 0; i < consumedWords; i += 1) {
      this.consume();
    }
    const phraseEnd = this.tokens[this.index - 1];

    let argument = null;
    if (this.canStartExpression(this.peek())) {
      argument = this.parseExpression(PRECEDENCE.POSTFIX);
    }

    const endIndex = argument ? argument.span.endIndex : this.tokens[this.index - 1].end;
    return {
      type: "AnchorExpression",
      anchorName,
      argument,
      span: spanFrom(phraseStart.start, endIndex),
      anchorSpan: spanFrom(phraseStart.start, phraseEnd.end),
    };
  }

  parseBusinessDaysBetween() {
    const first = this.peek();
    const consumed = this.consumeBusinessDaysWords();
    const between = this.consumeWord(
      "between",
      "E_PARSE_EXPECTED_BETWEEN",
      "Expected keyword 'between' after 'business days'.",
      ["Use: business days between <a> and <b>"],
    );

    const startExpr = this.parseExpression(0);
    this.consumeWord("and", "E_PARSE_EXPECTED_AND", "Expected keyword 'and' in business-day range.", [
      "Use: business days between <a> and <b>",
    ]);
    const endExpr = this.parseExpression(0);

    return {
      type: "BusinessDaysBetween",
      start: startExpr,
      end: endExpr,
      span: spanFrom(first.start, endExpr.span.endIndex),
      unitSpan: spanFrom(first.start, consumed.end),
      betweenSpan: tokenSpan(between),
    };
  }

  parseBusinessDayRelative() {
    const first = this.consume();
    const business = this.consumeWord("business", "E_PARSE_EXPECTED_BUSINESS_DAYS", "Expected 'business day'.");
    const day = this.consumeWord("day", "E_PARSE_EXPECTED_BUSINESS_DAYS", "Expected 'business day'.");
    const relation = this.peek();
    if (relation.type !== "WORD" || (relation.canonical !== "after" && relation.canonical !== "before")) {
      throw this.errorAtToken(relation, "E_PARSE_EXPECTED_BEFORE_AFTER", "Expected 'before' or 'after'.", [
        "Use: first business day after <date>",
      ]);
    }
    this.consume();
    const target = this.parseExpression(PRECEDENCE.COMPARISON + 1);
    return {
      type: "BusinessDayRelativeExpression",
      selector: first.canonical,
      relation: relation.canonical,
      target,
      span: spanFrom(first.start, target.span.endIndex),
      phraseSpan: spanFrom(first.start, day.end),
      relationSpan: tokenSpan(relation),
    };
  }

  parseNumberOrDuration() {
    const numberToken = this.consumeType("NUMBER", "E_PARSE_EXPECTED_NUMBER", "Expected a number.");
    const amount = Number(numberToken.text);
    const firstWord = this.peek();

    if (firstWord.type === "WORD") {
      const compact = firstWord.start === numberToken.end;
      const unitMatch = this.matchUnitWords(this.index);

      if (unitMatch) {
        this.index += unitMatch.consumed;
        return {
          type: "DurationLiteral",
          amount,
          unit: unitMatch.unit,
          span: spanFrom(numberToken.start, unitMatch.end),
          unitSpan: spanFrom(unitMatch.start, unitMatch.end),
        };
      }

      if (compact || !RESERVED_AFTER_NUMBER.has(firstWord.canonical)) {
        throw this.errorAtToken(
          firstWord,
          "E_PARSE_UNKNOWN_UNIT",
          `Unknown unit '${firstWord.text}'.`,
          ["Valid units include: d, days, weeks, months, years, h, m, s, business days."],
        );
      }
    }

    return {
      type: "NumberLiteral",
      value: amount,
      span: tokenSpan(numberToken),
    };
  }

  matchUnitWords(index) {
    const one = this.tokens[index];
    if (!one || one.type !== "WORD") {
      return null;
    }

    if (one.canonical === "business" && this.tokens[index + 1]?.type === "WORD") {
      const two = this.tokens[index + 1];
      if (two.canonical === "day" || two.canonical === "days") {
        return {
          unit: "businessDays",
          consumed: 2,
          start: one.start,
          end: two.end,
        };
      }
    }

    const mapped = normalizeUnitAlias(one.text);
    if (!mapped) {
      return null;
    }

    return {
      unit: mapped,
      consumed: 1,
      start: one.start,
      end: one.end,
    };
  }

  canStartExpression(token) {
    if (!token) {
      return false;
    }

    if (["LPAREN", "DATE", "TIMESTAMP", "NUMBER", "INVALID_DATE_SLASH"].includes(token.type)) {
      return true;
    }

    if (token.type !== "WORD") {
      return false;
    }

    return !["as", "in", "and", "between"].includes(token.canonical);
  }

  tryAnchorPhraseAhead(a, b, c) {
    return this.peek().type === "WORD" && this.peek().canonical === a && this.peek(1).type === "WORD" && this.peek(1).canonical === b && this.peek(2).type === "WORD" && this.peek(2).canonical === c;
  }

  tryBusinessDaysBetweenAhead() {
    const consumed = this.businessDaysWordsLength(this.index);
    if (!consumed) {
      return false;
    }
    const token = this.peek(consumed);
    return token.type === "WORD" && token.canonical === "between";
  }

  tryBusinessDayRelativeAhead() {
    const first = this.peek();
    return (
      first.type === "WORD" &&
      (first.canonical === "first" || first.canonical === "last") &&
      this.peek(1).type === "WORD" &&
      this.peek(1).canonical === "business" &&
      this.peek(2).type === "WORD" &&
      this.peek(2).canonical === "day" &&
      this.peek(3).type === "WORD" &&
      (this.peek(3).canonical === "after" || this.peek(3).canonical === "before")
    );
  }

  consumeBusinessDaysWords() {
    const consumed = this.businessDaysWordsLength(this.index);
    if (!consumed) {
      throw this.errorAtToken(
        this.peek(),
        "E_PARSE_EXPECTED_BUSINESS_DAYS",
        "Expected 'business days'.",
        ["Use 'business days' or 'businessDays'."],
      );
    }

    const start = this.peek().start;
    let end = this.peek().end;
    for (let i = 0; i < consumed; i += 1) {
      const token = this.consume();
      end = token.end;
    }
    return { start, end };
  }

  businessDaysWordsLength(index) {
    const first = this.tokens[index];
    if (!first || first.type !== "WORD") {
      return 0;
    }

    if (first.canonical === "businessdays" || first.canonical === "businessday") {
      return 1;
    }

    const second = this.tokens[index + 1];
    if (first.canonical === "business" && second?.type === "WORD" && (second.canonical === "day" || second.canonical === "days")) {
      return 2;
    }

    return 0;
  }
}

export function parse(tokens, input = "") {
  try {
    const parser = new Parser(tokens, input);
    const ast = parser.parse();
    return { ok: true, ast };
  } catch (error) {
    if (error && error.kind === "parse") {
      return { ok: false, error };
    }
    throw error;
  }
}
