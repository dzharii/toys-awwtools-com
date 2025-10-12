
var WEEKDAYS = ["Sun", "Rom", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
var FULL_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

function getUtcMidnight(date) {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
}

function getDaysSinceEpoch(date) {
  var EPOCH = Date.UTC(1970, 0, 1);
  return Math.floor((getUtcMidnight(date) - EPOCH) / 86400000);
}

function getIndex8(date) {
  return (5 + getDaysSinceEpoch(date)) % 8;
}

function formatTime(date) {
  return date.toTimeString().slice(0, 8);
}

function renderClock(root) {
  var digitMap = {
    0: [1,1,1,1,1,1,0],
    1: [0,1,1,0,0,0,0],
    2: [1,1,0,1,1,0,1],
    3: [1,1,1,1,0,0,1],
    4: [0,1,1,0,0,1,1],
    5: [1,0,1,1,0,1,1],
    6: [1,0,1,1,1,1,1],
    7: [1,1,1,0,0,0,0],
    8: [1,1,1,1,1,1,1],
    9: [1,1,1,1,0,1,1]
  };
  
  var segmentsByDigit = [];
  for (var i = 0; i < 6; i++) {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "40");
    svg.setAttribute("height", "80");
    svg.setAttribute("viewBox", "0 0 40 80");
    svg.style.margin = "0 2px";
    var segments = [];

    for (var j = 0; j < 7; j++) {
      var rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttribute("class", "segment");
      rect.setAttribute("width", "30");
      rect.setAttribute("height", "8");
      rect.setAttribute("rx", "2");
      rect.setAttribute("ry", "2");
      rect.setAttribute("transform", "translate(5, " + (j * 10 + 5) + ")");
      svg.appendChild(rect);
      segments.push(rect);
    }

    root.appendChild(svg);
    segmentsByDigit.push(segments);
    if (i === 1 || i === 3) {
      var colon = document.createElement("div");
      colon.textContent = ":";
      colon.style.fontSize = "48px";
      colon.style.margin = "0 4px";
      colon.id = "colon-" + i;
      root.appendChild(colon);
    }
  }

  return function updateClock(d) {
    var h = d.getHours();
    var m = d.getMinutes();
    var s = d.getSeconds();
    var digits = [
      Math.floor(h / 10), h % 10,
      Math.floor(m / 10), m % 10,
      Math.floor(s / 10), s % 10
    ];
    digits.forEach(function(num, i) {
      var pattern = digitMap[num];
      pattern.forEach(function(on, j) {
        segmentsByDigit[i][j].classList.toggle("active", on);
      });
    });

    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      var show = d.getMilliseconds() < 500;
      document.querySelectorAll("[id^=colon-]").forEach(function(el) {
        el.style.opacity = show ? "1" : "0";
      });
    }
  };
}

function renderWeekHeader(root) {
  WEEKDAYS.forEach(function(name, i) {
    var span = document.createElement("span");
    span.textContent = name;
    span.dataset.index8 = i;
    root.appendChild(span);
  });
  return function highlight(i) {
    root.querySelectorAll("span").forEach(function(el) {
      el.classList.remove("highlight");
    });
    root.querySelector('span[data-index8="' + i + '"]').classList.add("highlight");
  };
}

function renderYearCalendar(root, year) {
  var today = new Date();
  var currentDate = today.getDate();
  var currentMonth = today.getMonth();
  var currentYear = today.getFullYear();

  FULL_MONTHS.forEach(function(name, m) {
    var wrapper = document.createElement("div");
    wrapper.className = "month";

    var label = document.createElement("div");
    label.className = "month-name";
    label.textContent = name;
    wrapper.appendChild(label);

    var grid = document.createElement("div");
    grid.className = "day-grid";

    var firstIndex = getIndex8(new Date(year, m, 1));
    for (var i = 0; i < firstIndex; i++) {
      grid.appendChild(document.createElement("div"));
    }

    var daysInMonth = new Date(year, m + 1, 0).getDate();
    for (var d = 1; d <= daysInMonth; d++) {
      var day = document.createElement("div");
      day.textContent = d;
      if (d === currentDate && m === currentMonth && year === currentYear) {
        day.className = "today";
      }
      grid.appendChild(day);
    }

    wrapper.appendChild(grid);
    root.appendChild(wrapper);
  });
}

function startLoop() {
  var now = new Date();
  var year = now.getFullYear();

  var clockRoot = document.getElementById("svg-clock");
  var updateClock = renderClock(clockRoot);

  var weekHeader = document.getElementById("week-header");
  var highlightHeader = renderWeekHeader(weekHeader);

  var calendarRoot = document.getElementById("calendar");
  renderYearCalendar(calendarRoot, year);

  function update() {
    var now = new Date();
    updateClock(now);
    document.getElementById("text-clock").textContent = formatTime(now);
    highlightHeader(getIndex8(now));
    requestAnimationFrame(update);
  }
  update();

  var dateLine = document.getElementById("current-date-line");
  function updateDateLine() {
    var d = new Date();
    dateLine.textContent = d.getFullYear() + "-" +
      String(d.getMonth() + 1).padStart(2, "0") + "-" +
      String(d.getDate()).padStart(2, "0") + " — " +
      WEEKDAYS[getIndex8(d)];
  }
  updateDateLine();

  var msUntilMidnight = getUtcMidnight(new Date(Date.now() + 86400000)) - Date.now();
  setTimeout(function() {
    updateDateLine();
    document.querySelectorAll(".today").forEach(function(el) {
      el.classList.remove("today");
    });
    calendarRoot.innerHTML = "";
    renderYearCalendar(calendarRoot, year);
  }, msUntilMidnight + 1000);
}

startLoop();

