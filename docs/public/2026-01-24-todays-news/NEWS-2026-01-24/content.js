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
      title: 'Seattle News',
      subhead: 'Seattle, WA - Saturday January 24, 2026 - Three Sections'
    })

    // Column 1
    .addColumn(col => col
      .headline({ level: 3, text: 'Transit & Infrastructure' })
      .headline({ level: 4, text: 'Sound Transit sets March 28 opening for Seattle-Bellevue light rail' })
      .p('Sound Transit announced the 2 Line extension between Seattle and Bellevue will open March 28, creating the first direct light-rail link across Lake Washington on I-90. The opening adds new stations at Judkins Park and on Mercer Island, with trains expected every eight minutes at peak and every 10 to 15 minutes off-peak.')
      .p('Published: Jan 23, 2026 - Source: KUOW - URL: https://www.kuow.org/stories/light-rail-between-seattle-and-bellevue-will-open-this-weekend')
    )

    // Column 2
    .addColumn(col => col
      .headline({ level: 3, text: 'Public Safety & Justice' })
      .headline({ level: 4, text: '12-year-old charged after Seattle robbery involving screwdriver attack' })
      .p('A 12-year-old is facing second-degree robbery and obstruction charges after a Seattle robbery in which a 19-year-old suspect allegedly attacked a victim with a screwdriver outside an Amazon Fresh in the Central District. Police said the juvenile tried to take the victim\'s phone, called for an accomplice, and resisted arrest while giving a false name and date of birth.')
      .p('Published: Jan 23, 2026 - Source: KIRO 7 News - URL: https://www.kiro7.com/news/local/12-year-old-charged-seattle-robbery-involving-screwdriver-attack/53J5PQIHKREWLF4SM2HN35F2YI/')
    )

    // Column 3
    .addColumn(col => col
      .headline({ level: 3, text: 'Culture & Food' })
      .headline({ level: 4, text: "Dick's Drive-In marks 72 years with 19-cent burgers Jan 26-29" })
      .p("Dick's Drive-In is celebrating its 72nd anniversary with a 19-cent hamburger or cheeseburger promotion. The deal runs Monday through Thursday, January 26-29, from 10 a.m. to 11 a.m., limited to one per customer at all eight locations.")
      .p("Published: Jan 24, 2026 - Source: KIRO 7 News - URL: https://www.kiro7.com/news/local/dicks-drive-celebrates-72-years-19-cent-burgers/KXAX2WEBMVD6LKVC2NJOGXKG3M/")
    )

    .render();

})();
