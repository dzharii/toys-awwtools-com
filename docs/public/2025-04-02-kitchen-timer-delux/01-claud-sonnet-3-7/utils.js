// utils.js - Utility functions for the kitchen timer app

/**
 * Generates a unique ID for new tiles
 * Custom implementation to avoid reliance on browser methods
 * @returns {string} A unique ID string
 */
export function generateUniqueId() {
  const timestamp = new Date().getTime().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `tile-${timestamp}-${randomStr}`;
}

/**
 * Performs fuzzy search on a collection of items
 * @param {Array} items - The array of objects to search within
 * @param {string} searchTerm - The term to search for
 * @param {Array} keys - The object properties to search in
 * @returns {Array} Filtered array of items that match the search term
 */
export function fuzzySearch(items, searchTerm, keys = ['title', 'description', 'category']) {
  searchTerm = searchTerm.toLowerCase();
  
  return items.filter(item => {
    return keys.some(key => {
      if (!item[key]) return false;
      const value = item[key].toLowerCase();
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
export function highlightMatch(text, searchTerm) {
  if (!searchTerm || !text) return text;
  
  const regex = new RegExp(`(${searchTerm})`, 'gi');
  return text.replace(regex, '<span class="highlight">$1</span>');
}

/**
 * Parses a time string into total seconds
 * @param {string} timeStr - Time string in format HH:MM:SS
 * @returns {number} Total seconds
 */
export function parseTimeToSeconds(timeStr) {
  const parts = timeStr.split(':').map(Number);
  let hours = 0, minutes = 0, seconds = 0;
  
  if (parts.length === 3) {
    [hours, minutes, seconds] = parts;
  } else if (parts.length === 2) {
    [minutes, seconds] = parts;
  } else if (parts.length === 1) {
    [seconds] = parts;
  }
  
  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Formats seconds into HH:MM:SS string
 * @param {number} totalSeconds - Total seconds to format
 * @returns {string} Formatted time string
 */
export function formatSecondsToTime(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}