// utils.js - Utility functions for the kitchen timer app

/**
 * Generates a unique ID for new tiles
 * Custom implementation to avoid reliance on browser methods
 * @returns {string} A unique ID string
 */
function generateUniqueId() {
  var timestamp = new Date().getTime().toString(36);
  var randomStr = Math.random().toString(36).substring(2, 8);
  return "tile-" + timestamp + "-" + randomStr;
}

/**
 * Performs fuzzy search on a collection of items
 * @param {Array} items - The array of objects to search within
 * @param {string} searchTerm - The term to search for
 * @param {Array} keys - The object properties to search in
 * @returns {Array} Filtered array of items that match the search term
 */
function fuzzySearch(items, searchTerm, keys) {
  keys = keys || ['title', 'description', 'category'];
  searchTerm = searchTerm.toLowerCase();
  
  return items.filter(function(item) {
    return keys.some(function(key) {
      if (!item[key]) return false;
      var value = item[key].toLowerCase();
      return value.includes(searchTerm);
    });
  });
}

/**
 * Highlights matching text segments for search results
 * @param {string} text - The text to highlight matches in
 * @param {string} searchTerm - The term to highlight
 * @returns {string} HTML with highlighted matches
 */
function highlightMatch(text, searchTerm) {
  if (!searchTerm || !text) return text;
  
  var regex = new RegExp("(" + searchTerm + ")", "gi");
  return text.replace(regex, '<span class="highlight">$1</span>');
}

/**
 * Parses a time string into total seconds
 * @param {string} timeStr - Time string in format HH:MM:SS
 * @returns {number} Total seconds
 */
function parseTimeToSeconds(timeStr) {
  var parts = timeStr.split(':').map(Number);
  var hours = 0, minutes = 0, seconds = 0;
  
  if (parts.length === 3) {
    hours = parts[0];
    minutes = parts[1];
    seconds = parts[2];
  } else if (parts.length === 2) {
    minutes = parts[0];
    seconds = parts[1];
  } else if (parts.length === 1) {
    seconds = parts[0];
  }
  
  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Formats seconds into HH:MM:SS string
 * @param {number} totalSeconds - Total seconds to format
 * @returns {string} Formatted time string
 */
function formatSecondsToTime(totalSeconds) {
  var hours = Math.floor(totalSeconds / 3600);
  var minutes = Math.floor((totalSeconds % 3600) / 60);
  var seconds = totalSeconds % 60;
  
  return padZero(hours) + ":" + padZero(minutes) + ":" + padZero(seconds);
}

/**
 * Pads a number with leading zero if needed
 * @param {number} num - Number to pad
 * @returns {string} Padded number string
 */
function padZero(num) {
  return num.toString().padStart(2, '0');
}