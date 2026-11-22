/* EMBERFALL DUEL — state machine, game loop, keyboard and mouse input.
   One state object drives everything: title, table, win and loss screens.
   Energy grows +1 per turn to a max of 10; you draw 2 cards each turn;
   playing two cards of one house in a turn triggers a CHAIN bonus. */

function readSeed() {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get('seed');
  const n = raw === null ? 20261122 : parseInt(raw, 10);
  return Number.isFinite(n) ? n : 20261122;
}

function readScene() {
  const params = new URLSearchParams(window.location.search);
  return params.get('scene');
}

function newGame(seed) {
  const rng = mulberry32(seed);
  const deck = buildDeck(seed);
  const hand = deck.splice(0, 5);
  return {
    seed,
    rng,
    screen: 'title',
    turn: 1,
    energy: 3,
    energyMax: 3,
    deck,
    discard: [],
    hand,
    playedHouses: [],
    player: { hp: 30, maxHp: 30, block: 0 },
    warden: { hp: 30, maxHp: 30, block: 0 },
    wardenHandCount: 5,
    intent: null,
    log: ['The Ashen Warden waits across the felt.'],
    lastHit: null,
    stats: { turns: 0, cardsPlayed: 0 },
  };
}

let state = newGame(readSeed());

function addLog(s, line) {
  s.log.push(line);
  if (s.log.length > 30) s.log = s.log.slice(-30);
}

function drawCards(s, n) {
  for (let i = 0; i < n; i++) {
    if (s.deck.length === 0) {
      if (s.discard.length === 0) return;
      s.deck = shuffleDeck(s.discard.splice(0), s.rng);
      addLog(s, 'Deck reshuffled from the discard pile.');
    }
    const card = s.deck.shift();
    if (card) s.hand.push(card);
  }
}

function startTurn(s) {
  s.turn += 1;
  s.energyMax = Math.min(10, 2 + s.turn);
  s.energy = s.energyMax;
  s.player.block = 0;
  s.playedHouses = [];
  drawCards(s, 2);
  AudioFX.playDraw();
  addLog(s, 'Turn ' + s.turn + ' — you draw 2 cards, energy ' + s.energy + '.');
  s.intent = wardenPickIntent(s);
}

function startGame() {
  const keepSeed = state.seed;
  state = newGame(keepSeed);
  state.screen = 'table';
  state.intent = wardenPickIntent(state);
  addLog(state, 'Turn 1 — the duel begins. Energy 3.');
  renderAll(state);
}

function chainBonus(s, card) {
  if (s.playedHouses.indexOf(card.house) >= 0) return 3;
  return 0;
}

function playCard(index) {
  if (state.screen !== 'table') return;
  const card = state.hand[index];
  if (!card) return;
  if (card.cost > state.energy) {
    addLog(state, 'Not enough energy for that card.');
    renderAll(state);
    return;
  }
  const bonus = chainBonus(state, card);
  state.energy -= card.cost;
  state.hand.splice(index, 1);
  state.discard.push(card);
  state.playedHouses.push(card.house);
  state.stats.cardsPlayed += 1;
  AudioFX.playCard();

  if (card.kind === 'Strike' || card.kind === 'Spark') {
    const total = card.value + bonus;
    const dealt = Math.max(0, total - state.warden.block);
    state.warden.block = Math.max(0, state.warden.block - total);
    state.warden.hp = Math.max(0, state.warden.hp - dealt);
    addLog(state, 'You play ' + HOUSES[card.house].name + ' ' + cardLabel(card) +
      (bonus > 0 ? ' (CHAIN +3)' : '') + ' — ' + dealt + ' damage to the Warden.');
    AudioFX.playHit();
    if (bonus > 0) {
      flashChain();
      AudioFX.playChain();
    }
    if (card.kind === 'Spark') {
      const before = state.hand.length;
      drawCards(state, 1);
      if (state.hand.length > before) addLog(state, 'Spark draws a card.');
    }
  } else {
    const total = card.value + bonus;
    state.player.block += total;
    addLog(state, 'You play ' + HOUSES[card.house].name + ' ' + cardLabel(card) +
      (bonus > 0 ? ' (CHAIN +3)' : '') + ' — +' + total + ' block.');
    if (bonus > 0) {
      flashChain();
      AudioFX.playChain();
    }
  }

  if (state.warden.hp <= 0) {
    state.screen = 'win';
    state.stats.turns = state.turn;
    AudioFX.playWin();
    renderAll(state);
    return;
  }
  renderAll(state);
}

function endTurn() {
  if (state.screen !== 'table') return;
  state.warden.block = 0;
  wardenAct(state);
  if (state.screen === 'loss') {
    AudioFX.playLose();
    renderAll(state);
    return;
  }
  startTurn(state);
  renderAll(state);
}

function restart() {
  startGame();
}

document.addEventListener('keydown', function (e) {
  if (e.key === 'm' || e.key === 'M') {
    AudioFX.toggleMute();
    renderAll(state);
    return;
  }
  if (e.key === 'r' || e.key === 'R') {
    if (state.screen !== 'title') restart();
    return;
  }
  if (state.screen === 'title') {
    if (e.key === 'Enter') startGame();
    return;
  }
  if (state.screen === 'win' || state.screen === 'loss') {
    if (e.key === 'Enter') restart();
    return;
  }
  if (e.key >= '1' && e.key <= '5') {
    playCard(parseInt(e.key, 10) - 1);
    return;
  }
  if (e.key === ' ' || e.key === 'Enter') {
    e.preventDefault();
    endTurn();
  }
});

document.addEventListener('DOMContentLoaded', function () {
  const startBtn = document.getElementById('start-btn');
  if (startBtn) startBtn.addEventListener('click', startGame);
  const endBtn = document.getElementById('end-turn-btn');
  if (endBtn) endBtn.addEventListener('click', endTurn);
  const againWin = document.getElementById('again-win-btn');
  if (againWin) againWin.addEventListener('click', restart);
  const againLoss = document.getElementById('again-loss-btn');
  if (againLoss) againLoss.addEventListener('click', restart);
  const muteBtn = document.getElementById('mute-btn');
  if (muteBtn) muteBtn.addEventListener('click', function () {
    AudioFX.toggleMute();
    renderAll(state);
  });

  const scene = readScene();
  if (scene) {
    stageScene(state, scene);
  }
  renderAll(state);
});
