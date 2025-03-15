
document.addEventListener("DOMContentLoaded", function() {
    loadTimeZones();
    generateCalendar();
    loadFinancialQuarter();
    loadEvents();
});

function loadTimeZones() {
    const container = document.getElementById("timezones");
    timeZones.forEach(zone => {
        const clockDiv = document.createElement("div");
        clockDiv.classList.add("clock-box");
        clockDiv.setAttribute("data-timezone", zone.timezone);
        container.appendChild(clockDiv);
    });

    updateClocks();
    setInterval(updateClocks, 60000);
}

function updateClocks() {
    document.querySelectorAll(".clock-box").forEach(clock => {
        const timeZone = clock.getAttribute("data-timezone");
        const now = new Date().toLocaleString("en-US", { timeZone, hour12: false, hour: '2-digit', minute: '2-digit', weekday: 'long', day: '2-digit' });
        clock.textContent = now;
    });
}

function generateCalendar() {
    const calendarElement = document.getElementById("calendar");
    calendarElement.innerHTML = "";

    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement("div");
        dayElement.textContent = day;
        dayElement.classList.add("calendar-day");

        const date = new Date(now.getFullYear(), now.getMonth(), day);
        if (date < now) {
            dayElement.classList.add("past");
        }
        if (date.getDay() === 0 || date.getDay() === 6) {
            dayElement.classList.add("weekend");
        }
        
        const event = events.find(e => e.date === date.toISOString().split("T")[0]);
        if (event) {
            const dot = document.createElement("div");
            dot.classList.add("event-dot");
            dayElement.appendChild(dot);
            dayElement.setAttribute("title", event.title);
        }

        calendarElement.appendChild(dayElement);
    }
}

