
document.addEventListener("DOMContentLoaded", function() {
    updateClock();
    drawAnalogClock();
    loadTimeZones();
    generateCalendar();
    loadFinancialQuarter();
    loadEvents();
    setInterval(updateClock, 1000);
});

function updateClock() {
    const clockElement = document.getElementById("digital-clock");
    const now = new Date();
    clockElement.textContent = now.toLocaleTimeString();
}

function drawAnalogClock() {
    const canvas = document.getElementById("analog-clock");
    const ctx = canvas.getContext("2d");

    function drawClock() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        ctx.arc(50, 50, 40, 0, 2 * Math.PI);
        ctx.stroke();
    }
    drawClock();
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

