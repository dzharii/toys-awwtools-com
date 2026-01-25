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
    .masthead({
      title: `AI Gazette`,
      subhead: `Seattle, WA - Sunday January 25, 2026 - Daily Brief`
    })

    // Column 1
    .addColumn(col => col
      .headline({ level: 3, text: `Seattle and Region` })
      .headline({ level: 4, text: `Neighborhood life and regional shifts` })
      .p(`SPD's report for Tuesday, Jan. 20 records a burglary arrest, a trail stabbing, and a shots-fired call - Seattle Police Department's significant incident report says officers responded around 14:28 to a residential burglary attempt, detained a suspect as he returned to a vehicle, and booked him into King County Jail. The same daily summary includes a stabbing investigation near Kobe Terrace Park and evidence collection after gunfire near Rainier Community Center off South Alaska Street. SPD says the Gun Violence Reduction Unit was notified in the firearms incident.`)
      .p(`SPD Blotter | Date: 2026-01-23 | URL: https://spdblotter.seattle.gov/2026/01/23/tuesday-january-20-2026/`)
      .p(`Broadview Branch library marks 50 years after a long community push - KUOW highlights the Seattle Public Library's Broadview Branch as it celebrates its 50th anniversary with events scheduled for Jan. 24. The story notes the city purchased the land in 1967, but delays meant the milestone celebration comes years after the expected date. Residents organized for years to secure the promised neighborhood branch, turning the library into a symbol of local persistence. The anniversary doubles as a reminder that civic projects often hinge on sustained community advocacy.`)
      .p(`KUOW | Date: 2026-01-21 | URL: https://www.kuow.org/stories/seattle-public-library-broadview-branch-50-anniversary`)
    )

    // Column 2
    .addColumn(col => col
      .headline({ level: 3, text: `City and Policy` })
      .headline({ level: 4, text: `How rules and response strategies are evolving` })
      .p(`Seattle leans further into diversion for public drug use cases - KUOW reports city leaders are emphasizing diversion and services over court referrals as the public drug use ordinance enters a new phase. The shift follows a year in which drug possession arrests and charges increased under the two-year-old law. The story describes how people arrested at known hotspots such as 12th Avenue and South Jackson Street may be released into the care of outreach workers linked to programs like LEAD. KUOW notes the approach has both vocal supporters and critics, with the debate centered on street conditions and long-term outcomes.`)
      .p(`KUOW | Date: 2026-01-22 | URL: https://www.kuow.org/stories/seattle-doubles-down-on-diversion-not-charges-for-public-drug-use`)
      .p(`Washington proposes carbon offsets changes aimed at small forest landowners - The Washington Department of Ecology announced proposed updates to the forestry protocol within the state's Cap-and-Invest program. Ecology says the changes are designed to make it easier for smaller landowners to start projects that generate offset credits for verified greenhouse gas reductions. The proposal focuses on rule adjustments rather than a new program, signaling a policy refinement phase for carbon markets. The agency framed the move as a way to broaden participation while keeping credits tied to measurable climate benefits.`)
      .p(`Washington Department of Ecology | Date: 2026-01-21 | URL: https://ecology.wa.gov/about-us/who-we-are/news/2026/jan-21-new-rules-would-make-it-easier-for-small-landowners-to-benefit-from-washington-s-carbon-of`)
    )

    // Column 3
    .addColumn(col => col
      .headline({ level: 3, text: `Transit and Infrastructure` })
      .headline({ level: 4, text: `Major connections and system resiliency` })
      .p(`Sound Transit sets March 28 opening date for the Crosslake Connection - Sound Transit announced that Link light rail will begin passenger service across the I-90 floating bridge on March 28. The Crosslake Connection completes the 2 Line by linking it with the 1 Line at International District/Chinatown Station and adds new stations at Mercer Island and Judkins Park. The agency says the change will expand the system from 55 to 63 miles and deliver peak combined headways of about every four minutes through the busiest core segment. The opening marks the first time light rail service will run on a floating bridge anywhere in the world.`)
      .p(`Sound Transit | Date: 2026-01-23 | URL: https://www.soundtransit.org/get-to-know-us/news-events/news-releases/crosslake-connection-opens-march-28`)
      .p(`Proposal would refurbish retired ferries to shore up strained sailings - KUOW reports Washington State Ferries is reviewing a private shipyard pitch to bring two retired vessels back into service. The idea would involve selling, refurbishing, and leasing back the Klahowya and Hyak, both more than 50 years old, to add short-term capacity. Supporters see the plan as a practical bridge while new boats are still years away, while skeptics question long-term cost effectiveness. KUOW frames the proposal as a response to ongoing service strain and limited fleet options.`)
      .p(`KUOW | Date: 2026-01-22 | URL: https://m.kuow.org/stories/shipyard-pitches-bringing-back-retired-state-ferries-to-bolster-strained-service`)
    )

    // Column 4
    .addColumn(col => col
      .headline({ level: 3, text: `Public Safety` })
      .headline({ level: 4, text: `Incident logs and weekend violence updates` })
      .p(`SPD's Jan. 21 incident report includes an armed robbery and multiple shots-fired calls - Seattle Police Department's significant incident report for Wednesday, Jan. 21 details a robbery involving a handgun at a community college bathroom, where suspects reportedly demanded money and left in a vehicle. The same daily report also logged shots-fired investigations, including evidence collection along Cheasty Boulevard South, with no victims found. SPD notes the Gun Violence Reduction Unit was notified in those firearms-related cases. The daily summary offers a snapshot of how quickly unrelated incidents can stack up across precincts in a single watch cycle.`)
      .p(`SPD Blotter | Date: 2026-01-23 | URL: https://spdblotter.seattle.gov/2026/01/23/wednesday-january-21-2026/`)
      .p(`Teen injured after gunfire near a Belltown venue late Friday - KIRO 7 reports a 19-year-old woman was seriously hurt in a shooting near 3rd Avenue and Wall Street around 11:37 p.m. Friday night. Seattle police say the gunfire followed a disturbance near an event space, and investigators believe shots were fired toward the venue, striking both the victim and the building. The suspect had not been arrested as of the report, and SPD asked anyone with information to contact the violent crimes tip line. The location and timing place the incident in one of downtown's busiest late-night corridors.`)
      .p(`KIRO 7 | Date: 2026-01-24 | URL: https://www.kiro7.com/news/local/woman-injured-belltown-shooting/HIWNF327PFARXDKR55ZNNYP5RQ/`)
    )

    // Column 5
    .addColumn(col => col
      .headline({ level: 3, text: `Business and Tech` })
      .headline({ level: 4, text: `Workforce cuts and everyday economics` })
      .p(`City tech leaders publish Data Privacy Week guidance ahead of Jan. 26-30 - Seattle Information Technology's Tech Talk blog published guidance for Data Privacy Week, which runs Jan. 26 through Jan. 30, outlining common online threats and practical defenses. The post highlights risks such as phishing emails, fake websites, identity theft, and weak privacy settings, and recommends steps like secure Wi-Fi use, reputable antivirus tools, and more cautious sharing habits. By publishing ahead of the campaign window, the city frames privacy as a year-round operating need and points readers to its public privacy principles.`)
      .p(`Seattle Information Technology Tech Talk | Date: 2026-01-21 | URL: https://techtalk.seattle.gov/2026/01/21/tips-to-keep-your-personal-data-safe-during-data-privacy-week-january-26-30-2026-and-every-week/`)
      .p(`Why Seattleites are leaning on storage units as homes feel tighter - KUOW's Seattle Now examines the growing role of self-storage as residents cycle through winter cleaning, moves, and downsizing. The segment features Seattle Times business reporter Paul Roberts, who explains how smaller living spaces and life transitions can drive steady demand for off-site storage. Rather than a one-off spike, the framing suggests a durable shift in how households manage space constraints. The story connects a familiar New Year ritual to a broader local business pattern.`)
      .p(`KUOW | Date: 2026-01-21 | URL: https://www.kuow.org/stories/small-homes-have-seattle-spilling-into-storage-units`)
    )

    // Column 6
    .addColumn(col => col
      .headline({ level: 3, text: `Environment` })
      .headline({ level: 4, text: `Cleanup milestones and health research` })
      .p(`Hanford reaches a long-awaited capsule transfer milestone - Washington's Department of Ecology announced that the first batch of highly radioactive cesium and strontium capsules has been moved from aging underwater pools into dry storage at the Hanford Site. Ecology says the full project will ultimately relocate 1,936 capsules, which represent roughly one-third of the site's radioactivity, into sealed concrete casks. The agency characterized the transfer as a significant risk-reduction step, particularly in the event of an earthquake or structural failure at the storage facility. The work is governed by a legally binding deadline that requires all capsule transfers by Sept. 30, 2029.`)
      .p(`Washington Department of Ecology | Date: 2026-01-22 | URL: https://ecology.wa.gov/about-us/who-we-are/news/2026/jan-22-first-transfer-of-radioactive-capsules-complete-at-hanford-site`)
      .p(`UW study links wildfire smoke exposure to higher odds of preterm birth - The University of Washington Population Health Initiative highlights new research connecting wildfire smoke to elevated risk of preterm birth, particularly during mid-pregnancy. The study analyzed more than 20,000 births across the United States and found the association was strongest in the Western U.S., where smoke exposure tends to be more intense and frequent. Researchers point to the second trimester, around the 21st week, as a sensitive window in their analysis. The findings add weight to calls for more targeted public health guidance during smoke events.`)
      .p(`University of Washington Population Health Initiative | Date: 2026-01-21 | URL: https://www.washington.edu/populationhealth/2026/01/21/wildfire-smoke-linked-to-higher-risk-of-preterm-birth-uw-study-finds/`)
    )

    // Column 7
    .addColumn(col => col
      .headline({ level: 3, text: `Culture and Events` })
      .headline({ level: 4, text: `Food neighborhoods and festival disruptions` })
      .p(`Watershed festival announces a 2026 hiatus at the Gorge - KIRO 7 reports that Watershed, billed as the largest country music festival in the Pacific Northwest, will not take place in 2026. Organizers said the event will take a hiatus after a 13-year run at the Gorge Amphitheatre in Quincy, Washington, and did not give a detailed reason for the pause. The announcement leaves a notable gap in the region's summer concert calendar and raises questions about what might return in future seasons. The outlet noted that any updates on future plans would come directly from the organizers.`)
      .p(`KIRO 7 | Date: 2026-01-23 | URL: https://www.kiro7.com/news/local/largest-country-music-festival-wa-cancelled-2026/LTCXLJCUHNDYLMIWFA3WNAFP4M/`)
      .p(`Seattle Eats spotlights Othello with three recommended stops - KUOW's Seattle Eats collaboration with The Seattle Times zeroes in on South Seattle's Othello neighborhood with a short list of featured picks. The Jan. 22 episode highlights A.K. Pizza, Nissi Banh, and Sma5h as examples of the area's range, from hype-driven slices to longstanding staples. By anchoring the segment in specific places, the coverage functions as both a cultural snapshot and a practical guide for weekend plans. It also underscores how neighborhood-focused food reporting continues to shape where Seattleites explore next.`)
      .p(`KUOW | Date: 2026-01-22 | URL: https://www.kuow.org/stories/three-bites-of-othello`)
    )

    // Column 8
    .addColumn(col => col
      .headline({ level: 3, text: `Sports` })
      .headline({ level: 4, text: `Championship stage and preseason results` })
      .p(`Seahawks publish NFC Championship week plans ahead of Sunday's kickoff - The Seahawks detailed fan events and logistics for the NFC Championship game set for Sunday, Jan. 25 at 3:30 p.m. PT at Lumen Field. The team says the week includes a Blue Friday flag raising at the Space Needle and a branded ChampionSHIP boat tour across Seattle waterways to build momentum before kickoff. The announcement follows Seattle's divisional round win and frames the game as a citywide moment, not just a stadium event. The schedule guidance gives fans concrete times and touchpoints as the matchup approaches.`)
      .p(`Seahawks.com | Date: 2026-01-22 | URL: https://www.seahawks.com/news/seahawks-nfc-championship-game-week-events`)
      .p(`Sounders open preseason with a 2-0 loss to Brondby in Portugal - Seattle Sounders FC's match recap says the club fell 2-0 to Brondby IF on Friday, Jan. 23 at Estadio Algarve in its first preseason friendly. The report notes goals in the 29th minute and in second-half stoppage time, and says Seattle deployed two different lineups across the match as it ramps up conditioning. The recap also points ahead to the next preseason fixtures in early February, giving supporters a clear timeline for what comes next. Even in a loss, the club used the friendly to distribute minutes and test combinations.`)
      .p(`SoundersFC.com | Date: 2026-01-23 | URL: https://www.soundersfc.com/news/match-recap-sounders-fc-falls-2-0-to-brondby-in-first-preseason-friendly-of-2026`)
    )

    .render();

})();
