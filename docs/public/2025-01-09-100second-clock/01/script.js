
// Constants
const EPOCH_START = new Date('2025-01-10T00:00:00Z').getTime();
const SECONDS_IN_MINUTE = 100;
const MINUTES_IN_HOUR = 99;
const HOURS_IN_DAY = 24;

// Utility function to calculate custom time
function calculateCustomTime() {
  const now = Date.now();
  const elapsedMilliseconds = now - EPOCH_START;
  const totalSeconds = Math.floor(elapsedMilliseconds / 10);
  
  const seconds = totalSeconds % SECONDS_IN_MINUTE;
  const totalMinutes = Math.floor(totalSeconds / SECONDS_IN_MINUTE);
  const minutes = totalMinutes % MINUTES_IN_HOUR;
  const hours = Math.floor(totalMinutes / MINUTES_IN_HOUR) % HOURS_IN_DAY;

  return { hours, minutes, seconds };
}

// Utility function to update DOM
function updateClock() {
  const { hours, minutes, seconds } = calculateCustomTime();

  document.getElementById('hours').textContent = String(hours).padStart(2, '0');
  document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
  document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
}

// Initial render and real-time updates
updateClock();
setInterval(updateClock, 1000);

