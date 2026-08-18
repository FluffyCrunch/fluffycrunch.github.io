// Add or edit games here. Each entry renders a card in the Games section.
// playUrl should point to a real playable build (itch.io, Steam, WebGL host, etc).
const GAMES = [
  {
    title: "Apple Catcher",
    tagline: "Arcade reflex game",
    description: "Catch as many falling apples as you can in 30 seconds. Built with Phaser 3 and Vite — playable right in the browser.",
    tags: ["Phaser 3", "JavaScript", "Arcade"],
    gradient: "linear-gradient(135deg,#5fbb4f,#e63946)",
    emoji: "🍎",
    playUrl: "games/apple-catcher/index.html",
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
