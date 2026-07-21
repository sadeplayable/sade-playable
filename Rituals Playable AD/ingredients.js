// ─────────────────────────────────────────────────────────────
//  RITUALS COFFEE HOUSE — INGREDIENTS DATA
//
//  Each ingredient maps to the REAL components of Rituals drinks.
//  Tags are shared with matcher.js drink tags so the scorer works.
//
//  GRAYOUT LOGIC:
//  Each ingredient also has a `locks` array — once a user picks
//  ingredients that strongly commit to a drink direction,
//  ingredients that belong to competing drinks get grayed out.
// ─────────────────────────────────────────────────────────────

const INGREDIENTS = {
  // ── CHILLERS ────────────────────────────────────────────────
  // Cold-blended drinks. Each has a flavour base + milk + extras.
  // Real drinks: Pralines & Cream, Praline Caramel, Salted Caramel,
  //   Caramel Latte, Tahitian Vanilla Latte, Cookies & Cream,
  //   Cake Batter, Bubble Gum, Wild Berry Blast,
  //   Hot Chocolate, Decaf Mocha, Coffee Chiller

  chiller: {
    label: "Chiller",
    isIced: true,
    hasFoam: true,
    hasStraw: true,
    baseColor: "#b8d4e8",
    suggestions: [
      "Tropical Storm",
      "Caribbean Sunset",
      "Island Chill",
      "Velvet Thunder",
      "Sweet Escape",
    ],

    tabs: [
      {
        id: "flavour",
        label: "🍫 Flavour",
        items: [
          {
            id: "caramel-syrup",
            label: "Caramel Syrup",
            color: "#c8841a",
            emoji: "🍮",
            tags: ["caramel", "sweet", "rich", "drizzle"],
            // Caramel = Salted Caramel, Caramel Latte, Praline Caramel, Pralines & Cream
          },
          {
            id: "praline",
            label: "Praline Crunch",
            color: "#a0521a",
            emoji: "🥜",
            tags: ["praline", "nutty", "caramel", "indulgent"],
            // Pralines & Cream, Praline Caramel
          },
          {
            id: "sea-salt",
            label: "Sea Salt",
            color: "#94a3b8",
            emoji: "🧂",
            tags: ["salted", "savory", "caramel"],
            // Salted Caramel Chiller
          },
          {
            id: "vanilla-bean",
            label: "Vanilla Bean",
            color: "#e8c870",
            emoji: "🍦",
            tags: ["vanilla", "sweet", "creamy", "tahitian"],
            // Tahitian Vanilla Latte Chiller, Cake Batter
          },
          {
            id: "tahitian-vanilla",
            label: "Tahitian Vanilla",
            color: "#d4a96a",
            emoji: "🌺",
            tags: ["tahitian", "vanilla", "exotic", "floral"],
            // Tahitian Vanilla Latte Chiller specifically
          },
          {
            id: "dark-chocolate",
            label: "Dark Chocolate",
            color: "#3d1505",
            emoji: "🍫",
            tags: ["chocolate", "dark", "rich", "mocha"],
            // Hot Choc Chiller, Decaf Mocha, Cookies & Cream
          },
          {
            id: "oreo-cookie",
            label: "Oreo Cookie",
            color: "#1a1a1a",
            emoji: "🍪",
            tags: ["cookies", "cream", "chocolate", "crunchy", "sweet"],
            // Cookies & Cream Chiller
          },
          {
            id: "cake-batter",
            label: "Cake Batter",
            color: "#fbbf24",
            emoji: "🎂",
            tags: ["cakebatter", "sweet", "vanilla", "fun", "birthday"],
            // Cake Batter Chiller
          },
          {
            id: "bubblegum",
            label: "Bubble Gum",
            color: "#f472b6",
            emoji: "🫧",
            tags: ["bubblegum", "sweet", "fruity", "fun", "pink", "playful"],
            // Bubble Gum Chiller
          },
          {
            id: "wildberry",
            label: "Wild Berry Mix",
            color: "#7c3aed",
            emoji: "🫐",
            tags: ["berry", "wild", "fruity", "tangy", "vibrant", "purple"],
            // Wild Berry Blast
          },
          {
            id: "espresso-shot",
            label: "Espresso Shot",
            color: "#2d0a00",
            emoji: "⚡",
            tags: ["coffee", "espresso", "bold", "latte"],
            // Coffee Chiller, Caramel Latte Chiller, Decaf Mocha
          },
          {
            id: "decaf-espresso",
            label: "Decaf Shot",
            color: "#5a3020",
            emoji: "😴",
            tags: ["decaf", "coffee", "mild", "mocha", "soft"],
            // Decaf Mocha Chiller specifically
          },
        ],
      },
      {
        id: "milk",
        label: "🥛 Milk Base",
        items: [
          {
            id: "whole-milk",
            label: "Whole Milk",
            color: "#fff8e8",
            emoji: "🥛",
            tags: ["creamy", "milk", "dairy", "latte"],
            // Most lattes and cream-based chillers
          },
          {
            id: "heavy-cream",
            label: "Heavy Cream",
            color: "#fffff0",
            emoji: "🫙",
            tags: ["cream", "rich", "indulgent"],
            // Pralines & Cream, Espresso Con Panna style
          },
          {
            id: "oat-milk",
            label: "Oat Milk",
            color: "#e8d9b0",
            emoji: "🌾",
            tags: ["oat", "vegan", "mild", "smooth"],
          },
          {
            id: "coconut-milk",
            label: "Coconut Milk",
            color: "#f0f0e0",
            emoji: "🥥",
            tags: ["coconut", "tropical", "light"],
          },
        ],
      },
      {
        id: "extras",
        label: "✨ Toppings",
        items: [
          {
            id: "whip",
            label: "Whipped Cream",
            color: "#f5f5f0",
            emoji: "☁️",
            tags: ["whip", "indulgent", "creamy", "sweet"],
            // Pralines & Cream, Cake Batter, most chillers
          },
          {
            id: "caramel-drizzle",
            label: "Caramel Drizzle",
            color: "#c8841a",
            emoji: "🍯",
            tags: ["caramel", "drizzle", "sweet", "rich"],
            // Pralines & Cream, Praline Caramel, Salted Caramel
          },
          {
            id: "choc-drizzle",
            label: "Choc Drizzle",
            color: "#3d1a05",
            emoji: "🍫",
            tags: ["chocolate", "drizzle", "dark"],
            // Hot Choc, Decaf Mocha, Cookies & Cream
          },
          {
            id: "crushed-ice",
            label: "Crushed Ice",
            color: "#cce8f8",
            emoji: "🧊",
            tags: ["cold", "iced", "blended", "refreshing"],
          },
          {
            id: "pecan-bits",
            label: "Pecan Bits",
            color: "#8b5e3c",
            emoji: "🌰",
            tags: ["praline", "nutty", "crunchy", "indulgent"],
            // Pralines & Cream, Praline Caramel — the actual nut
          },
          {
            id: "cookie-crumble",
            label: "Cookie Crumble",
            color: "#c8a870",
            emoji: "🍪",
            tags: ["cookies", "crunchy", "sweet"],
            // Cookies & Cream
          },
        ],
      },
    ],
  },

  // ── COFFEE ──────────────────────────────────────────────────
  // Espresso-based hot or iced drinks.
  // Real drinks: Vanilla Latte, Caramel Latte, Hazelnut Bliss,
  //   Mochaccino, Cafe Latte, Espresso Macchiato,
  //   Espresso Con Panna, Americano

  coffee: {
    label: "Coffee",
    isIced: false,
    hasFoam: true,
    hasStraw: false,
    baseColor: "#6b3015",
    suggestions: [
      "Morning Ritual",
      "Dark & Stormy",
      "Velvet Rush",
      "Trini Brew",
      "Golden Hour",
    ],

    tabs: [
      {
        id: "espresso",
        label: "⚡ Espresso",
        items: [
          {
            id: "single-shot",
            label: "Single Shot",
            color: "#2d0e00",
            emoji: "⚡",
            tags: ["espresso", "bold", "classic"],
            // Cafe Latte, Vanilla Latte, Caramel Latte base
          },
          {
            id: "double-shot",
            label: "Double Shot",
            color: "#1a0700",
            emoji: "⚡⚡",
            tags: ["espresso", "double", "strong", "bold"],
            // Americano, Mochaccino — richer body
          },
          {
            id: "ristretto",
            label: "Ristretto",
            color: "#0d0500",
            emoji: "💧",
            tags: ["espresso", "intense", "short", "mark"],
            // Espresso Macchiato — short, concentrated
          },
          {
            id: "decaf-shot",
            label: "Decaf Shot",
            color: "#6b4030",
            emoji: "😴",
            tags: ["decaf", "mild", "soft", "espresso"],
          },
          {
            id: "hot-water",
            label: "Hot Water",
            color: "#a0c0d0",
            emoji: "💧",
            tags: ["hot", "classic", "black", "bold", "strong"],
            // Americano = espresso + hot water
          },
        ],
      },
      {
        id: "flavour",
        label: "🍮 Flavour",
        items: [
          {
            id: "cf-vanilla",
            label: "Vanilla Syrup",
            color: "#e8c870",
            emoji: "🍦",
            tags: ["vanilla", "sweet", "latte"],
            // Vanilla Latte
          },
          {
            id: "cf-caramel",
            label: "Caramel Syrup",
            color: "#c8841a",
            emoji: "🍮",
            tags: ["caramel", "sweet", "latte", "drizzle"],
            // Caramel Latte
          },
          {
            id: "cf-hazelnut",
            label: "Hazelnut Syrup",
            color: "#8b4513",
            emoji: "🌰",
            tags: ["hazelnut", "nutty", "bliss", "latte"],
            // Hazelnut Bliss
          },
          {
            id: "cf-chocolate",
            label: "Chocolate Sauce",
            color: "#3d1a05",
            emoji: "🍫",
            tags: ["mocha", "chocolate", "rich", "dark"],
            // Mochaccino
          },
          {
            id: "cf-whip",
            label: "Whipped Cream",
            color: "#f5f5f0",
            emoji: "☁️",
            tags: ["whip", "panna", "cream", "indulgent"],
            // Espresso Con Panna = espresso + whipped cream (that's literally it)
          },
          {
            id: "cf-foam",
            label: "Milk Foam",
            color: "#f0e8d8",
            emoji: "🫧",
            tags: ["latte", "creamy", "mark", "foam"],
            // Macchiato = espresso "marked" with foam
          },
        ],
      },
      {
        id: "milk",
        label: "🥛 Milk",
        items: [
          {
            id: "cf-steamed",
            label: "Steamed Milk",
            color: "#fff8e8",
            emoji: "🥛",
            tags: ["latte", "creamy", "dairy", "milk", "steamed"],
            // Latte, Mochaccino, Hazelnut Bliss — always steamed milk
          },
          {
            id: "cf-oat",
            label: "Oat Milk",
            color: "#e8d9b0",
            emoji: "🌾",
            tags: ["oat", "vegan", "latte"],
          },
          {
            id: "cf-nonfat",
            label: "Non-fat Milk",
            color: "#eaf4ff",
            emoji: "💧",
            tags: ["light", "nonfat", "latte"],
          },
        ],
      },
    ],
  },

  // ── TEA ─────────────────────────────────────────────────────
  // Chai-based drinks.
  // Real drinks: Chai Latte, Chai Tea, Iced Blended Chai
  //
  // Chai = black tea + warm spices (cinnamon, cardamom, ginger,
  //   cloves) + milk (latte) or just water (plain tea) or over ice

  tea: {
    label: "Tea",
    isIced: false,
    hasFoam: true,
    hasStraw: false,
    baseColor: "#9a6020",
    suggestions: [
      "Spice Route",
      "Morning Calm",
      "Island Chai",
      "Trini Spice",
      "Golden Brew",
    ],

    tabs: [
      {
        id: "base",
        label: "🍵 Tea Base",
        items: [
          {
            id: "black-tea",
            label: "Black Tea",
            color: "#3d1a05",
            emoji: "🫖",
            tags: ["chai", "black", "bold", "tea", "classic"],
            // All three Rituals tea drinks use black tea as the base
          },
          {
            id: "chai-concentrate",
            label: "Chai Concentrate",
            color: "#c87030",
            emoji: "🍵",
            tags: ["chai", "spice", "warm", "iced", "blended"],
            // Pre-spiced chai — used in Iced Blended Chai
          },
        ],
      },
      {
        id: "spice",
        label: "🌿 Spices",
        items: [
          {
            id: "cinnamon",
            label: "Cinnamon",
            color: "#9b4a1a",
            emoji: "🪵",
            tags: ["cinnamon", "warm", "spice", "chai"],
            // Key chai spice — Chai Latte, Chai Tea
          },
          {
            id: "cardamom",
            label: "Cardamom",
            color: "#7a8a30",
            emoji: "💚",
            tags: ["cardamom", "aromatic", "chai", "spice"],
            // Classic chai spice — Chai Latte especially
          },
          {
            id: "ginger",
            label: "Fresh Ginger",
            color: "#c89020",
            emoji: "🫚",
            tags: ["ginger", "chai", "spice", "bold", "zing"],
            // Chai Tea — the punchy, bold, pure version
          },
          {
            id: "cloves",
            label: "Cloves",
            color: "#3d1a0a",
            emoji: "🤎",
            tags: ["clove", "deep", "chai", "spice"],
            // Traditional masala chai blend
          },
          {
            id: "star-anise",
            label: "Star Anise",
            color: "#4a2a0a",
            emoji: "⭐",
            tags: ["chai", "spice", "aromatic", "warm"],
          },
        ],
      },
      {
        id: "milk-t",
        label: "🥛 Milk",
        items: [
          {
            id: "t-steamed",
            label: "Steamed Milk",
            color: "#fff8e8",
            emoji: "🥛",
            tags: ["latte", "creamy", "steamed", "milk"],
            // Chai Latte = spiced tea + steamed milk + foam
          },
          {
            id: "t-oat",
            label: "Oat Milk",
            color: "#e8d9b0",
            emoji: "🌾",
            tags: ["oat", "vegan", "mild", "latte"],
          },
          {
            id: "t-iced",
            label: "Over Ice",
            color: "#cce8f8",
            emoji: "🧊",
            tags: ["iced", "blended", "cold", "refreshing"],
            // Iced Blended Chai = blend over ice
          },
          {
            id: "t-honey",
            label: "Honey",
            color: "#fbbf24",
            emoji: "🍯",
            tags: ["sweet", "honey", "warm", "natural"],
            // Sweetener for plain Chai Tea
          },
        ],
      },
    ],
  },

  // ── SMOOTHIES ───────────────────────────────────────────────
  // Fruit-forward blended drinks.
  // Real drinks: Mango Mania, Passion Fruit Refresher,
  //   Extreme Peach Smoothie, Red Dragon Fruit Refresher

  smoothie: {
    label: "Smoothie",
    isIced: true,
    hasFoam: false,
    hasStraw: true,
    baseColor: "#e05878",
    suggestions: [
      "Tropic Thunder",
      "Caribbean Kiss",
      "Sunrise Blend",
      "Island Dream",
      "Passion Wave",
    ],

    tabs: [
      {
        id: "fruit",
        label: "🍑 Fruit",
        items: [
          {
            id: "mango",
            label: "Ripe Mango",
            color: "#f59e0b",
            emoji: "🥭",
            tags: ["mango", "tropical", "sweet", "smooth", "caribbean"],
            // Mango Mania — star ingredient
          },
          {
            id: "passion-fruit",
            label: "Passion Fruit",
            color: "#d97706",
            emoji: "🍋‍🟩",
            tags: [
              "passion",
              "tangy",
              "tropical",
              "refresher",
              "citrus",
              "bright",
            ],
            // Passion Fruit Refresher
          },
          {
            id: "peach",
            label: "Ripe Peach",
            color: "#fb923c",
            emoji: "🍑",
            tags: ["peach", "smooth", "sweet", "extreme", "fruity", "light"],
            // Extreme Peach Smoothie
          },
          {
            id: "dragonfruit",
            label: "Dragon Fruit",
            color: "#be185d",
            emoji: "🐉",
            tags: [
              "dragonfruit",
              "red",
              "exotic",
              "refresher",
              "tropical",
              "striking",
            ],
            // Red Dragon Fruit Refresher — the main act
          },
          {
            id: "pineapple",
            label: "Pineapple",
            color: "#eab308",
            emoji: "🍍",
            tags: ["pineapple", "tropical", "tangy", "bright"],
            // Supports Passion Fruit Refresher direction
          },
          {
            id: "coconut",
            label: "Coconut",
            color: "#a3a3a3",
            emoji: "🥥",
            tags: ["coconut", "tropical", "mild", "caribbean"],
            // Caribbean flair — Mango Mania direction
          },
        ],
      },
      {
        id: "boost",
        label: "💪 Boost",
        items: [
          {
            id: "lime-juice",
            label: "Lime Juice",
            color: "#65a30d",
            emoji: "🍋",
            tags: ["lime", "tangy", "citrus", "bright", "refresher"],
            // Refresher drinks — Passion Fruit & Dragon Fruit
          },
          {
            id: "honey-boost",
            label: "Honey",
            color: "#f59e0b",
            emoji: "🍯",
            tags: ["honey", "sweet", "natural", "smooth"],
            // Peach Smoothie — naturally sweet, gentle
          },
          {
            id: "chia",
            label: "Chia Seeds",
            color: "#4b5563",
            emoji: "🌱",
            tags: ["chia", "health", "texture", "smooth"],
          },
          {
            id: "ginger-boost",
            label: "Ginger Zing",
            color: "#c89020",
            emoji: "⚡",
            tags: ["ginger", "zing", "tropical", "bright"],
            // Works with Passion / Dragon fruit refreshers
          },
        ],
      },
      {
        id: "base-sm",
        label: "💧 Liquid Base",
        items: [
          {
            id: "coconut-water",
            label: "Coconut Water",
            color: "#e8f8f0",
            emoji: "🥥",
            tags: ["coconut", "light", "refreshing", "tropical", "caribbean"],
            // Refreshers — Dragon Fruit, Passion Fruit
          },
          {
            id: "sm-milk",
            label: "Fresh Milk",
            color: "#fff8e8",
            emoji: "🥛",
            tags: ["creamy", "dairy", "smooth", "sweet"],
            // Mango Mania, Peach Smoothie — creamier versions
          },
          {
            id: "sm-yogurt",
            label: "Greek Yogurt",
            color: "#fef9f0",
            emoji: "🫙",
            tags: ["yogurt", "thick", "smooth", "creamy", "extreme"],
            // Extreme Peach Smoothie — thick & rich
          },
          {
            id: "crushed-ice-sm",
            label: "Crushed Ice",
            color: "#cce8f8",
            emoji: "🧊",
            tags: ["iced", "cold", "refreshing", "blended"],
          },
        ],
      },
    ],
  },
};
