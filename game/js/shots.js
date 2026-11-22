/* EMBERFALL DUEL — deterministic scene presets for screenshots.
   ?scene=title shows the title screen, ?scene=table a mid-duel table,
   ?scene=win the victory screen and ?scene=loss the defeat screen.
   Each preset stages a fixed state so screenshots are reproducible. */

function stageScene(state, scene) {
  if (scene === 'title') {
    state.screen = 'title';
    return;
  }
  if (scene === 'win') {
    state.screen = 'win';
    state.warden.hp = 0;
    state.player.hp = 18;
    state.stats.turns = 7;
    state.stats.cardsPlayed = 19;
    state.intent = null;
    return;
  }
  if (scene === 'loss') {
    state.screen = 'loss';
    state.player.hp = 0;
    state.warden.hp = 12;
    state.stats.turns = 6;
    state.stats.cardsPlayed = 14;
    state.intent = null;
    return;
  }
  /* Default: a lively mid-duel table. */
  state.screen = 'table';
  state.turn = 4;
  state.energyMax = 6;
  state.energy = 4;
  state.player.hp = 22;
  state.player.block = 5;
  state.warden.hp = 17;
  state.warden.block = 3;
  state.wardenHandCount = 5;
  state.intent = { kind: 'Strike', value: 6, text: 'Strike 6', glyph: '⚔️' };
  state.hand = [
    { id: 's1', house: 'ember', kind: 'Strike', value: 8, cost: 3 },
    { id: 's2', house: 'tide', kind: 'Guard', value: 6, cost: 2 },
    { id: 's3', house: 'thorn', kind: 'Spark', value: 3, cost: 1 },
    { id: 's4', house: 'gloom', kind: 'Strike', value: 6, cost: 2 },
    { id: 's5', house: 'ember', kind: 'Guard', value: 5, cost: 1 },
  ];
  state.log = [
    'Turn 4 — you draw 2 cards.',
    'Warden guards, gaining 3 block.',
    'You played Ember Strike 8 for 8 damage.',
    'CHAIN x2! Ember Guard gains +3 block.',
  ];
}
