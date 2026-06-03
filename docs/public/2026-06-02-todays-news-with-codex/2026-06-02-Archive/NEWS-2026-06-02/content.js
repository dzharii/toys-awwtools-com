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
      subhead: `Seattle, WA - Tuesday June 2, 2026 - Daily Brief`
    })

    .addColumn(col => col
      .headline({ level: 2, text: `Oversight Gap Follows Longview Disaster` })
      .headline({ level: 5, text: `KIRO 7 reports tanks were not subject to required state or federal inspections.` })
      .p(`The Longview Nippon Dynawave Packaging disaster that killed 11 workers has opened a public question about industrial oversight. KIRO 7 reported that the white-liquor tanks involved were not subject to required state or federal inspections.`)
      .p(`The station also reported that UW occupational-health associate professor Marissa Baker said responsibility for maintenance logs and inspections is largely left to mill owners and operators. AI Gazette is framing this as an oversight issue, not as a proven cause of the disaster.`)
      .p(`Source attribution: KIRO 7, June 1, 2026, URL: https://www.kiro7.com/news/local/white-liquor-tanks-that-imploded-longview-plant-not-inspected-by-state-or-feds-experts-say/44HFU77GVVCI7H76SIIBALG3VM/`)
      .p(`WORKPLACE POLICY BRIEF - Gov. Bob Ferguson signed an executive order supporting women in the workplace who are experiencing perimenopause and menopause. The official news release list places the issue inside state workplace policy rather than treating it only as a private health matter.`)
      .p(`Source attribution: Governor Bob Ferguson official news releases, June 1, 2026, URL: https://governor.wa.gov/news/news-releases`)
    )

    .addColumn(col => col
      .headline({ level: 2, text: `World Cup Seattle Moves From Planning to Public Space` })
      .headline({ level: 5, text: `Six matches, fan zones, security work, and a Sounders link to the U.S. roster.` })
      .p(`Cristian Roldan was named to the USMNT final 26-player World Cup roster, giving Seattle a direct local tie to the national team. The United States is scheduled to play Australia at noon June 19 at Seattle Stadium, also known as Lumen Field.`)
      .p(`That match is one of Seattle's six World Cup games. Axios Seattle also listed free fan zones at Pioneer Square, Seattle Center, Waterfront Park, Pacific Place, and Victory Hall in SoDo.`)
      .p(`Source attribution: Axios Seattle, June 1, 2026, URL: https://www.axios.com/local/seattle/2026/06/01/cristian-roldan-world-cup-seattle-match-usmnt-sounders-fifa-washington`)
      .p(`Seattle expects about 750,000 regional World Cup visitors and six matches, with free Unity Loop public events beginning June 11. SeattleFWC26 lists event locations including Seattle Center, Waterfront Park, Pacific Place, and Victory Hall in SoDo.`)
      .p(`FOX 13 reported that federal and local authorities are ramping up security planning, with attention extending beyond counterterrorism to issues including human trafficking. The story belongs as a civic-preparation item: public space, tourism, safety, and transportation will all meet during the tournament period.`)
      .p(`Source attribution: SeattleFWC26 official site and FOX 13, May 29, 2026, URLs: https://seattlefc26.com/ and https://www.fox13seattle.com/video/fmc-jkp1au6rk8h8onqd`)
    )

    .addColumn(col => col
      .headline({ level: 2, text: `Washington Ferries Mark 75 Years` })
      .headline({ level: 5, text: `A birthday for civic infrastructure, highway service, and regional habit.` })
      .p(`Washington State Ferries began its 75th anniversary celebrations with a Space Needle flag, a Colman Dock ORCA station, special lighting and signage, ferry DJ sets, and anniversary flags. The observance treats the system as both civic infrastructure and a regional symbol.`)
      .p(`Steve Nevey described ferries as part of the highway system and a public good. That framing matters because the ferry network is not only a travel amenity; for many communities, it is an essential route.`)
      .p(`Source attribution: KIRO 7, June 1, 2026, URL: https://www.kiro7.com/news/local/washington-state-ferries-celebrates-its-75th-birthday-with-giveaways-events-more/MFINBCIT6RCCTFNCJYLPA2FKDI/`)
      .p(`KRAKEN OWNERSHIP NOTE - Melinda French Gates is set to become a minority investor in the Seattle Kraken ownership group, pending NHL approval. The move would add one of the region's most visible civic and philanthropic figures to the ownership structure around the team.`)
      .p(`One Roof Sports and Entertainment is the parent of the Kraken and Climate Pledge Arena. It has said it would pursue an NBA team if the league moves forward with expansion, making the ownership news relevant beyond hockey.`)
      .p(`Source attribution: KIRO 7, June 1, 2026, URL: https://www.kiro7.com/news/local/melinda-french-gates-become-minority-investor-seattle-kraken/PSYJLJO2YNC4PJEQZE4ST7EUQQ/`)
    )

    .addColumn(col => col
      .headline({ level: 2, text: `War and Politics Abroad and at Home` })
      .headline({ level: 5, text: `Ukraine, Lebanon, Hormuz, and a six-state primary day.` })
      .p(`A massive Russian missile and drone attack killed 18 people across Ukraine, according to AP News. The attacks included Kyiv and other cities, keeping civilian danger and air-defense needs at the center of the war.`)
      .p(`Ukrainian President Volodymyr Zelenskyy appealed for more U.S. and European support. The story belongs because it is a major war development with direct consequences for diplomacy, military aid, and civilian protection.`)
      .p(`Source attribution: AP News, updated June 2, 2026, URL: https://apnews.com/article/938c74b107d9bb8dc16b179d76125e50`)
      .p(`Iran stopped communicating with mediators after Israel threatened to bomb Beirut while fighting Hezbollah in Lebanon, AP News reported. The halt adds diplomatic uncertainty to an already wider regional conflict.`)
      .p(`AP also reported that ceasefire talks included an effort to loosen Iran's chokehold on the Strait of Hormuz, through which a fifth of oil and natural gas passed in peacetime. That gives the story a direct energy-security and market-risk dimension.`)
      .p(`Source attribution: AP News, updated June 2, 2026, URL: https://apnews.com/article/9bde9a3425d4b9ff70f157bdae0fb982`)
      .p(`Voters in California, Iowa, Montana, New Jersey, New Mexico, and South Dakota cast primary ballots on June 2. AP highlighted California's race for governor to succeed term-limited Gavin Newsom and Democratic efforts in Iowa.`)
      .p(`Source attribution: AP News, June 2, 2026, URL: https://apnews.com/article/4355e73b946486ac92452ec856966d7e`)
    )

    .addColumn(col => col
      .headline({ level: 2, text: `Markets Pause After Records` })
      .headline({ level: 5, text: `A delayed market-health read, not investment advice.` })
      .p(`U.S. stocks paused or slipped after recent record highs in June 2 market coverage. Alphabet weighed on indexes, while Hewlett Packard Enterprise rose sharply after strong AI-server-related results and targets.`)
      .p(`The broader market context remained tied to AI and data-center infrastructure demand, which continued to support some technology names. Middle East tension and rate-cut expectations also remained part of the market backdrop.`)
      .p(`This is not investment advice, and AI Gazette is not publishing exact market numbers because final closing data was not independently verified during this run.`)
      .p(`Source attribution: MarketScreener, Pittsburgh Post-Gazette, and Yahoo Finance market coverage for June 2, 2026, URLs: https://www.marketscreener.com/news/wall-street-futures-tick-lower-after-record-highs-hpe-soars-ce7f5dded98bf720 , https://www.post-gazette.com/business/money/2026/06/02/stock-market-today-june-2-2026/stories/202606020041 , https://sg.finance.yahoo.com/news/stock-market-today-tuesday-june-2-ai-231755175.html`)
    )

    .render();
})();
