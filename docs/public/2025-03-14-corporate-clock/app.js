// Main JavaScript for Corporate Calendar and Clock Dashboard

// Global variables for time format (default 24-hour)
let use24HourFormat = true;

// Update multiple time zone clocks from timezones.js configuration
function updateTimezoneClocks() {
  const container = document.getElementById('timezone-clocks');
  container.innerHTML = '';
  timezones.forEach((tz) => {
    const clockDiv = document.createElement('div');
    clockDiv.className = 'timezone-clock';
    clockDiv.id = `clock-${tz.label.replace(/\s+/g, '-')}`;
    container.appendChild(clockDiv);
    updateSingleTimezoneClock(tz);
  });
}

function updateSingleTimezoneClock(tz) {
  const clockDiv = document.getElementById(`clock-${tz.label.replace(/\s+/g, '-')}`);
  if (!clockDiv) return;
  const options = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: !use24HourFormat,
    timeZone: tz.timeZone,
    weekday: 'long',
    day: 'numeric'
  };
  const now = new Date();
  const formatter = new Intl.DateTimeFormat([], options);
  clockDiv.textContent = `${tz.label}: ${formatter.format(now)}`;
}

// Update digital clock
function updateDigitalClock() {
  const digitalClock = document.getElementById('digital-clock');
  if (!digitalClock) return;
  const options = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: !use24HourFormat,
    weekday: 'long',
    day: 'numeric'
  };
  const now = new Date();
  const formatter = new Intl.DateTimeFormat([], options);
  digitalClock.textContent = formatter.format(now);
}

// Toggle between 12-hour and 24-hour formats
document.getElementById('toggle-format').addEventListener('click', function() {
  use24HourFormat = !use24HourFormat;
  this.textContent = use24HourFormat ? 'Switch to 12-Hour Format' : 'Switch to 24-Hour Format';
  updateDigitalClock();
  updateTimezoneClocks();
});

// Financial Quarter Calculation
function getQuarterDetails(date) {
  const year = date.getFullYear();
  let quarterStart, quarterEnd, quarterName;
  if (date.getMonth() < 3) {
    quarterStart = new Date(year, 0, 1);
    quarterEnd = new Date(year, 3, 0);
    quarterName = 'Q1';
  } else if (date.getMonth() < 6) {
    quarterStart = new Date(year, 3, 1);
    quarterEnd = new Date(year, 6, 0);
    quarterName = 'Q2';
  } else if (date.getMonth() < 9) {
    quarterStart = new Date(year, 6, 1);
    quarterEnd = new Date(year, 9, 0);
    quarterName = 'Q3';
  } else {
    quarterStart = new Date(year, 9, 1);
    quarterEnd = new Date(year, 12, 0);
    quarterName = 'Q4';
  }
  return { quarterName, quarterStart, quarterEnd };
}

function calculateWorkdays(startDate, endDate) {
  let count = 0;
  let curDate = new Date(startDate);
  while (curDate <= endDate) {
    const day = curDate.getDay();
    if (day !== 0 && day !== 6) count++;
    curDate.setDate(curDate.getDate() + 1);
  }
  return count;
}

function updateQuarterInfo() {
  const now = new Date();
  const { quarterName, quarterStart, quarterEnd } = getQuarterDetails(now);
  const totalDays = Math.ceil((quarterEnd - quarterStart) / (1000 * 60 * 60 * 24)) + 1;
  const daysPassed = Math.ceil((now - quarterStart) / (1000 * 60 * 60 * 24));
  const calendarDaysRemaining = totalDays - daysPassed;
  const workdaysRemaining = calculateWorkdays(now, quarterEnd);
  const progressPercent = Math.min(100, Math.floor((daysPassed / totalDays) * 100));
  
  document.getElementById('quarter-text').textContent = `${quarterName}: ${quarterStart.toLocaleDateString()} - ${quarterEnd.toLocaleDateString()} | Days Passed: ${daysPassed} | Calendar Days Remaining: ${calendarDaysRemaining} | Workdays Remaining: ${workdaysRemaining}`;
  
  const progressBar = document.getElementById('quarter-progress');
  progressBar.style.width = `${progressPercent}%`;
  
  // Countdown until quarter end
  const timeDiff = quarterEnd - now;
  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeDiff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((timeDiff / (1000 * 60)) % 60);
  document.getElementById('quarter-countdown').textContent = `Time until quarter end: ${days}d ${hours}h ${minutes}m`;
}

// Calendar Generation
function generateCalendar() {
  const calendarEl = document.getElementById('calendar');
  calendarEl.innerHTML = '';
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  // Fill blank days before first day
  for (let i = 0; i < firstDay; i++) {
    const emptyCell = document.createElement('div');
    emptyCell.className = 'calendar-day';
    calendarEl.appendChild(emptyCell);
  }
  
  for (let day = 1; day <= daysInMonth; day++) {
    const cell = document.createElement('div');
    cell.className = 'calendar-day';
    const cellDate = new Date(year, month, day);
    cell.textContent = day;
    
    // Highlight current day
    if (day === now.getDate()) {
      cell.classList.add('current');
    }
    // Highlight weekends
    const weekday = cellDate.getDay();
    if (weekday === 0 || weekday === 6) {
      cell.classList.add('weekend');
    }
    // Highlight past days
    if (cellDate < new Date(year, month, now.getDate())) {
      cell.classList.add('past');
    }
    // Add event markers if there are events on this day
    events.forEach(event => {
      const eventDate = new Date(event.eventDate);
      if (eventDate.getFullYear() === year && eventDate.getMonth() === month && eventDate.getDate() === day) {
        const marker = document.createElement('div');
        marker.className = `event-marker ${event.cssClass}`;
        // Tooltip for event details
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = `${event.title} - ${new Date(event.eventDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
        marker.appendChild(tooltip);
        cell.appendChild(marker);
      }
    });
    
    calendarEl.appendChild(cell);
  }
}

// Upcoming Events List
function updateEventsList() {
  const eventsListEl = document.getElementById('events-list');
  eventsListEl.innerHTML = '';
  const now = new Date();
  // Filter upcoming events
  const upcomingEvents = events.filter(event => new Date(event.eventDate) > now)
                               .sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));
  upcomingEvents.forEach(event => {
    const li = document.createElement('li');
    const eventDate = new Date(event.eventDate);
    // Countdown timer calculation
    const timeDiff = eventDate - now;
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((timeDiff / (1000 * 60)) % 60);
    li.textContent = `${event.title} on ${eventDate.toLocaleDateString()} at ${eventDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - Starts in ${days}d ${hours}h ${minutes}m`;
    eventsListEl.appendChild(li);
  });
}

// Notification System
function updateNotificationBar() {
  const notificationBar = document.getElementById('notification-bar');
  const now = new Date();
  let notifications = [];
  events.forEach(event => {
    const eventDate = new Date(event.eventDate);
    // If event is within the notification timing threshold (in minutes)
    const notifTime = event.notificationTime; // notificationTime in minutes before event
    if ((eventDate - now) <= notifTime * 60 * 1000 && (eventDate - now) > 0) {
      notifications.push(`${event.title} is starting soon!`);
    }
  });
  notificationBar.textContent = notifications.join(' | ');
}

// Main update function for all components
function updateDashboard() {
  updateDigitalClock();
  updateTimezoneClocks();
  updateQuarterInfo();
  generateCalendar();
  updateEventsList();
  updateNotificationBar();
}

// Initial update
updateDashboard();

// Update dashboard every minute
setInterval(updateDashboard, 60000);
  
// Also update clocks more frequently for smooth CSS transition (if needed)
setInterval(() => {
  updateDigitalClock();
  updateTimezoneClocks();
}, 1000);

