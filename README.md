# EMBERFALL DUEL

[![make.fun](https://make.fun/badge/best-card-game-20261122-1826.svg)](https://make.fun/c/best-card-game-20261122-1826)
[![rank](https://make.fun/badge/best-card-game-20261122-1826/DKAnbu/best-card-game-20261122-1826/rank.svg)](https://make.fun/c/best-card-game-20261122-1826)
[![reward](https://make.fun/badge/best-card-game-20261122-1826/DKAnbu/best-card-game-20261122-1826/reward.svg)](https://make.fun/c/best-card-game-20261122-1826)

**EMBERFALL DUEL: 4-house card battler, 30 HP, chain combos, telegraphed AI, 24-card deck**

A turn-based card battler, played in the browser with keyboard and mouse.
You duel the Ashen Warden across a green felt table. Both fighters start at
30 HP. Each turn you gain energy, draw cards, and play your hand — and the
Warden always shows you what it plans to do next, so every turn is a
decision you can read and answer.

## How to play

- **Goal:** reduce the Ashen Warden to 0 HP before it does the same to you.
- **Energy:** you start each turn with energy (3 on turn one, +1 every turn,
  up to 10). Every card costs energy to play.
- **Hand:** you hold 5 cards and draw 2 at the start of each turn, from a
  24-card deck.
- **Four houses:** Ember (red flame), Tide (blue drop), Thorn (green leaf)
  and Gloom (purple moon). Houses are told apart by colour and shape, never
  by text alone.
- **Card types:** Strike deals damage, Guard gains block, Spark deals a
  little damage and draws a card.
- **CHAIN combo:** play two cards of the same house in one turn and the
  second one gets +3 power — watch for the "CHAIN x2!" flash.
- **Read the Warden:** its intent is telegraphed every turn
  ("Warden bersiap: Strike 6"), so guard up or strike first as the moment
  demands.

## Controls

- `1`–`5` play a card from your hand (or click a card).
- `Space` / `Enter` ends your turn (or click End Turn).
- `Enter` starts from the title screen. `R` restarts. `M` mutes sound.

## Screens

Title screen, the duel table, a victory screen and a defeat screen, each
with its own statistics (turns played, HP left, cards played).

## Run it

Serve `game/` with any static server, for example:

```
node serve.ts
```

then open `http://localhost:8080`. No network is used: every asset is a
local file and all sound is synthesised with WebAudio. Seeded runs work
with `?seed=123`; fixed scenes for screenshots with
`?scene=title|table|win|loss`.

## File structure

```
main.ts            entrypoint: copies game/ + screenshots/ to /output, writes dossier.json
serve.ts           tiny static server for game/ on :8080
vendor/            make.fun dossier library (kit copy, unchanged)
game/
  index.html       page, table layout, no network references
  style.css        felt table, cards, animations
  js/cards.js      the four houses, card definitions, deck, seeded shuffle
  js/ai.js         the Warden: telegraphed intent and simple heuristics
  js/render.js     DOM rendering and card animations
  js/audio.js      WebAudio synth effects (play, hit, win fanfare)
  js/shots.js      deterministic ?scene= presets for screenshots
  js/main.js       state machine, game loop, keyboard and mouse input
screenshots/      four real renders of the game
```
