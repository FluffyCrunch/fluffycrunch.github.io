# Shifa Khatri — Game Dev Portfolio

A static, single-page portfolio built with plain HTML/CSS/JS (no build step, no framework).

## Structure
- `index.html` — page content/sections
- `css/style.css` — all styling and animations
- `js/games-data.js` — **edit this to add/update games**
- `js/main.js` — boot screen, background, attract-mode screen, library filters, game modal, achievements, sound, Konami code

## Adding a new game
Open `js/games-data.js` and add an entry to the `GAMES` array. It shows up automatically in the
hero "attract mode" screen, the Library (with filters) and its own details modal.

```js
{
  id: "my-game",                       // unique slug
  title: "My Game",
  tagline: "One-line hook",
  genre: "Platformer",
  filters: ["arcade", "unity"],        // ids from GAME_FILTERS at the bottom of the file
  engine: "Unity · C#",
  platform: "Browser (WebGL)",
  description: "1-3 sentence pitch.",
  features: ["Feature one", "Feature two"],
  controls: [["Space", "Jump"]],       // optional
  tags: ["Unity", "C#"],
  shots: ["assets/games/my-game-1.webp"], // first one is the cover
  accent: "#22d3ee",
  playUrl: "https://...",              // leave "" if there is no live build
  sourceUrl: "https://github.com/FluffyCrunch/..."
}
```
Screenshots live in `assets/games/` (16:9 WebP around 1400px wide keeps the page light).
Update the hero stats in `index.html` if the totals change.

## Running locally
Any static server works, e.g.:
```
python -m http.server 8000
```
Then open http://localhost:8000

## Deploying (GitHub Pages)
1. Push to the `main` branch of this repo.
2. In GitHub: Settings → Pages → Source: `main` branch, `/ (root)`.
3. Your site will be live at `https://<username>.github.io/Potfolio/`.
