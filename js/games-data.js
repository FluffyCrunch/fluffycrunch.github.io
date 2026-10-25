// Every game in the portfolio. Each entry renders a card in the Library,
// a slide in the hero "attract mode" screen, and a detail modal.
//
// Fields:
//   id          unique slug (used for the modal)
//   title       game name
//   tagline     one-line hook
//   genre       shown as the card's genre label
//   filters     which Library filter chips it shows up under
//   engine      main engine / framework
//   platform    where it runs
//   description 1-3 sentence pitch
//   features    bullet list for the detail modal
//   controls    [key, action] pairs for the detail modal (optional)
//   tags        tech chips
//   shots       screenshots (first one is the cover)
//   accent      card highlight colour
//   playUrl     live build (leave empty if there is none)
//   sourceUrl   GitHub source
//   featured    true for the hero spotlight game
const GAMES = [
  {
    id: "void-rush",
    title: "Void Rush",
    tagline: "3D tower defense, built twice in two engines",
    genre: "Tower Defense",
    filters: ["3d", "strategy"],
    engine: "PixiJS + pixi3d / Babylon.js",
    platform: "Browser (WebGL)",
    description: "Hold the castle against 12 escalating waves, boss fights included. The same map, towers, enemies and wave data run through two completely separate 3D pipelines: PixiJS with pixi3d and a hand-written GLB loader, and Babylon.js.",
    features: [
      "5 tower types: Frost, Laser, Cannon, Tesla and Spike Trap",
      "Branching tower upgrades and a gold economy",
      "12 waves with boss encounters and multiple difficulties",
      "Custom GLB loader so pixi3d can use the Kenney 3D models",
      "One shared data file drives both the PixiJS and Babylon.js builds"
    ],
    controls: [["Click", "Place or select a tower"], ["Drag", "Orbit the camera"], ["Right-drag", "Pan the map"], ["Esc", "Cancel placement"]],
    tags: ["PixiJS", "pixi3d", "Babylon.js", "GLB / glTF", "Vite"],
    shots: ["assets/games/void-rush-1.webp", "assets/games/void-rush-3.webp", "assets/games/void-rush-2.webp"],
    accent: "#8b5cf6",
    playUrl: "https://voidrushpixi.netlify.app/",
    sourceUrl: "https://github.com/FluffyCrunch/Pixi/tree/main/Void-Rush",
    featured: true
  },
  {
    id: "immortal",
    title: "IMmortal",
    tagline: "A noir fighter where every death makes you weaker",
    genre: "Action",
    filters: ["arcade", "story"],
    engine: "Canvas 2D (no engine)",
    platform: "Browser · Desktop + Touch",
    description: "Orans cannot die, but every time he rises, a little less of him comes back. Fight through four areas and a boss to save Mantis in a black-and-white noir brawler with manga-style cutscenes and a soundtrack generated live in the browser.",
    features: [
      "Death is a mechanic: you rise where you fell, enemies stay hurt, but max HP and damage shrink each time",
      "Enemies surround you, fill a poise meter and counter if you spam; perfect-dodge to slow time",
      "Four areas and a boss fight with a mid-fight transformation",
      "Manga-style cutscenes with screentone, eye close-ups and impact frames, all drawn in code",
      "One HTML file with no image or audio files: a step-sequencer soundtrack with fight and boss variants"
    ],
    controls: [["A D / ← →", "Move"], ["Space", "Jump"], ["Click", "Attack combo"], ["Right-click", "Heavy attack"], ["Ctrl", "Dodge roll"], ["E", "Talk"]],
    tags: ["Canvas 2D", "Web Audio API", "JavaScript", "Procedural animation"],
    shots: ["assets/games/immortal-1.webp", "assets/games/immortal-2.webp", "assets/games/immortal-3.webp"],
    accent: "#d4d4d8",
    playUrl: "https://immortal-fluffycrunch.netlify.app",
    sourceUrl: "https://github.com/FluffyCrunch/Random-ideas/tree/main/immortal"
  },
  {
    id: "crystalux",
    title: "Crystalux",
    tagline: "60-second match-3 with combos and bombs",
    genre: "Puzzle",
    filters: ["puzzle", "mobile"],
    engine: "PixiJS v8",
    platform: "Browser · Mobile",
    description: "Swap gems on an 8×8 board, chain cascades into combos and set off bomb gems before the 60-second clock runs out. Built around juice: tweens, pooled particles, callouts and a star rating at the end.",
    features: [
      "Match-3, 4 and 5 score 100 / 250 / 500",
      "Bomb gems, cascades and COMBO / ON FIRE! / MEGA MATCH! callouts",
      "Idle hint system that pulses a valid move after 5 seconds",
      "Scene manager with fade transitions, custom tween system",
      "Bitmap-font HUD, music and SFX, touch support on mobile"
    ],
    controls: [["Click / tap", "Select a gem"], ["Swipe / click neighbour", "Swap"]],
    tags: ["PixiJS v8", "JavaScript", "Tweens", "Particles", "Vite"],
    shots: ["assets/games/crystalux-2.webp", "assets/games/crystalux-1.webp", "assets/games/crystalux-3.webp"],
    accent: "#22d3ee",
    playUrl: "https://crystalux.netlify.app/",
    sourceUrl: "https://github.com/FluffyCrunch/Pixi/tree/main/Crystalux"
  },
  {
    id: "hand-pong",
    title: "Hand Pong",
    tagline: "Pong where your hand is the controller",
    genre: "Arcade",
    filters: ["arcade", "webcam"],
    engine: "Canvas + MediaPipe",
    platform: "Browser · Webcam",
    description: "Hold your hand up to the webcam and move it to block the ball. First to 7 beats the CPU. Comic-book hit effects, screen shake that grows with the rally, and a CPU that gets sharper the more you score.",
    features: [
      "Real-time hand tracking with MediaPipe Hand Landmarker",
      "Paddle-edge hits change the bounce angle",
      "Ball speeds up each hit; sub-stepped so it never tunnels",
      "Adaptive CPU opponent that can still misjudge",
      "Every sound synthesized live with the Web Audio API"
    ],
    controls: [["Hand / mouse", "Move paddle"], ["P / Esc", "Pause"], ["M", "Mute"]],
    tags: ["Canvas", "MediaPipe", "Web Audio API", "Computer Vision"],
    shots: ["assets/games/hand-pong-1.webp"],
    accent: "#facc15",
    playUrl: "https://hand-pong-fluffycrunch.netlify.app",
    sourceUrl: "https://github.com/FluffyCrunch/Random-ideas/tree/main/hand-pong"
  },
  {
    id: "nebula",
    title: "Nebula",
    tagline: "Interactive particle toy with a custom shader",
    genre: "Experience",
    filters: ["experiment", "shaders"],
    engine: "PixiJS v8 + GLSL",
    platform: "Browser · PWA",
    description: "Thousands of glowing particles drift through space. Pull them toward your cursor, click to burst new ones. A custom GLSL filter adds a chromatic-aberration shimmer and a slow breathing pulse.",
    features: [
      "2,000-particle object pool, zero allocations mid-frame",
      "Custom GLSL fragment filter (chromatic aberration + pulse)",
      "Noise-based drift and velocity-aware cursor attraction",
      "Live FPS and particle-count HUD",
      "Installable PWA with offline service worker"
    ],
    controls: [["Move", "Attract particles"], ["Click / tap", "Burst"]],
    tags: ["PixiJS v8", "GLSL", "Object Pooling", "PWA"],
    shots: ["assets/games/nebula-2.webp", "assets/games/nebula-1.webp"],
    accent: "#ec4899",
    playUrl: "https://nebula-pixijs.netlify.app/",
    sourceUrl: "https://github.com/FluffyCrunch/Pixi/tree/main/Nebula"
  },
  {
    id: "flappy-bird",
    title: "Flappy Bird",
    tagline: "The classic, rebuilt in Unity",
    genre: "Arcade",
    filters: ["arcade", "unity"],
    engine: "Unity 2021.3 · C#",
    platform: "Desktop · Mobile",
    description: "A faithful Flappy Bird remake built in Unity: gravity-based bird physics, a randomised pipe spawner, parallax scrolling and a full play → game over → restart loop.",
    features: [
      "Player.cs: gravity, flap impulse and sprite animation",
      "Spawner.cs: timed pipe spawns with randomised gap height",
      "Parallax.cs: layered scrolling background",
      "GameManager.cs: game state, score and UI",
      "Keyboard, mouse and touch input"
    ],
    controls: [["Space / click / tap", "Flap"]],
    tags: ["Unity", "C#", "2D Physics", "Prefabs"],
    shots: ["assets/games/flappy-bird-1.webp"],
    accent: "#4ade80",
    playUrl: "",
    sourceUrl: "https://github.com/FluffyCrunch/Unity-Game/tree/main/Flappy_Bird"
  },
  {
    id: "apple-catcher",
    title: "Apple Catcher",
    tagline: "30 seconds, one basket, as many apples as you can",
    genre: "Arcade",
    filters: ["arcade"],
    engine: "Phaser 3",
    platform: "Browser",
    description: "My first Phaser game. Slide the basket, catch falling apples, and get 10 before the 30-second timer ends to win.",
    features: [
      "Phaser Arcade Physics",
      "Particle burst on every catch",
      "Countdown timer, live score and win / lose screens",
      "Background music and coin SFX"
    ],
    controls: [["← →", "Move basket"]],
    tags: ["Phaser 3", "JavaScript", "Arcade Physics", "Vite"],
    shots: ["assets/games/apple-catcher-1.webp"],
    accent: "#f97316",
    playUrl: "",
    sourceUrl: "https://github.com/FluffyCrunch/Phaser/tree/main/AppleCatcher"
  },
  {
    id: "fog-mirror",
    title: "Fog Mirror",
    tagline: "Wipe a steamy mirror clean with your real hand",
    genre: "Toy",
    filters: ["experiment", "webcam"],
    engine: "Canvas + MediaPipe",
    platform: "Browser · Webcam",
    description: "Your webcam becomes a fogged-up bathroom mirror. Wave your hand to wipe the fog away and watch it slowly creep back, with water drips running from the edges of each wipe.",
    features: [
      "Hand tracking paints a mask that cuts through the fog",
      "Fog fades back in over time, with adjustable comeback speed",
      "Wipe with your whole hand, all fingers or one finger",
      "Snap and save a picture of the mirror",
      "Runs fully on-device; no video leaves the browser"
    ],
    controls: [["Hand / drag", "Wipe fog"], ["R", "Fog it again"], ["H", "Hide menu"]],
    tags: ["Canvas", "MediaPipe", "Computer Vision"],
    shots: ["assets/games/fog-mirror-1.webp"],
    accent: "#38bdf8",
    playUrl: "https://fog-mirror-fluffycrunch.netlify.app",
    sourceUrl: "https://github.com/FluffyCrunch/Random-ideas/tree/main/fog-mirror"
  }
];

// Library filter chips, in display order.
const GAME_FILTERS = [
  { id: "all", label: "All Games" },
  { id: "3d", label: "3D" },
  { id: "arcade", label: "Arcade" },
  { id: "puzzle", label: "Puzzle" },
  { id: "unity", label: "Unity" },
  { id: "webcam", label: "Hand-Tracked" },
  { id: "experiment", label: "Experiments" }
];
