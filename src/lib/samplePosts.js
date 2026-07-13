// Demo content shown only when Contentful env vars are missing,
// so the layout can be reviewed before a Contentful space is wired up.
// Shaped identically to a normalized entry from src/lib/contentful.js.

const paragraph = (text) => ({
  nodeType: 'paragraph',
  data: {},
  content: [{ nodeType: 'text', value: text, marks: [], data: {} }]
});

const richDoc = (paragraphs) => ({
  nodeType: 'document',
  data: {},
  content: paragraphs.map(paragraph)
});

const TITLES = [
  ['After the Last Train', 'A city that only tells the truth after midnight'],
  ['Neon and Ash', 'Notes from a decade spent in back rooms and green rooms'],
  ['The Long Bar', 'On the etiquette of drinking alone, done well'],
  ['Static Bloom', 'What the radio taught me about longing'],
  ['Low Light District', 'A field guide to the parts of town without street signs'],
  ['Smoke Signals', 'Everything I know about leaving, I learned from a lighter'],
  ['The Velvet Hour', 'Between last call and first light, a different set of rules'],
  ['Borrowed Rooms', 'Motels, sublets, and the honesty of temporary space'],
  ['Whiskey Logic', 'A defense of bad decisions made for good reasons'],
  ['Corner Booth', 'Diner confessions from people who should know better']
];

const BODY = [
  'The city doesn\u2019t change after midnight so much as it stops pretending. The lights that flatter by day go harsh, then honest, then strange.',
  'Nobody tells you the silence is the hard part. Not the noise, not the neon \u2014 the fifteen minutes after everyone leaves and the room is just a room again.',
  'There is a version of this story where I leave earlier, where the night ends at a reasonable hour and nobody has to explain anything to anyone.',
  'What I remember isn\u2019t the argument. It\u2019s the exact shade the sky went while we were having it, somewhere between bruise and ember.',
  'Every bartender worth trusting has a theory about regulars. Mine is that we\u2019re not chasing a drink. We\u2019re chasing the version of the room where we belong.'
];

export const SAMPLE_POSTS = TITLES.map(([title, subtitle], i) => ({
  id: `sample-${i}`,
  title,
  subtitle,
  excerpt: BODY[i % BODY.length],
  content: richDoc([BODY[i % BODY.length], BODY[(i + 2) % BODY.length], BODY[(i + 4) % BODY.length]]),
  date: new Date(Date.now() - i * 1000 * 60 * 60 * 26).toISOString()
}));
