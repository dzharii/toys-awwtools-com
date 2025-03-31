
const container = document.getElementById("calendarContainer");

const calendarModules = [
  {
    name: "Gregorian Calendar",
    getDateTime: () => {
      const now = new Date();
      return {
        date: now.toLocaleDateString("en-GB", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        time: now.toLocaleTimeString()
      };
    },
    description: "Introduced in 1582 by Pope Gregory XIII, the Gregorian calendar corrected inaccuracies in the Julian calendar. It has become the global standard for civil timekeeping and is widely used in everyday life."
  },
  {
    name: "Julian Calendar",
    getDateTime: () => {
      const now = new Date();
      const julianOffset = 13 * 86400000;
      const julianDate = new Date(now.getTime() - julianOffset);
      return {
        date: julianDate.toDateString() + " (approx.)",
        time: now.toLocaleTimeString()
      };
    },
    description: "Established by Julius Caesar in 45 BCE, the Julian calendar was the predominant calendar in the Western world for centuries. Today, it remains in use within certain Eastern Orthodox liturgical contexts."
  }
];

const cardElements = [];

function createCard(calendar) {
  const card = document.createElement("div");
  card.className = "card";

  const title = document.createElement("h2");
  title.textContent = calendar.name;

  const dateDiv = document.createElement("div");
  dateDiv.className = "date";

  const timeDiv = document.createElement("div");
  timeDiv.className = "time";

  const noteDiv = document.createElement("div");
  noteDiv.className = "note";
  noteDiv.textContent = calendar.description;

  card.appendChild(title);
  card.appendChild(dateDiv);
  card.appendChild(timeDiv);
  card.appendChild(noteDiv);
  container.appendChild(card);

  return { dateDiv, timeDiv };
}

function updateMainClock() {
  document.getElementById("mainClock").textContent = new Date().toLocaleTimeString();
}

function initializeCalendarCards() {
  calendarModules.forEach(calendar => {
    const { dateDiv, timeDiv } = createCard(calendar);
    cardElements.push({ getDateTime: calendar.getDateTime, dateDiv, timeDiv });
  });
}

function updateCalendars() {
  cardElements.forEach(({ getDateTime, dateDiv, timeDiv }) => {
    const { date, time } = getDateTime();
    dateDiv.textContent = date;
    timeDiv.textContent = time;
  });
}

initializeCalendarCards();
updateMainClock();
updateCalendars();
setInterval(() => {
  updateMainClock();
  updateCalendars();
}, 1000);

