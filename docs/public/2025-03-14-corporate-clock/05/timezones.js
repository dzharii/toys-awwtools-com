
const timeZones = [
    { timezone: "UTC", name: "UTC" },
    { timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, name: "Local" },
    { timezone: "America/New_York", name: "New York" },
    { timezone: "Europe/London", name: "London" }
];

