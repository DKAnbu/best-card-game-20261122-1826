/* EMBERFALL DUEL — the Ashen Warden AI.
   The Warden telegraphs its intent at the start of every player turn, so
   the player can read it and answer. It acts once per round with a simple
   heuristic: strike hard when the player is weak, guard when it is hurt,
   otherwise mix strikes and sparks. */

function wardenPickIntent(state) {
  const w = state.warden;
  const p = state.player;
  const roll = state.rng();
  if (p.hp <= 10 && roll < 0.7) {
    return { kind: 'Strike', value: 8, text: 'Strike 8', glyph: '⚔️' };
  }
  if (w.hp <= 10 && roll < 0.6) {
    return { kind: 'Guard', value: 8, text: 'Guard 8', glyph: '🛡️' };
  }
  if (roll < 0.45) {
    return { kind: 'Strike', value: 6, text: 'Strike 6', glyph: '⚔️' };
  }
  if (roll < 0.7) {
    return { kind: 'Spark', value: 4, text: 'Spark 4', glyph: '✨' };
  }
  if (roll < 0.85) {
    return { kind: 'Guard', value: 6, text: 'Guard 6', glyph: '🛡️' };
  }
  return { kind: 'Strike', value: 5, text: 'Strike 5', glyph: '⚔️' };
}

/* The Warden carries out the intent it telegraphed last turn. */
function wardenAct(state) {
  const intent = state.intent;
  if (!intent) return;
  const w = state.warden;
  const p = state.player;
  if (intent.kind === 'Strike' || intent.kind === 'Spark') {
    const dealt = Math.max(0, intent.value - p.block);
    p.block = Math.max(0, p.block - intent.value);
    p.hp = Math.max(0, p.hp - dealt);
    state.lastHit = { target: 'player', amount: dealt, blocked: intent.value - dealt };
    addLog(state, 'Warden strikes for ' + intent.value + ' (' + dealt + ' through your block).');
  } else {
    w.block += intent.value;
    state.lastHit = { target: 'warden', amount: 0, blocked: 0 };
    addLog(state, 'Warden guards, gaining ' + intent.value + ' block.');
  }
  if (p.hp <= 0) {
    state.screen = 'loss';
    state.stats.turns = state.turn;
  }
}
