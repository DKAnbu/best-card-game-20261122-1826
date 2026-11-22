/* EMBERFALL DUEL — DOM rendering and card animation.
   Renders the table from state: life bars, energy crystals, the Warden's
   face-down hand, the player's fanned hand, the telegraphed intent and the
   battle log. Cards slide in when dealt and snap when played. */

function el(id) {
  return document.getElementById(id);
}

function setBar(fillId, textId, hp, maxHp) {
  const fill = el(fillId);
  const text = el(textId);
  if (fill) fill.style.width = Math.max(0, (hp / maxHp) * 100) + '%';
  if (text) text.textContent = hp + ' / ' + maxHp;
}

function renderEnergy(state) {
  const box = el('energy-crystals');
  if (!box) return;
  box.innerHTML = '';
  for (let i = 0; i < state.energyMax; i++) {
    const c = document.createElement('span');
    c.className = 'crystal' + (i < state.energy ? ' lit' : '');
    c.textContent = '◆';
    box.appendChild(c);
  }
  const label = el('energy-label');
  if (label) label.textContent = 'Energy ' + state.energy + ' / ' + state.energyMax;
}

function renderWardenHand(state) {
  const box = el('warden-hand');
  if (!box) return;
  box.innerHTML = '';
  const shown = Math.min(5, state.wardenHandCount);
  for (let i = 0; i < shown; i++) {
    const back = document.createElement('div');
    back.className = 'card-back';
    back.textContent = '🔥';
    box.appendChild(back);
  }
}

function makeCardElement(card, index, state) {
  const house = HOUSES[card.house];
  const div = document.createElement('div');
  div.className = 'card house-' + card.house;
  div.dataset.index = String(index);
  const playable = state.screen === 'table' && card.cost <= state.energy;
  if (!playable) div.classList.add('unplayable');
  div.style.setProperty('--house', house.color);
  div.style.setProperty('--house-dark', house.dark);
  div.style.setProperty('--house-soft', house.soft);

  const glyph = document.createElement('div');
  glyph.className = 'card-glyph';
  glyph.textContent = house.glyph;
  div.appendChild(glyph);

  const name = document.createElement('div');
  name.className = 'card-house-name';
  name.textContent = house.name;
  div.appendChild(name);

  const kind = document.createElement('div');
  kind.className = 'card-kind';
  kind.textContent = cardLabel(card);
  div.appendChild(kind);

  const text = document.createElement('div');
  text.className = 'card-text';
  text.textContent = cardVerb(card);
  div.appendChild(text);

  const cost = document.createElement('div');
  cost.className = 'card-cost';
  cost.textContent = '◆ ' + card.cost;
  div.appendChild(cost);

  const key = document.createElement('div');
  key.className = 'card-key';
  key.textContent = String(index + 1);
  div.appendChild(key);

  div.addEventListener('click', function () {
    playCard(index);
  });
  return div;
}

function renderPlayerHand(state) {
  const box = el('player-hand');
  if (!box) return;
  box.innerHTML = '';
  state.hand.forEach(function (card, i) {
    const node = makeCardElement(card, i, state);
    node.classList.add('deal-in');
    node.style.animationDelay = i * 0.07 + 's';
    box.appendChild(node);
  });
}

function renderIntent(state) {
  const box = el('warden-intent');
  if (!box) return;
  if (state.screen !== 'table' || !state.intent) {
    box.textContent = '';
    box.classList.remove('show');
    return;
  }
  box.textContent = state.intent.glyph + ' Warden bersiap: ' + state.intent.text;
  box.classList.add('show');
}

function renderLog(state) {
  const box = el('battle-log');
  if (!box) return;
  box.innerHTML = '';
  const tail = state.log.slice(-4);
  for (const line of tail) {
    const p = document.createElement('p');
    p.textContent = line;
    box.appendChild(p);
  }
}

function renderStats(state) {
  const winStats = el('win-stats');
  if (winStats) {
    winStats.textContent =
      'Won in ' + state.stats.turns + ' turns · ' + state.player.hp + ' HP left · ' +
      state.stats.cardsPlayed + ' cards played';
  }
  const lossStats = el('loss-stats');
  if (lossStats) {
    lossStats.textContent =
      'Fell on turn ' + state.stats.turns + ' · Warden had ' + state.warden.hp +
      ' HP left · ' + state.stats.cardsPlayed + ' cards played';
  }
}

function flashChain() {
  const toast = el('chain-toast');
  if (!toast) return;
  toast.classList.remove('pop');
  void toast.offsetWidth;
  toast.textContent = 'CHAIN x2! +3 power';
  toast.classList.add('pop');
}

function renderAll(state) {
  const screens = ['title', 'table', 'win', 'loss'];
  for (const name of screens) {
    const node = el('screen-' + name);
    if (node) node.classList.toggle('active', state.screen === name);
  }
  setBar('warden-hp-fill', 'warden-hp-text', state.warden.hp, state.warden.maxHp);
  setBar('player-hp-fill', 'player-hp-text', state.player.hp, state.player.maxHp);
  const wBlock = el('warden-block');
  if (wBlock) wBlock.textContent = state.warden.block > 0 ? '🛡️ ' + state.warden.block : '';
  const pBlock = el('player-block');
  if (pBlock) pBlock.textContent = state.player.block > 0 ? '🛡️ ' + state.player.block : '';
  const turnLabel = el('turn-label');
  if (turnLabel) turnLabel.textContent = 'Turn ' + state.turn;
  renderEnergy(state);
  renderWardenHand(state);
  renderPlayerHand(state);
  renderIntent(state);
  renderLog(state);
  renderStats(state);
  const muteBtn = el('mute-btn');
  if (muteBtn) muteBtn.textContent = AudioFX.muted ? '🔇 Sound off (M)' : '🔊 Sound on (M)';
}
