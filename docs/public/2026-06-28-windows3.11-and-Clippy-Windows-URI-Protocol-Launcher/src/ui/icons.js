// Retro 16-color, hard-edge inline SVG icons. No emoji, no external fonts.
(function () {
  function svg(body) {
    return '<svg viewBox="0 0 32 32" width="32" height="32" shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg">' + body + '</svg>';
  }
  function frame(fill) { return '<rect x="3" y="2" width="26" height="28" fill="' + (fill || '#fff') + '" stroke="#000"/>'; }
  var I = {
    apps: frame('#c0c0c0') + '<rect x="6" y="5" width="8" height="8" fill="#ff0000"/><rect x="18" y="5" width="8" height="8" fill="#00a000"/><rect x="6" y="17" width="8" height="8" fill="#0000c0"/><rect x="18" y="17" width="8" height="8" fill="#c0a000"/>',
    gear: frame('#c0c0c0') + '<rect x="13" y="4" width="6" height="24" fill="#404040"/><rect x="4" y="13" width="24" height="6" fill="#404040"/><circle cx="16" cy="16" r="6" fill="#808080" stroke="#000"/><circle cx="16" cy="16" r="2" fill="#fff"/>',
    scissors: frame('#fff') + '<rect x="6" y="6" width="20" height="2" fill="#000" stroke-dasharray="2"/><circle cx="9" cy="22" r="3" fill="#c0c0c0" stroke="#000"/><circle cx="20" cy="22" r="3" fill="#c0c0c0" stroke="#000"/><path d="M11 21 L26 9 M18 21 L26 13" stroke="#000" fill="none"/>',
    store: frame('#fff') + '<path d="M7 12 L9 6 H23 L25 12 Z" fill="#c0a000" stroke="#000"/><rect x="8" y="12" width="16" height="13" fill="#e0c040" stroke="#000"/><rect x="13" y="16" width="6" height="9" fill="#804000"/>',
    shield: frame('#fff') + '<path d="M16 4 L26 8 V16 C26 22 21 26 16 28 C11 26 6 22 6 16 V8 Z" fill="#0040c0" stroke="#000"/><path d="M11 16 l4 4 7-9" stroke="#fff" stroke-width="2" fill="none"/>',
    network: frame('#fff') + '<rect x="5" y="6" width="9" height="7" fill="#008080" stroke="#000"/><rect x="18" y="19" width="9" height="7" fill="#008080" stroke="#000"/><path d="M9 13 V22 H22" stroke="#000" fill="none"/>',
    access: frame('#fff') + '<circle cx="16" cy="8" r="3" fill="#0000c0"/><path d="M8 13 H24 M16 13 V22 M16 22 L11 28 M16 22 L21 28" stroke="#0000c0" stroke-width="2" fill="none"/>',
    lock: frame('#fff') + '<rect x="9" y="14" width="14" height="12" fill="#c0a000" stroke="#000"/><path d="M11 14 V10 a5 5 0 0 1 10 0 V14" stroke="#000" fill="none" stroke-width="2"/><rect x="15" y="18" width="2" height="4" fill="#000"/>',
    paint2: frame('#fff') + '<rect x="6" y="6" width="20" height="14" rx="6" fill="#ffc0c0" stroke="#000"/><circle cx="11" cy="11" r="1.5" fill="#f00"/><circle cx="16" cy="9" r="1.5" fill="#00f"/><circle cx="21" cy="11" r="1.5" fill="#0a0"/><rect x="14" y="20" width="4" height="8" fill="#804000"/>',
    game: frame('#fff') + '<rect x="5" y="11" width="22" height="11" rx="5" fill="#107010" stroke="#000"/><rect x="9" y="15" width="2" height="4" fill="#fff"/><rect x="7" y="17" width="6" height="2" fill="#fff"/><circle cx="21" cy="15" r="1.5" fill="#fff"/><circle cx="24" cy="18" r="1.5" fill="#fff"/>',
    legacy: '<rect x="6" y="3" width="18" height="26" fill="#e0d8a0" stroke="#000"/><path d="M19 3 L24 8 H19 Z" fill="#a09060"/><path d="M16 12 L22 24 H10 Z" fill="#c0a000" stroke="#000"/><rect x="15" y="16" width="2" height="4" fill="#000"/><rect x="15" y="21" width="2" height="2" fill="#000"/>',
    index: frame('#fff') + '<rect x="6" y="6" width="20" height="5" fill="#0080c0" stroke="#000"/><rect x="6" y="13" width="20" height="5" fill="#c0c0c0" stroke="#000"/><rect x="6" y="20" width="20" height="5" fill="#c0c0c0" stroke="#000"/>',
    help: frame('#fff') + '<text x="16" y="24" font-size="22" text-anchor="middle" fill="#0000c0" font-family="serif">?</text>',
    paint: frame('#fff') + '<path d="M22 6 l4 4 -12 12 -4-4z" fill="#ffd000" stroke="#000"/><rect x="6" y="22" width="6" height="4" fill="#804000"/>',
    calc: frame('#c0c0c0') + '<rect x="8" y="6" width="16" height="5" fill="#90c090"/><rect x="9" y="14" width="3" height="3" fill="#000"/><rect x="14" y="14" width="3" height="3" fill="#000"/><rect x="19" y="14" width="3" height="3" fill="#000"/><rect x="9" y="20" width="3" height="3" fill="#000"/><rect x="14" y="20" width="3" height="3" fill="#000"/><rect x="19" y="20" width="3" height="3" fill="#000"/>',
    clock: frame('#fff') + '<circle cx="16" cy="16" r="10" fill="#fff" stroke="#000"/><path d="M16 16 V9 M16 16 l5 3" stroke="#000"/>',
    camera: frame('#fff') + '<rect x="6" y="11" width="20" height="13" fill="#404040" stroke="#000"/><rect x="11" y="8" width="6" height="3" fill="#404040"/><circle cx="16" cy="18" r="4" fill="#80c0ff" stroke="#fff"/>',
    photos: frame('#fff') + '<rect x="6" y="8" width="20" height="16" fill="#80c0ff" stroke="#000"/><path d="M6 22 l6-7 5 5 4-3 5 5z" fill="#208020"/><circle cx="11" cy="13" r="2" fill="#ff0"/>',
    edge: frame('#fff') + '<circle cx="16" cy="16" r="11" fill="#0080c0" stroke="#000"/><path d="M6 16 H26 M16 5 V27" stroke="#fff" fill="none"/>',
    weather: frame('#fff') + '<circle cx="13" cy="13" r="5" fill="#ff0"/><ellipse cx="19" cy="20" rx="8" ry="5" fill="#fff" stroke="#000"/>',
    mail: frame('#fff') + '<rect x="6" y="9" width="20" height="14" fill="#fff" stroke="#000"/><path d="M6 9 l10 8 10-8" stroke="#000" fill="none"/>',
    phone: frame('#fff') + '<rect x="11" y="5" width="10" height="22" rx="2" fill="#404040" stroke="#000"/><rect x="13" y="8" width="6" height="13" fill="#80c0ff"/>',
    media: frame('#000') + '<path d="M12 9 L24 16 L12 23 Z" fill="#ff0"/>',
    app: frame('#c0c0c0') + '<rect x="9" y="9" width="14" height="14" fill="#0000c0"/>'
  };
  window.ICONS = {};
  Object.keys(I).forEach(function (k) { window.ICONS[k] = svg(I[k]); });
  window.getIcon = function (key) { return window.ICONS[key] || window.ICONS.app; };
})();
