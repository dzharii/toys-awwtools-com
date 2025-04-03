window.kitchenUtils = {
  generateUniqueId: function() {
    const timestamp = new Date().getTime().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `tile-${timestamp}-${randomStr}`;
  },

  fuzzySearch: function(items, searchTerm, keys = ['title', 'description', 'category']) {
    searchTerm = searchTerm.toLowerCase();
    return items.filter(item => keys.some(key => item[key]?.toLowerCase().includes(searchTerm)));
  },

  highlightMatch: function(text, searchTerm) {
    if (!searchTerm || !text) return text;
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
  },

  parseTimeToSeconds: function(timeStr) {
    const parts = timeStr.split(':').map(Number);
    const [h = 0, m = 0, s = 0] = [...Array(3)].map((_, i) => parts[parts.length - 3 + i] || 0);
    return h * 3600 + m * 60 + s;
  },

  formatSecondsToTime: function(totalSeconds) {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
};
