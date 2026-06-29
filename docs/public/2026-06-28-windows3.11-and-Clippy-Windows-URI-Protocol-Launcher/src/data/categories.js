// Desktop group definitions and Settings subgroups
window.GROUPS = [
  { id: 'apps', title: 'Windows Apps', icon: 'apps', view: 'icons', blurb: 'Familiar app launchers and app-level URI schemes.' },
  { id: 'settings', title: 'Settings Groups', icon: 'gear', view: 'subgroups', blurb: 'Entry point into ms-settings: areas, grouped by task.' },
  { id: 'capture', title: 'Capture and Screenshots', icon: 'scissors', view: 'icons', blurb: 'Snipping Tool, Screen Sketch, Camera, Photos, capture privacy.' },
  { id: 'store', title: 'Microsoft Store Links', icon: 'store', view: 'icons', blurb: 'Store home, search, products, library, updates, App Installer.' },
  { id: 'system', title: 'System and Security', icon: 'shield', view: 'details', blurb: 'Update, Defender, recovery, security, backup, enrollment.' },
  { id: 'network', title: 'Network and Devices', icon: 'network', view: 'icons', blurb: 'Wi-Fi, Bluetooth, printers, projection, USB, mobile, input.' },
  { id: 'accessibility', title: 'Accessibility', icon: 'access', view: 'icons', blurb: 'Narrator, magnifier, captions, pointer, keyboard, hearing.' },
  { id: 'privacy', title: 'Privacy and Permissions', icon: 'lock', view: 'details', blurb: 'Camera, microphone, location, libraries, diagnostics.' },
  { id: 'personalization', title: 'Personalization', icon: 'paint2', view: 'icons', blurb: 'Background, colors, taskbar, Start, themes, fonts, lighting.' },
  { id: 'gaming', title: 'Gaming and Xbox', icon: 'game', view: 'icons', blurb: 'Game Bar, Xbox, captures, overlays, gaming settings.' },
  { id: 'legacy', title: 'Legacy and Optional', icon: 'legacy', view: 'details', blurb: 'Deprecated, removed, hardware-gated, install-dependent links.' },
  { id: 'all', title: 'All URI Links', icon: 'index', view: 'details', blurb: 'Complete searchable reference.' },
  { id: 'help', title: 'Help Topics', icon: 'help', view: 'help', blurb: 'Guidance, protocol explanation, prompts, troubleshooting.' }
];

window.SETTINGS_AREAS = [
  'Accounts', 'Apps', 'Devices', 'Accessibility', 'Network', 'Personalization',
  'Privacy', 'System', 'Time and Language', 'Update and Security'
];

window.CLIPPY_FIRST = {
  apps: 'Windows Apps contains familiar app-level protocol links such as Paint, Calculator, Camera, Photos, Store, and Security.',
  settings: 'Settings links are grouped by task area. Use Search if you know the setting name.',
  capture: 'Capture links can open Snipping Tool, Camera, Photos, and related capture settings.',
  store: 'Store links include concrete pages and templates. Templates need values such as a product ID or search query.',
  system: 'System and Security links open real Windows management surfaces. This launcher requests navigation; changes happen only inside Windows.',
  network: 'This group is useful for Bluetooth, Wi-Fi, printers, projection, USB, and mobile-device shortcuts.',
  accessibility: 'Accessibility links open focused Settings pages for display, audio, keyboard, pointer, captions, Narrator, and related tools.',
  privacy: 'Privacy links open permission pages. They do not change permissions until you make changes in Windows Settings.',
  personalization: 'Personalization contains visual and input customization links such as Background, Colors, Themes, Fonts, Start, and Taskbar.',
  gaming: 'Gaming links depend on Game Bar, Xbox components, and Windows gaming settings. Some may be missing on lean installations.',
  legacy: 'Legacy and Optional contains links that may be removed, deprecated, hardware-dependent, or app-installation-dependent.',
  all: 'All Links is the full reference view. Use Search or status filters when the list is too dense.'
};
