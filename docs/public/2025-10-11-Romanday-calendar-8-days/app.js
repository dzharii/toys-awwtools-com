/* Romanday Eight-Day Calendar (legacy script version, no modules) */
(function () {
  'use strict';

  /* ===== Constants & Utilities ===== */
  var WEEKDAY_LABELS = Object.freeze(["Sun", "Rom", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]);
  var WEEKDAY_FULL = Object.freeze(["Sunday", "Romanday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]);
  var MONTH_FULL = Object.freeze([
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ]);
  var MS_PER_DAY = 86400000;
  var EPOCH_UTC_MS = Date.UTC(1970, 0, 1, 0, 0, 0, 0); // 1970-01-01T00:00:00Z
  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ===== Time & Mapping Functions ===== */
  function getUtcMidnight(date) {
    // UTC midnight corresponding to the local calendar date of `date`
    return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  }

  function getDaysSinceEpoch(date) {
    var ms = getUtcMidnight(date) - EPOCH_UTC_MS;
    return Math.floor(ms / MS_PER_DAY);
  }

  function getIndex8(date) {
    // (5 + daysSinceEpoch) mod 8 so 1970-01-01 → Thursday (index 5)
    var dse = getDaysSinceEpoch(date);
    return (5 + (dse % 8) + 8) % 8;
  }

  function firstOfMonthIndex(year, month /* 0-based */) {
    var d = new Date(year, month, 1);
    return getIndex8(d);
  }

  function formatTime(date) {
    var pad2 = function (n) { return String(n).padStart(2, "0"); };
    return pad2(date.getHours()) + ":" + pad2(date.getMinutes()) + ":" + pad2(date.getSeconds());
  }

  function formatISODate(date) {
    var y = date.getFullYear();
    var m = String(date.getMonth() + 1).padStart(2, "0");
    var d = String(date.getDate()).padStart(2, "0");
    return y + "-" + m + "-" + d;
  }

  /* ===== Seven-Segment Clock Rendering ===== */

  // Build a single seven-segment digit group
  function buildDigitGroup(svgNS, xOffset) {
    var g = document.createElementNS(svgNS, "g");
    g.setAttribute("transform", "translate(" + xOffset + ",0)");
    g.setAttribute("role", "group");

    var seg = function (name, x, y, w, h, rotate, rx, ry) {
      if (rotate === void 0) rotate = 0;
      if (rx === void 0) rx = 6;
      if (ry === void 0) ry = 6;
      var r = document.createElementNS(svgNS, "rect");
      r.setAttribute("class", "segment seg-" + name);
      r.setAttribute("x", x); r.setAttribute("y", y);
      r.setAttribute("width", w); r.setAttribute("height", h);
      r.setAttribute("rx", rx); r.setAttribute("ry", ry);
      if (rotate) {
        var cx = x + w / 2, cy = y + h / 2;
        r.setAttribute("transform", "rotate(" + rotate + " " + cx + " " + cy + ")");
      }
      g.appendChild(r);
      return r;
    };

    // a (top), b (top-right), c (bottom-right), d (bottom), e (bottom-left), f (top-left), g (middle)
    var segments = {
      a: seg("a", 20, 4, 60, 14),
      b: seg("b", 74, 18, 14, 60),
      c: seg("c", 74, 102, 14, 60),
      d: seg("d", 20, 168, 60, 14),
      e: seg("e", 12, 102, 14, 60),
      f: seg("f", 12, 18, 14, 60),
      g: seg("g", 20, 86, 60, 14)
    };

    return { group: g, segments: segments };
  }

  // Digit to segments map
  var DIGIT_TO_SEGS = Object.freeze({
    0: ["a","b","c","d","e","f"],
    1: ["b","c"],
    2: ["a","b","g","e","d"],
    3: ["a","b","g","c","d"],
    4: ["f","g","b","c"],
    5: ["a","f","g","c","d"],
    6: ["a","f","g","c","d","e"],
    7: ["a","b","c"],
    8: ["a","b","c","d","e","f","g"],
    9: ["a","b","c","d","f","g"]
  });

  function renderClock(root) {
    var svgNS = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("class", "clock-svg");
    svg.setAttribute("viewBox", "0 0 900 200");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", "Digital clock showing hours, minutes, and seconds");

    var digitWidth = 100;
    var spacing = 10;
    var step = digitWidth + spacing;

    var groups = [];
    var x = 0;

    // Hidden explanation for SR users
    var srLabels = document.createElement("div");
    srLabels.className = "visually-hidden";
    srLabels.innerText = "Clock digits: Hours tens, Hours ones, Minutes tens, Minutes ones, Seconds tens, Seconds ones.";

    // HH
    var d0 = buildDigitGroup(svgNS, x); svg.appendChild(d0.group); groups.push(d0); x += step;
    var d1 = buildDigitGroup(svgNS, x); svg.appendChild(d1.group); groups.push(d1); x += step;

    // :
    var colon1 = document.createElementNS(svgNS, "g");
    colon1.setAttribute("transform", "translate(" + (x - 2) + ",0)");
    var dot1a = document.createElementNS(svgNS, "rect");
    dot1a.setAttribute("class","colon-dot");
    dot1a.setAttribute("x","0"); dot1a.setAttribute("y","60");
    dot1a.setAttribute("width","16"); dot1a.setAttribute("height","16"); dot1a.setAttribute("rx","8"); dot1a.setAttribute("ry","8");
    var dot1b = document.createElementNS(svgNS, "rect");
    dot1b.setAttribute("class","colon-dot");
    dot1b.setAttribute("x","0"); dot1b.setAttribute("y","120");
    dot1b.setAttribute("width","16"); dot1b.setAttribute("height","16"); dot1b.setAttribute("rx","8"); dot1b.setAttribute("ry","8");
    colon1.appendChild(dot1a); colon1.appendChild(dot1b);
    svg.appendChild(colon1);
    x += 20;

    // MM
    var d2 = buildDigitGroup(svgNS, x); svg.appendChild(d2.group); groups.push(d2); x += step;
    var d3 = buildDigitGroup(svgNS, x); svg.appendChild(d3.group); groups.push(d3); x += step;

    // :
    var colon2 = document.createElementNS(svgNS, "g");
    colon2.setAttribute("transform", "translate(" + (x - 2) + ",0)");
    var dot2a = document.createElementNS(svgNS, "rect");
    dot2a.setAttribute("class","colon-dot");
    dot2a.setAttribute("x","0"); dot2a.setAttribute("y","60");
    dot2a.setAttribute("width","16"); dot2a.setAttribute("height","16"); dot2a.setAttribute("rx","8"); dot2a.setAttribute("ry","8");
    var dot2b = document.createElementNS(svgNS, "rect");
    dot2b.setAttribute("class","colon-dot");
    dot2b.setAttribute("x","0"); dot2b.setAttribute("y","120");
    dot2b.setAttribute("width","16"); dot2b.setAttribute("height","16"); dot2b.setAttribute("rx","8"); dot2b.setAttribute("ry","8");
    colon2.appendChild(dot2a); colon2.appendChild(dot2b);
    svg.appendChild(colon2);
    x += 20;

    // SS
    var d4 = buildDigitGroup(svgNS, x); svg.appendChild(d4.group); groups.push(d4); x += step;
    var d5 = buildDigitGroup(svgNS, x); svg.appendChild(d5.group); groups.push(d5); x += step;

    root.appendChild(svg);
    root.appendChild(srLabels);

    var digitSegments = groups.map(function (g) { return g.segments; });

    function setDigit(digitIndex, value) {
      var segs = digitSegments[digitIndex];
      var on = DIGIT_TO_SEGS[value] || [];
      Object.keys(segs).forEach(function (key) {
        var el = segs[key];
        if (on.indexOf(key) !== -1) el.classList.add("on");
        else el.classList.remove("on");
      });
    }

    var colonOn = true;
    function setColon(visible) {
      colonOn = visible;
      [dot1a, dot1b, dot2a, dot2b].forEach(function (el) {
        if (visible) el.classList.remove("off");
        else el.classList.add("off");
      });
    }
    if (prefersReducedMotion) setColon(true);

    function update(date) {
      var h = date.getHours();
      var m = date.getMinutes();
      var s = date.getSeconds();
      setDigit(0, Math.floor(h / 10));
      setDigit(1, h % 10);
      setDigit(2, Math.floor(m / 10));
      setDigit(3, m % 10);
      setDigit(4, Math.floor(s / 10));
      setDigit(5, s % 10);
    }

    return {
      update: update,
      blink: function () { if (!prefersReducedMotion) setColon(!colonOn); },
      setColon: function (v) { setColon(!!v); }
    };
  }

  /* ===== Week Header Rendering ===== */
  function renderWeekHeader(root) {
    root.innerHTML = "";
    var items = WEEKDAY_LABELS.map(function (label, idx) {
      var div = document.createElement("div");
      div.className = "weekday";
      div.textContent = label;
      div.setAttribute("role", "text");
      div.dataset.idx8 = String(idx);
      root.appendChild(div);
      return div;
    });

    function setHighlight(i) {
      items.forEach(function (el) {
        el.classList.toggle("current", Number(el.dataset.idx8) === i);
      });
    }
    return { setHighlight: setHighlight };
  }

  /* ===== Year Calendar Rendering ===== */
  function renderYearCalendar(root, year) {
    root.innerHTML = "";
    var fragment = document.createDocumentFragment();

    for (var month = 0; month < 12; month++) {
      var wrap = document.createElement("section");
      wrap.className = "month";
      wrap.setAttribute("aria-labelledby", "m-" + year + "-" + month + "-title");

      var title = document.createElement("h3");
      title.className = "month-title";
      title.id = "m-" + year + "-" + month + "-title";
      title.textContent = MONTH_FULL[month] + " " + year;
      wrap.appendChild(title);

      var grid = document.createElement("div");
      grid.className = "month-grid";
      grid.setAttribute("role", "grid");
      grid.setAttribute("aria-readonly", "true");

      // Header row
      for (var i = 0; i < 8; i++) {
        var headerCell = document.createElement("div");
        headerCell.className = "cell header";
        headerCell.style.background = "transparent";
        headerCell.style.borderTop = "none";
        headerCell.style.fontWeight = "600";
        headerCell.style.textAlign = "center";
        headerCell.style.color = "var(--fg-dim)";
        headerCell.style.minHeight = "34px";
        headerCell.textContent = WEEKDAY_LABELS[i];
        grid.appendChild(headerCell);
      }

      var firstIdx8 = firstOfMonthIndex(year, month);
      var daysInMonth = new Date(year, month + 1, 0).getDate();

      for (var p = 0; p < firstIdx8; p++) {
        var cellPad = document.createElement("div");
        cellPad.className = "cell blank";
        cellPad.setAttribute("role", "gridcell");
        grid.appendChild(cellPad);
      }

      for (var day = 1; day <= daysInMonth; day++) {
        var cell = document.createElement("div");
        cell.className = "cell";
        cell.setAttribute("role", "gridcell");

        var num = document.createElement("span");
        num.className = "num";
        num.textContent = String(day);
        cell.appendChild(num);

        var iso = year + "-" + String(month + 1).padStart(2,"0") + "-" + String(day).padStart(2,"0");
        cell.dataset.date = iso;
        cell.tabIndex = 0;

        grid.appendChild(cell);
      }

      wrap.appendChild(grid);
      fragment.appendChild(wrap);
    }

    root.appendChild(fragment);

    function highlightTodayCell(date) {
      root.querySelectorAll(".cell.today").forEach(function (el) { el.classList.remove("today"); });
      var selector = '.cell[data-date="' + formatISODate(date) + '"]';
      var el = root.querySelector(selector);
      if (el) el.classList.add("today");
    }

    function setCurrentDateLine(date, idx8) {
      var line = document.getElementById("current-date-line");
      var iso = formatISODate(date);
      line.textContent = iso + " — " + WEEKDAY_FULL[idx8];
    }

    return { highlightTodayCell: highlightTodayCell, setCurrentDateLine: setCurrentDateLine };
  }

  /* ===== App Boot & Loop ===== */
  function boot() {
    var now = new Date();
    var displayYear = now.getFullYear();

    var clockRoot = document.getElementById("clock");
    var headerRoot = document.getElementById("week-header");
    var calRoot = document.getElementById("year-calendar");
    var clockText = document.getElementById("clock-text");

    var clock = renderClock(clockRoot);
    var header = renderWeekHeader(headerRoot);
    var calendar = renderYearCalendar(calRoot, displayYear);

    var currentDate = now;
    var currentIdx8 = getIndex8(currentDate);
    header.setHighlight(currentIdx8);
    calendar.highlightTodayCell(currentDate);
    calendar.setCurrentDateLine(currentDate, currentIdx8);
    clock.update(currentDate);
    clockText.textContent = formatTime(currentDate) + " (local time)";

    var lastTick = performance.now();
    var interval = 250;

    function tick(t) {
      if (t - lastTick >= interval) {
        lastTick = t;
        var d = new Date();
        clock.update(d);
        if (!prefersReducedMotion) {
          clock.blink();
        }
        clockText.textContent = formatTime(d) + " (local time)";
        var idx = getIndex8(d);
        if (idx !== currentIdx8) {
          currentIdx8 = idx;
          header.setHighlight(idx);
        }
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);

    scheduleMidnightRefresh();

    function scheduleMidnightRefresh() {
      var now = new Date();
      var tmr = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 50);
      var delay = Math.max(25, tmr.getTime() - now.getTime());
      window.setTimeout(function () {
        var d = new Date();
        currentDate = d;
        currentIdx8 = getIndex8(d);
        header.setHighlight(currentIdx8);
        calendar.highlightTodayCell(d);
        calendar.setCurrentDateLine(d, currentIdx8);
        scheduleMidnightRefresh();
      }, delay);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();

