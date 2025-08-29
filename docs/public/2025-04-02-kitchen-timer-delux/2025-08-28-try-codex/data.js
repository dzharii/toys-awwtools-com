// Predefined timer tiles. Keep IDs stable and unique.
// initialDuration is in seconds.
const TIMER_PRESETS = [
  {
    id: "pasta-perfection",
    title: "Pasta Perfection",
    description: "Boil to al dente perfection every time.",
    icon: "🍝",
    category: "Cooking",
    initialDuration: 8 * 60,
    origin: "predefined",
    links: [
      { title: "Serious Eats Pasta Guide", url: "https://www.seriouseats.com/pasta", lastUpdated: "" }
    ]
  },
  {
    id: "tea-time",
    title: "Tea Time",
    description: "Steep tea at your favorite strength.",
    icon: "🍵",
    category: "Beverage",
    initialDuration: 3 * 60,
    origin: "predefined",
    links: []
  },
  {
    id: "perfect-eggs",
    title: "Perfect Eggs",
    description: "Soft-, medium-, or hard-boiled eggs.",
    icon: "🥚",
    category: "Cooking",
    initialDuration: 6 * 60,
    origin: "predefined",
    links: []
  },
  {
    id: "bread-rise",
    title: "Bread Rise",
    description: "Track dough proofing times.",
    icon: "🍞",
    category: "Baking",
    initialDuration: 45 * 60,
    origin: "predefined",
    links: []
  },
];

