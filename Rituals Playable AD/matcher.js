// ─────────────────────────────────────────────────────────────
//  RITUALS COFFEE HOUSE — DRINK MATCHER
//  Each menu drink has a set of tags that describe it.
//  matchDrink() scores user's selected ingredients against
//  every drink in the same category and returns the best fit.
// ─────────────────────────────────────────────────────────────

const MENU_DRINKS = {
  chiller: [
    {
      name: "Pralines & Cream Chiller",
      image: "images/Pralines & Cream Chiller.png",
      tags: ["praline", "caramel", "cream", "nutty", "sweet", "indulgent"],
      url: "https://ritualscoffeehouse.com/menu/",
      desc: "Nutty pralines meet silky cream in Rituals' most raved-about cold blend. Rich, sweet, and completely addictive.",
    },
    {
      name: "Praline Caramel Chiller",
      image: "images/Praline Caramel Chiller.png",
      tags: ["praline", "caramel", "nutty", "drizzle", "sweet", "rich"],
      url: "https://ritualscoffeehouse.com/menu/",
      desc: "Golden caramel and toasted praline blended to chilled perfection. Every sip is a little celebration.",
    },
    {
      name: "Salted Caramel Chiller",
      image: "images/Salted Caramel Chiller.png",
      tags: ["caramel", "salted", "savory", "sweet", "creamy", "cold"],
      url: "https://ritualscoffeehouse.com/menu/",
      desc: "The unexpected genius of sweet caramel kissed with sea salt — blended cold and impossibly smooth.",
    },
    {
      name: "Caramel Latte Chiller",
      image: "images/Caramel Latte Chiller.png",
      tags: [
        "caramel",
        "latte",
        "coffee",
        "espresso",
        "sweet",
        "milk",
        "dairy",
      ],
      url: "https://ritualscoffeehouse.com/menu/",
      desc: "Latte warmth meets chiller cool — espresso and caramel blended with milk into something magical.",
    },
    {
      name: "Tahitian Vanilla Latte Chiller",
      image: "images/Tahitian Vanilla Latte Chiller.png",
      tags: [
        "vanilla",
        "tahitian",
        "exotic",
        "latte",
        "creamy",
        "milk",
        "sweet",
      ],
      url: "https://ritualscoffeehouse.com/menu/",
      desc: "Rare Tahitian vanilla swirled into a latte chiller. Floral, sweet, and impossibly luxurious.",
    },
    {
      name: "Cookies & Cream Chiller",
      image: "images/Cookies & Cream Chiller.png",
      tags: ["cookies", "cream", "chocolate", "sweet", "indulgent", "crunchy"],
      url: "https://ritualscoffeehouse.com/menu/",
      desc: "Every favourite childhood flavour in a cold blended cup. This one's always a crowd-pleaser.",
    },
    {
      name: "Cake Batter Chiller",
      image: "images/Cake Batter Chiller.png",
      tags: ["cakebatter", "vanilla", "sweet", "fun", "whip", "birthday"],
      url: "https://ritualscoffeehouse.com/menu/",
      desc: "It tastes exactly like birthday cake batter. Yes, really. This one brings the party.",
    },
    {
      name: "Bubble Gum Chiller",
      image: "images/Bubble Gum Chiller.png",
      tags: ["bubblegum", "sweet", "fruity", "fun", "pink", "playful"],
      url: "https://ritualscoffeehouse.com/menu/",
      desc: "Sweet, playful, and impossibly pink. The chiller that turns heads at every Rituals counter.",
    },
    {
      name: "Wild Berry Blast",
      image: "images/Wild Berry Blast.png",
      tags: ["berry", "wild", "fruity", "tangy", "vibrant", "purple"],
      url: "https://ritualscoffeehouse.com/menu/",
      desc: "Bold berry flavours blasted into a vivid cold drink. Bright, tangy, and completely refreshing.",
    },
    {
      name: "Hot Chocolate Chiller",
      image: "images/Hot Chocolate Chiller.png",
      tags: ["chocolate", "mocha", "rich", "dark", "cold", "blended"],
      url: "https://ritualscoffeehouse.com/menu/",
      desc: "Your beloved hot chocolate, reimagined cold. Thick, rich, and deeply chocolatey.",
    },
    {
      name: "Decaf Mocha Chiller",
      image: "images/Decaf Mocha Chiller.png",
      tags: ["decaf", "mocha", "chocolate", "coffee", "mild", "soft"],
      url: "https://ritualscoffeehouse.com/menu/",
      desc: "All the mocha flavour, none of the jitters. The late-night treat you deserve.",
    },
    {
      name: "Coffee Chiller",
      image: "images/Coffee Chiller.png",
      tags: ["coffee", "espresso", "bold", "cold", "blended", "classic"],
      url: "https://ritualscoffeehouse.com/menu/",
      desc: "The OG — pure coffee flavour blended smooth and cold. For the coffee lover who means it.",
    },
  ],

  coffee: [
    {
      name: "Vanilla Latte",
      image: "images/Vanilla Latte.png",
      tags: ["vanilla", "sweet", "latte", "creamy", "milk", "dairy"],
      url: "https://ritualscoffeehouse.com/menu/",
      desc: "Smooth vanilla syrup meets silky steamed milk and rich espresso. One of the most loved on the Rituals menu.",
    },
    {
      name: "Caramel Latte",
      image: "images/Caramel Latte.png",
      tags: ["caramel", "sweet", "latte", "milk", "dairy", "drizzle"],
      url: "https://ritualscoffeehouse.com/menu/",
      desc: "Golden caramel drizzled through a silky latte. Rich, comforting, and always satisfying.",
    },
    {
      name: "Hazelnut Bliss",
      image: "images/Hazelnut Bliss.png",
      tags: ["hazelnut", "nutty", "latte", "bliss", "sweet", "milk"],
      url: "https://ritualscoffeehouse.com/menu/",
      desc: "Toasted hazelnut woven through a velvety latte. Warm, nutty, and deeply satisfying.",
    },
    {
      name: "Mochaccino",
      image: "images/Mochaccino.png",
      tags: ["mocha", "chocolate", "espresso", "milk", "rich", "dark"],
      url: "https://ritualscoffeehouse.com/menu/",
      desc: "Dark chocolate and bold espresso united with velvety steamed milk. Rich. Unapologetic. Iconic.",
    },
    {
      name: "Cafe Latte",
      image: "images/Cafe Latte.png",
      tags: ["latte", "creamy", "milk", "dairy", "espresso", "classic"],
      url: "https://ritualscoffeehouse.com/menu/",
      desc: "The everyday ritual — silky steamed milk over a rich espresso base. Simple perfection.",
    },
    {
      name: "Espresso Macchiato",
      image: "images/Espresso Macchiato.png",
      tags: ["macchiato", "espresso", "bold", "mark", "short", "strong"],
      url: "https://ritualscoffeehouse.com/menu/",
      desc: "A bold espresso marked with just a touch of silky foam. Pure. Direct. For the purists.",
    },
    {
      name: "Espresso Con Panna",
      image: "images/Espresso Con Panna.png",
      tags: ["conpanna", "cream", "panna", "espresso", "whip", "indulgent"],
      url: "https://ritualscoffeehouse.com/menu/",
      desc: "Rich espresso crowned with a cloud of fresh whipped cream. Indulgent simplicity at its finest.",
    },
    {
      name: "Americano",
      image: "images/Americano.png",
      tags: ["espresso", "bold", "hot", "classic", "strong", "black", "double"],
      url: "https://ritualscoffeehouse.com/menu/",
      desc: "Bold espresso and hot water. Clean, strong, and unapologetically classic.",
    },
  ],

  tea: [
    {
      name: "Chai Latte",
      image: "images/Chai Latte.png",
      tags: [
        "chai",
        "latte",
        "creamy",
        "steamed",
        "spice",
        "cinnamon",
        "cardamom",
        "warm",
      ],
      url: "https://ritualscoffeehouse.com/menu/",
      desc: "Warming spices — cinnamon, cardamom, ginger — wrapped in steamed milk. A hug in a cup.",
    },
    {
      name: "Chai Tea",
      image: "images/Chai Tea.png",
      tags: ["chai", "black", "spice", "ginger", "bold", "classic", "tea"],
      url: "https://ritualscoffeehouse.com/menu/",
      desc: "Aromatic spiced tea brewed strong and pure. Classic, comforting, Caribbean.",
    },
    {
      name: "Iced Blended Chai",
      image: "images/Iced Blended Chai.png",
      tags: ["chai", "iced", "blended", "cold", "spice", "refreshing", "milk"],
      url: "https://ritualscoffeehouse.com/menu/",
      desc: "Spiced chai blended with ice into a cool refreshing twist on the beloved classic.",
    },
  ],

  smoothie: [
    {
      name: "Mango Mania",
      image: "images/Mango Mania.png",
      tags: ["mango", "tropical", "sweet", "smooth", "fruity", "caribbean"],
      url: "https://ritualscoffeehouse.com/menu/",
      desc: "Pure Caribbean mango in every sip. Sweet, vibrant, and completely irresistible.",
    },
    {
      name: "Passion Fruit Refresher",
      image: "images/Passion Fruit Refresher.png",
      tags: ["passion", "tangy", "tropical", "refresher", "citrus", "bright"],
      url: "https://ritualscoffeehouse.com/menu/",
      desc: "Tangy passion fruit blended into a bright, tropical refresher. Pure Caribbean sunshine.",
    },
    {
      name: "Extreme Peach Smoothie",
      image: "images/Extreme Peach Smoothie.png",
      tags: ["peach", "smooth", "sweet", "extreme", "fruity", "light"],
      url: "https://ritualscoffeehouse.com/menu/",
      desc: "Sun-ripened peach blended silky-smooth. Naturally sweet and impossibly refreshing.",
    },
    {
      name: "Red Dragon Fruit Refresher",
      image: "images/Red Dragon Fruit Refresher.png",
      tags: [
        "dragonfruit",
        "red",
        "exotic",
        "refresher",
        "tropical",
        "striking",
      ],
      url: "https://ritualscoffeehouse.com/menu/",
      desc: "Stunning crimson dragon fruit blended into a tropical refresher. As beautiful as it tastes.",
    },
  ],
};

// ─────────────────────────────────────────────────────────────
//  SCORING ENGINE
//  Collects all tags from selected ingredients, then scores
//  each menu drink by how many of its tags match.
// ─────────────────────────────────────────────────────────────

function matchDrink(category, selectedIngredients) {
  const drinks = MENU_DRINKS[category];
  if (!drinks || drinks.length === 0) return null;

  // Flatten all tags from the user's chosen ingredients
  const userTags = new Set();
  selectedIngredients.forEach((ing) => {
    (ing.tags || []).forEach((t) => userTags.add(t));
  });

  let best = null;
  let bestScore = -1;

  drinks.forEach((drink) => {
    let score = 0;
    drink.tags.forEach((tag) => {
      if (userTags.has(tag)) score++;
    });
    // Normalise: score relative to drink's total tags (prevents long-tag drinks always winning)
    const normalised = score / drink.tags.length;
    if (normalised > bestScore) {
      bestScore = normalised;
      best = drink;
    }
  });

  // If nothing matched at all, just return the first drink in category
  return best || drinks[0];
}
