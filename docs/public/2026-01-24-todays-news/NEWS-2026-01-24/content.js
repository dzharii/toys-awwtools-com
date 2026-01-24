/* Content authoring file:
 * - ONLY edit this file to change the newspaper content.
 * - main.js provides the fluent API + validation.
 */
(() => {
  'use strict';

  // Create builder and render into #app
  const paper = window.NewspaperKit.create({
    mount: '#app',
    debug: true
  });

  paper
    .masthead({
      title: 'AI Gazette',
      subhead: 'Seattle, WA - Saturday January 24, 2026 - Daily Brief'
    })

    // Column 1
    .addColumn(col => col
      .headline({ level: 3, text: 'Seattle and Region' })
      .headline({ level: 4, text: 'Weather shifts and regional movement' })
      .p(`Seattle is headed for a record-dry January stretch - The region is tracking one of its driest, mildest Januarys in recent years. As of Thursday the city had gone 10 straight days without measurable rain, and Sea-Tac Airport has logged about 3.3 inches this month versus a January average just over 5.5. Axios reports a temperature inversion is trapping moisture near the surface, producing overnight fog. Forecasts show a high-pressure ridge keeping conditions mostly dry into the middle of next week.`)
      .p(`Axios Seattle | Date: 2026-01-23 | URL: https://www.axios.com/local/seattle/2026/01/23/seattle-dry-january-2026-dry-temperatures-mild-fog`)
      .p(`How Sea-Tac Airport is combating chaos with construction - KUOW's Seattle Now describes ongoing construction across the airport as travel demand builds toward this summer's World Cup. Projects include widening roadways and revamping the C Concourse, with officials racing to finish upgrades on a tight timeline. The segment features a discussion with Seattle Times business reporter Lauren Rosenblatt about the scale of the work and how it may affect travelers.`)
      .p(`KUOW | Date: 2026-01-14 | URL: https://www.kuow.org/stories/how-sea-tac-airport-is-combating-chaos-with-construction`)
    )

    // Column 2
    .addColumn(col => col
      .headline({ level: 3, text: 'City and Policy' })
      .headline({ level: 4, text: 'City decisions and policy signals' })
      .p(`Councilmember Kettle statement on Seattle's enforcement of public drug use laws - Councilmember Bob Kettle issued a statement after reports suggested Seattle had stopped making drug-related arrests in 2026, while the Mayor's Office and Seattle Police said there was no policy change. He said the confusion should be used as a chance to examine how the public-drug-use ordinance is working in practice. Kettle voiced support for diversion programs like LEAD but said some cases still require criminal-justice enforcement. He called the moment an opportunity to improve the ordinance.`)
      .p(`Seattle City Council Blog | Date: 2026-01-05 | URL: https://council.seattle.gov/2026/01/05/councilmember-kettle-statement-on-seattles-enforcement-of-public-drug-use-laws/`)
      .p(`Mayor Harrell Launches New Responsible AI Plan and Community Innovation Hackathon Series - The City announced a 2025-2026 AI Plan that updates its responsible-use policy and expands guidance beyond generative AI. The plan includes staff trainings and new enterprise tools, plus a new citywide AI leadership role to coordinate deployments. It also launches a Community Innovation Hackathon Series, beginning with a Youth Connector hackathon on Sept. 11 focused on improving access to youth programs. Officials said the initiative aims to speed up services like permitting while keeping accountability and privacy principles in place.`)
      .p(`Tech Talk (Seattle IT) | Date: 2025-09-11 | URL: https://techtalk.seattle.gov/2025/09/11/mayor-harrell-launches-new-responsible-ai-plan-and-community-innovation-hackathon-series/`)
    )

    // Column 3
    .addColumn(col => col
      .headline({ level: 3, text: 'Transit and Infrastructure' })
      .headline({ level: 4, text: 'Service changes and major projects' })
      .p(`1 Line service schedule for weekend Jan. 23-25 - Sound Transit says the 1 Line will be suspended between Capitol Hill and SODO from 10 p.m. Friday, Jan. 23 through Saturday, Jan. 24 while crews test automatic train protection in the Downtown Seattle Transit Tunnel. Shuttle buses will replace trains between those stations every 10-15 minutes, while trains run every 15 minutes between Lynnwood and Capitol Hill and between SODO and Federal Way. The agency canceled planned work for Sunday, Jan. 25, restoring a normal Sunday schedule. Additional game trains and special Sounder trips will be ready for Seahawks fans.`)
      .p(`Sound Transit | Date: 2026-01-22 | URL: https://www.soundtransit.org/get-to-know-us/news-events/news-releases/1-line-service-schedule-weekend-jan-23-25`)
      .p(`WSDOT, SDOT, Sound Transit, King County Metro prep for major Seattle Revive I-5 construction starting Jan. 9, weather permitting - WSDOT says northbound I-5 will close from I-90 to Northeast 45th Street starting as early as 11:59 p.m. Friday, Jan. 9 through Monday, Jan. 12 to establish a work zone on the Ship Canal Bridge. After reopening, two northbound lanes will remain closed until early June, with express lanes running northbound-only 24 hours a day. The preservation project includes resurfacing the bridge deck, replacing expansion joints, and improving drainage. Work will pause for FIFA World Cup matches in Seattle from June 8 to July 10 before resuming later in 2026.`)
      .p(`WSDOT | Date: 2026-01-06 | URL: https://wsdot.wa.gov/about/news/2026/wsdot-sdot-sound-transit-king-county-metro-prep-major-seattle-revive-i-5-construction-starting-jan-9`)
    )

    // Column 4
    .addColumn(col => col
      .headline({ level: 3, text: 'Public Safety' })
      .headline({ level: 4, text: 'Incidents and enforcement updates' })
      .p(`Man with 'WAR' hat arrested for having shotgun in crowd at Space Needle New Year's celebration - Seattle police arrested a 21-year-old man after reports that he was sitting near the Pacific Science Center with a partially concealed shotgun during New Year's Eve festivities. Officers said the call came around 7:20 p.m. Dec. 31, and the man also had a pistol and ammunition. KIRO 7 reported he cooperated with officers and had a valid concealed-carry permit. He was booked into King County Jail for unlawful use of weapons and given a one-year trespass warning at Seattle Center.`)
      .p(`KIRO 7 | Date: 2026-01-01 | URL: https://www.kiro7.com/news/local/man-with-war-hat-arrested-having-shotgun-crowd-space-needle-new-years-celebration/AAF56ORRAVEMDKHWZBKJPTTCBY/`)
      .p(`Seattle's first 2026 homicide stems from a shooting more than 50 years ago - KUOW reports that 71-year-old Joseph Garrett died Jan. 4, becoming Seattle's first homicide of 2026. The fatal injury traces back to a 1973 shooting outside Garfield High School, and the suspected shooter was never charged and is now dead. The King County Prosecuting Attorney's Office said it may be the longest delayed-death homicide in the county. Officials noted these cases are unusual but do occur when victims die years after an assault.`)
      .p(`KUOW | Date: 2026-01-23 | URL: https://www.kuow.org/stories/seattle-s-first-2026-homicide-stems-from-a-shooting-more-than-50-years-ago`)
    )

    // Column 5
    .addColumn(col => col
      .headline({ level: 3, text: 'Business and Tech' })
      .headline({ level: 4, text: 'Companies, investment, and local industry' })
      .p(`Here's where Seattle ranks among U.S. cities based on capital raised - GeekWire reports that a Carta analysis ranked Seattle No. 6 for startup capital raised in 2025, with nearly $2 billion, about 2.9% of the total on the platform. The Bay Area led the list at roughly 39%, followed by New York and Los Angeles. Seattle placed fourth among software-as-a-service hubs and landed between sixth and eighth in categories such as AI, hardware, and fintech. The piece cites recent large regional rounds including TerraPower and Helion Energy.`)
      .p(`GeekWire | Date: 2026-01-08 | URL: https://www.geekwire.com/2026/heres-where-seattle-ranks-among-u-s-cities-based-on-capital-raised/`)
      .p(`After 100 years, a Northwest symbol of Japanese culture returns to Tacoma - KUOW reports that Uwajimaya plans a new Tacoma store slated to open in 2027, returning to the city where the company's founders opened their first shop in 1928. The proposed location is the former Hobby Lobby space near Target at Tacoma Central, and the store is expected to be more than 6,000 square feet. CEO Denise Moriguchi said the design will follow a "village concept" with multiple tenants and shared gathering areas. The company also plans an Issaquah expansion, which would bring its Northwest footprint to six stores.`)
      .p(`KUOW | Date: 2026-01-15 | URL: https://www.kuow.org/stories/after-100-years-a-northwest-symbol-of-japanese-culture-returns-to-tacoma`)
    )

    // Column 6
    .addColumn(col => col
      .headline({ level: 3, text: 'Environment' })
      .headline({ level: 4, text: 'Ecosystems, climate, and cleanup' })
      .p(`Hanford cleanup gets record $3.2 billion budget - The Washington Department of Ecology said Congress approved a record $3.2 billion for Hanford cleanup in fiscal year 2026, more than $200 million higher than the prior two years. The release notes the funding is still below the state's estimate of a fully compliant budget but marks progress on legally required cleanup milestones. Ecology highlighted recent milestones, including agreements to address 56 million gallons of radioactive tank waste and progress toward vitrifying waste into glass. Officials said the work will continue for decades to protect the Columbia River and surrounding communities.`)
      .p(`Washington Department of Ecology | Date: 2026-01-15 | URL: https://ecology.wa.gov/about-us/who-we-are/news/2026/jan-15-hanford-cleanup-gets-record-3-2-billion-budget`)
      .p(`VIDEO: A unique salmon recovery partnership in King County has proven to be an effective model for collective impact - King County says a regional salmon-recovery partnership formed 25 years ago has reconnected 730 acres of floodplain and completed 719 projects. The coalition has planted nearly 1,500 acres of native riparian vegetation while improving water quality and reducing flood risk. At a 25th-anniversary summit at the University of Washington, partners signed a new agreement to continue the work for the next decade. The county describes the approach as a watershed-scale effort that aligns investments across jurisdictions.`)
      .p(`King County DNRP Field Notes | Date: 2026-01-14 | URL: https://kingcountyfieldnotes.org/2026/01/14/video-a-unique-salmon-recovery-partnership-in-king-county-has-proven-to-be-an-effective-model-for-collective-impact/`)
    )

    // Column 7
    .addColumn(col => col
      .headline({ level: 3, text: 'Culture and Events' })
      .headline({ level: 4, text: 'Arts, heritage, and community gatherings' })
      .p(`Marvin Oliver's totem poles are set to return to Steinbrueck Park - KNKX reports that Seattle Parks plans to reinstall a pair of 50-foot totem poles by artist Marvin Oliver at Victor Steinbrueck Park near Pike Place Market. The poles were removed for restoration amid questions about whether they represent Coast Salish peoples, and the park reopened last year without them. The "Farmer's Pole" has been fully restored by Makah carver Greg Colfax, while the "Untitled" pole will be reviewed by a structural engineer before reattachment. The agency expects the poles to return to the park by March.`)
      .p(`KNKX | Date: 2026-01-13 | URL: https://www.knkx.org/arts-culture/2026-01-13/marvin-olivers-totem-poles-steinbrueck-park`)
      .p(`Stranger Suggests: Headbanging to Sludge Metal, Jumping into Freezing Water, and Eating Too Much Hot and Melty Cheese - The Stranger's weekly event roundup highlights Seattle's New Year's Day Polar Bear Plunge at Matthews Beach Park. The listing notes the plunge is free, starts at noon on Jan. 1, and will have lifeguards on duty as hundreds of participants rush into the water. It also points readers to year-round local plunge groups such as Puget Sound Plungers and Coldwater Collective for additional cold-water events around the region.`)
      .p(`The Stranger | Date: 2025-12-29 | URL: https://www.thestranger.com/stranger-suggests/2025/12/29/80384530/stranger-suggests-headbanging-to-sludge-metal-jumping-into-freezing-water-and-eating-too-much-hot-and-melty-cheese`)
    )

    // Column 8
    .addColumn(col => col
      .headline({ level: 3, text: 'Sports' })
      .headline({ level: 4, text: 'Seattle teams and fan moments' })
      .p(`Pacific Northwest Seismic Network Teams Up With Seattle Seahawks And Lumen Field To Measure Fan-Generated Shaking During 2026 NFL Playoffs - The Seahawks and the Pacific Northwest Seismic Network installed six seismic stations inside Lumen Field on Jan. 12 to measure crowd-generated shaking during the playoffs. The sensors will capture ground motion from the "12s," and PNSN plans to share real-time seismograms during the game. The team said the project builds on prior in-stadium deployments during playoff runs in 2014, 2015, and 2017. PNSN, based at the University of Washington, operates more than 700 seismic stations across Washington and Oregon.`)
      .p(`Seahawks.com | Date: 2026-01-14 | URL: https://www.seahawks.com/news/pacific-northwest-seismic-network-teams-up-with-seattle-seahawks-and-lumen-field-to-measure-fan-generated-shaking-during-2026-nfl-playoffs`)
      .p(`Mariners FanFest is sold out for the first time in club history - The Mariners announced that FanFest at T-Mobile Park has sold out, with more than 25,000 fans expected across Saturday, Jan. 31 and Sunday, Feb. 1. The club said attendees will be able to meet players, run the bases, tour the clubhouse, and take part in on-field activities. Attendance is capped at just over 12,500 per day to keep the experience manageable. The team also noted Opening Day is March 26 against the Cleveland Guardians.`)
      .p(`MLB.com | Date: 2026-01-23 | URL: https://www.mlb.com/news/mariners-fanfest-is-sold-out-for-the-first-time-in-club-history`)
    )

    .render();

})();
