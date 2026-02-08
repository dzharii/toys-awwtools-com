Reference data bundle for the date expression language project.

Contents
- iana_zones_subset.sample.txt: small IANA tzid list used by fixtures.
- place_resolver_min.sample.json: sample place->tzid mapping for demo resolver.
- business_calendar.sample.json: sample business calendar config with holidays.
- holidays_us_2026_nager.sample.json: sample public holidays data (US, 2026).
- expression_fixtures.sample.json: end-to-end parse/eval fixtures for deterministic tests.
- dst_fixtures_la_2026.sample.json: DST boundary fixtures for calendar-vs-time addition.

Sources and licensing notes (verify for your distribution needs)
- IANA Time Zone Database (tzdb): https://www.iana.org/time-zones and ftp releases. Use to validate tzid lists and rules.
- Timezone boundary polygons (for lat/lon->tzid): timezone-boundary-builder releases: https://github.com/evansiroky/timezone-boundary-builder (ODbL data; MIT code).
- Place names / cities reference: GeoNames dumps: https://download.geonames.org/export/dump/ (GeoNames licensing/attribution requirements apply).
- Holiday data sample in this bundle: fetched from Nager.Date API endpoint https://date.nager.at/api/v3/PublicHolidays/2026/US (see https://date.nager.at/API for documentation).

This bundle is intentionally small and is meant for tests and demo behavior, not for production-grade geocoding or comprehensive holiday coverage.
