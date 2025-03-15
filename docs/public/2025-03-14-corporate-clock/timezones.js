// Time Zones Configuration for the Dashboard
// Default time zones: UTC and the user's local time zone (auto-detected)
// Users can add additional time zones by adding objects with 'label' and 'timeZone' properties.
const timezones = [
  {
    label: "UTC",
    timeZone: "UTC"
  },
  {
    label: "Local",
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
  }
];


