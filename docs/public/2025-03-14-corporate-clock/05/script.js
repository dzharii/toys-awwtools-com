
document.addEventListener("DOMContentLoaded", function() {
    updateClock();
    setInterval(updateClock, 1000);
    loadTimeZones();
    generateCalendar();
    loadFinancialQuarter();
    loadEvents();
    setInterval(updateEventCountdowns, 1000);
});

function updateClock() {
    const clockElement = document.getElementById("digital-clock");
    const now = new Date();
    clockElement.textContent = now.toLocaleTimeString();
}

function generateCalendar() {
    const calendarElement = document.getElementById("calendar");
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(now.getFullYear(), now.getMonth(), day);
        const dayElement = document.createElement("div");
        dayElement.textContent = day;
        dayElement.classList.add("calendar-day");

        if (date < now) {
            dayElement.classList.add("past");
        }
        if ([0, 6].includes(date.getDay())) {
            dayElement.classList.add("weekend");
        }

        calendarElement.appendChild(dayElement);
    }
}

function updateEventCountdowns() {
    const now = new Date();
    const eventList = document.getElementById("event-list");
    eventList.innerHTML = "";

    events.forEach(event => {
        const eventDate = new Date(event.date);
        const diffTime = eventDate - now;
        const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        const listItem = document.createElement("li");
        listItem.textContent = `${event.title} - ${event.date} (${daysLeft} days left)`;
        eventList.appendChild(listItem);
    });
}

