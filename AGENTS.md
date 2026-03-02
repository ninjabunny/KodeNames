# Repository Guidelines

## Project Structure & Module Organization
This repository is a static web app for a Kodenames-style game.
- `index.html`: main game page and script/style wiring.
- `ada.html`: accessibility-focused variant.
- `scripts/`: client-side logic:
  - `index.js` game state, board generation, scoring, interactions.
  - `data.js` word lists and datasets.
  - `seedrandom.js` seeded RNG dependency.
  - `analytics.js` tracking hooks.
- `styles/styles.css`: all UI styling.
- `data/data.json`: additional word data assets.

Keep new gameplay logic in `scripts/`, and keep page-level wiring in HTML files minimal.

## Build, Test, and Development Commands
No build step is required.
- Run locally with a simple server:
  - `python3 -m http.server 8000`
  - Open `http://localhost:8000/index.html`
- Quick manual check without server:
  - Open `index.html` directly in a browser.

Prefer serving over HTTP when validating external scripts or browser-specific behavior.

## Coding Style & Naming Conventions
- Use plain JavaScript, HTML, and CSS (no framework assumptions).
- Match existing style in touched files:
  - JavaScript currently uses tabs and `var` in legacy sections.
  - CSS uses tab-indented property blocks.
- Naming:
  - Functions/variables: `camelCase` (for example, `createNewGame`, `spyMasterMode`).
  - Constants: `UPPER_SNAKE_CASE` (for example, `NUMBER_OF_WORDS`, `COLOR_RED`).
  - IDs/classes in HTML/CSS: short, descriptive lowercase names.

## Testing Guidelines
There is no automated test suite yet. Validate changes manually:
- Start a seeded game and confirm deterministic board generation.
- Verify mode switching (`Default`, `Spanish`, `2K Nouns`, `Movies`, `Custom`).
- Check SpyMaster toggle, score updates, and winner text.
- Test on desktop and mobile viewport sizes.

If adding tests later, place them under `tests/` and name files `*.test.js`.

## Commit & Pull Request Guidelines
Follow the existing git history style: short, imperative commit subjects (for example, `Improve styling`, `Fix end bracket`).
- Keep subject lines concise and focused on one change.
- In PRs, include:
  - what changed and why,
  - manual test steps performed,
  - screenshots/GIFs for UI changes,
  - linked issue(s) when applicable.
