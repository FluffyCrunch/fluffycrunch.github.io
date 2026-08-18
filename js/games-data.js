// Add or edit games here. Each entry renders a card in the Games section.
// playUrl should point to a real playable build (itch.io, Steam, WebGL host, etc).
const GAMES = [
  {
    title: "Void Rush",
    tagline: "3D tower defense, built from scratch",
    description: "A 3D tower defense game running entirely in the browser — no game engine, no editor, mostly no premade assets. 12 waves, 4 upgradeable towers, a shielded final boss. Every sound is synthesized live with the Web Audio API, and the fire, smoke, and terrain are procedural.",
    tags: ["PixiJS", "WebGL", "Web Audio API", "3D"],
    cover: "assets/games/void-rush-1.png",
    gradient: "linear-gradient(135deg,#2e8b57,#1b3a6b)",
    emoji: "🏰",
    playUrl: "https://voidrushpixi.netlify.app/",
    status: "Playable"
  },
  {
    title: "Flappy Bird",
    tagline: "Classic side-scroller remake",
    description: "A faithful Flappy Bird remake built in Unity — bird physics, parallax background, pipe spawner, and score system.",
    tags: ["Unity", "C#", "Arcade"],
    gradient: "linear-gradient(135deg,#4fc3f7,#7b5cff)",
    emoji: "🐦",
    playUrl: "https://github.com/FluffyCrunch/Unity-Game/tree/main/Flappy_Bird",
    status: "View Source"
  }
];
