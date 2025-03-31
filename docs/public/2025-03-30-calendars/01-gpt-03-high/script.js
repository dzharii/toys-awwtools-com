'use strict';

// Utility: format number to two digits
function pad(num) {
  return num < 10 ? '0' + num : num;
}

// Gregorian Conversion (using built-in Date)
function getGregorian(date) {
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const day = date.getDate();
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  const time = pad(date.getHours()) + ':' + pad(date.getMinutes()) + ':' + pad(date.getSeconds());
  return { display: day + ' ' + month + ' ' + year + ' - ' + time };
}

// Julian Conversion: Subtract 13 days from the Gregorian date (approximation)
function getJulian(date) {
  const julianDate = new Date(date.getTime() - (13 * 24 * 60 * 60 * 1000));
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const day = julianDate.getDate();
  const month = monthNames[julianDate.getMonth()];
  const year = julianDate.getFullYear();
  const time = pad(julianDate.getHours()) + ':' + pad(julianDate.getMinutes()) + ':' + pad(julianDate.getSeconds());
  return { display: day + ' ' + month + ' ' + year + ' - ' + time };
}

// Islamic (Hijri) Conversion using an approximation algorithm
function hijriToJD(year, month, day) {
  return day +
         Math.ceil(29.5 * (month - 1)) +
         (year - 1) * 354 +
         Math.floor((3 + (11 * year)) / 30) +
         1948440 - 385;
}

function getIslamic(date) {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  
  // Convert Gregorian to Julian Day Number (JDN)
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  const jd = day + Math.floor((153 * m + 2) / 5) + 
             365 * y + Math.floor(y / 4) - Math.floor(y / 100) + 
             Math.floor(y / 400) - 32045;
  
  const islamicEpoch = 1948439.5;
  const days = jd - islamicEpoch;
  const islamicYear = Math.floor((30 * days + 10646) / 10631);
  
  // Find the first day of the Islamic year
  const jd1 = hijriToJD(islamicYear, 1, 1);
  let islamicMonth = Math.ceil((jd - jd1) / 29.5) + 1;
  if (islamicMonth > 12) islamicMonth = 12;
  const jdMonthStart = hijriToJD(islamicYear, islamicMonth, 1);
  const islamicDay = jd - jdMonthStart + 1;
  
  // Month names in Arabic (with romanization)
  const monthNames = [
    { native: "محرم", roman: "Muharram" },
    { native: "صفر", roman: "Safar" },
    { native: "ربيع الأول", roman: "Rabi' al-awwal" },
    { native: "ربيع الثاني", roman: "Rabi' al-thani" },
    { native: "جمادى الأولى", roman: "Jumada al-awwal" },
    { native: "جمادى الآخرة", roman: "Jumada al-thani" },
    { native: "رجب", roman: "Rajab" },
    { native: "شعبان", roman: "Sha'ban" },
    { native: "رمضان", roman: "Ramadan" },
    { native: "شوال", roman: "Shawwal" },
    { native: "ذو القعدة", roman: "Dhu al-Qi'dah" },
    { native: "ذو الحجة", roman: "Dhu al-Hijjah" }
  ];
  
  const mObj = monthNames[islamicMonth - 1];
  const time = pad(date.getHours()) + ':' + pad(date.getMinutes()) + ':' + pad(date.getSeconds());
  return { display: Math.floor(islamicDay) + ' ' + mObj.native + ' (' + mObj.roman + ') ' + islamicYear + ' - ' + time };
}

// Hebrew Conversion: Rough approximation (Note: This is not an exact conversion)
function getHebrew(date) {
  const gregYear = date.getFullYear();
  const month = date.getMonth();
  // Approximate Hebrew year calculation
  const hebYear = month < 8 ? gregYear + 3760 : gregYear + 3761;
  // Approximate mapping for month names
  const hebMonthNames = ["Tishrei", "Cheshvan", "Kislev", "Tevet", "Shevat", "Adar", "Nisan", "Iyar", "Sivan", "Tammuz", "Av", "Elul"];
  const hebMonth = hebMonthNames[month % 12];
  const day = date.getDate();
  const time = pad(date.getHours()) + ':' + pad(date.getMinutes()) + ':' + pad(date.getSeconds());
  return { display: day + ' ' + hebMonth + ' ' + hebYear + ' - ' + time };
}

// Chinese Calendar: Rough approximation (using traditional month names and romanization)
function getChinese(date) {
  // This approximation uses the Gregorian date as a placeholder for the lunar date.
  const lunarYear = date.getFullYear() - 1; // Arbitrary offset for demonstration
  const lunarMonth = date.getMonth() + 1;
  const lunarDay = date.getDate();
  const monthNames = ["正月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "冬月", "腊月"];
  const lunarMonthName = monthNames[(lunarMonth - 1) % 12];
  const time = pad(date.getHours()) + ':' + pad(date.getMinutes()) + ':' + pad(date.getSeconds());
  return { display: lunarDay + ' ' + lunarMonthName + ' (' + "M" + lunarMonth + ') ' + lunarYear + ' - ' + time };
}

// Hindu Calendar (Vikram Samvat Approximation)
function getHindu(date) {
  // Vikram Samvat is roughly 57 years ahead of the Gregorian calendar.
  const vsYear = date.getFullYear() + 57;
  const day = date.getDate();
  // Approximate lunar month names
  const monthNames = ["Chaitra", "Vaishakha", "Jyeshtha", "Ashadha", "Shravana", "Bhadrapada", "Ashwin", "Kartik", "Margashirsha", "Pausha", "Magha", "Phalguna"];
  const hinduMonth = monthNames[date.getMonth() % 12];
  const time = pad(date.getHours()) + ':' + pad(date.getMinutes()) + ':' + pad(date.getSeconds());
  return { display: day + ' ' + hinduMonth + ' ' + vsYear + ' - ' + time };
}

// Persian (Solar Hijri) Calendar: Rough approximation
function getPersian(date) {
  // Simplified approximation.
  const persianYear = date.getFullYear() - 621;
  const day = date.getDate();
  const persianMonth = date.getMonth() + 1;
  const time = pad(date.getHours()) + ':' + pad(date.getMinutes()) + ':' + pad(date.getSeconds());
  return { display: day + '/' + persianMonth + '/' + persianYear + ' - ' + time };
}

// Buddhist Calendar: Add 543 years to the Gregorian year.
function getBuddhist(date) {
  const budYear = date.getFullYear() + 543;
  const day = date.getDate();
  const budMonth = date.getMonth() + 1;
  const time = pad(date.getHours()) + ':' + pad(date.getMinutes()) + ':' + pad(date.getSeconds());
  return { display: day + '/' + budMonth + '/' + budYear + ' - ' + time };
}

// Coptic Calendar: Rough approximation
function getCoptic(date) {
  // Approximate conversion by subtracting 283 years
  const copticYear = date.getFullYear() - 283;
  const day = date.getDate();
  const copticMonth = date.getMonth() + 1;
  const time = pad(date.getHours()) + ':' + pad(date.getMinutes()) + ':' + pad(date.getSeconds());
  return { display: day + '/' + copticMonth + '/' + copticYear + ' - ' + time };
}

// Ethiopian Calendar: Rough approximation
function getEthiopian(date) {
  // Ethiopian calendar is roughly 7-8 years behind Gregorian.
  const ethiopianYear = date.getFullYear() - 8;
  const day = date.getDate();
  const ethiopianMonth = date.getMonth() + 1;
  const time = pad(date.getHours()) + ':' + pad(date.getMinutes()) + ':' + pad(date.getSeconds());
  return { display: day + '/' + ethiopianMonth + '/' + ethiopianYear + ' - ' + time };
}

// Bahá'í Calendar: Rough approximation
function getBahai(date) {
  // Bahá'í calendar starts in 1844 AD.
  const bahaiYear = date.getFullYear() - 1844;
  const day = date.getDate();
  // Approximate month calculation: cycle through 19 months
  const bahaiMonth = (date.getMonth() % 19) + 1;
  const time = pad(date.getHours()) + ':' + pad(date.getMinutes()) + ':' + pad(date.getSeconds());
  return { display: day + '/' + bahaiMonth + '/' + bahaiYear + ' - ' + time };
}

// Japanese Calendar (Era System): Currently using Reiwa era.
function getJapanese(date) {
  const eraName = "Reiwa";
  const eraYear = date.getFullYear() - 2018; // Reiwa started in 2019
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const time = pad(date.getHours()) + ':' + pad(date.getMinutes()) + ':' + pad(date.getSeconds());
  return { display: eraName + ' ' + eraYear + ', ' + day + '/' + month + ' - ' + time };
}

// Indian National Calendar (Saka): Rough approximation
function getSaka(date) {
  // Simplified conversion: Saka year is roughly Gregorian year - 78.
  const sakaYear = date.getFullYear() - 78;
  const day = date.getDate();
  // Approximate month names for Saka calendar
  const sakaMonthNames = ["Chaitra", "Vaisakha", "Jyaistha", "Asadha", "Sravana", "Bhadra", "Asvina", "Kartika", "Agrahayana", "Pausha", "Magha", "Phalguna"];
  const sakaMonth = sakaMonthNames[date.getMonth() % 12];
  const time = pad(date.getHours()) + ':' + pad(date.getMinutes()) + ':' + pad(date.getSeconds());
  return { display: day + ' ' + sakaMonth + ' ' + sakaYear + ' - ' + time };
}

// Update all calendar modules every second.
function updateCalendars() {
  const now = new Date();
  
  document.querySelector("#gregorian .date-time").textContent = getGregorian(now).display;
  document.querySelector("#julian .date-time").textContent = getJulian(now).display;
  document.querySelector("#islamic .date-time").textContent = getIslamic(now).display;
  document.querySelector("#hebrew .date-time").textContent = getHebrew(now).display;
  document.querySelector("#chinese .date-time").textContent = getChinese(now).display;
  document.querySelector("#hindu .date-time").textContent = getHindu(now).display;
  document.querySelector("#persian .date-time").textContent = getPersian(now).display;
  document.querySelector("#buddhist .date-time").textContent = getBuddhist(now).display;
  document.querySelector("#coptic .date-time").textContent = getCoptic(now).display;
  document.querySelector("#ethiopian .date-time").textContent = getEthiopian(now).display;
  document.querySelector("#bahai .date-time").textContent = getBahai(now).display;
  document.querySelector("#japanese .date-time").textContent = getJapanese(now).display;
  document.querySelector("#saka .date-time").textContent = getSaka(now).display;
}

// Initialize and update calendars every second
updateCalendars();
setInterval(updateCalendars, 1000);

