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
      subhead: `Seattle, WA - Thursday February 5, 2026 - Daily Brief`
    })

    .addColumn(col => col
      .headline({ level: 3, text: `Seattle and Region` })
      .headline({ level: 4, text: `Weather swings and local disruption` })
      .p(`Friday weather looks cloudy and cool before a warm weekend around Seattle - KUOW reports a cooler, cloudier Friday is expected before temperatures rebound through the weekend. The story says forecasters expect highs in the low 50s on Friday, then a move into the upper 50s for parts of the region by Sunday. Meteorologists cited shifting air flow as the reason the short cool break is likely to be brief. The forecast matters for commuters and outdoor events because drizzle chances stay low while cloud cover rises. KUOW notes this pattern follows an unusually mild run for early February in Western Washington. The main near-term takeaway is a quick transition from gray Friday conditions to warmer weekend afternoons.`)
      .p(`KUOW | Date: 2026-02-05 | URL: https://www.kuow.org/stories/friday-weather-looks-cloudy-and-cool-before-a-warm-weekend-around-seattle`)
      .p(`Officials announce completed repairs after a major Bellevue sinkhole - KING 5 reports Bellevue crews completed emergency work tied to a significant sinkhole that affected traffic and neighborhood access. City teams stabilized the damaged area, completed pavement repairs, and reopened normal movement through the corridor. The report says the incident forced short-term detours while engineers assessed underground damage and replacement needs. Local officials described the completed work as a key step to prevent recurring washout risk at the site. The closure and reopening timeline became a practical test of city response coordination and contractor mobilization. KING 5 says the repair phase is done, with follow-up monitoring expected to continue.`)
      .p(`KING 5 | Date: 2026-02-03 | URL: https://www.king5.com/article/news/local/bellevue/officials-announce-completed-repairs-after-major-bellevue-sinkhole/281-8fdf7bb7-dab2-4a2d-a8c4-be46be74ac40`)
    )

    .addColumn(col => col
      .headline({ level: 3, text: `City and Policy` })
      .headline({ level: 4, text: `Council action on sidewalks and homelessness` })
      .p(`Councilmember Moore introduces legislation to strengthen sidewalk safety and pedestrian access in Seattle - The Seattle City Council said the proposal targets sidewalk obstruction and accessibility conditions across neighborhoods. The legislation is framed as a pedestrian-first policy that aims to improve safe passage for people using wheelchairs, walkers, and strollers. Council updates describe the bill as a response to repeated complaints about blocked routes and uneven enforcement. The proposal lays out clearer standards city departments can use when prioritizing sidewalk interventions. City lawmakers said the measure is intended to improve consistency rather than rely on case-by-case reactions. The council filing marks the start of formal committee review and potential revisions before a final vote.`)
      .p(`Seattle City Council | Date: 2026-02-04 | URL: https://council.seattle.gov/2026/02/04/councilmember-moore-introduces-legislation-strengthening-sidewalk-safety-and-pedestrian-access-in-seattle/`)
      .p(`Council passes a resolution supporting KCRHA's two-year plan during Unified Care Team rampdown - The Seattle City Council approved a resolution backing King County Regional Homelessness Authority planning as city operations shift. Council materials describe the move as alignment work during the planned rampdown of the Unified Care Team model. The adopted resolution signals policy support for a multi-year framework instead of short tactical cycles. Officials said the measure is meant to provide clearer coordination expectations between city departments and the regional authority. The action also sets a political marker ahead of budget and implementation decisions later in the year. Seattle leaders framed it as a governance step designed to reduce service fragmentation during transition.`)
      .p(`Seattle City Council | Date: 2026-02-04 | URL: https://council.seattle.gov/2026/02/04/council-passes-resolution-in-support-of-kcrha-two-year-plan-to-address-unified-care-team-rampdown/`)
    )

    .addColumn(col => col
      .headline({ level: 3, text: `Transit and Infrastructure` })
      .headline({ level: 4, text: `Rail permitting and SR 99 capacity changes` })
      .p(`West Seattle Link Extension enters federal environmental review - Sound Transit said the project has moved into the federal environmental review phase, a major permitting milestone. The agency identified this as the process that will evaluate alternatives, impacts, and mitigation before final federal decisions. The announcement is significant because federal review governs schedule confidence and downstream construction sequencing. Sound Transit said community engagement and technical analysis will continue as part of this stage. Project planning remains tied to regional mobility goals connecting West Seattle with the broader Link network. The milestone does not start construction, but it marks formal advancement in the route to build approval.`)
      .p(`Sound Transit | Date: 2026-02-04 | URL: https://www.soundtransit.org/get-to-know-us/news-events/news-releases/west-seattle-link-extension-project-enters-federal`)
      .p(`WSDOT will permanently close one northbound SR 99 lane in Seattle beginning Feb. 9 - WSDOT announced the long-term lane closure from South Atlantic Street through the SR 99 tunnel approach area. The agency said the change supports operational and safety needs connected to the Alaskan Way Viaduct replacement corridor. Drivers are being warned to plan for lower capacity and potential travel-time pressure during peak periods. WSDOT's notice sets February 9 as the start date, giving commuters a short runway for route adjustments. Officials said ongoing coordination with local partners remains part of managing downtown traffic effects. The lane configuration change is permanent, not a weekend-only construction closure.`)
      .p(`WSDOT | Date: 2026-02-04 | URL: https://wsdot.wa.gov/about/news/2026/wsdot-permanently-close-one-lane-northbound-sr-99-seattle-south-atlantic-street-through`)
    )

    .addColumn(col => col
      .headline({ level: 3, text: `Public Safety` })
      .headline({ level: 4, text: `Daily incident logs and enforcement activity` })
      .p(`Seattle Police published its Tuesday February 3 blotter summary - SPD's daily report lists incidents and arrests across multiple precincts with time-stamped entries. The blotter format provides a citywide snapshot of overnight and daytime activity, including responses to violent crime calls and property offenses. These summaries are used by residents and media to track where enforcement and emergency response resources were deployed. SPD's post reflects routine transparency practice rather than a single incident briefing. The item also serves as a record for follow-up reporting when investigations continue beyond the initial response day. The department posted the roundup on February 4 with incident references tied to February 3 activity.`)
      .p(`SPD Blotter | Date: 2026-02-04 | URL: https://spdblotter.seattle.gov/2026/02/04/tuesday-february-3-2026/`)
      .p(`Seattle Police posted its Wednesday February 4 blotter update - The department released another daily recap covering notable incidents and arrests logged that day. SPD's ongoing publication cadence gives neighborhoods a structured view of call types and response distribution. The report includes multiple entries rather than one headline case, which is typical for the blotter format. Public-facing logs like this are frequently used by community groups monitoring local safety trends over time. The February 4 post extends that daily sequence and updates the public on same-day activity. SPD published the summary through its official blotter channel with standard incident note formatting.`)
      .p(`SPD Blotter | Date: 2026-02-04 | URL: https://spdblotter.seattle.gov/2026/02/04/wednesday-february-4-2026/`)
    )

    .addColumn(col => col
      .headline({ level: 3, text: `Business and Tech` })
      .headline({ level: 4, text: `Why big-tech stocks are falling this week` })
      .p(`Big tech firms continue layoffs as Microsoft and Amazon lead a stock downturn tied to a falling Nasdaq - GeekWire reports continued workforce cuts are landing at the same time large tech names are sliding in public markets. The article says Seattle-area giants are central to the move as investors reassess growth assumptions against higher spending and earnings pressure. Layoff announcements are being read as cost-discipline signals, but they also underline uncertainty about where durable demand is strongest. GeekWire ties the moment to a broader repricing cycle in which AI optimism is competing with concern about margins and execution risk. The report highlights how Seattle's flagship tech employers are not insulated from national market sentiment during this correction phase. It provides direct local context for why big-tech stocks are falling even as core products keep growing.`)
      .p(`GeekWire | Date: 2026-02-04 | URL: https://www.geekwire.com/2026/big-tech-firms-continue-layoffs-as-microsoft-and-amazon-lead-stock-downturn-on-falling-nasdaq/`)
      .p(`Amazon stock sinks after profit outlook misses estimates despite a cloud revenue beat - Reuters, via Investing.com, reports shares fell after earnings because guidance and spending plans failed to satisfy investors. The report says second-quarter operating profit guidance came in below analyst expectations, with a midpoint around $15.5 billion versus a consensus near $19.4 billion. It also says Amazon projected about $100 billion in capital expenditures for 2026, including approximately $30 billion already in the first quarter. That spending profile intensified concerns that AI infrastructure buildouts will pressure free cash flow before returns are fully visible. Reuters notes the drop put Amazon shares on pace for their largest one-day decline in more than two years. The piece captures a core reason big-tech stocks are falling: strong revenue is not enough when profit outlook and capex intensity surprise to the downside.`)
      .p(`Reuters via Investing.com | Date: 2026-02-05 | URL: https://www.investing.com/news/stock-market-news/amazon-sinks-as-profit-outlook-misses-estimates-despite-cloud-beat-3898765`)
      .p(`Wall Street turns mixed as chip pressure offsets upbeat earnings in other sectors - Reuters, via Investing.com, reports tech sentiment weakened as semiconductor names slid while some non-tech earnings stayed firm. The article says the Philadelphia SE Semiconductor index dropped about 3%, with losses in Nvidia and Broadcom adding pressure to broader risk appetite. Reuters links the decline to concerns around export controls and demand expectations for AI-related hardware. Even with better results in parts of the market, that chip weakness held back a clearer risk-on move. The report reflects another channel behind recent big-tech softness because mega-cap valuations are tightly connected to AI supply-chain confidence. The session's mixed finish shows earnings optimism can be outweighed when core technology benchmarks retreat sharply.`)
      .p(`Reuters via Investing.com | Date: 2026-02-04 | URL: https://www.investing.com/news/stock-market-news/wall-st-mixed-as-earnings-optimism-helps-offset-pressure-from-chip-stocks-3897278`)
      .p(`OpenAI and SoftBank reportedly scout Oregon sites for a Stargate AI data center - GeekWire reports the partners are evaluating Pacific Northwest locations as part of a large-scale AI infrastructure push. The story says the search activity highlights how power, land, and permitting timelines are becoming strategic constraints in AI expansion. For Seattle-area tech watchers, the development underscores regional competition to host next-wave compute facilities. Massive infrastructure proposals can lift long-run growth narratives while also raising near-term questions about capital intensity and execution risk. GeekWire's report places the Northwest in the center of that buildout conversation as site scouting advances. The item adds context to market volatility by showing why investors are simultaneously excited about AI demand and cautious about the size and timing of required spending.`)
      .p(`GeekWire | Date: 2026-02-05 | URL: https://www.geekwire.com/2026/openai-and-softbank-reportedly-scouting-sites-in-oregon-for-massive-stargate-ai-data-center/`)
    )

    .addColumn(col => col
      .headline({ level: 3, text: `Environment` })
      .headline({ level: 4, text: `Seasonal signals and species monitoring` })
      .p(`The first signs of spring are showing up in Western Washington - KIRO 7 reports early seasonal indicators are emerging across the region after a relatively mild stretch. The story points to biological and weather cues that typically appear as winter begins to loosen in lowland areas. Forecasters and observers described the shift as preliminary rather than a full seasonal turn, with February still capable of colder swings. Even so, the report highlights how local conditions are already nudging early spring patterns in vegetation and daily temperature feel. Residents tracking gardens, parks, and outdoor plans are seeing those first changes now. KIRO 7 frames it as an early but noticeable transition signal for the Seattle area.`)
      .p(`KIRO 7 | Date: 2026-02-04 | URL: https://www.kiro7.com/weather/first-signs-spring-are-here-western-washington/DM3BO3PLUFAO3K6QJ34YHNLVXY/`)
      .p(`Forecasters ask whether this spring could become one of the wettest seasons on record in Western Washington - KIRO 7 reports meteorologists are tracking patterns that could deliver a very wet spring after recent atmospheric setup changes. The story explains that seasonal outlooks are not deterministic, but current signals point to elevated rain potential compared with average years. Broadcasters and forecasters describe this as a planning-relevant scenario for transportation, outdoor projects, and flood-aware communities. The report emphasizes uncertainty ranges while still flagging the possibility of high precipitation totals if storm tracks align. Residents are advised to interpret the outlook as early guidance rather than a guaranteed final outcome. KIRO 7 frames the forecast discussion as a reminder that fast winter-to-spring transitions can quickly reshape local risk conditions.`)
      .p(`KIRO 7 | Date: 2026-02-05 | URL: https://www.kiro7.com/weather/will-this-spring-be-one-wettest-seasons-you-should-know/4BZB2KSCWNECBM2E4URLIIWJWI/`)
    )

    .addColumn(col => col
      .headline({ level: 3, text: `Culture and Events` })
      .headline({ level: 4, text: `Week planner and Black History Month guide` })
      .p(`Seattle Met's weekly roundup lists 51 things to do around the city - The guide compiles concerts, exhibits, food plans, and neighborhood outings into a single planning list for the coming days. Seattle Met frames the picks as a practical menu for both indoor and outdoor activities during a variable February weather week. The list format helps readers compare options across venues without needing to track separate calendars. Event curation pieces like this are especially useful when many organizations launch new month programming at once. The article highlights how quickly local arts and social schedules rotate from week to week. Seattle Met's latest update gives residents a dense snapshot of what is active right now across Seattle.`)
      .p(`Seattle Met | Date: 2026-02-05 | URL: https://www.seattlemet.com/arts-and-culture/things-to-do-in-seattle-this-week`)
      .p(`KNKX publishes a Black History Month 2026 guide for Seattle and Tacoma events - The public radio outlet assembled activities and stories centered on Black culture, music, and community participation. The page includes a mix of event recommendations and editorial features tied to the month. KNKX's curation emphasizes local opportunities rather than only national observances, giving readers region-specific ways to engage. The guide also connects listeners to historical context through station reporting and interviews. As a monthly kickoff resource, it functions like a cultural roadmap for February programming. KNKX positions the collection as an ongoing reference that will support planning throughout the month.`)
      .p(`KNKX | Date: 2026-02-01 | URL: https://www.knkx.org/events/2026-02-01/black-history-month-things-to-do-2026-seattle-tacoma-events`)
    )

    .addColumn(col => col
      .headline({ level: 3, text: `Sports` })
      .headline({ level: 4, text: `Sounders result and Seahawks draft chatter` })
      .p(`Sounders FC and Cruz Azul play to a 0-0 draw in the Leagues Cup 2026 opener - Sounders FC's match recap says Seattle opened tournament play with a scoreless result against Liga MX opposition. The draw provides an early standings point while keeping group scenarios open for the next match window. Club reporting highlighted defensive organization and chance management as central factors in the outcome. Tournament openers often set rotation and lineup decisions for the following rounds, and this result keeps those tactical choices active. A clean sheet against strong competition is a stabilizing start even without a finishing breakthrough. Seattle now moves forward in the group stage with points on the board and limited margin for errors in upcoming fixtures.`)
      .p(`SoundersFC.com | Date: 2026-02-04 | URL: https://www.soundersfc.com/news/match-recap-sounders-fc-and-cruz-azul-play-to-0-0-draw-in-leagues-cup-2026-opener`)
      .p(`Seahawks roundup tracks expert reactions to the 2026 draft class - Seahawks.com says league analysts are weighing the balance and projected fit of Seattle's incoming class. The roundup format aggregates multiple external evaluations, giving fans a quick view of consensus and disagreement points. Coverage highlights positional depth and developmental upside as recurring themes in early commentary. Draft analysis at this stage is inherently projection-driven, but it shapes expectations heading into camp and preseason competition. Seattle's official report frames the class as broadly well-rounded compared with peer groups. The discussion now shifts from grades to roster integration as offseason work advances.`)
      .p(`Seahawks.com | Date: 2026-02-05 | URL: https://www.seahawks.com/news/monday-round-up-what-the-experts-are-saying-about-the-seahawks-2026-draft-class`)
    )

    .render();

})();
