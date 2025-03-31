/**
 * Global Calendars Dashboard
 * 
 * This script provides real-time date and time conversions for various calendar systems.
 * Each calendar implementation is self-contained in its own function or object.
 */

// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Start clock update and calendar conversions
    updateAllCalendars();
    // Update every second
    setInterval(updateAllCalendars, 1000);
});

// Main function to update all calendars
function updateAllCalendars() {
    const now = new Date();
    
    // Update main clock
    updateMainClock(now);
    
    // Update all individual calendars
    updateGregorianCalendar(now);
    updateJulianCalendar(now);
    updateIslamicCalendar(now);
    updateHebrewCalendar(now);
    updateChineseCalendar(now);
    updateHinduCalendar(now);
    updatePersianCalendar(now);
    updateBuddhistCalendar(now);
    updateCopticCalendar(now);
    updateEthiopianCalendar(now);
    updateBahaiCalendar(now);
    updateJapaneseCalendar(now);
    updateSakaCalendar(now);
}

// Update the main clock in the header
function updateMainClock(date) {
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
    };
    
    const clockElement = document.getElementById('main-clock');
    clockElement.textContent = date.toLocaleString(undefined, options);
    // Apply a subtle animation to show the time is updating
    clockElement.classList.add('time-update');
    setTimeout(() => clockElement.classList.remove('time-update'), 500);
}

// Format time consistently across calendar displays
function formatTime(date) {
    return date.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

// ==============================================
// Gregorian Calendar Functions
// ==============================================
function updateGregorianCalendar(date) {
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const day = date.getDate();
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    
    const dateDisplay = document.getElementById('gregorian-date');
    const timeDisplay = document.getElementById('gregorian-time');
    
    dateDisplay.textContent = `${month} ${day}, ${year}`;
    timeDisplay.textContent = formatTime(date);
}

// ==============================================
// Julian Calendar Functions
// ==============================================
function updateJulianCalendar(date) {
    const julianDate = convertToJulian(date);
    
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const dateDisplay = document.getElementById('julian-date');
    const timeDisplay = document.getElementById('julian-time');
    
    dateDisplay.textContent = `${monthNames[julianDate.month - 1]} ${julianDate.day}, ${julianDate.year}`;
    timeDisplay.textContent = formatTime(date);
}

function convertToJulian(date) {
    // Simplified Julian calendar conversion
    let gregorianYear = date.getFullYear();
    let gregorianMonth = date.getMonth() + 1;
    let gregorianDay = date.getDate();
    
    // Calculate Julian calendar date (simplified approach)
    let centuryAdjustment = Math.floor(gregorianYear / 100) - Math.floor(gregorianYear / 400) - 2;
    
    // Current difference between Julian and Gregorian calendars
    let dayDifference = 0;
    
    // Basic algorithm to determine difference:
    if (gregorianYear >= 1900 && gregorianYear < 2100) {
        dayDifference = 13; // 20th & 21st century
    } else if (gregorianYear >= 1800 && gregorianYear < 1900) {
        dayDifference = 12; // 19th century
    } else if (gregorianYear >= 1700 && gregorianYear < 1800) {
        dayDifference = 11; // 18th century
    } else if (gregorianYear >= 1582 && gregorianYear < 1700) {
        dayDifference = 10; // 16th-17th century
    }
    
    let jd = Math.floor(365.25 * (gregorianYear + 4716)) +
             Math.floor(30.6001 * (gregorianMonth + 1)) +
             gregorianDay - dayDifference - 1524.5;
    
    let julian = {};
    julian.year = gregorianYear;
    julian.month = gregorianMonth;
    julian.day = Math.max(1, gregorianDay - dayDifference);
    
    // Handle month/year boundaries
    if (julian.day <= 0) {
        julian.month--;
        if (julian.month === 0) {
            julian.month = 12;
            julian.year--;
        }
        
        // Days in the previous month
        const daysInPrevMonth = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        if (julian.month === 2 && isLeapYear(julian.year)) {
            daysInPrevMonth[2] = 29;
        }
        
        julian.day += daysInPrevMonth[julian.month];
    }
    
    return julian;
}

function isLeapYear(year) {
    // Julian calendar leap year rule: divisible by 4
    return year % 4 === 0;
}

// ==============================================
// Islamic (Hijri) Calendar Functions
// ==============================================
function updateIslamicCalendar(date) {
    const islamicDate = convertToIslamic(date);
    
    const monthNames = [
        'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani', 'Jumada al-Awwal', 'Jumada al-Thani',
        'Rajab', 'Shaban', 'Ramadan', 'Shawwal', 'Dhu al-Qadah', 'Dhu al-Hijjah'
    ];
    
    const dateDisplay = document.getElementById('islamic-date');
    const timeDisplay = document.getElementById('islamic-time');
    
    dateDisplay.textContent = `${islamicDate.day} ${monthNames[islamicDate.month - 1]}, ${islamicDate.year} AH`;
    timeDisplay.textContent = formatTime(date);
}

function convertToIslamic(date) {
    // Approximate calculation of Islamic calendar date
    const gregorianDate = new Date(date);
    
    // Julian day calculation
    const year = gregorianDate.getFullYear();
    const month = gregorianDate.getMonth() + 1;
    const day = gregorianDate.getDate();
    
    let jd = Math.floor((1461 * (year + 4800 + Math.floor((