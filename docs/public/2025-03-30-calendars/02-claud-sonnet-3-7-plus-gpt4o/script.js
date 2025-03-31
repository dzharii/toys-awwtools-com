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
    
    let jd = Math.floor((1461 * (year + 4800 + Math.floor((month - 14) / 12))) / 4) +
             Math.floor((367 * (month - 2 - 12 * Math.floor((month - 14) / 12))) / 12) -
             Math.floor((3 * Math.floor((year + 4900 + Math.floor((month - 14) / 12)) / 100)) / 4) +
             day - 32075;

    // Islamic date calculation
    jd = jd - 1948440 + 10632;
    const n = Math.floor((jd - 1) / 10631);
    jd = jd - 10631 * n + 354;
    const j = Math.floor((10985 - jd) / 5316) * Math.floor((50 * jd) / 17719) + 
              Math.floor(jd / 5670) * Math.floor((43 * jd) / 15238);
    jd = jd - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) - 
         Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
    
    const islamicMonth = Math.floor((24 * jd) / 709);
    const islamicDay = jd - Math.floor((709 * islamicMonth) / 24);
    const islamicYear = 30 * n + j - 30;

    return {
        year: islamicYear,
        month: islamicMonth + 1,
        day: islamicDay
    };
}

// ==============================================
// Hebrew Calendar Functions
// ==============================================
function updateHebrewCalendar(date) {
    const hebrewDate = convertToHebrew(date);
    
    const monthNames = [
        'Nisan', 'Iyar', 'Sivan', 'Tammuz', 'Av', 'Elul', 
        'Tishrei', 'Cheshvan', 'Kislev', 'Tevet', 'Shevat', 'Adar', 'Adar II'
    ];
    
    const dateDisplay = document.getElementById('hebrew-date');
    const timeDisplay = document.getElementById('hebrew-time');
    
    const monthName = hebrewDate.leap && hebrewDate.month === 12 ? 'Adar I' : 
                     (hebrewDate.leap && hebrewDate.month === 13 ? 'Adar II' : monthNames[hebrewDate.month - 1]);
    
    dateDisplay.textContent = `${hebrewDate.day} ${monthName}, ${hebrewDate.year}`;
    timeDisplay.textContent = formatTime(date);
}

function convertToHebrew(date) {
    // Simplified Hebrew calendar calculation
    // Using a mathematical approximation for the Hebrew date
    
    const gregorianDate = new Date(date);
    const year = gregorianDate.getFullYear();
    const month = gregorianDate.getMonth() + 1;
    const day = gregorianDate.getDate();
    
    // Julian day number calculation
    const jd = Math.floor(367 * year - Math.floor(7 * (year + Math.floor((month + 9) / 12)) / 4) - 
              Math.floor(3 * Math.floor((year + Math.floor((month - 9) / 7)) / 100 + 1) / 4) + 
              Math.floor(275 * month / 9) + day + 1721028.5);
    
    // Hebrew date calculation (approximation)
    const hebrewYear = Math.floor((jd - 347996) / 365.2468) + 1;
    
    // Determine if it's a leap year in the Hebrew calendar
    const isLeapHebrewYear = ((7 * hebrewYear + 1) % 19) < 7;
    
    // Calculate Hebrew month and day (approximate)
    const daysInYear = isLeapHebrewYear ? 384 : 354;
    const dayOfYear = (jd - 347996) % 365.2468;
    
    // Simplified month calculation
    let hebrewMonth;
    let hebrewDay;
    
    if (dayOfYear < 30) {
        hebrewMonth = 7; // Tishrei
        hebrewDay = Math.floor(dayOfYear) + 1;
    } else if (dayOfYear < 59) {
        hebrewMonth = 8; // Cheshvan
        hebrewDay = Math.floor(dayOfYear) - 30 + 1;
    } else if (dayOfYear < 88) {
        hebrewMonth = 9; // Kislev
        hebrewDay = Math.floor(dayOfYear) - 59 + 1;
    } else if (dayOfYear < 117) {
        hebrewMonth = 10; // Tevet
        hebrewDay = Math.floor(dayOfYear) - 88 + 1;
    } else if (dayOfYear < 147) {
        hebrewMonth = 11; // Shevat
        hebrewDay = Math.floor(dayOfYear) - 117 + 1;
    } else if (isLeapHebrewYear && dayOfYear < 177) {
        hebrewMonth = 12; // Adar I (in leap year)
        hebrewDay = Math.floor(dayOfYear) - 147 + 1;
    } else if (isLeapHebrewYear && dayOfYear < 207) {
        hebrewMonth = 13; // Adar II (in leap year)
        hebrewDay = Math.floor(dayOfYear) - 177 + 1;
    } else if (!isLeapHebrewYear && dayOfYear < 177) {
        hebrewMonth = 12; // Adar (in non-leap year)
        hebrewDay = Math.floor(dayOfYear) - 147 + 1;
    } else if (dayOfYear < 236) {
        hebrewMonth = 1; // Nisan
        hebrewDay = Math.floor(dayOfYear) - (isLeapHebrewYear ? 207 : 177) + 1;
    } else if (dayOfYear < 266) {
        hebrewMonth = 2; // Iyar
        hebrewDay = Math.floor(dayOfYear) - 236 + 1;
    } else if (dayOfYear < 295) {
        hebrewMonth = 3; // Sivan
        hebrewDay = Math.floor(dayOfYear) - 266 + 1;
    } else if (dayOfYear < 325) {
        hebrewMonth = 4; // Tammuz
        hebrewDay = Math.floor(dayOfYear) - 295 + 1;
    } else {
        hebrewMonth = 5; // Av
        hebrewDay = Math.floor(dayOfYear) - 325 + 1;
    }
    
    return {
        year: hebrewYear,
        month: hebrewMonth,
        day: hebrewDay,
        leap: isLeapHebrewYear
    };
}

// ==============================================
// Chinese Calendar Functions
// ==============================================
function updateChineseCalendar(date) {
    const chineseDate = convertToChinese(date);
    
    // Chinese month names with romanization
    const monthNames = [
        '正月 (Zhēngyuè)', '二月 (Èryuè)', '三月 (Sānyuè)', '四月 (Sìyuè)', 
        '五月 (Wǔyuè)', '六月 (Liùyuè)', '七月 (Qīyuè)', '八月 (Bāyuè)', 
        '九月 (Jiǔyuè)', '十月 (Shíyuè)', '十一月 (Shíyīyuè)', '十二月 (Shí'èryuè)'
    ];
    
    // Chinese zodiac animals
    const zodiacAnimals = [
        '鼠 (Rat)', '牛 (Ox)', '虎 (Tiger)', '兔 (Rabbit)', '龙 (Dragon)', '蛇 (Snake)',
        '马 (Horse)', '羊 (Goat)', '猴 (Monkey)', '鸡 (Rooster)', '狗 (Dog)', '猪 (Pig)'
    ];
    
    // Chinese celestial stems and terrestrial branches
    const stems = ['甲 (Jiǎ)', '乙 (Yǐ)', '丙 (Bǐng)', '丁 (Dīng)', '戊 (Wù)', 
                  '己 (Jǐ)', '庚 (Gēng)', '辛 (Xīn)', '壬 (Rén)', '癸 (Guǐ)'];
    const branches = ['子 (Zǐ)', '丑 (Chǒu)', '寅 (Yín)', '卯 (Mǎo)', '辰 (Chén)', '巳 (Sì)',
                     '午 (Wǔ)', '未 (Wèi)', '申 (Shēn)', '酉 (Yǒu)', '戌 (Xū)', '亥 (Hài)'];
    
    const dateDisplay = document.getElementById('chinese-date');
    const timeDisplay = document.getElementById('chinese-time');
    
    const stemIndex = (chineseDate.year - 4) % 10;
    const branchIndex = (chineseDate.year - 4) % 12;
    const animalIndex = branchIndex;
    
    dateDisplay.textContent = `${stems[stemIndex]}${branches[branchIndex]} 年, ${monthNames[chineseDate.month - 1]}, ${chineseDate.day}日 - ${zodiacAnimals[animalIndex]} Year`;
    timeDisplay.textContent = formatTime(date);
}

function convertToChinese(date) {
    // Simplified Chinese lunar calendar approximation
    // This is a very rough approximation as the actual calculation is complex
    const gregorianDate = new Date(date);
    const year = gregorianDate.getFullYear();
    const month = gregorianDate.getMonth() + 1;
    const day = gregorianDate.getDate();
    
    // Chinese New Year typically falls between Jan 21 and Feb 20
    // We'll use a rough approximation: if before Feb 5, use previous year
    const lunarYear = (month === 1 || (month === 2 && day < 5)) ? year - 1 : year;
    
    // Simplified month and day calculation (very approximate)
    // Lunar months are roughly 29.5 days, starting ~1 month earlier than Gregorian
    let lunarMonth = ((month + 10) % 12) + 1;
    // Account for leap month possibility (very rough)
    if (Math.random() < 0.08) { // About 7/87 chance of leap month
        lunarMonth = ((month + 9) % 12) + 1;
    }
    
    // Approximate day - using same day but accounting for lunar month being ~29.5 days
    let lunarDay = day;
    if (lunarDay > 29) {
        lunarDay = 29;
    }
    
    return {
        year: lunarYear,
        month: lunarMonth,
        day: lunarDay
    };
}

// ==============================================
// Hindu Calendar Functions
// ==============================================

/**
 * Convert Gregorian date to Hindu calendar date
 * @param {Date} date - JavaScript Date object representing Gregorian date
 * @returns {Object} Hindu date with year, month, day, paksha
 */
function gregorianToHindu(date) {
  // Constants for Hindu calendar calculations
  const HINDU_EPOCH = 1749994; // Day count at Hindu epoch start (Jan 23, -3102 CE)
  
  // Calculate Julian day number from Gregorian date
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  let julianDay = Math.floor((1461 * (year + 4800 + (month - 14) / 12)) / 4) +
                  Math.floor((367 * (month - 2 - 12 * ((month - 14) / 12))) / 12) -
                  Math.floor((3 * Math.floor((year + 4900 + (month - 14) / 12) / 100)) / 4) +
                  day - 32075;
                  
  // Calculate Ahargana (elapsed days since Hindu epoch)
  const ahargana = julianDay - HINDU_EPOCH;
  
  // Calculation of lunar position
  const lunarPosition = calculateLunarPosition(ahargana);
  
  // Calculate lunar date components
  const hinduYear = Math.floor((lunarPosition.year + 1) / 1);
  const hinduMonth = Math.floor(lunarPosition.month);
  const hinduDay = Math.floor(lunarPosition.day);
  const paksha = lunarPosition.tithi < 15 ? 'Shukla' : 'Krishna';
  const tithi = lunarPosition.tithi % 15 === 0 ? 15 : lunarPosition.tithi % 15;
  
  return {
    year: hinduYear,
    month: hinduMonth,
    day: hinduDay,
    paksha: paksha,
    tithi: tithi,
    monthName: getHinduMonthName(hinduMonth),
    adhikaMasa: lunarPosition.adhikaMasa
  };
}

/**
 * Calculate lunar position for the given Ahargana
 * @param {number} ahargana - Days since Hindu epoch
 * @returns {Object} Lunar position details
 */
function calculateLunarPosition(ahargana) {
  // Mean solar longitude at epoch
  const MEAN_SUN_LONG_EPOCH = 333.0;
  // Mean lunar longitude at epoch
  const MEAN_LUNAR_LONG_EPOCH = 160.0;
  
  // Time conversion constants
  const SOLAR_YEAR = 365.2587565;  // Days in solar year
  const LUNAR_MONTH = 29.5305882;  // Days in lunar month
  
  // Calculate mean solar and lunar longitudes
  const meanSolarLong = (MEAN_SUN_LONG_EPOCH + ahargana * 360 / SOLAR_YEAR) % 360;
  const meanLunarLong = (MEAN_LUNAR_LONG_EPOCH + ahargana * 360 / LUNAR_MONTH) % 360;
  
  // Apply corrections for solar and lunar anomalies
  // This is a simplified model - actual Hindu calculations are more complex
  const solarLong = meanSolarLong + 2 * Math.sin(toRadians(meanSolarLong));
  const lunarLong = meanLunarLong + 5 * Math.sin(toRadians(meanLunarLong - meanSolarLong));
  
  // Calculate lunar phase (tithi)
  const lunarPhase = (lunarLong - solarLong + 360) % 360;
  const tithi = Math.floor(lunarPhase / 12) + 1;
  
  // Calculate year, month, and day
  const year = Math.floor(ahargana / SOLAR_YEAR) + 3102; // Hindu calendar epoch (BCE)
  const month = Math.floor((solarLong / 30) % 12) + 1;
  
  // Check for adhika masa (intercalary month)
  const lastNewMoon = Math.floor((lunarLong - solarLong) / 30);
  const nextNewMoon = Math.floor((lunarLong + 30 - solarLong) / 30);
  const adhikaMasa = lastNewMoon !== nextNewMoon;
  
  return {
    year: year,
    month: month,
    day: Math.floor(lunarPhase / (360 / 30)) + 1,
    tithi: tithi,
    adhikaMasa: adhikaMasa
  };
}

/**
 * Convert angle from degrees to radians
 * @param {number} degrees - Angle in degrees
 * @returns {number} Angle in radians
 */
function toRadians(degrees) {
  return degrees * Math.PI / 180;
}

/**
 * Get Hindu month name
 * @param {number} month - Month number (1-12)
 * @returns {string} Hindu month name
 */
function getHinduMonthName(month) {
  const monthNames = [
    "Chaitra", "Vaisakha", "Jyeshtha", "Ashadha", 
    "Shravana", "Bhadrapada", "Ashwina", "Kartika", 
    "Margashirsha", "Pausha", "Magha", "Phalguna"
  ];
  return monthNames[(month - 1) % 12];
}

/**
 * Check if the given Hindu date is on a festival
 * @param {Object} hinduDate - Hindu date object
 * @returns {Array} List of festivals on this date
 */
function getHinduFestivals(hinduDate) {
  const festivals = [];
  
  // Month-specific festivals
  switch (hinduDate.month) {
    case 1: // Chaitra
      if (hinduDate.paksha === 'Shukla' && hinduDate.tithi === 1) {
        festivals.push('Hindu New Year');
      }
      if (hinduDate.paksha === 'Shukla' && hinduDate.tithi === 9) {
        festivals.push('Ram Navami');
      }
      break;
      
    case 2: // Vaisakha
      if (hinduDate.paksha === 'Shukla' && hinduDate.tithi === 15) {
        festivals.push('Buddha Purnima');
      }
      break;
      
    case 6: // Bhadrapada
      if (hinduDate.paksha === 'Shukla' && hinduDate.tithi === 4) {
        festivals.push('Ganesh Chaturthi');
      }
      break;
      
    case 7: // Ashwina
      if (hinduDate.paksha === 'Shukla' && hinduDate.tithi === 10) {
        festivals.push('Dussehra');
      }
      break;
      
    case 8: // Kartika
      if (hinduDate.paksha === 'Krishna' && hinduDate.tithi === 15) {
        festivals.push('Diwali');
      }
      if (hinduDate.paksha === 'Shukla' && hinduDate.tithi === 1) {
        festivals.push('New Year (North India)');
      }
      break;
      
    case 10: // Pausha
      if (hinduDate.paksha === 'Shukla' && hinduDate.tithi === 15) {
        festivals.push('Sankranti');
      }
      break;
      
    case 11: // Magha
      if (hinduDate.paksha === 'Shukla' && hinduDate.tithi === 5) {
        festivals.push('Vasant Panchami');
      }
      break;
      
    case 12: // Phalguna
      if (hinduDate.paksha === 'Shukla' && hinduDate.tithi === 15) {
        festivals.push('Holi');
      }
      break;
  }
  
  // Common festivals across months
  if (hinduDate.paksha === 'Krishna' && hinduDate.tithi === 8) {
    festivals.push('Ashtami');
  }
  
  if (hinduDate.paksha === 'Shukla' && hinduDate.tithi === 11) {
    festivals.push('Ekadashi');
  }
  
  if (hinduDate.paksha === 'Krishna' && hinduDate.tithi === 11) {
    festivals.push('Ekadashi');
  }
  
  return festivals;
}

/**
 * Convert Hindu date to Gregorian date (approximate)
 * @param {number} year - Hindu calendar year
 * @param {number} month - Hindu calendar month (1-12)
 * @param {number} day - Hindu calendar day
 * @param {string} paksha - 'Shukla' or 'Krishna'
 * @returns {Date} JavaScript Date object with Gregorian date
 */
function hinduToGregorian(year, month, day, paksha) {
  // Approximate conversion - this is a simplified model
  // Accurate conversion requires astronomical calculations
  
  // Constants for Hindu calendar calculations
  const HINDU_EPOCH = new Date(-3102, 1, 23); // Hindu epoch start (Jan 23, -3102 CE)
  const SOLAR_YEAR = 365.2587565;  // Days in solar year
  
  // Calculate approximate days since Hindu epoch
  const yearsElapsed = year - 3102;
  const daysElapsed = Math.floor(yearsElapsed * SOLAR_YEAR);
  
  // Adjust for month and paksha
  const monthOffset = (month - 1) * 30;
  const pakshaOffset = paksha === 'Krishna' ? 15 : 0;
  
  // Final calculation (very approximate)
  const totalDaysElapsed = daysElapsed + monthOffset + pakshaOffset + day - 1;
  
  const resultDate = new Date(HINDU_EPOCH);
  resultDate.setDate(HINDU_EPOCH.getDate() + totalDaysElapsed);
  
  return resultDate;
}

/**
 * Determine if a Hindu year is a leap year
 * @param {number} year - Hindu year
 * @returns {boolean} True if leap year
 */
function isHinduLeapYear(year) {
  // Hindu leap year calculation (simplified)
  return ((year * 5) + 56) % 65 === 0;
}

/**
 * Get the current date according to the Hindu calendar
 * @returns {Object} Current Hindu date
 */
function getCurrentHinduDate() {
  return gregorianToHindu(new Date());
}

/**
 * Format a Hindu date as a string
 * @param {Object} hinduDate - Hindu date object
 * @returns {string} Formatted date string
 */
function formatHinduDate(hinduDate) {
  const suffix = getDaySuffix(hinduDate.day);
  const adhikaMasaText = hinduDate.adhikaMasa ? " (Adhika)" : "";
  
  return `${hinduDate.day}${suffix} ${hinduDate.monthName}${adhikaMasaText} ${hinduDate.year}, ${hinduDate.paksha} Paksha, Tithi ${hinduDate.tithi}`;
}

/**
 * Get appropriate suffix for a day number
 * @param {number} day - Day number
 * @returns {string} Suffix ('st', 'nd', 'rd', or 'th')
 */
function getDaySuffix(day) {
  if (day >= 11 && day <= 13) {
    return 'th';
  }
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}