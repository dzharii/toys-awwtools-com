# 2026-04-12-Twitch-clone-for-testing

A high-density, Twitch-like settings single-page app for local browser automation and UI interaction testing.

## Highlights

- Full shell with sticky top bar, persistent left rail, and seven settings tabs.
- Hash-based routing with deep links and back/forward support.
- Versioned localStorage persistence for controls, expanded state, scroll positions, route, and generated seed.
- Stable/dynamic startup modes with seeded synthetic data:
  - `?mode=stable&seed=12345`
  - `?mode=dynamic`
- Screenshot-backed pages implemented with realistic control density:
  - Profile
  - Security and Privacy
  - Notifications
  - Connections
  - Content Preferences
- Inferred but fully implemented pages:
  - Prime Perks
  - Channel and Videos
- Local-only modals/wizards for email, phone verification, 2FA, OAuth, and sign-out confirmation.
- Toast feedback and cross-surface coupling:
  - Content label preferences affect left-rail categories and recommendations.
  - Recommendation feedback populates feedback sections.

## Notes

- No framework or build step.
- Runs directly from static files.
- Designed for selector testing with stable `data-testid` and `data-setting-key` hooks.
