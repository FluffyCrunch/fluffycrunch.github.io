# Shifa Khatri — Game Dev Portfolio

A static, single-page portfolio built with plain HTML/CSS/JS (no build step, no framework).

## Structure
- `index.html` — page content/sections
- `css/style.css` — all styling and animations
- `js/games-data.js` — **edit this to add/update games**
- `js/main.js` — boot screen, particle background, scroll reveals, typing effect, card rendering

## Adding a new game
Open `js/games-data.js` and add an entry to the `GAMES` array:

```js
{
  title: "Your Game Title",
  tagline: "One-line hook",
  description: "1-2 sentence description of the game.",
  tags: ["Unity", "C#", "Platformer"],
  gradient: "linear-gradient(135deg,#COLOR1,#COLOR2)", // card cover background
  emoji: "🎮", // placeholder cover icon (swap for real art later if desired)
  playUrl: "https://your-game-host.com/play", // itch.io, Steam, WebGL build, etc.
  status: "Playable" // or "Coming Soon"
}
```
The card renders automatically — no HTML editing needed.

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
