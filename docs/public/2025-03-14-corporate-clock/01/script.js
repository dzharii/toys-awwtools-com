
document.addEventListener("DOMContentLoaded", function() {
    updateClock();
    setInterval(updateClock, 1000);

    generateCalendar();
    loadFinancialQuarter();
    loadEvents();
});

function updateClock() {
    const clockElement = document.getElementById("digital-clock");
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    clockElement.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
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
        
        if (day === now.getDate()) {
            dayElement.classList.add("today");
        }

        calendarElement.appendChild(dayElement);
    }
}

function loadFinancialQuarter() {
    const quarterInfo = document.getElementById("quarter-info");
    const quarterProgress = document.getElementById("quarter-progress");
    const quarterCountdown = document.getElementById("quarter-countdown");

    const now = new Date();
    const currentQuarter = Math.floor(now.getMonth() / 3) + 1;
    const quarterStart = new Date(now.getFullYear(), (currentQuarter - 1) * 3, 1);
    const quarterEnd = new Date(now.getFullYear(), currentQuarter * 3, 0);
    const totalDays = (quarterEnd - quarterStart) / (1000 * 60 * 60 * 24);
    const elapsedDays = (now - quarterStart) / (1000 * 60 * 60 * 24);

    quarterInfo.textContent = `Current Quarter: Q${currentQuarter} (${quarterStart.toDateString()} - ${quarterEnd.toDateString()})`;
    quarterProgress.style.width = `${(elapsedDays / totalDays) * 100}%`;
    quarterCountdown.textContent = `Days remaining: ${Math.ceil(totalDays - elapsedDays)}`;
}

function loadEvents() {
    const eventList = document.getElementById("event-list");
    eventList.innerHTML = "";

    events.forEach(event => {
        const eventItem = document.createElement("li");
        eventItem.classList.add("event-item");
        eventItem.textContent = `${event.title} - ${event.date}`;
        eventList.appendChild(eventItem);
    });
}

