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
    .weather({
      title: 'Weatherforcast for the next 24 hours: Plenty of Sunshine',
      details: 'Wind: 7km/h SSE; Ther: 21°C; Hum: 82%'
    })
    .masthead({
      title: 'Newpost York',
      subhead: 'York, MA - Thursday August 30, 1978 - Seven Pages'
    })

    // Column 1
    .addColumn(col => col
      .headline({ level: 3, text: 'When darkness overspreads my eyes' })
      .byline('by JOHANN WOLFGANG VON GOETHE')
      .p('When, while the lovely valley teems with vapour around me, and the meridian sun strikes the upper surface of the impenetrable foliage of my trees, and but a few stray gleams steal into the inner sanctuary, I throw myself down among the tall grass by the trickling stream;')
      .p('and, as I lie close to the earth, a thousand unknown plants are noticed by me: when I hear the buzz of the little world among the stalks, and grow familiar with the countless indescribable forms of the insects and flies, then I feel the presence of the Almighty, who formed us in his own image, and the breath of that universal love which bears and sustains us, as it floats around us in an eternity of bliss; and then, my friend, when darkness overspreads my eyes, and heaven and earth seem to dwell in my soul and absorb its power, like the form of a beloved mistress, then I often think with longing, Oh, would I could describe these conceptions, could impress upon paper all that is living so full and warm within me, that it might be the mirror of my soul, as my soul is the mirror of the infinite God!')
    )

    // Column 2
    .addColumn(col => col
      .headline({ level: 5, text: 'Give people courage' })
      .headline({ level: 6, text: 'The crowd seemed to grow' })
      .p('The sunset faded to twilight before anything further happened. The crowd far away on the left, towards Woking, seemed to grow, and I heard now a faint murmur from it. The little knot of people towards Chobham dispersed. There was scarcely an intimation of movement from the pit.')
      .figure({
        // use https to avoid mixed-content problems
        src: 'https://media.giphy.com/media/PW7MoTD2d9pJK/giphy.gif',
        alt: 'A person looking hopeful, looping animation.',
        caption: 'Hermine hoping for courage.'
      })
      .p('It was this, as much as anything, that gave people courage, and I suppose the new arrivals from Woking also helped to restore confidence. At any rate, as the dusk came on a slow, intermittent movement upon the sand pits began, a movement that seemed to gather force as the stillness of the evening about the cylinder remained unbroken. Vertical black figures in twos and threes would advance, stop, watch, and advance again, spreading out as they did so in a thin irregular crescent that promised to enclose the pit in its attenuated horns. I, too, on my side began to move towards the pit.')
      .p('Then I saw some cabmen and others had walked boldly into the sand pits, and heard the clatter of hoofs and the gride of wheels. I saw a lad trundling off the barrow of apples. And then, within thirty yards of the pit, advancing from the direction of Horsell, I noted a little black knot of men, the foremost of whom was waving a white flag.')
    )

    // Column 3
    .addColumn(col => col
      .headline({ level: 1, text: 'May the Force be with you' })
      .headline({ level: 2, text: 'Let go your conscious self and act on instinct' })
      .p('Partially, but it also obeys your commands. Hey, Luke! May the Force be with you. I have traced the Rebel spies to her. Now she is my only link to finding their secret base.')
      .figure({
        src: 'https://media.giphy.com/media/4fDWVPMoSyhgc/giphy.gif',
        alt: 'A cinematic moment, looping animation from a sci-fi scene.',
        caption: '"This time, let go your conscious self and act on instinct."'
      })
      .p('Leave that to me. Send a distress signal, and inform the Senate that all on board were killed.')
      .citation('"Don\'t under­estimate the Force. I suggest you try it again, Luke."')
      .p('This time, let go your conscious self and act on instinct. In my experience, there is no such thing as luck. You\'re all clear, kid. Let\'s blow this thing and go home!')
      .p('You don\'t believe in the Force, do you? Partially, but it also obeys your commands. The plans you refer to will soon be back in our hands. As you wish.')
    )

    // Column 4
    .addColumn(col => col
      .headline({ level: 3, text: 'The buzz of the little world' })
      .headline({ level: 4, text: 'A thousand unknown plants' })
      .p('I should be incapable of drawing a single stroke at the present moment; and yet I feel that I never was a greater artist than now.')
      .p('When, while the lovely valley teems with vapour around me, and the meridian sun strikes the upper surface of the impenetrable foliage of my trees, and but a few stray gleams steal into the inner sanctuary, I throw myself down among the tall grass by the trickling stream; and, as I lie close to the earth, a thousand unknown plants are noticed by me: when I hear the buzz of the little world among the stalks, and grow familiar with the countless indescribable forms of the insects and flies, then I feel the presence of the Almighty, who formed us in his own image, and the breath')
    )

    // Column 5
    .addColumn(col => col
      .headline({ level: 1, text: 'It wasn\'t a dream' })
      .byline('by FRANZ KAFKA')
      .p('One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin. He lay on his armour-like back, and if he lifted his head a little he could see his brown belly, slightly domed and divided by arches into stiff sections. The bedding was hardly able to cover it and seemed ready to slide off any moment.')
      .p('His many legs, pitifully thin compared with the size of the rest of him, waved about helplessly as he looked. "What\'s happened to me?" he thought. It wasn\'t a dream. His room, a proper human room although a little too small, lay peacefully between its four familiar walls.')
      .p('A collection of textile samples lay spread out on the table - Samsa was a travelling salesman - and above it there hung a picture that he had recently cut out of an illustrated magazine and housed in a nice, gilded frame. It showed a lady fitted out with a fur hat and fur boa who sat upright, raising a heavy fur muff that covered the whole of her lower arm towards the viewer. Gregor then turned to look out the window at the dull weather.')
    )

    .render();

})();

