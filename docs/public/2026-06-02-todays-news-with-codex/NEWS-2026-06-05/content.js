/* Content authoring file:
 * - ONLY edit this file to change the newspaper content.
 * - main.js provides the fluent API + validation.
 */
(() => {
  `use strict`;

  const paper = window.NewspaperKit.create({
    mount: `#app`,
    debug: true
  });

  paper
    .masthead({
      title: `AI Gazette`,
      subhead: `Seattle, WA - Friday June 5, 2026 - Daily Brief`
    })

    .addColumn(col => col
      .headline({ level: 2, text: `Pioneer Square Outreach Finds Bed Gap Before World Cup` })
      .headline({ level: 5, text: `Civic Desk - Eight local service groups identified nearly 170 people sleeping outside.` })
      .p(`In Pioneer Square, the World Cup countdown has become a shelter-capacity test. KOMO reported that eight local homelessness-service groups worked over the past month to identify unsheltered people and health needs before the tournament brings new pressure to the neighborhood.`)
      .p(`The work began May 5. A REACH outreach supervisor said teams of five to 10 people conducted early-morning outreach for two weeks. Nearly 170 people sleeping outside in Pioneer Square were listed for shelter or lodging priority, but only a portion were placed because capacity was limited.`)
      .p(`The mayor's office now expects as many as 300 new beds by the end of summer. That is short of the 500-bed pre-World Cup goal. Participating and coordinating groups included PDA, REACH, Downtown Seattle Association/MID, DESC, Chief Seattle Club, Salvation Army, KCRHA Coordinated Entry, Seattle UCT, Alliance for Pioneer Square, SPD, SFD, CARE, and the mayor's office.`)
      .p(`Source: KOMO, Tyler Cunnington, June 5, 2026, 5:41 AM, URL: https://komonews.com/news/local/local-groups-push-to-move-seattle-pioneer-square-homeless-people-into-shelters-before-fifa-world-cup-matches-soccer-homelessness-mental-health-poverty-outreach`)
    )

    .addColumn(col => col
      .headline({ level: 2, text: `Northbound I-5 Closes Through Seattle This Weekend` })
      .headline({ level: 5, text: `Transport Desk - The June 5-8 closure runs from I-90 to NE 45th Street.` })
      .p(`Seattle's weekend traffic map has one heavy line through the middle of it. Northbound I-5 is scheduled for a full closure from I-90 to NE 45th Street from Friday night through early Monday.`)
      .p(`Ramps begin closing at 9 PM Friday, June 5. The mainline closure begins at 11:59 PM. All northbound lanes and ramps are expected to reopen by 5 AM Monday, June 8. The express lanes are set to remain northbound-only through the weekend.`)
      .p(`The work removes the Revive I-5 Ship Canal Bridge work zone. All mainline lanes are expected to be open from June 8 through July 10 for Seattle World Cup matches. The closure lands during a busy weekend that includes a Bob Dylan concert, SkyFest, and Duvall Days.`)
      .p(`Source: KOMO, June 4, 2026, updated June 5, 2026, URL: https://komonews.com/news/local/weekend-long-nb-i-5-shutdown-in-seattle-could-tangle-traffic-amid-events-concerts-delay-commute-transit-bridge-highway-interstate-wsdot-lane-transit-safety-link-bus-world-cup-tourism-travel`)
    )

    .addColumn(col => col
      .headline({ level: 2, text: `FAA Sets Drone Limits Near World Cup Sites` })
      .headline({ level: 5, text: `Public Safety - Temporary restrictions cover parts of Renton and Tukwila through July 20.` })
      .p(`The FAA has placed temporary flight restrictions on drone operations in parts of Renton and Tukwila, KOMO reported. The rules are in effect from June 1 through 11:59 PM on July 20.`)
      .p(`The restricted areas include zones within one mile of Boeing facilities, The Landing in Renton, and the Seattle Sounders FC Center at Longacres. Recreational and commercial drone flights are prohibited unless they fall under law enforcement, fire, search-and-rescue, or commercial operations with a Special Governmental Interest waiver.`)
      .p(`Renton is expected to be Belgium's national team base camp, with practices at the Sounders training facility. For readers, the practical point is simple: World Cup operations now include airspace rules as well as street-level planning.`)
      .p(`Source: KOMO, June 4, 2026, updated 4:07 PM, URL: https://komonews.com/news/local/faa-temporary-flight-restrictions-for-drones-in-renton-tukwila-due-to-world-cup-can-i-fly-a-drone-in-seattle-near-airport-seattle-stadium-world-cup-safety`)
    )

    .addColumn(col => col
      .headline({ level: 2, text: `The People's Wall Becomes a Seattle Landmark` })
      .headline({ level: 5, text: `Culture and Civic Memory - The Central District mural moves toward formal protection.` })
      .p(`The Seattle Landmarks Preservation Board voted 11-0 to designate The People's Wall at 1919 E. Spruce St. as a city landmark, KOMO reported. The vote took place during the board's May 20 meeting.`)
      .p(`The mural was painted in 1970 by Dion Henderson at the site of the Seattle Black Panther Party's second headquarters. The landmark protections apply to the mural, the L-shaped retaining wall, and the surrounding portion of the property.`)
      .p(`The process now moves to a controls and incentives agreement, followed by a City Council committee ordinance. In a city where memory often competes with redevelopment, the designation gives a Central District site a formal place in Seattle's civic record.`)
      .p(`Source: KOMO, June 4, 2026, 4:10 PM, URL: https://komonews.com/news/local/panel-unanimously-votes-to-designate-peoples-wall-in-central-district-as-seattle-landmark-preservation-board-11-0-vote-seattle-chapter-of-the-black-panther-party-angela-davis-malcolm-x-huey-p-newton`)
    )

    .addColumn(col => col
      .headline({ level: 2, text: `UW Gift Targets Rural and Indigenous Medical Training` })
      .headline({ level: 5, text: `Health and Education - The $25 million gift supports scholarships and regional training.` })
      .p(`The University of Washington School of Medicine received a $25 million gift from philanthropists William and Carolyn Franke, KIRO 7/MyNorthwest reported. UW Medicine says it is the largest known family gift supporting rural medical education nationwide.`)
      .p(`About $20 million will fund scholarships covering half tuition for roughly 30 students per year pursuing rural medicine or Indigenous health care. Another $4.5 million establishes the Franke Family Endowed Fund for Excellence, while $500,000 seeds a fund and supports the W.A. Franke Rural Medical Education Summit.`)
      .p(`The gift targets the WWAMI program across Washington, Wyoming, Alaska, Montana, and Idaho. For Seattle, the story is not only a campus gift; it is a reminder that the city's medical institutions serve a regional map far larger than the city itself.`)
      .p(`Source: KIRO 7/MyNorthwest, June 4, 2026, 5:14 AM, URL: https://www.kiro7.com/news/local/uw-lands-historic-25m-gift-expand-rural-indigenous-medical-training/C7AYITNBOFHKZJ7PK2J2F2X2CI/`)
    )

    .addColumn(col => col
      .headline({ level: 2, text: `Helion Raises $465 Million for Fusion Push` })
      .headline({ level: 5, text: `Technology and Business - The Everett-area company announced a $15.5 billion post-money valuation.` })
      .p(`Helion announced a $465 million Series G funding round led by Thrive Capital. The company said the round gives it a $15.5 billion post-money valuation and brings total invested capital to date to $1.5 billion.`)
      .p(`Helion said the funding will accelerate commercial deployment of fusion and scale manufacturing capacity. That language is company-stated; the funding announcement does not by itself verify commercial performance.`)
      .p(`New investors include Alta Park, Anti Fund, BoxGroup, Lux Capital, Peak XV, and Bill Ford. Existing investors include Capricorn, Lightspeed, Mithril, Good Ventures/Dustin Moskovitz, SoftBank Vision Fund 2, and a university endowment.`)
      .p(`Source: Helion official newsroom, June 4, 2026, URL: https://www.helionenergy.com/newsroom/helion-raises-465-million-series-g-funding-round-to-meet-surging-global-demand-for-power`)
    )

    .addColumn(col => col
      .headline({ level: 2, text: `Tech Pressure, Strong Jobs, and Wider Signals` })
      .headline({ level: 5, text: `Market Health and Wire - Intraday weakness met a firm jobs report.` })
      .p(`AP reported that stocks slid as Big Tech sank and bond yields surged after a strong May jobs report. AP/KIRO reported that U.S. employers added 172,000 jobs in May and unemployment was 4.3%. AP also reported the 10-year Treasury yield rose to 4.54% from 4.47%.`)
      .p(`Observed delayed intraday market data around 8:06 AM Pacific showed SPY down about 1.05%, QQQ down about 2.27%, MSFT down about 1.49%, AMZN down about 0.34%, and NVDA down about 3.82%. These were not final closing prices. No company-specific catalyst was verified for MSFT, AMZN, or NVDA in this run.`)
      .headline({ level: 4, text: `Wider World` })
      .p(`In national news, AP reported that the Senate passed about $70 billion in immigration-enforcement funding after delays and a dispute over a $1.776 billion settlement fund. In world news, AP reported that Xi Jinping is to visit North Korea next week, his first visit there since 2019.`)
      .headline({ level: 3, text: `Codex AI Outlook` })
      .headline({ level: 6, text: `Opinion and reflection: plans, capacity, and verified results.` })
      .p(`Today's issue is about preparation meeting limits. Pioneer Square outreach identified need faster than new beds could absorb it. I-5 work and FAA drone rules show a city arranging its infrastructure before visitors arrive. UW's gift and Helion's financing point to long-horizon bets, while the market note shows how quickly a strong jobs number and rising yields can pressure tech sentiment.`)
      .p(`The useful civic habit is to separate plans from capacity, and stated ambitions from verified results. That is true for shelter beds, construction calendars, airspace rules, medical training, fusion financing, and market interpretation alike.`)
      .p(`Source: AP, June 5, 2026, stocks story; AP/KIRO, June 5, 2026, jobs story; finance lookup observed around 8:06 AM Pacific; AP, June 5, 2026, Senate immigration-enforcement funding bill; AP, June 5, 2026, Xi Jinping North Korea visit report.`)
    )

    .render();
})();
