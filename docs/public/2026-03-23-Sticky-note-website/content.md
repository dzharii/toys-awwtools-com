# Seattle personal ops portal link inventory

A00
## Critical safety and real time awareness

A01
Real time incidents and dispatch style monitoring

A01-01 entity["organization","Seattle Fire Department Real-Time 911","dispatch log, seattle wa"] - Public, minimal table of fire/EMS 911 incidents (filterable by date) with incident type, units, location, and timestamps. citeturn1view0turn0view1

A01-02 entity["organization","Seattle Fire Department","fire agency, seattle wa"] - Main hub for fire department services, including a direct entry point to the Real-Time 911 page and official contact info. citeturn9search2turn9search6

A01-03 entity["organization","SFD Live","third-party 911 map, seattle"] - Community-built live map view of Seattle fire/EMS 911 incidents, presented with an incident map and additional situational context. citeturn9search18turn35search22

A01-04 entity["organization","Seattle Police Department","police agency, seattle wa"] - Official hub for police help flows and core public guidance (when to call 911, reporting options, precinct navigation). citeturn9search21turn9search9

A01-05 entity["organization","Seattle Police Web Incident Reporting","online police reports, seattle"] - Official web entry point for filing eligible non-emergency reports online. citeturn9search19turn9search3

A01-06 entity["organization","Seattle Police Calls for Service Map","24h calls map, seattle"] - Map view designed to show police responses to 911 calls within the last 24 hours (CAD-derived, with safety/privacy constraints). citeturn35search8turn35search21

A01-07 entity["organization","Seattle Police Crime Data Map","7-day offenses map, seattle"] - Map of finalized crime reports over the past 7 days, updated daily with classification notes and revision caveats. citeturn5search6turn5search10

A01-08 entity["organization","Seattle Police Crime Dashboard","crime dashboard, seattle"] - Dashboard interface for police crime data using NIBRS terminology, for trend and category exploration. citeturn35search2turn5search2

A01-09 entity["organization","King County Sheriff's Office Online Reporting","kcs online reports, king county"] - Online reporting option for incidents in sheriff-served jurisdictions (useful when you are outside city limits). citeturn9search7

A01-10 entity["organization","King County Sheriff's Office Crime Stats & Data","crime dashboards, king county"] - County sheriff dashboards and data pages for crime in sheriff jurisdictions/contract cities, refreshed daily per the agency. citeturn5search14

```text
A01-01 https://web.seattle.gov/sfd/realtime911/getRecsForDatePub.asp?action=Today&incDate=&rad1=des
A01-02 https://www.seattle.gov/fire
A01-03 https://sfdlive.com/
A01-04 https://www.seattle.gov/police
A01-05 https://spdonlinereporting.seattle.gov/
A01-06 https://experience.arcgis.com/experience/6ee2574e047d4cdb9cb5ad287b76d091
A01-07 https://www.seattle.gov/police/information-and-data/data/online-crime-maps
A01-08 https://www.seattle.gov/police/information-and-data/data/crime-dashboard
A01-09 https://kingcounty.gov/en/dept/sheriff/courts-jails-legal-system/sheriff-services/online-reporting
A01-10 https://kingcounty.gov/en/dept/sheriff/about-king-county/about-sheriff-office/news-data-reports/crime-stats-data
```

A02
Emergency alerts and official notifications

A02-01 entity["organization","AlertSeattle","emergency alerts, seattle wa"] - Official emergency alert system for the city, supporting text/email/phone alerts for emergencies and major disruptions. citeturn2search4turn7search18

A02-02 entity["organization","AlertSeattle FAQ","alerts faq, seattle wa"] - Operational details for AlertSeattle (what messages look like, opt-in expectations, and common troubleshooting). citeturn2search19

A02-03 entity["organization","AlertSeattle on X","alerts social feed, seattle"] - Public social feed used as an additional broadcast channel for city alerts and updates. citeturn2search7

A02-04 entity["organization","AlertSeattle - Emergency Management explainer","alert categories, seattle wa"] - Explains what the alert system is used for (safety, health, transportation disruption, utility disruptions). citeturn7search18

A02-05 entity["organization","ALERT King County","emergency notifications, king county"] - County-level emergency notification signup supporting text/email/phone style delivery. citeturn3search0

A02-06 entity["organization","King County Emergency News","emergency updates, king county"] - County emergency updates site used for incident and disruption communications. citeturn3search8

A02-07 entity["organization","Washington Military Department Alerts","state alerts hub, wa"] - State hub that aggregates WA government alerting and hazard information, including hazard program pages. citeturn3search18

A02-08 entity["organization","Seattle Customer Service Bureau contact hub","311 and city contacts, seattle"] - Centralized contact page that bundles 911, 311, and key utility emergency numbers and pathways. citeturn9search4

A02-09 entity["organization","Seattle Elected Officials directory","city officials hub, seattle"] - City directory page that centralizes elected-official navigation and related contact entry points. citeturn13search11

A02-10 entity["organization","Washington Utilities and Transportation Commission 911 guide","special service numbers, wa"] - State reference explainer for service numbers like 211 and how 311 is governed locally in WA. citeturn9search20

```text
A02-01 https://alert.seattle.gov/
A02-02 https://alert.seattle.gov/faq/
A02-03 https://x.com/AlertSeattle
A02-04 https://www.seattle.gov/emergency-management/prepare/alert-seattle
A02-05 https://kingcounty.gov/en/dept/executive-services/health-safety/safety-injury-prevention/preparedness/alert-king-county
A02-06 https://kcemergency.com/
A02-07 https://mil.wa.gov/alerts
A02-08 https://www.seattle.gov/customer-service-bureau/contact-us
A02-09 https://www.seattle.gov/elected-officials
A02-10 https://www.utc.wa.gov/regulated-industries/utilities/telecommunications/911-and-other-special-service-numbers
```

A03
Preparedness, hubs, and hazard awareness maps

A03-01 entity["organization","Seattle Emergency Management","oem hub, seattle wa"] - Official emergency management hub with preparedness pathways, trainings, and civic-wide readiness resources. citeturn33search17turn3search3

A03-02 entity["organization","Seattle Hazard Explorer","hazard map app, seattle"] - Interactive hazard explorer app summarizing local hazards, demographics, and critical facilities used for planning and preparedness. citeturn33search1turn26search4

A03-03 entity["organization","Seattle Emergency Management - All Hazards","hazards overview, seattle"] - Hazard library and entry point to the hazards explorer mapping tool and disaster impact context. citeturn33search5turn26search0

A03-04 entity["organization","Seattle Emergency Management - Prepare Your Neighborhood","neighborhood hubs, seattle"] - Official pathway to neighborhood prep, including hub resources and links to interactive hub maps and NeighborLink. citeturn33search3turn25search8

A03-05 entity["organization","Seattle Emergency Hubs","volunteer hub network, seattle"] - Volunteer-based network of emergency communication hubs (integrated into planning, but independently operated), useful for post-disaster neighborhood coordination. citeturn33search2turn25search4

A03-06 entity["organization","Seattle Emergency NeighborLink Map","neighborlink map, seattle"] - Interactive map intended to connect neighbors and neighborhood groups before an emergency, as part of community preparedness. citeturn33search6turn25search0

A03-07 entity["organization","Seattle Public Disaster Education","oem classes, seattle"] - Request-based classes and education resources to build preparedness at group/community scale. citeturn33search4

A03-08 entity["organization","Serve Washington CERT","cert training hub, wa"] - State portal for CERT training discovery and references to local course calendars and requests. citeturn33search20

A03-09 entity["organization","King County Emergency Management trainings","free trainings, king county"] - County preparedness training offerings and information sessions for orgs in county areas. citeturn33search7

A03-10 entity["organization","UW Emergency Management trainings","campus training hub, seattle"] - University readiness training and exercise hub (useful if you work/study on campus or want structured preparedness training formats). citeturn33search13

```text
A03-01 https://www.seattle.gov/emergency-management
A03-02 https://experience.arcgis.com/experience/2acb05d732134331bc05214740076373
A03-03 https://www.seattle.gov/emergency-management/disaster-impacts/all-hazards
A03-04 https://www.seattle.gov/emergency-management/prepare/prepare-your-neighborhood
A03-05 https://seattleemergencyhubs.org/
A03-06 https://seattleemergencyhubs.org/seattle-emergency-neighborlink-map/
A03-07 https://www.seattle.gov/emergency-management/education-and-engagement/public-disaster-education
A03-08 https://servewashington.wa.gov/cert-community-emergency-response-team/
A03-09 https://kingcounty.gov/en/dept/executive-services/health-safety/safety-injury-prevention/emergency-preparedness/prepare/training
A03-10 https://www.washington.edu/uwem/training-exercises/
```

A04
Weather, air quality, earthquakes, floods, and geologic hazards

A04-01 entity["organization","National Weather Service Seattle/Tacoma forecast office","weather alerts, puget sound"] - Primary regional source for official watches/warnings and local forecast products for the metro area. citeturn6search0

A04-02 entity["organization","NWS point forecast for central Seattle","point forecast, seattle"] - Point forecast page (map click) useful for quick temperature/precip details for a specific coordinate. citeturn6search4

A04-03 entity["organization","Washington Air Quality Map","aqi map, wa"] - State-operated air quality map showing AQI conditions and monitoring station data. citeturn6search3turn6search7

A04-04 entity["organization","Washington Department of Ecology wildfire smoke guidance","smoke and health, wa"] - State guidance page framing wildfire smoke impacts and how to interpret AQI signals and warnings. citeturn6search19turn6search11

A04-05 entity["organization","USGS Latest Earthquakes map","earthquake map, usgs"] - Official live earthquake map and feeds (useful as source of record for recent regional quakes). citeturn6search13turn6search5

A04-06 entity["organization","Pacific Northwest Seismic Network","earthquake reporting, pnw"] - Regional seismic network site with recent-event listings and outreach/education context. citeturn6search9turn6search2

A04-07 entity["organization","ShakeAlert","earthquake early warning, usgs"] - Public-facing overview of the US earthquake early warning system serving WA/OR/CA, including implementation context. citeturn6search6

A04-08 entity["organization","Washington Military Department MyShake announcement","myshake app, wa"] - State post describing availability of the MyShake app as a delivery pathway tied to earthquake early warning. citeturn6search18turn6search10

A04-09 entity["organization","King County Flood Warning System","flood alerts, king county"] - County flood warning portal with preparedness resources and links to alerting, closures, and NWS/USGS references. citeturn25search18

A04-10 entity["organization","Washington Geological Survey hazard map portal","geologic hazard maps, wa"] - State geologic hazard mapping entry point (faults, seismogenic features, and related layers). citeturn26search9

```text
A04-01 https://www.weather.gov/sew/
A04-02 https://forecast.weather.gov/MapClick.php?lat=47.6218&lon=-122.3503
A04-03 https://airqualitymap.ecology.wa.gov/
A04-04 https://ecology.wa.gov/air-climate/air-quality/smoke-fire/wildfire-smoke
A04-05 https://earthquake.usgs.gov/earthquakes/map/
A04-06 https://pnsn.org/
A04-07 https://www.shakealert.org/
A04-08 https://mil.wa.gov/news/myshake-earthquake-early-warning-app-now-available
A04-09 https://flood.kingcounty.gov/
A04-10 https://dnr.wa.gov/washington-geological-survey/geologic-hazards-and-environment/geologic-hazard-maps
```

B00
## Mobility, transport disruption, and infrastructure

B01
Roads, traffic cameras, winter response, and travel conditions

B01-01 entity["organization","SDOT Travelers","traffic map, seattle"] - Real-time traffic conditions for city streets and freeways, with linked cameras and incident context. citeturn7search0

B01-02 entity["organization","Seattle traffic cameras directory","traffic camera pages, seattle"] - City-hosted traffic camera pages with refresh notes and camera index navigation. citeturn7search7

B01-03 entity["organization","WSDOT real-time travel map","travel map, wa"] - State real-time travel map with alerts, cameras, travel times, and restrictions. citeturn7search25turn7search12

B01-04 entity["organization","WSDOT Travel Center - Real-time travel data","real-time travel hub, wa"] - State travel landing page aggregating road travel tools (alerts, cameras, passes, weather). citeturn25search10turn7search3

B01-05 entity["organization","SDOT Snow Plow Routes","winter response map, seattle"] - During snow events, provides the winter response map and planned plow routes for city priority streets. citeturn25search1

B01-06 entity["organization","King County Winter Weather Response Map","plows and serviced roads, king county"] - Seasonal map for snowplow locations and recently serviced roads (beta map, time-windowed). citeturn25search5

B01-07 entity["organization","King County Road Services winter weather guidance","snow and ice routes, king county"] - County page explaining snow/ice routes, priorities, and clearing approach for unincorporated areas. citeturn25search7

B01-08 entity["organization","WSDOT mountain passes and winter travel","pass reports hub, wa"] - Central state hub for pass conditions and winter travel planning, with subscriptions. citeturn25search6turn25search13

B01-09 entity["organization","WSDOT Snoqualmie Pass report","snoqualmie pass, wa"] - Direct pass detail page (temp, restrictions, and updates) useful for quick go/no-go checks. citeturn25search2

B01-10 entity["organization","King County Flood Risk Map","floodplain address lookup, king county"] - Address-based flood risk map to check if a property is in a flood risk area. citeturn25search15turn25search22

```text
B01-01 https://web.seattle.gov/travelers/
B01-02 https://www.seattle.gov/trafficcams/i5_85th.htm
B01-03 https://wsdot.com/travel/real-time/map/
B01-04 https://wsdot.com/travel/real-time/
B01-05 https://www.seattle.gov/transportation/projects-and-programs/safety-first/winter-weather-response/snow-plow-routes
B01-06 https://winter-response.kingcounty.gov/
B01-07 https://kingcounty.gov/en/dept/local-services/transit-transportation-roads/roads-and-bridges/road-services/maintenance/winter-weather
B01-08 https://wsdot.com/travel/real-time/mountainpasses/
B01-09 https://www.wsdot.com/traffic/passes/snoqualmie/
B01-10 https://kingcountyfloodcontrol.org/flood-resources/floodplain-map/
```

B02
Transit planning, live arrivals, and service disruption alerts

B02-01 entity["organization","King County Metro","public transit, king county"] - Transit agency hub with rider tools, schedules, and service change references. citeturn23search5

B02-02 entity["organization","King County Metro Trip Planner","trip planning, king county"] - Web trip planner that supports mapping, departures, and real-time vehicle positions (when available). citeturn23search1turn23search13

B02-03 entity["organization","King County Metro Service Advisories","reroutes and delays, king county"] - Official advisories list for delays, reroutes, closures, with filtering and a snow/ice/flood map entry. citeturn23search3turn25search11

B02-04 entity["organization","King County Metro Transit Alerts signup","transit alert subscriptions, king county"] - Subscription page describing when alerts are sent and how to sign up; points Sound Transit riders to their alert system. citeturn23search19

B02-05 entity["organization","Sound Transit","regional transit agency, puget sound"] - Regional transit hub for rail/bus services, system maps, and service planning. citeturn23search18

B02-06 entity["organization","Sound Transit Service Alerts","construction and disruptions, puget sound"] - Alert subscription and page view for construction/event-related revisions and other disruptions. citeturn23search7

B02-07 entity["organization","Sound Transit Passenger Tools","real-time arrivals, puget sound"] - Tooling page describing access to real-time arrivals (by route stop tab) and scope limitations. citeturn23search2

B02-08 entity["organization","OneBusAway for Puget Sound","real-time arrivals app, puget sound"] - Mobile/web interface for stop code and route searches for real-time arrivals in the regional transit ecosystem. citeturn23search20turn23search4

B02-09 entity["organization","King County Metro Mobile and web apps directory","app shortlist, king county"] - Curated list of officially referenced rider apps (including OneBusAway) and what they are for. citeturn23search16

B02-10 entity["organization","Seattle Streetcar info page","streetcar overview, seattle"] - Streetcar overview page under SDOT with report references and rider information entry points. citeturn23search11

```text
B02-01 https://kingcounty.gov/en/dept/metro
B02-02 https://tripplanner.kingcounty.gov/
B02-03 https://kingcounty.gov/en/dept/metro/rider-tools/service-advisories
B02-04 https://kingcounty.gov/en/dept/metro/rider-tools/service-advisories/transit-alerts-signup
B02-05 https://www.soundtransit.org/
B02-06 https://www.soundtransit.org/ride-with-us/service-alerts
B02-07 https://www.soundtransit.org/ride-with-us/passenger-tools
B02-08 https://pugetsound.onebusaway.org/
B02-09 https://kingcounty.gov/en/dept/metro/rider-tools/mobile-and-web-apps
B02-10 https://www.seattle.gov/transportation/getting-around/transit/streetcar
```

B03
Ferries and airport operational status

B03-01 entity["organization","Washington State Ferries main hub","ferries status, wa"] - State ferry hub with live status, real-time map, terminal cameras, and rider information. citeturn7search5

B03-02 entity["organization","Washington State Ferries Travel Alert Bulletins","ferries bulletins, wa"] - Current travel alert bulletins page (with a visible last-updated timestamp). citeturn7search1

B03-03 entity["organization","Washington State Ferries Route Alerts signup","ferries alerts signup, wa"] - Subscription page describing alert delivery windows and notification expectations. citeturn7search9

B03-04 entity["organization","Washington State Ferries VesselWatch","live vessel map, wa"] - Real-time map views for ferries by route, with delay markers and terminal camera linkouts. citeturn7search19

B03-05 entity["organization","Washington State Ferries Ferries and Terminals","terminal cameras, wa"] - Hub for real-time ferry map, travel alerts, and loading cameras by terminal. citeturn7search13

B03-06 entity["organization","Port of Seattle live estimated checkpoint wait times","tsa wait times, sea"] - Official checkpoint wait times page with operational guidance and travel-time recommendations. citeturn7search2

B03-07 entity["organization","Port of Seattle SEA Spot Saver","checkpoint reservation, sea"] - Airport tool for reserving a time window for security screening under Spot Saver. citeturn7search6

B03-08 entity["organization","Port of Seattle security screening overview","checkpoint options, sea"] - Explains security screening types and checkpoints, including accessibility notes and program options. citeturn7search14

B03-09 entity["organization","Port of Seattle SEA-TAC Airport hub page","airport services hub, sea"] - Main airport landing page with links to wait times, traveler advisories, accessibility, and airport programs. citeturn7search24

B03-10 entity["organization","Washington State DOT main site","transportation hub, wa"] - State DOT hub for travel, ferry, and construction planning, including entry points to map views. citeturn7search3turn25search17

```text
B03-01 https://wsdot.wa.gov/travel/washington-state-ferries
B03-02 https://wsdot.com/ferries/schedule/bulletin.aspx
B03-03 https://wsdot.wa.gov/Ferries/RouteAlerts
B03-04 https://wsdot.com/ferries/vesselwatch/
B03-05 https://wsdot.wa.gov/travel/washington-state-ferries/ferries-terminals
B03-06 https://www.portseattle.org/page/live-estimated-checkpoint-wait-times
B03-07 https://www.portseattle.org/SEAspotsaver
B03-08 https://www.portseattle.org/Security
B03-09 https://www.portseattle.org/sea-tac
B03-10 https://wsdot.wa.gov/
```

B04
Parking, tickets, permits, and vehicle admin shortcuts

B04-01 entity["organization","SDOT Parking Program maps and data","parking maps, seattle"] - Entry point for Seattle Parking Map, paid parking areas, and RPZ maps. citeturn24search2

B04-02 entity["organization","SDOT Restricted Parking Zone permits","rpz permits, seattle"] - RPZ program explainer and permit pathway, describing goal (reduce all-day commuter parking near major centers). citeturn24search8turn24search15

B04-03 entity["organization","Seattle Municipal Court - Pay My Ticket","pay ticket, seattle"] - Central payment page for municipal tickets, including phone payment instructions and constraints. citeturn24search0turn24search3

B04-04 entity["organization","Seattle Municipal Court - Find My Ticket Info","ticket lookup help, seattle"] - Instructions for using the court portal to search (including license plate based searches for vehicle infractions). citeturn24search13

B04-05 entity["organization","King County District Court - Citations or Tickets portal","pay ticket, king county"] - Search and pay interface for district court tickets (vehicle license, ticket number, or name). citeturn24search6turn24search20

B04-06 entity["organization","Seattle Pay or Apply hub","payments hub, seattle"] - Simple hub page collecting common city payments/applications (including tickets and other common workflows). citeturn24search9

B04-07 entity["organization","Washington Department of Licensing - Renew or replace driver license","driver license renew, wa"] - Official guide to renew/replace a driver license online, with timing constraints and eligibility. citeturn24search4turn24search1

B04-08 entity["organization","WA DOL License Express","dol account login, wa"] - Account gateway for WA licensing online services. citeturn24search10

B04-09 entity["organization","PayByPhone Seattle info page","parking payment app, seattle"] - Parking payment app entry page describing the Seattle workflow (location number based). citeturn24search16

B04-10 entity["organization","Port of Seattle parking payment options","airport parking payments, sea"] - Airport parking payment options, including pre-booked parking note and payment modes. citeturn24search12

```text
B04-01 https://www.seattle.gov/transportation/projects-and-programs/programs/parking-program/maps-and-data
B04-02 https://www.seattle.gov/transportation/permits-and-services/permits/parking-permits/rpz-permits
B04-03 https://www.seattle.gov/courts/tickets-and-payments/pay-my-ticket
B04-04 https://www.seattle.gov/courts/tickets-and-payments/find-my-ticket-info
B04-05 https://kcdc-efiling.kingcounty.gov/ecourt/?q=node%2F410
B04-06 https://www.seattle.gov/pay-or-apply
B04-07 https://dol.wa.gov/driver-licenses-and-permits/renew-or-replace-driver-license
B04-08 https://www.dol.wa.gov/licenseexpress.html
B04-09 https://www.paybyphone.com/park-in-seattle
B04-10 https://www.portseattle.org/faq/parking-payment-options-lost-tickets-and-receipts
```

C00
## Health, safety net, and environmental health

C01
Public health, clinics, vaccines, and health situation dashboards

C01-01 entity["organization","Public Health - Seattle & King County","public health dept, king county"] - County public health hub with program navigation, Board of Health references, and official news releases. citeturn10search0turn34search4

C01-02 entity["organization","Public Health Centers directory","clinics list, king county"] - Directory of public health centers and service notes (location pages contain the operational details). citeturn10search16

C01-03 entity["organization","Where to get vaccinated in King County","vaccination locations, king county"] - Curated vaccination location list with notes about walk-ins, appointments, and fee expectations for certain service types. citeturn10search1

C01-04 entity["organization","King County vaccination map locator","no-cost vaccines map, king county"] - Map locator for no-cost vaccinations for children and uninsured adults, with availability caveats. citeturn10search4

C01-05 entity["organization","King County respiratory virus data dashboards","respiratory data, king county"] - Respiratory illness dashboards for COVID-19, influenza, RSV, and related pathogens for the county. citeturn34search11

C01-06 entity["organization","Public Health news releases page","public health news, king county"] - Central archive for public health news releases and newsletter signup paths. citeturn34search19

C01-07 entity["organization","Washington State Department of Health","state health agency, wa"] - State health hub with major program entry points (including provider lookup, flu info, and safety alerts). citeturn10search19turn31search20

C01-08 entity["organization","WA DOH Health and Safety Alerts","health alerts, wa"] - State health alerts hub including specialized alert distribution systems and incident notifications. citeturn34search6

C01-09 entity["organization","WA DOH Flu overview","flu guidance, wa"] - State flu overview and activity reporting approach (weekly reports during season). citeturn34search7turn34search3

C01-10 entity["organization","WA DOH Drinking Water Alerts","active water alerts, wa"] - List view of active drinking water alerts for Group A systems statewide. citeturn34search2turn27search4

```text
C01-01 https://kingcounty.gov/en/dept/dph
C01-02 https://kingcounty.gov/en/dept/dph/health-safety/health-centers-programs-services/public-health-centers
C01-03 https://kingcounty.gov/en/dept/dph/health-safety/health-centers-programs-services/immunizations/where-to-get-vaccine
C01-04 https://kingcounty.gov/en/dept/dph/health-safety/health-centers-programs-services/immunizations/where-to-get-vaccine/map-locator
C01-05 https://kingcounty.gov/en/dept/dph/health-safety/disease-illness/respiratory-virus-data
C01-06 https://kingcounty.gov/en/dept/dph/about-king-county/about-public-health/news
C01-07 https://doh.wa.gov/
C01-08 https://doh.wa.gov/emergencies/health-and-safety-alerts
C01-09 https://doh.wa.gov/you-and-your-family/illness-and-disease-z/flu
C01-10 https://doh.wa.gov/community-and-environment/drinking-water/active-alerts
```

C02
Crisis support, poisoning, and interpersonal safety resources

C02-01 entity["organization","988 Suicide & Crisis Lifeline","us crisis line"] - National 988 hub describing call/text/chat availability, confidentiality, and what to expect. citeturn10search14

C02-02 entity["organization","WA 988","washington 988 hub"] - Washington-specific 988 explainer (how it works in-state, and access via phone/text/chat). citeturn10search22

C02-03 entity["organization","King County Crisis Services","behavioral crisis care, king county"] - County crisis care entry point including 988 and the regional crisis line, plus next-step pathways. citeturn10search10

C02-04 entity["organization","Washington State Health Care Authority crisis lines page","crisis lines, wa"] - State page listing crisis-line options and escalation guidance (911 vs 988). citeturn10search18

C02-05 entity["organization","Washington Poison Center","poison guidance, wa"] - WA poison center homepage describing free expert treatment advice and prevention mission. citeturn10search5turn10search9

C02-06 entity["organization","PoisonHelp - find a poison center","poison help, us"] - Federal locator confirming that 1-800-222-1222 connects you to local poison centers nationwide. citeturn10search13turn10search17

C02-07 entity["organization","DVHopeline","dv advocacy helpline, wa"] - Statewide domestic violence advocacy helpline emphasizing confidential support for any community. citeturn29search3

C02-08 entity["organization","New Beginnings","dv help, seattle"] - Seattle-based domestic violence organization with 24-hour helpline and support entry points. citeturn29search4turn29search7

C02-09 entity["organization","DAWN - Domestic Abuse Women's Network","dv services, king county"] - King County domestic abuse services organization with advocacy/support line and services overview. citeturn29search1turn29search22

C02-10 entity["organization","King County Protection Orders portal","protection orders, king county"] - County portal describing protection orders and guidance, including advocacy support navigation. citeturn29search2turn29search21

```text
C02-01 https://988lifeline.org/
C02-02 https://wa988.org/
C02-03 https://kingcounty.gov/en/dept/dchs/human-social-services/behavioral-health-recovery/crisis-services
C02-04 https://www.hca.wa.gov/free-or-low-cost-health-care/i-need-behavioral-health-support/mental-health-crisis-lines
C02-05 https://www.wapc.org/
C02-06 https://poisonhelp.hrsa.gov/poison-centers/find-poison-center
C02-07 https://dvhopeline.org/
C02-08 https://newbegin.org/about-us/contact/
C02-09 https://dawnrising.org/
C02-10 https://kingcounty.gov/en/dept/pao/courts-jails-legal-system/protection-orders
```

C03
Benefits, rent help entry points, unemployment, and job support

C03-01 entity["organization","Washington 211","social services directory, wa"] - Statewide directory and referral system used for community services and basic needs navigation. citeturn3search2turn21search0

C03-02 entity["organization","United Way of King County","services hub, king county"] - United Way hub for finding services and coordinated support entry points. citeturn3search16turn11search25

C03-03 entity["organization","Washington Connection","benefits application, wa"] - Apply online for multiple public benefits programs; designed as a statewide gateway to services. citeturn21search0turn21search20

C03-04 entity["organization","DSHS - How to apply for services","apply guidance, wa"] - Official options for applying (online, phone, or local office) and what you can do on the portal. citeturn21search4

C03-05 entity["organization","Washington Connection - See If I Qualify","benefit prescreener, wa"] - Prescreen tool to check potential eligibility categories for benefits. citeturn21search16

C03-06 entity["organization","Washington Employment Security Department","unemployment benefits, wa"] - State unemployment hub with benefit guidance and worker supports. citeturn21search13turn21search9

C03-07 entity["organization","WA ESD eServices login","unemployment eservices, wa"] - Login gateway for unemployment eServices and claim management. citeturn21search1turn21search5

C03-08 entity["organization","WorkSource Seattle-King County","job support, seattle area"] - Job seeker support, training programs, and career services hub for the Seattle/King County area. citeturn22search0turn22search4turn22search16

C03-09 entity["organization","City of Seattle jobs portal","city jobs, seattle"] - Job application portal for city employment, with account-based application workflow. citeturn22search1turn22search5

C03-10 entity["organization","careers.wa.gov","state jobs, wa"] - State government job portal for applying and managing profiles for state roles. citeturn22search21

```text
C03-01 https://wa211.org/
C03-02 https://www.uwkc.org/
C03-03 https://www.washingtonconnection.org/
C03-04 https://www.dshs.wa.gov/esa/community-services-offices/how-apply-services
C03-05 https://www.washingtonconnection.org/prescreening/home.go?action=Introduction
C03-06 https://esd.wa.gov/
C03-07 https://secure.esd.wa.gov/
C03-08 https://www.worksourceskc.org/
C03-09 https://www.governmentjobs.com/careers/SEATTLE
C03-10 https://careers.wa.gov/
```

C04
Food safety, water quality, CSOs, swimming advisories

C04-01 entity["organization","King County Search Restaurant Safety Ratings","restaurant inspections, king county"] - Public inspection rating lookup (with a noted system transition and update caveats). citeturn5search3turn5search15

C04-02 entity["organization","King County Food Safety Rating System overview","rating system, king county"] - Explainer for how the county rating system was developed and what it is meant to convey. citeturn5search7

C04-03 entity["organization","King County report possible foodborne illness","foodborne illness report, king county"] - Reporting workflow for suspected illness after eating at a county food business, including what information they request. citeturn34search1turn34search5

C04-04 entity["organization","King County foodborne illness outbreaks list","outbreak list, king county"] - Public list of outbreaks and investigations with a year-tab structure and a short URL reference. citeturn34search12turn34search15

C04-05 entity["organization","Seattle Public Utilities Water Quality Annual Reports","water quality reports, seattle"] - Annual water quality reports required by the EPA, distributed to customers and published online. citeturn27search0

C04-06 entity["organization","Seattle Public Utilities Water Quality Concerns","water issues contacts, seattle"] - Water quality concern explainer listing urgent response and general-question contacts. citeturn34search17

C04-07 entity["organization","King County Combined Sewer Overflow status map","cso status, seattle"] - Live status map (10-minute updates) with a 48-hour avoidance warning after overflow events. citeturn27search2turn27search10

C04-08 entity["organization","King County lake swimming beach bacteria and temperature","freshwater beach testing, king county"] - County beach bacteria/temperature reporting page (seasonal testing schedule referenced). citeturn27search1

C04-09 entity["organization","WA DOH Swimming Beach Advisories map","saltwater beach advisories, wa"] - State map covering saltwater beach closures/advisories (Ecology/DOH BEACH program). citeturn27search5

C04-10 entity["organization","AlertSeattle Boil Water page","boil water advisory, seattle"] - City boil-water advisory page describing what to do and the scope of an advisory when issued. citeturn27search8turn27search12

```text
C04-01 https://kingcounty.gov/en/dept/dph/health-safety/food-safety/search-restaurant-safety-ratings
C04-02 https://kingcounty.gov/en/dept/dph/health-safety/food-safety/inspection-rating-system/rating-system
C04-03 https://kingcounty.gov/en/dept/dph/health-safety/food-safety/food-borne-illness-complaints
C04-04 https://kingcounty.gov/en/dept/dph/health-safety/disease-illness/foodborne-illness-outbreaks
C04-05 https://www.seattle.gov/utilities/about/reports/water-quality
C04-06 https://www.seattle.gov/utilities/your-services/water/water-quality/quality-concerns
C04-07 https://kingcounty.gov/en/dept/dnrp/waste-services/wastewater-treatment/sewer-system-services/cso-status
C04-08 https://kingcounty.gov/en/dept/dnrp/nature-recreation/parks-recreation/king-county-parks/water-recreation/swimming-beach-bacteria-temperature
C04-09 https://doh.wa.gov/community-and-environment/water-recreation/beach-advisories
C04-10 https://alert.seattle.gov/boilwater/
```

D00
## Civic, legal, property, consumer, and records

D01
Police reporting, transparency dashboards, and public disclosure

D01-01 entity["organization","Seattle Police Department contact page","non-emergency line, seattle"] - Official contact page including 911 vs non-emergency routing and key unit tip lines. citeturn9search5

D01-02 entity["organization","Seattle Police Online Crime Reporting page","online reporting criteria, seattle"] - Eligibility criteria and entry point for online reporting (non-emergency, within city limits, etc). citeturn9search3

D01-03 entity["organization","Seattle Police Records Request Center","spd pdr portal, seattle"] - SPD public records request center (submit requests, communicate with staff, pay and download records). citeturn35search1turn22search14

D01-04 entity["organization","Seattle Police Public Records Act Requests Dashboard","pdr dashboard, seattle"] - Dashboard summarizing request volume, categories, and timelines (with privacy redactions). citeturn35search0turn22search22

D01-05 entity["organization","Seattle Public Records Request Center","citywide pdr portal, seattle"] - Citywide portal used to submit public disclosure requests to city departments, with status tracking and downloads. citeturn22search2turn35search5

D01-06 entity["organization","Seattle Police Public Information Online","public info shortcuts, spd"] - Curated links to SPD public information already available online (policies, maps, blotter styles). citeturn35search7

D01-07 entity["organization","Seattle Police Online Data Maps landing page","calls and offenses, seattle"] - Landing page describing real-time-ish call maps and crime maps, including data source notes (CAD). citeturn35search12turn5search6

D01-08 entity["organization","Seattle Police Department policy manual site","spd manual, powerdms"] - Official published manual repository. citeturn35search3turn35search6

D01-09 entity["organization","King County Sheriff's Office records requests","kcso records, king county"] - Sheriff records request and public disclosure pathways for county-level law enforcement. citeturn35search17turn22search15

D01-10 entity["organization","King County submit a public records request","countywide pdr program, king county"] - County public records program page with electronic submission as the primary recommended pathway. citeturn35search18turn22search3

```text
D01-01 https://www.seattle.gov/police/about-us/contact-us
D01-02 https://www.seattle.gov/police/need-help/property-crimes/online-reporting
D01-03 https://www.seattle.gov/police/information-and-data/public-disclosure-requests/records-request-center
D01-04 https://www.seattle.gov/police/information-and-data/public-disclosure-requests/public-records-request-dashboard
D01-05 https://www.seattle.gov/public-records/public-records-request-center
D01-06 https://www.seattle.gov/police/information-and-data/public-disclosure-requests/public-information-online
D01-07 https://www.seattle.gov/police/information-and-data/data/online-crime-maps
D01-08 https://public.powerdms.com/Sea4550
D01-09 https://kingcounty.gov/en/dept/sheriff/courts-jails-legal-system/sheriff-records
D01-10 https://kingcounty.gov/en/dept/executive-services/about-king-county/business-operations/risk-management-services/public-records-program
```

D02
Courts, tickets, case lookup, and official records search

D02-01 entity["organization","Seattle Municipal Court portal","case info portal, seattle"] - Public portal for municipal court case documents and public information access. citeturn24search3turn4search2

D02-02 entity["organization","Seattle Municipal Court - Tickets and Payments hub","tickets hub, seattle"] - Central entry point for tickets, payments, and linked court services. citeturn24search3

D02-03 entity["organization","King County District Court eFiling and Case Access","case access, king county"] - County district court case/efiling portal used for filings, access, and case-related workflows (with access constraints). citeturn4search17turn22search23

D02-04 entity["organization","Washington Courts - Find My Court Date","court date lookup, wa"] - Statewide tool for locating court dates by name or case number, depending on the court. citeturn4search10

D02-05 entity["organization","King County Superior Court - case search portal","superior court portal, king county"] - Case access and search entry point for superior court records. citeturn4search11

D02-06 entity["organization","King County Recorder's Office - online records search","official records search, king county"] - Free online database for recorded official records (with a 1991 cutoff for online availability noted). citeturn22search11

D02-07 entity["organization","Seattle SDCI Permit and Property Records search","permit records search, seattle"] - Legacy permit and property records search by record number or address. citeturn12search17

D02-08 entity["organization","Washington Courts statewide forms directory","court forms, wa"] - State court forms directory and search for commonly used statewide forms (local courts may add more). citeturn30search8turn29search20

D02-09 entity["organization","Seattle Municipal Code and City Charter hub","code reference, seattle"] - City clerk page describing where to browse/search the municipal code online and related code access. citeturn14search7

D02-10 entity["organization","Municode Seattle Municipal Code library","code browser, seattle"] - Code publisher interface for browsing the municipal code with supplement update notes. citeturn14search3turn14search11

```text
D02-01 https://kingcounty.gov/en/legacy/courts/district-court/presiding-judge/online-case-search
D02-02 https://www.seattle.gov/courts/tickets-and-payments
D02-03 https://kcdc-efiling.kingcounty.gov/ecourt/
D02-04 https://dw.courts.wa.gov/?fa=home.fmcd
D02-05 https://kingcounty.gov/en/court/superior-court/courts-jails-legal-system/case-records-access
D02-06 https://kingcounty.gov/en/dept/executive-services/certificates-permits-licenses/records-licensing/recorders-office/records-search
D02-07 https://web.seattle.gov/dpd/edms/
D02-08 https://www.courts.wa.gov/forms/
D02-09 https://www.seattle.gov/cityclerk/legislation-and-research/seattle-municipal-code-and-city-charter
D02-10 https://library.municode.com/wa/seattle/codes/municipal_code
```

D03
Representation lookup, districts, and elections logistics

D03-01 entity["organization","USA.gov elected officials lookup","find reps, us"] - Federal tool directory for finding and contacting elected officials across federal/state/local levels. citeturn13search0

D03-02 entity["organization","U.S. House Find Your Representative","house member lookup, us"] - Official House tool mapping ZIP code to district and member site/contact. citeturn13search8

D03-03 entity["organization","U.S. Senate contact guide","senator contact, us"] - Senate contact guidance and references to state pages for phone numbers and websites. citeturn13search24

D03-04 entity["organization","Washington Legislature District Finder","district finder, wa"] - Address-based district finder for legislative or congressional district identification. citeturn13search1

D03-05 entity["organization","Seattle City Council members page","council roster, seattle"] - Current council roster list, plus a “find your district” entry point and contact instructions. citeturn13search19turn13search27

D03-06 entity["organization","Seattle City Clerk - Contact the City Council","council contacts, seattle"] - Centralized directory of councilmember emails/phones and a district finder map. citeturn13search7

D03-07 entity["organization","Seattle Mayor contact page","mayor contact, seattle"] - Official mayor contact channel and office communication entry points. citeturn13search3

D03-08 entity["organization","King County Elections - ballot drop boxes","drop box locations, king county"] - County drop box list page describing publication timing and Election Day deadline constraints. citeturn13search2turn13search10

D03-09 entity["organization","King County Elections - Find my district","district map app, king county"] - County mapping app to view precinct and multiple levels of districts for residents. citeturn13search17

D03-10 entity["organization","WA Secretary of State drop box locator","drop boxes and voting centers, wa"] - State page for drop box and voting center locations (with election-cycle publication notes). citeturn13search6

```text
D03-01 https://www.usa.gov/elected-officials
D03-02 https://www.house.gov/representatives/find-your-representative
D03-03 https://www.senate.gov/senators/senators-contact.htm
D03-04 https://app.leg.wa.gov/districtfinder
D03-05 https://www.seattle.gov/council/members
D03-06 https://www.seattle.gov/cityclerk/agendas-and-legislative-resources/city-council-agendas/contact-the-city-council
D03-07 https://www.seattle.gov/mayor/contact
D03-08 https://kingcounty.gov/en/dept/elections/how-to-vote/ballots/return-my-ballot/ballot-drop-boxes
D03-09 https://kingcounty.gov/en/dept/elections/maps/find-my-district
D03-10 https://www.sos.wa.gov/elections/voters/voter-registration/drop-box-and-voting-center-locations
```

D04
Permits, property research, taxes, and verification tools

D04-01 entity["organization","Seattle Services Portal","permits and services portal, seattle"] - City portal for permits, inspections, and property-related records lookups. citeturn4search1turn12search25

D04-02 entity["organization","SDCI Apply for Permits","permit application hub, seattle"] - Permitting hub describing application start points and permitting areas. citeturn4search9turn31search10

D04-03 entity["organization","SDCI inspections lookup tool page","inspection lookup, seattle"] - Inspections lookup and status tooling entry point. citeturn4search13

D04-04 entity["organization","SDCI Property Information Map","property map, seattle"] - GIS property map tool useful for property context and related layers. citeturn12search2turn12search11

D04-05 entity["organization","King County Parcel Viewer","parcel info map, king county"] - Parcel search map with direct links to assessor reports and district/development conditions. citeturn12search0turn12search13

D04-06 entity["organization","King County iMap","interactive mapping, king county"] - County GIS mapping tool with customizable layers (property, natural resources, political boundaries, etc). citeturn12search3turn12search15

D04-07 entity["organization","King County Property Taxes payment portal","pay property tax, king county"] - County payment portal for property taxes, with service-fee notes and treasury office details. citeturn14search2turn14search6

D04-08 entity["organization","FileLocal","local biz taxes portal, wa"] - Portal for local business licensing and city tax filing/payment, positioned as a one-stop online system. citeturn14search0turn14search4

D04-09 entity["organization","WA Department of Revenue file and pay hub","state taxes portal, wa"] - State tax filing and payment guidance for online filing, payment methods, and classifications. citeturn14search1turn14search5

D04-10 entity["organization","WA L&I Verify tool","verify contractor, wa"] - Official tool to verify contractor/tradesperson/business status and see active registration and related signals. citeturn31search0turn31search2

```text
D04-01 https://services.seattle.gov/
D04-02 https://www.seattle.gov/sdci/permits
D04-03 https://www.seattle.gov/sdci/permits/inspections/inspections-lookup-tool
D04-04 https://seattlecitygis.maps.arcgis.com/apps/webappviewer/index.html?id=f822b2c6498c4163b0cf908e2241e9c2
D04-05 https://kingcounty.gov/en/dept/kcit/data-information-services/gis-center/maps-apps/parcel-viewer
D04-06 https://kingcounty.gov/en/dept/kcit/data-information-services/gis-center/maps-apps/imap
D04-07 https://payment.kingcounty.gov/Home/Index?app=PropertyTaxes
D04-08 https://www.filelocal-wa.gov/
D04-09 https://dor.wa.gov/file-pay-taxes
D04-10 https://secure.lni.wa.gov/verify/
```

E00
## Housing, utilities, waste, and animals

E01
Renting rules, eviction help, and affordable housing entry points

E01-01 entity["organization","Renting in Seattle","renter rights hub, seattle"] - City hub for renter regulations and fair housing info, with handbook references and best practices. citeturn11search0turn11search9

E01-02 entity["book","Renters Handbook","renters handbook, seattle"] - City-produced handbook summarizing rights/obligations and relationship management concepts for renters/landlords. citeturn11search9turn11search3

E01-03 entity["organization","Tenants Union of Washington State","tenant hotline, seattle"] - Tenant counseling entry point and hotline support for landlord-tenant issues (non-attorney counseling). citeturn11search12turn11search20

E01-04 entity["organization","Washington Law Help - Eviction topic hub","eviction legal info, wa"] - Legal self-help hub covering notices, eviction process, defenses, lockouts, and utility shutoffs. citeturn11search2turn11search8

E01-05 entity["organization","WA Attorney General landlord-tenant resources","tenant resources, wa"] - State AG hub aggregating renter self-help resources and referral options. citeturn11search19turn11search5

E01-06 entity["organization","Seattle Office of Housing - Find Affordable Rental Housing","affordable housing map, seattle"] - City map and resource bundle for locating income-restricted affordable buildings and contact pathways. citeturn11search18turn11search1

E01-07 entity["organization","Seattle Housing Authority","public housing and vouchers, seattle"] - Public housing authority providing subsidized rental housing and rental assistance programs. citeturn11search7turn11search4

E01-08 entity["organization","DSHS Housing and Essential Needs program","hen program, wa"] - State referral program describing access to essential needs items and potential rental assistance for eligible individuals. citeturn11search10

E01-09 entity["organization","SDCI Renting hub","rental inspections and complaints, seattle"] - Renting-related inspections, complaint entry points, rental registration resources, and map linkouts. citeturn11search24turn11search17

E01-10 entity["organization","United Way Rent Help","rent assistance intake, king county"] - United Way intake/entry for rental assistance and eviction prevention resources. citeturn11search25

```text
E01-01 https://www.seattle.gov/rentinginseattle
E01-02 https://www.seattle.gov/rentinginseattle/renters/moving-in/renters-handbook
E01-03 https://tenantsunion.org/counseling
E01-04 https://www.washingtonlawhelp.org/en/topics/housing/eviction
E01-05 https://www.atg.wa.gov/residential-landlord-tenant-resources
E01-06 https://www.seattle.gov/housing/renters/find-housing
E01-07 https://www.seattlehousing.org/
E01-08 https://www.dshs.wa.gov/esa/community-services-offices/housing-and-essential-needs-referral-program
E01-09 https://www.seattle.gov/sdci/renting
E01-10 https://www.uwkc.org/renthelp/
```

E02
Utilities outages, water outages, waste pickup, and hazardous waste

E02-01 entity["organization","Seattle City Light Outages hub","power outages, seattle"] - Official outage reporting page including phone reporting instructions and safety warnings (downed lines). citeturn36search3turn8search3

E02-02 entity["organization","Seattle City Light outage map","outage map, seattle"] - Map interface presenting active outage events and customer counts. citeturn36search6

E02-03 entity["organization","Seattle City Light Outage Alerts","outage notifications, seattle"] - City Light page describing testing of outage notification alerts for unplanned outages. citeturn8search2turn8search9

E02-04 entity["organization","Seattle Public Utilities Water Outage Status map","water outages map, seattle"] - Live map search for planned and emergency water outages (address and nearby search). citeturn36search9turn36search2

E02-05 entity["organization","Seattle Public Utilities - Look Up Collection Day","garbage schedule lookup, seattle"] - Address lookup calendar for garbage/recycling/food and yard waste pickup, including holiday schedule impacts. citeturn8search0turn8search4

E02-06 entity["organization","Seattle Public Utilities - Where to Dispose of Household Hazardous Waste","haz waste disposal, seattle"] - City text explaining hazardous waste disposal facilities that are free for county residents, with facility notes. citeturn8search8

E02-07 entity["organization","King County Hazardous Waste disposal facilities","haz waste sites, king county"] - County disposal facilities listing (including Wastemobile option) and hotline details/hours. citeturn8search5turn8search12

E02-08 entity["organization","King County Wastemobile schedule","haz waste mobile, king county"] - Seasonal Wastemobile schedule with hours and disposal fee notes. citeturn8search20

E02-09 entity["company","Puget Sound Energy outage map","outages, puget sound"] - Utility outage map and restoration times for the PSE service area. citeturn36search0turn36search18

E02-10 entity["company","Puget Sound Energy gas emergency reporting","gas leak reporting, puget sound"] - Gas emergency instructions emphasizing leaving the area and calling the emergency number (and 911). citeturn36search1turn36search16

```text
E02-01 https://www.seattle.gov/city-light/outages
E02-02 https://scl.datacapable.com/map/
E02-03 https://www.seattle.gov/city-light/outages/outage-alerts
E02-04 https://maps.seattle.gov/spu/wateroutage/
E02-05 https://www.seattle.gov/utilities/your-services/collection-and-disposal/your-collection-day/look-up-collection-day
E02-06 https://www.seattle.gov/utilities/your-services/collection-and-disposal/garbage/hazardous-waste-items/where-to-dispose-of-hazardous-waste
E02-07 https://kingcounty.gov/en/dept/dnrp/waste-services/hazardous-waste-program/household/disposal-facilities
E02-08 https://kingcounty.gov/en/dept/dnrp/waste-services/hazardous-waste-program/wastemobile
E02-09 https://www.pse.com/outage/outage-map
E02-10 https://www.pse.com/en/outage/report-gas-emergency
```

E03
Animals, lost pets, licensing, and wildlife reporting

E03-01 entity["organization","Seattle Animal Shelter","animal shelter, seattle"] - Main shelter hub with adoption, lost/found pets, and animal control entry points. citeturn28search20turn28search16

E03-02 entity["organization","Seattle Animal Shelter - Lost Pets","lost pets guidance, seattle"] - Lost pet guidance and contact expectations; notes about shelter listing updates and communication channels. citeturn28search4turn28search0

E03-03 entity["organization","Seattle Animal Shelter - Found Pets at the Shelter","found pets listings, seattle"] - Found pets listings page and explanations of what a “Found Report” implies operationally. citeturn28search0

E03-04 entity["organization","Seattle Animal Shelter - Animal Control","animal control, seattle"] - Animal control page with escalation guidance for life-threatening situations and scope notes. citeturn28search2

E03-05 entity["organization","Regional Animal Services of King County","animal services, king county"] - County animal services hub for licensing, lost pets, and animal control response outside city limits. citeturn28search9turn28search6

E03-06 entity["organization","King County pet licensing page","pet license, king county"] - Pet license requirement explainer and benefits (including identification and recovery support). citeturn28search1

E03-07 entity["organization","King County found animal search","found pets list, king county"] - Found animals search/list with holding period notes and redemption guidance. citeturn28search8

E03-08 entity["organization","Washington Department of Fish and Wildlife report observations","wildlife reporting, wa"] - Portal for reporting wildlife observations including dead or sick wildlife and invasive species pathways. citeturn28search3turn28search7

E03-09 entity["organization","WDFW Wildlife Health reporting form","sick/injured wildlife report, wa"] - Direct report form for sick/injured/dead animals, with taxonomy for report type. citeturn28search11

E03-10 entity["organization","Seattle Animal Shelter contacts page","shelter contacts, seattle"] - Contacts and submission entry points for common issues (noise, deceased animals, off-leash dogs, etc). citeturn28search14

```text
E03-01 https://www.seattle.gov/animal-shelter
E03-02 https://www.seattle.gov/animal-shelter/find-an-animal/lost-pets
E03-03 https://www.seattle.gov/animal-shelter/find-an-animal/lost-pets/found-pets-at-the-shelter
E03-04 https://www.seattle.gov/animal-shelter/animal-control
E03-05 https://kingcounty.gov/en/dept/executive-services/animals-pets-pests/regional-animal-services
E03-06 https://kingcounty.gov/en/dept/executive-services/animals-pets-pests/regional-animal-services/pet-licenses
E03-07 https://kingcounty.gov/en/dept/executive-services/animals-pets-pests/regional-animal-services/lost-pet/found-animal-search
E03-08 https://wdfw.wa.gov/get-involved/report-observations
E03-09 https://survey123.arcgis.com/share/1550804e5fd743668049e06d5ad8836a
E03-10 https://www.seattle.gov/animal-shelter/about-us/hours-location-and-contacts
```

F00
## Information, learning, recreation, and community signal

F01
Open data, GIS, and research-grade city/county datasets

F01-01 entity["organization","Seattle Open Data program page","open data, seattle"] - City open data program landing page with the portal entry point and contact email. citeturn5search4turn5search16

F01-02 entity["organization","Seattle data and research hub","data hub, seattle"] - City page linking to open data and other data sources (census and federal data links included). citeturn5search8

F01-03 entity["organization","Seattle GeoData","gis data hub, seattle"] - City GIS open data hub for commonly requested layers and applications. citeturn5search12turn12search18

F01-04 entity["organization","King County GIS Open Data","gis open data, king county"] - County GIS open data hub for spatial datasets and apps. citeturn5search5turn5search9

F01-05 entity["organization","King County GIS Data Hub page","gis sources, king county"] - County page describing GIS data sources and linking to portals and hub sites. citeturn5search9turn12search23

F01-06 entity["organization","Seattle Police data landing page","police data hub, seattle"] - Police data hub listing dashboards, precinct layers, and records request entry points. citeturn5search18turn35search6

F01-07 entity["organization","King County food establishment inspection dataset","inspection dataset, king county"] - Downloadable dataset for food establishment inspections (useful for custom queries and analysis). citeturn5search19

F01-08 entity["organization","Traffic Cameras dataset - Seattle GeoData","camera layer, seattle"] - GIS dataset describing SDOT-maintained traffic camera locations as a layer. citeturn7search11

F01-09 entity["organization","Seattle Public Library online resources","databases and tools, seattle"] - Library portal for online databases and resources for learning and research. citeturn15search3turn15search7

F01-10 entity["organization","Seattle Public Library event calendar","free events, seattle"] - Library events calendar emphasizing free classes and activities across branches and online. citeturn20search2turn20search12

```text
F01-01 https://www.seattle.gov/tech/reports-and-data/open-data
F01-02 https://www.seattle.gov/data-and-research
F01-03 https://data-seattlecitygis.opendata.arcgis.com/
F01-04 https://gis-kingcounty.opendata.arcgis.com/
F01-05 https://kingcounty.gov/en/dept/kcit/data-information-services/gis-center/data-hub
F01-06 https://www.seattle.gov/police/information-and-data
F01-07 https://data.kingcounty.gov/Health-Wellness/Food-Establishment-Inspection-Data/f29f-zza5
F01-08 https://data-seattlecitygis.opendata.arcgis.com/datasets/SeattleCityGIS::traffic-cameras
F01-09 https://www.spl.org/online-resources
F01-10 https://www.spl.org/event-calendar
```

F02
Parks, trails, permits, and “what to do this weekend” tooling

F02-01 entity["organization","Seattle Parks and Recreation","parks dept, seattle"] - Main parks department hub aggregating programs, facilities, and project info. citeturn16search9

F02-02 entity["organization","Seattle Parks hiking and trails page","trail maps, seattle"] - Hiking and trails page listing parks/trail destinations and closures context. citeturn15search1

F02-03 entity["organization","Seattle Parks activities registration search","activities registration, seattle"] - Activities search for classes, programs, and seasonal offerings (registration platform). citeturn16search2turn16search6

F02-04 entity["organization","Seattle swimming beaches page","beach advisories, seattle"] - City page noting that beaches may close temporarily due to water quality or algae, with page banners used for alerts. citeturn27search9

F02-05 entity["organization","Washington Trails Association trip reports","trail conditions, wa"] - Community trip reports used to understand current trail conditions and recent experiences. citeturn15search6turn15search10

F02-06 entity["organization","Washington Trails Association hiking guide","hike database, wa"] - Vetted hiking guide database intended as a structured source for hike planning. citeturn15search14

F02-07 entity["organization","Washington State Parks Discover Pass page","discover pass prices, wa"] - Official Discover Pass pricing and usage notes (annual and day pass). citeturn15search2turn15search13

F02-08 entity["organization","Discover Pass official site","discover pass hub, wa"] - Discover Pass portal for pass purchase and general program context. citeturn15search5

F02-09 entity["organization","Seattle Center event calendar","events calendar, seattle"] - Official calendar for Seattle Center events, including free events and listings. citeturn16search1turn16search4

F02-10 entity["organization","Seattle Department of Neighborhoods citywide event calendar","community events, seattle"] - Citywide event calendar for neighborhood events and community activities, with a submit flow for DON events. citeturn20search3turn20search24

```text
F02-01 https://www.seattle.gov/parks
F02-02 https://www.seattle.gov/parks/recreation/hiking-and-trails
F02-03 https://apm.activecommunities.com/seattle/Activity_Search
F02-04 https://www.seattle.gov/parks/recreation/swimming-beaches
F02-05 https://www.wta.org/go-outside/trip-reports
F02-06 https://www.wta.org/go-outside/hikes
F02-07 https://parks.wa.gov/passes-permits/get-park-pass/discover-pass
F02-08 https://discoverpass.wa.gov/
F02-09 https://www.seattlecenter.com/events/event-calendar
F02-10 https://www.seattle.gov/neighborhoods/event-calendar
```

F03
Local news, neighborhood signal, and public media

F03-01 entity["organization","KUOW","public radio newsroom, seattle"] - Local NPR station and newsroom for regional coverage and public affairs. citeturn17search1

F03-02 entity["organization","Cascade PBS News","regional news, seattle"] - Local public media newsroom section for regional reporting and analysis. citeturn17search2turn17search10

F03-03 entity["organization","KING 5","local tv news, seattle"] - Local TV news site for breaking news, weather, and regional updates. citeturn18search1

F03-04 entity["organization","KIRO 7 News","local tv news, seattle"] - Local news site with a fast-updating feed and topic pages. citeturn18search2turn18search6

F03-05 entity["organization","KOMO News","local tv news, seattle"] - Local news site with breaking updates and regional reporting. citeturn17search24

F03-06 entity["organization","The Stranger","alt weekly, seattle"] - Local alternative publication covering news, politics, arts, and events. citeturn18search3

F03-07 entity["organization","The Seattle Times","daily newspaper, seattle"] - Major daily newspaper in the region (web access may vary), widely cited as the largest-circulation paper in the state. citeturn18search8turn19search8

F03-08 entity["organization","PubliCola","local politics blog, seattle"] - Local politics and city-focused reporting and commentary. citeturn19search1

F03-09 entity["organization","Capitol Hill Seattle","hyperlocal news, seattle"] - Neighborhood-focused news site with public-safety and local development coverage. citeturn19search3turn19search7

F03-10 entity["organization","West Seattle Blog","hyperlocal news, seattle"] - High-tempo neighborhood blog with traffic alerts, events, and breaking local updates. citeturn17search3turn20search32

F03-11 entity["organization","My Ballard","hyperlocal news, seattle"] - Neighborhood blog for Ballard and nearby areas, including events and local business updates. citeturn19search2turn19search14

F03-12 entity["organization","EverOut Seattle events feed","events discovery, seattle"] - Events discovery feed used for “what’s happening” scanning (today, weekend, and beyond). citeturn16search0turn16search3

```text
F03-01 https://www.kuow.org/
F03-02 https://www.cascadepbs.org/news/
F03-03 https://www.king5.com/
F03-04 https://www.kiro7.com/news/
F03-05 https://komonews.com/
F03-06 https://www.thestranger.com/
F03-07 https://seattletimes.com/
F03-08 https://publicola.com/
F03-09 https://www.capitolhillseattle.com/
F03-10 https://westseattleblog.com/
F03-11 https://www.myballard.com/
F03-12 https://everout.com/seattle/
```

F04
Reference patterns from your project and minimal “tool index” building blocks

F04-01 entity["organization","info.zharii.com","personal portal placeholder, seattle"] - Currently a minimal placeholder page (“Hello World”), suitable as the landing slot for your curated Seattle ops index. citeturn0view0

F04-02 entity["organization","toys.awwtools.com","personal tools index, web"] - Minimal tool collection site with a strong “works offline / privacy-first” positioning and a link-out to source. citeturn0view2

F04-03 entity["organization","dzharii/toys-awwtools-com","github repo, toys site"] - GitHub repository for the toys site (useful as a reference implementation for structure, previews, and deployment conventions). citeturn32view0

F04-04 entity["organization","Seattle Open Data Portal","datasets, seattle"] - City dataset portal entry point (useful for building your own “live tiles” and dashboards). citeturn5search4turn5search20

F04-05 entity["organization","King County Open Data onboarding page","data portal guide, king county"] - “Getting started” guide framing how to use the county open data portal. citeturn5search21

F04-06 entity["organization","pig.observer Seattle traffic cams","community cam aggregator, seattle"] - Community-made traffic cam aggregator that notes it sources data from SDOT. citeturn7search21turn7search11

F04-07 entity["organization","Seattle Customer Service Bureau Find It, Fix It app page","service request app, seattle"] - Explains the Find It, Fix It mobile app and how it supports reporting selected city issues with photo/location. citeturn9search8turn9search0

F04-08 entity["organization","Seattle Public Utilities Utility Services portal","utility self-service, seattle"] - Utility self-service portal bundling outage map entry points and reporting numbers. citeturn8search6turn8search18

```text
F04-01 https://info.zharii.com/
F04-02 https://toys.awwtools.com/
F04-03 https://github.com/dzharii/toys-awwtools-com
F04-04 https://data.seattle.gov/
F04-05 https://data.kingcounty.gov/stories/s/Getting-Started-on-the-Open-Data-Portal/hs9f-jhiq/
F04-06 https://pig.observer/seattle/
F04-07 https://www.seattle.gov/customer-service-bureau/find-it-fix-it-mobile-app
F04-08 https://myutilities.seattle.gov/
```