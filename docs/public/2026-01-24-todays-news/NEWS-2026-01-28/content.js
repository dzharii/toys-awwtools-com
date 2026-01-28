/* Content authoring file:
 * - ONLY edit this file to change the newspaper content.
 * - main.js provides the fluent API + validation.
 */
(() => {
  `use strict`;

  // Create builder and render into #app
  const paper = window.NewspaperKit.create({
    mount: `#app`,
    debug: true
  });

  paper
    .weather({
      title: `Weather for Seattle, King County`,
      details: `Cloudy, 44F (7C). Tue Jan 27: Low 43F (6C), High 52F (11C), considerable cloudiness. Wed Jan 28: Low 46F (8C), High 51F (10C), cloudy with a morning shower in spots and occasional afternoon rain and drizzle.`
    })
    .masthead({
      title: `AI Gazette`,
      subhead: `Seattle, WA - Wednesday January 28, 2026 - Daily Brief`
    })

    // Column 1
    .addColumn(col => col
      .headline({ level: 3, text: `Seattle and Region` })
      .headline({ level: 4, text: `Jobs, science, and local impact` })
      .p(`MIN_ITEMS, ATTRIBUTION. Seattle metro job market shrank in 2025, ending the post-pandemic growth streak - KUOW reports the Puget Sound Regional Council's estimates show the four-county Seattle metro area lost about 13,000 jobs in 2025. The region typically adds roughly 40,000 jobs in a strong year, so the dip stands out alongside rare downturn years like 2001 and 2009. The story notes the metro area spans King, Pierce, Snohomish, and Kitsap counties and frames the change as the first annual contraction since the COVID era.`)
      .p(`KUOW | Date: 2026-01-27 | URL: https://www.kuow.org/stories/rare-club-of-years-when-seattle-metro-lost-jobs-welcomes-new-member-2025`)
      .p(`UW astronomers log a record-breaking asteroid observation using Rubin Observatory images - KNKX reports University of Washington astronomers used early imagery from the Vera C. Rubin Observatory to document a record-setting asteroid observation as the survey project ramps up. Researchers said the object poses no impact risk and emphasized that rapid detection is the point of the Rubin program's wide-field scans. The report highlights the UW team's role in early data validation and how the observatory is expected to expand near-Earth object tracking.`)
      .p(`KNKX | Date: 2026-01-27 | URL: https://www.knkx.org/2026-01-27/university-of-washington-astronomers-record-breaking-asteroid`)
    )

    // Column 2
    .addColumn(col => col
      .headline({ level: 3, text: `City and Policy` })
      .headline({ level: 4, text: `Legal responses and civic pressure` })
      .p(`Washington, King County, and Seattle join lawsuit tied to ICE actions in Minnesota - KOMO reports the state of Washington, King County, and the City of Seattle joined a lawsuit connected to immigration enforcement actions stemming from a Minnesota incident that has triggered protests nationwide. Local officials said the case challenges how ICE operated in that episode and seeks limits on similar actions in Washington. The story notes leaders framed the filing as a response to fear in immigrant communities and to questions about federal-local coordination.`)
      .p(`KOMO News | Date: 2026-01-27 | URL: https://komonews.com/news/politics/washington-state-king-county-seattle-join-in-lawsuit-addressing-ice-actions-in-minnesota-worst-case-ice-scenario-in-washington-immigration-enforcement-arrest-legal-illegal-arrest-pretti-renee-good-minnesota-shooting-trump-vance-seattle-immigrant-border`)
    )

    // Column 3
    .addColumn(col => col
      .headline({ level: 3, text: `Transit and Infrastructure` })
      .headline({ level: 4, text: `Rail changes and system expansions` })
      .p(`Sound Transit sets March 28 opening for the Crosslake Connection - The agency announced Link light rail will begin passenger service across the I-90 floating bridge on March 28, completing the 2 Line by linking with the 1 Line at International District/Chinatown Station. The opening adds new stations at Mercer Island and Judkins Park and expands the system from about 55 to 63 miles. Sound Transit said peak combined headways through the central segment will be roughly every four minutes, a major change for riders traveling between Seattle and the Eastside.`)
      .p(`Sound Transit | Date: 2026-01-23 | URL: https://www.soundtransit.org/get-to-know-us/news-events/news-releases/crosslake-connection-opens-march-28`)
      .p(`Sound Transit plans a 1 Line suspension between Capitol Hill and SODO for Jan 23-25 work - The agency said trains would be suspended between Capitol Hill and SODO starting 10 p.m. Friday and continuing through Saturday for automatic train protection testing in the downtown tunnel. Shuttle buses would replace trains between those stations, while trains run every 15 minutes between Lynnwood and Capitol Hill and between SODO and Federal Way. Sound Transit later canceled the planned Sunday work, restoring a normal Sunday schedule.`)
      .p(`Sound Transit | Date: 2026-01-22 | URL: https://www.soundtransit.org/get-to-know-us/news-events/news-releases/1-line-service-schedule-weekend-jan-23-25`)
    )

    // Column 4
    .addColumn(col => col
      .headline({ level: 3, text: `Public Safety` })
      .headline({ level: 4, text: `Investigations and emergency response` })
      .p(`Darrington schools evacuated after a bomb threat call to the district office - KIRO 7 reports Darrington Elementary and Darrington High School evacuated after an automated voice call threatened to bomb district buildings. The district said students and staff were safe while law enforcement cleared the sites, and a Washington State Patrol bomb technician responded. The report notes the threat was made to the district office and prompted a coordinated emergency response.`)
      .p(`KIRO 7 | Date: 2026-01-27 | URL: https://www.kiro7.com/news/local/two-darrington-schools-evacuated-after-someone-calls-bomb-threat/DPZCVFJBA5HABL5EBCFYN74RCM/`)
      .p(`Man critically injured in a shooting near Seattle's Aurora Avenue - KIRO 7 reports a 20-year-old man was in critical condition after a shooting along Aurora Avenue in north Seattle. Officers responded to the area and opened an investigation while medical crews transported the victim. The report describes the shooting as part of a continuing public safety concern along the Aurora corridor and notes police were seeking information from witnesses.`)
      .p(`KIRO 7 | Date: 2026-01-27 | URL: https://www.kiro7.com/news/local/man-critically-injured-shooting-along-seattles-aurora-avenue/DJBZJDA37FGIVDDZQARDZ4I4BA/`)
    )

    // Column 5
    .addColumn(col => col
      .headline({ level: 3, text: `Business and Tech` })
      .headline({ level: 4, text: `Workforce shifts and research labs` })
      .p(`Amazon prepares another round of cuts with roles tied to Washington state - KIRO 7, citing Reuters, reports Amazon is preparing to lay off thousands of employees as part of ongoing cost controls. The story says the reductions could affect multiple business units and include roles in Washington state, continuing a multi-year effort to trim headcount. The report frames the move as another sign of pressure to balance growth investments with profitability.`)
      .p(`KIRO 7 | Date: 2026-01-27 | URL: https://www.kiro7.com/news/local/amazon-set-lay-off-thousands-washington-state/OJDZS36VKBGBPDUFDE4NE352YQ/`)
      .p(`AI2 open-sources SERA coding agents to train on an organization's own codebase - GeekWire reports the Allen Institute for AI released an open-source toolkit called SERA that lets organizations train coding agents using their internal repositories. The project is designed to run at relatively low cost and focuses on modular, reusable components rather than monolithic models. The institute said the goal is to make codebase-specific agents easier to prototype and share across teams.`)
      .p(`GeekWire | Date: 2026-01-27 | URL: https://www.geekwire.com/2026/ai2-cooks-up-open-source-coding-agents-with-tech-equivalent-of-a-hot-plate-and-a-frying-pan/`)
    )

    // Column 6
    .addColumn(col => col
      .headline({ level: 3, text: `Environment` })
      .headline({ level: 4, text: `Dry streak watch and sky science` })
      .p(`Seattle's 14-day dry streak could end tonight as rain approaches - KIRO 7 reports Sea-Tac had gone 14 consecutive days without measurable rainfall as of Monday, one day shy of the all-time January record from 1963. National Weather Service forecasters told the outlet rain was most likely between about 9 p.m. and midnight Tuesday, which would end the streak at 14 days. The story notes the dry spell has pushed the region close to record territory for midwinter rain gaps.`)
      .p(`KIRO 7 | Date: 2026-01-27 | URL: https://www.kiro7.com/news/local/seattles-14-day-dry-streak-could-end-tonight-rainfall-approaches/LSYZFYHYVBD5RJIJYJXGMNHMAQ/`)
      .p(`Western Washington nears its longest midwinter dry streak in decades - KIRO 7 reports the region hit a 13th straight day without measurable rain on Monday, with the 1963 record standing at 15 days and a longer 18-day stretch dating back to 1901. Meteorologists said a persistent high-pressure ridge has kept storms off the coast while daytime highs lingered in the upper 40s to low 50s. The report notes the streak's rarity for a midwinter period in the Puget Sound region.`)
      .p(`KIRO 7 | Date: 2026-01-26 | URL: https://www.kiro7.com/weather/western-wa-approaches-longest-mid-winter-dry-streak-60-years/TNVWH252T5B5HPN4EASWPAAV2E/`)
    )

    // Column 7
    .addColumn(col => col
      .headline({ level: 3, text: `Culture and Events` })
      .headline({ level: 4, text: `Week-ahead picks and community memorials` })
      .p(`Seattle Met's weekly guide highlights museum food and a butterfly landing - Seattle Met's roundup of things to do points readers to the National Nordic Museum's food festival and a butterfly-themed event at Benaroya Hall. The guide frames the week as a mix of winter indoor experiences and neighborhood outings. It serves as a practical checklist for planning local time off and nearby cultural stops.`)
      .p(`Seattle Met | Date: 2026-01-21 | URL: https://www.seattlemet.com/arts-and-culture/what-to-do-in-seattle-this-week-1`)
      .p(`Cal Anderson Park memorial grows as nightly vigils continue on Capitol Hill - Capitol Hill Seattle Blog posted photos and details from a memorial in Cal Anderson Park tied to deaths linked to immigration enforcement. The report notes ongoing nightly vigils and a growing public display of candles, notes, and artwork. The coverage situates the memorial within continuing local organizing on Capitol Hill and documents how the site has become a gathering point for community mourning and advocacy.`)
      .p(`Capitol Hill Seattle Blog | Date: 2026-01-27 | URL: https://www.capitolhillseattle.com/2026/01/chs-pics-a-cal-anderson-memorial-to-those-lost-to-ice-violence/`)
    )

    // Column 8
    .addColumn(col => col
      .headline({ level: 3, text: `Sports` })
      .headline({ level: 4, text: `Seahawks punch their Super Bowl ticket` })
      .p(`Seahawks beat the Rams 31-27 to advance to Super Bowl LX - Seattle's official recap says the Seahawks won the NFC Championship 31-27 and will face the New England Patriots in Super Bowl LX. The game win secures the team's return to the league title stage and sets a Feb. 8 matchup at Levi's Stadium in Santa Clara, California. The report highlights the late-game finish and points to the championship preparations that begin immediately.`)
      .p(`Seahawks.com | Date: 2026-01-25 | URL: https://www.seahawks.com/news/seahawks-defeat-rams-to-advance-to-super-bowl-lx`)
      .p(`Seahawks celebrate a Super Bowl berth after the NFC title win - Seahawks.com recaps the locker room and on-field celebrations following the 31-27 victory that sent Seattle to the Super Bowl. The story describes the mood as the team closed a high-stakes run and turned attention to the championship game ahead. It also notes the win delivered the franchise's first NFC title in more than a decade, underscoring the scale of the moment for players and fans.`)
      .p(`Seahawks.com | Date: 2026-01-27 | URL: https://www.seahawks.com/news/seahawks-are-headed-to-the-super-bowl`)
    )

    // Column 9 (status)
    .addColumn(col => col
      .headline({ level: 3, text: `` })
      .headline({ level: 4, text: `STATUS` })
      .p(`INCOMPLETE: Category minimums were not met and some item dates could not be fully confirmed during this run.`)
    )

    .render();

})();
