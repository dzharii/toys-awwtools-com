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
      subhead: `Seattle, WA - Wednesday June 3, 2026 - Daily Brief`
    })

    .addColumn(col => col
      .headline({ level: 2, text: `Deadline Set for Homelessness Authority Reckoning` })
      .headline({ level: 5, text: `Civic Desk - A 9-0 Seattle vote gives the Mayor's Office until August 1.` })
      .p(`Seattle's homelessness government now has a date on the ledger. The Seattle City Council voted 9-0 on June 2 for a resolution giving the Mayor's Office until August 1 to return with a recommendation on the future of the King County Regional Homelessness Authority.`)
      .p(`The matter arrives with hard arithmetic already in view. KIRO 7 and MyNorthwest reported audit context of $13 million mismanaged amid a $45 million deficit. A KCRHA committee discussion is expected June 5.`)
      .p(`The vote does not settle the authority's fate. It narrows the question. Seattle has asked for a recommendation, and the clock now belongs to the mayor's side of City Hall.`)
      .p(`Source: KIRO 7 / MyNorthwest, June 3, 2026, URL: https://www.kiro7.com/news/local/seattle-council-gives-mayor-until-august-1-recommend-future-king-county-homelessness-agency/FXFDYJH7DVA27GWU2RAZ2SR5RE/`)
    )

    .addColumn(col => col
      .headline({ level: 2, text: `Transit Tax Proposal Meets an Eastside Emergency` })
      .headline({ level: 5, text: `Metro Desk - City Hall proposes bus funding as Redmond crews fight a pre-dawn fire.` })
      .p(`Mayor Katie Wilson proposed renewing and expanding the Seattle Transit Measure with a 0.3 percent sales tax. The proposal would average $138 million annually over 10 years, fund 280,000 King County Metro bus trips a year, and provide 22,000 free ORCA passes for qualified lower-income residents.`)
      .p(`The measure would replace the current 0.15 percent tax, which expires in March 2027. If approved by the City Council and voters, the renewed measure would take effect in 2027 and last for 10 years.`)
      .p(`In the Eastside morning, KOMO reported a two-alarm fire at a landscaping business in the Ames Lake area of Redmond. Eastside Fire & Rescue said the business is in the 27900 block of Redmond Fall City Road. KOMO reported two buildings and 15 cars destroyed, SR 202 at Northeast Tolt Hill Road closed, multiple 911 calls around 3 a.m., and no injuries reported.`)
      .p(`Source: SDOT Blog / Office of the Mayor, June 2, 2026, URL: https://sdotblog.seattle.gov/2026/06/02/seattle-transit-measure-renewal/ ; KOMO News, June 3, 2026, URL: https://komonews.com/news/local/crews-battle-2-alarm-fire-at-redmond-commercial-business-ames-lake-area-redmond-fall-city-road-closure-firefighters-eastside-fire-and-rescue`)
    )

    .addColumn(col => col
      .headline({ level: 2, text: `World Cup Optimism Gets a Reality Check` })
      .headline({ level: 5, text: `Business Desk - Restaurants and hotels adjust expectations before the first Seattle match.` })
      .p(`The World Cup remains a civic and business event for Seattle, but KNKX reported a new note of caution. A survey by the American Hotel and Lodging Association found 80 percent of respondents said hotel bookings were tracking below initial forecasts.`)
      .p(`That does not mean businesses expect a poor summer. KNKX reported that hospitality leaders still expect a good season, but some are moving from broad projections to closer tactical planning. Fire & Vine Hospitality is adjusting restaurant hours and menus around match timing and visitor patterns.`)
      .p(`This is a new development rather than another security-planning item. The question has shifted from whether Seattle can host crowds to how many customers actually show up, where they go, and whether local businesses can meet them at the right hour.`)
      .p(`Source: KNKX, June 3, 2026, URL: https://www.knkx.org/business/2026-06-03/seattle-tacoma-businesses-prepare-world-cup-some-ask-how-many-fans-will-show-up`)
    )

    .addColumn(col => col
      .headline({ level: 2, text: `Bird Counts Fall as Brain Research Accelerates` })
      .headline({ level: 5, text: `Science Desk - Seattle's parks and laboratories tell different stories about long work.` })
      .p(`In a June 1 local science item, KUOW reported that a Birds Connect Seattle study found average bird counts at eight Seattle-area sites fell 21 percent from 2005 to 2023. Species diversity fell 18 percent. Sites included Golden Gardens, Seward Park, and the Washington Park Arboretum.`)
      .p(`That is not a distant climate abstraction. It is a count from places Seattle residents know by footpath, shoreline, and tree canopy.`)
      .p(`KNKX and NPR reported that the Allen Institute in Seattle launched a $400 million Brain Health accelerator focused on genetic therapies for brain disorders including Alzheimer's, Parkinson's, ALS, Lewy body dementia, and Huntington's. Funding includes $200 million from the Allen Institute, $100 million from the Bezos family, and $100 million from NIH, AWS, EverythingALS, and others.`)
      .p(`Source: KUOW, June 1, 2026, URL: https://www.kuow.org/stories/seattle-bird-populations-diversity-are-declining-new-study-finds ; KNKX/NPR, June 3, 2026, URL: https://www.knkx.org/2026-06-03/we-finally-know-enough-about-how-the-brain-breaks-to-focus-on-fixing-it-experts-say`)
    )

    .addColumn(col => col
      .headline({ level: 2, text: `Pride Opens the Civic Calendar as AI Meets Federal Review` })
      .headline({ level: 5, text: `Culture and Technology - June celebration meets a voluntary AI review path.` })
      .p(`FOX 13 Seattle's Pride guide places Pride in the Park on June 6 from noon to 7 p.m., with more than 80 vendor booths, food trucks, local LGBTQIA+ performers, DJs, drag shows, a dance floor, and a 21+ alcohol garden.`)
      .p(`The Seattle Pride Parade is set for June 28 at 11 a.m., with more than 250 contingents and an expected 300,000 people. In a Seattle issue, this is not filler. It is the opening of one of the city's major civic and cultural months.`)
      .p(`On the technology front, AP reported that President Trump signed an executive order creating a voluntary framework for federal vetting of top AI systems for national-security risks for up to 30 days before public release. For a Seattle-centered technology readership, the operative word is voluntary, but the new frame is federal review before release.`)
      .p(`Source: FOX 13 Seattle, June 2, 2026, URL: https://www.fox13seattle.com/news/seattle-pride-events-2026 ; AP News, updated June 2, 2026, URL: https://apnews.com/article/trump-ai-executive-order-e41af74f7b0865482f07d10fe7a50fe3`)
    )

    .addColumn(col => col
      .headline({ level: 2, text: `World Brief and Codex AI Outlook` })
      .headline({ level: 5, text: `World and Opinion - A distant strike, then a reflection on measurement and capacity.` })
      .p(`AP reported that Ukrainian long-range drones hit a St. Petersburg oil terminal before Russia's economic forum. Ukrainian President Volodymyr Zelenskyy said the drones flew more than 1,000 kilometers.`)
      .p(`The same report said the airport briefly suspended flights and mobile internet was cut. For a Seattle-centered paper, the brief earns its place as a world item with infrastructure, aviation, and energy implications, not as a general war roundup.`)
      .p(`Source: AP News, updated June 3, 2026, URL: https://apnews.com/article/russia-ukraine-petersburg-oil-terminal-putin-drone-887969921c595f3a81c3b6c0b120b5f3`)
      .headline({ level: 3, text: `Codex AI Outlook` })
      .headline({ level: 6, text: `Opinion and reflection: deadlines, capacity, and verification.` })
      .p(`Today's issue is a ledger of capacity. Seattle's council wants a deadline on homelessness governance. The mayor wants a larger transit measure before the current tax expires. Businesses preparing for the World Cup are revising expectations before the crowds arrive. Even the AI order is framed as a review period before release.`)
      .p(`The pattern is not panic. It is verification. Count the money before choosing KCRHA's future. Count bus trips before asking for the tax. Count hotel bookings before assuming a summer windfall. Count birds before treating urban nature as permanent. Put top AI systems through a national-security review before public release, even if the framework is voluntary.`)
      .p(`Seattle's strongest habit, when it is at its best, is practical scrutiny. The city does not lack ambition in this issue: transit expansion, Pride gatherings, brain-health research, World Cup readiness. But ambition without measurement drifts into pageantry. The useful civic question is the old one: what was promised, what was counted, and what changed after the count?`)
      .p(`Source: This column is grounded only in verified items attributed in this issue from KIRO 7 / MyNorthwest, SDOT Blog / Office of the Mayor, KOMO News, KNKX, KUOW, KNKX/NPR, FOX 13 Seattle, and AP News.`)
    )

    .render();
})();
