/* EMBERFALL DUEL — cards, houses, deck and seeded shuffle.
   Four original houses, told apart by colour and glyph. Three card kinds:
   Strike (damage), Guard (block), Spark (small damage plus draw one). */

const HOUSES = {
  ember: { key: 'ember', name: 'Ember', glyph: '🔥', color: '#e8452c', dark: '#7a1d10', soft: '#ffd9cf' },
  tide: { key: 'tide', name: 'Tide', glyph: '💧', color: '#2b7de9', dark: '#123a6e', soft: '#d3e6ff' },
  thorn: { key: 'thorn', name: 'Thorn', glyph: '🍃', color: '#2fae4e', dark: '#14532a', soft: '#d6f2dc' },
  gloom: { key: 'gloom', name: 'Gloom', glyph: '🌙', color: '#8b5cf6', dark: '#3b1d7a', soft: '#e6dbff' },
};

const HOUSE_KEYS = ['ember', 'tide', 'thorn', 'gloom'];

/* One card template per house slot: six cards per house, 24 in the deck. */
const DECK_BLUEPRINT = [
  { kind: 'Strike', value: 6, cost: 2 },
  { kind: 'Strike', value: 8, cost: 3 },
  { kind: 'Strike', value: 5, cost: 1 },
  { kind: 'Guard', value: 6, cost: 2 },
  { kind: 'Guard', value: 5, cost: 1 },
  { kind: 'Spark', value: 3, cost: 1 },
];

function mulberry32(seed) {
  let a = seed >>> 0;
  return function nextRandom() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleDeck(deck, rng) {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = deck[i];
    deck[i] = deck[j];
    deck[j] = tmp;
  }
  return deck;
}

/* Build a fresh 24-card deck, shuffled with the given seed. */
function buildDeck(seed) {
  const rng = mulberry32(seed);
  const deck = [];
  let uid = 0;
  for (const house of HOUSE_KEYS) {
    for (const bp of DECK_BLUEPRINT) {
      deck.push({
        id: 'c' + uid++,
        house,
        kind: bp.kind,
        value: bp.value,
        cost: bp.cost,
      });
    }
  }
  return shuffleDeck(deck, rng);
}

function cardLabel(card) {
  if (card.kind === 'Strike') return 'Strike ' + card.value;
  if (card.kind === 'Guard') return 'Guard ' + card.value;
  return 'Spark ' + card.value + ' + draw';
}

function cardVerb(card) {
  if (card.kind === 'Strike') return 'deals ' + card.value + ' damage';
  if (card.kind === 'Guard') return 'gains ' + card.value + ' block';
  return 'deals ' + card.value + ' damage and draws a card';
}
