// ─────────────────────────────────────────────────────────────
//  RITUALS COFFEE HOUSE — PLAYABLE AD APP LOGIC
//  Enhanced with Web Audio sound FX + juicy animations
//  + enforced build order (base → flavour → extras)
// ─────────────────────────────────────────────────────────────

const state = {
  category: null,
  selectedIngredients: [],
  drinkName: "",
  activeTab: null,
};

// ─────────────────────────────────────────────────────────────
//  TAB ORDER RULES
//  First two tabs are REQUIRED (≥1 pick each).
//  Third tab is optional (bonus extras).
//  A tab is LOCKED if the tab before it has 0 picks.
// ─────────────────────────────────────────────────────────────

// Friendly labels for each tab's required pick prompt
const TAB_PROMPTS = {
  // Chiller
  flavour: "Pick a flavour first ☝️",
  milk: "Now choose your milk base 🥛",
  extras: "Optional — add any toppings you like ✨",
  // Coffee
  espresso: "Choose your espresso first ⚡",
  // Tea
  base: "Choose your tea base first 🍵",
  spice: "Now pick your spices 🌿",
  "milk-t": "Optional — add milk or sweetener ✨",
  // Smoothie
  fruit: "Pick your fruit first 🍑",
  boost: "Now pick a boost 💪",
  "base-sm": "Optional — add a liquid base ✨",
};

function getTabOrder(cat) {
  return cat.tabs.map((t) => t.id);
}

function getTabIndex(cat, tabId) {
  return getTabOrder(cat).indexOf(tabId);
}

// How many ingredients the user has from a specific tab
function countPicksInTab(cat, tabId) {
  const tab = cat.tabs.find((t) => t.id === tabId);
  if (!tab) return 0;
  const tabItemIds = new Set(tab.items.map((i) => i.id));
  return state.selectedIngredients.filter((s) => tabItemIds.has(s.id)).length;
}

// Is this tab unlocked? Tab 0 always yes. Tab N requires tab N-1 to have ≥1 pick.
function isTabUnlocked(cat, tabId) {
  const idx = getTabIndex(cat, tabId);
  if (idx === 0) return true;
  const prevTabId = getTabOrder(cat)[idx - 1];
  return countPicksInTab(cat, prevTabId) >= 1;
}

// Are all REQUIRED tabs (first two) satisfied?
function requiredTabsSatisfied(cat) {
  const order = getTabOrder(cat);
  const required = order.slice(0, 2); // first two tabs mandatory
  return required.every((tabId) => countPicksInTab(cat, tabId) >= 1);
}

// ──────────────────────────────────────────────
//  WEB AUDIO ENGINE
// ──────────────────────────────────────────────

let audioCtx = null;

function getAudio() {
  if (!audioCtx)
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

function playTone({
  freq = 440,
  type = "sine",
  duration = 0.12,
  volume = 0.18,
  attack = 0.005,
  decay = 0.08,
  freqEnd = null,
}) {
  try {
    const ctx = getAudio();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    if (freqEnd)
      osc.frequency.linearRampToValueAtTime(
        freqEnd,
        ctx.currentTime + duration,
      );
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + attack);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      ctx.currentTime + attack + decay,
    );
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch (e) {}
}

function playChord(freqs, opts = {}) {
  freqs.forEach((f, i) =>
    setTimeout(() => playTone({ freq: f, ...opts }), i * 40),
  );
}

const SFX = {
  selectCat() {
    playTone({
      freq: 520,
      type: "triangle",
      duration: 0.18,
      volume: 0.2,
      freqEnd: 680,
    });
  },
  addIngredient(idx) {
    const notes = [330, 370, 415, 466, 523, 587, 659, 740];
    const freq = notes[idx % notes.length];
    playTone({
      freq,
      type: "triangle",
      duration: 0.14,
      volume: 0.22,
      freqEnd: freq * 1.08,
    });
  },
  removeIngredient() {
    playTone({
      freq: 330,
      type: "sine",
      duration: 0.1,
      volume: 0.12,
      freqEnd: 240,
    });
  },
  tabSwitch() {
    playTone({ freq: 480, type: "sine", duration: 0.08, volume: 0.1 });
  },
  tabLocked() {
    playTone({
      freq: 180,
      type: "sawtooth",
      duration: 0.1,
      volume: 0.1,
      freqEnd: 150,
    });
  },
  navForward() {
    playChord([440, 554, 659], {
      type: "triangle",
      duration: 0.14,
      volume: 0.16,
      decay: 0.1,
    });
  },
  navBack() {
    playTone({
      freq: 350,
      type: "sine",
      duration: 0.1,
      volume: 0.12,
      freqEnd: 280,
    });
  },
  milestone() {
    [523, 659, 784, 1047].forEach((f, i) =>
      setTimeout(
        () =>
          playTone({
            freq: f,
            type: "triangle",
            duration: 0.12,
            volume: 0.2,
            freqEnd: f * 1.05,
          }),
        i * 60,
      ),
    );
  },
  grayedClick() {
    playTone({
      freq: 200,
      type: "sawtooth",
      duration: 0.06,
      volume: 0.08,
      freqEnd: 180,
    });
  },
  reveal() {
    [523, 659, 784, 880, 1047].forEach((f, i) =>
      setTimeout(
        () =>
          playTone({
            freq: f,
            type: "triangle",
            duration: 0.28,
            volume: 0.22,
            decay: 0.25,
          }),
        i * 80,
      ),
    );
  },
  reset() {
    playTone({
      freq: 380,
      type: "sine",
      duration: 0.15,
      volume: 0.12,
      freqEnd: 460,
    });
  },
  nameType() {
    playTone({
      freq: 600 + Math.random() * 100,
      type: "sine",
      duration: 0.04,
      volume: 0.06,
    });
  },
  tabUnlock() {
    playChord([440, 554], {
      type: "triangle",
      duration: 0.1,
      volume: 0.18,
      decay: 0.08,
    });
  },
};

// ──────────────────────────────────────────────
//  VISUAL FX HELPERS
// ──────────────────────────────────────────────

function spawnParticle(x, y, emoji) {
  const el = document.createElement("div");
  el.className = "float-particle";
  el.textContent = emoji;
  el.style.left = x + "px";
  el.style.top = y + "px";
  document.body.appendChild(el);
  el.addEventListener("animationend", () => el.remove());
}

function burstParticles(x, y, emojis, count = 4) {
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      spawnParticle(
        x + (Math.random() - 0.5) * 60,
        y + (Math.random() - 0.5) * 40,
        emojis[Math.floor(Math.random() * emojis.length)],
      );
    }, i * 60);
  }
}

function rippleBtn(btn, e) {
  const rect = btn.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = (e ? e.clientX - rect.left : rect.width / 2) - size / 2;
  const y = (e ? e.clientY - rect.top : rect.height / 2) - size / 2;
  const ripple = document.createElement("span");
  ripple.className = "btn-ripple";
  ripple.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px`;
  btn.appendChild(ripple);
  ripple.addEventListener("animationend", () => ripple.remove());
}

function showToast(text) {
  const old = document.querySelector(".streak-toast");
  if (old) old.remove();
  const toast = document.createElement("div");
  toast.className = "streak-toast";
  toast.textContent = text;
  document.body.appendChild(toast);
  toast.addEventListener("animationend", () => toast.remove());
}

function wiggleCup() {
  const cup = document.getElementById("cup-outer");
  if (!cup) return;
  cup.classList.remove("wiggle");
  void cup.offsetWidth;
  cup.classList.add("wiggle");
  cup.addEventListener("animationend", () => cup.classList.remove("wiggle"), {
    once: true,
  });
}

function bumpBadge() {
  const badge = document.getElementById("ing-badge");
  if (!badge) return;
  badge.classList.remove("bump");
  void badge.offsetWidth;
  badge.classList.add("bump");
  badge.addEventListener("animationend", () => badge.classList.remove("bump"), {
    once: true,
  });
}

function spawnSparkles(container, count = 6) {
  const symbols = ["✨", "⭐", "🌟", "💫", "✦"];
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const sp = document.createElement("div");
      sp.className = "sparkle";
      sp.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      sp.style.left = Math.random() * 100 + "%";
      sp.style.top = Math.random() * 100 + "%";
      container.appendChild(sp);
      sp.addEventListener("animationend", () => sp.remove());
    }, i * 80);
  }
}

// ──────────────────────────────────────────────
//  SCREENS
// ──────────────────────────────────────────────

function showScreen(id) {
  document
    .querySelectorAll(".screen")
    .forEach((s) => s.classList.remove("active"));
  const el = document.getElementById(id);
  el.classList.add("active", "slide-in");
  el.addEventListener("animationend", () => el.classList.remove("slide-in"), {
    once: true,
  });
  el.scrollTop = 0;
}

// ──────────────────────────────────────────────
//  SCREEN 1 — CATEGORY
// ──────────────────────────────────────────────

function selectCat(btn) {
  SFX.selectCat();
  document
    .querySelectorAll(".cat-card")
    .forEach((b) => b.classList.remove("selected"));
  btn.classList.add("selected");
  state.category = btn.dataset.cat;
  state.selectedIngredients = [];
  const rect = btn.getBoundingClientRect();
  const catEmojis = {
    chiller: ["🧋", "❄️", "✨"],
    coffee: ["☕", "⚡", "💛"],
    tea: ["🍵", "🌿", "✨"],
    smoothie: ["🥤", "🍑", "🌺"],
  };
  burstParticles(
    rect.left + rect.width / 2,
    rect.top + rect.height / 2,
    catEmojis[state.category] || ["✨"],
    3,
  );
  const cta = document.getElementById("cat-cta");
  cta.removeAttribute("disabled");
  cta.classList.add("ready");
}

function goToCategory() {
  SFX.navBack();
  showScreen("screen-category");
}

// ──────────────────────────────────────────────
//  SCREEN 2 — INGREDIENTS
// ──────────────────────────────────────────────

function goToIngredients() {
  if (!state.category) return;
  SFX.navForward();
  const cat = INGREDIENTS[state.category];
  buildTabs(cat);
  renderCup();
  showScreen("screen-ingredients");
  updateIngCta();
}

function buildTabs(cat) {
  const tabBar = document.getElementById("ing-tabs");
  const grid = document.getElementById("ing-grid");
  tabBar.innerHTML = "";
  grid.innerHTML = "";

  cat.tabs.forEach((tab, i) => {
    const btn = document.createElement("button");
    const unlocked = isTabUnlocked(cat, tab.id);
    const isOptional = i === cat.tabs.length - 1; // last tab always optional

    btn.className =
      "ing-tab" + (i === 0 ? " active" : "") + (!unlocked ? " tab-locked" : "");
    btn.dataset.tab = tab.id;

    // Show lock icon on locked tabs
    btn.innerHTML = unlocked ? tab.label : `🔒 ${tab.label}`;

    btn.onclick = () => {
      if (!isTabUnlocked(cat, tab.id)) {
        SFX.tabLocked();
        // Show which tab they need to fill first
        const tabIdx = getTabIndex(cat, tab.id);
        const prevTab = cat.tabs[tabIdx - 1];
        showToast(
          `Pick a ${prevTab.label.replace(/[^\w\s]/g, "").trim()} first!`,
        );
        // Shake the locked tab button
        btn.classList.remove("tab-locked-shake");
        void btn.offsetWidth;
        btn.classList.add("tab-locked-shake");
        btn.addEventListener(
          "animationend",
          () => btn.classList.remove("tab-locked-shake"),
          { once: true },
        );
        return;
      }
      switchTab(tab.id, cat);
    };
    tabBar.appendChild(btn);
  });

  state.activeTab = cat.tabs[0].id;
  renderTabItems(cat.tabs[0], grid);
  renderStepIndicator(cat);
}

function switchTab(tabId, cat) {
  SFX.tabSwitch();
  state.activeTab = tabId;
  document.querySelectorAll(".ing-tab").forEach((b) => {
    b.classList.toggle("active", b.dataset.tab === tabId);
  });
  const tab = cat.tabs.find((t) => t.id === tabId);
  renderTabItems(tab, document.getElementById("ing-grid"));
}

// ──────────────────────────────────────────────
//  STEP INDICATOR — shows progress across tabs
// ──────────────────────────────────────────────

function renderStepIndicator(cat) {
  let indicator = document.getElementById("step-indicator");
  if (!indicator) {
    indicator = document.createElement("div");
    indicator.id = "step-indicator";
    indicator.className = "step-indicator";
    const panel = document.querySelector(".ingredient-panel");
    panel.insertBefore(indicator, panel.firstChild);
  }

  indicator.innerHTML = "";
  cat.tabs.forEach((tab, i) => {
    const picks = countPicksInTab(cat, tab.id);
    const isOptional = i === cat.tabs.length - 1;
    const unlocked = isTabUnlocked(cat, tab.id);

    const step = document.createElement("div");
    step.className =
      "step-dot" +
      (picks > 0 ? " done" : "") +
      (!unlocked ? " locked" : "") +
      (state.activeTab === tab.id ? " current" : "");

    const label = tab.label.replace(/[^\w\s]/g, "").trim();
    step.innerHTML =
      picks > 0
        ? `<span class="step-icon">✓</span><span class="step-name">${label}</span>`
        : `<span class="step-icon">${unlocked ? i + 1 : "🔒"}</span><span class="step-name">${label}${isOptional ? " ·opt" : ""}</span>`;

    step.onclick = () => {
      if (unlocked) switchTab(tab.id, cat);
      else {
        SFX.tabLocked();
        const prevTab = cat.tabs[i - 1];
        showToast(
          `Pick a ${prevTab.label.replace(/[^\w\s]/g, "").trim()} first!`,
        );
      }
    };
    indicator.appendChild(step);

    // Connector line between steps
    if (i < cat.tabs.length - 1) {
      const line = document.createElement("div");
      line.className = "step-line" + (picks > 0 ? " done" : "");
      indicator.appendChild(line);
    }
  });
}

function renderTabItems(tab, container) {
  container.innerHTML = "";
  const grayedIds = getGrayedOutIds();
  updateGrayoutBanner(grayedIds.size > 0);

  tab.items.forEach((item) => {
    const isSelected = state.selectedIngredients.some((s) => s.id === item.id);
    const isGrayed = grayedIds.has(item.id) && !isSelected;

    const chip = document.createElement("button");
    chip.className =
      "ing-chip" +
      (isSelected ? " selected" : "") +
      (isGrayed ? " grayed" : "");
    chip.dataset.id = item.id;
    chip.style.setProperty("--chip-color", item.color);
    chip.innerHTML = `
      <span class="chip-emoji">${item.emoji}</span>
      <span class="chip-label">${item.label}</span>
      <span class="chip-check">✓</span>
      ${isGrayed ? '<span class="chip-lock">🔒</span>' : ""}
    `;

    if (!isGrayed) {
      chip.onclick = (e) => {
        rippleBtn(chip, e);
        toggleIngredient(item, chip);
      };
    } else {
      chip.onclick = () => SFX.grayedClick();
    }
    container.appendChild(chip);
  });
}

function updateGrayoutBanner(show) {
  const panel = document.querySelector(".ingredient-panel");
  if (!panel) return;
  let banner = document.getElementById("grayout-banner");
  if (show && !banner) {
    banner = document.createElement("div");
    banner.id = "grayout-banner";
    banner.className = "grayout-banner";
    banner.innerHTML = `🔮 Your mix is taking shape — some options don't fit!`;
    // Insert after step-indicator if present
    const indicator = document.getElementById("step-indicator");
    if (indicator) indicator.after(banner);
    else panel.insertBefore(banner, panel.firstChild);
  } else if (!show && banner) {
    banner.remove();
  }
}

// ──────────────────────────────────────────────
//  GRAYOUT LOGIC
// ──────────────────────────────────────────────

function getGrayedOutIds() {
  const grayed = new Set();
  if (state.selectedIngredients.length < 2) return grayed;

  const drinks = MENU_DRINKS[state.category];
  if (!drinks) return grayed;

  const userTags = new Set();
  state.selectedIngredients.forEach((ing) =>
    (ing.tags || []).forEach((t) => userTags.add(t)),
  );

  const scored = drinks.map((drink) => {
    let score = 0;
    drink.tags.forEach((tag) => {
      if (userTags.has(tag)) score++;
    });
    return { drink, normalised: score / drink.tags.length };
  });
  scored.sort((a, b) => b.normalised - a.normalised);
  const top = scored[0],
    second = scored[1];

  if (!top || top.normalised < 0.25) return grayed;
  if (top.normalised - (second ? second.normalised : 0) < 0.2) return grayed;

  const cat = INGREDIENTS[state.category];
  const allItems = [];
  cat.tabs.forEach((tab) => tab.items.forEach((item) => allItems.push(item)));
  const winnerTags = new Set(top.drink.tags);
  allItems.forEach((item) => {
    if (!(item.tags || []).some((t) => winnerTags.has(t))) grayed.add(item.id);
  });
  return grayed;
}

// ──────────────────────────────────────────────
//  TOGGLE INGREDIENT
// ──────────────────────────────────────────────

function toggleIngredient(item, chipEl) {
  const cat = INGREDIENTS[state.category];
  const idx = state.selectedIngredients.findIndex((s) => s.id === item.id);
  const adding = idx === -1;

  if (adding) {
    state.selectedIngredients.push(item);
    SFX.addIngredient(state.selectedIngredients.length - 1);
    const rect = chipEl.getBoundingClientRect();
    burstParticles(rect.left + rect.width / 2, rect.top, [item.emoji, "✨"], 3);

    // Milestone toasts
    const count = state.selectedIngredients.length;
    if (count === 3) {
      SFX.milestone();
      showToast("🔥 Heating up! Keep going…");
    } else if (count === 5) {
      SFX.milestone();
      showToast("🌟 Master Barista energy!");
    }
  } else {
    state.selectedIngredients.splice(idx, 1);
    SFX.removeIngredient();
  }

  wiggleCup();
  bumpBadge();
  updateIngBadge();

  // After toggling, check if a new tab just became unlocked → auto-advance hint
  const prevLockedTabs = cat.tabs.filter((t) => !isTabUnlocked(cat, t.id));

  // Re-render tabs (unlock states may have changed)
  rebuildTabBar(cat);

  updateIngCta();
  renderCup();

  // Re-render current tab items
  const tab = cat.tabs.find((t) => t.id === state.activeTab);
  if (tab) renderTabItems(tab, document.getElementById("ing-grid"));

  // Check if a tab just unlocked — celebrate and auto-switch
  const nowLockedTabs = cat.tabs.filter((t) => !isTabUnlocked(cat, t.id));
  if (adding && nowLockedTabs.length < prevLockedTabs.length) {
    // A tab just unlocked!
    const newlyUnlocked = prevLockedTabs.find((t) => isTabUnlocked(cat, t.id));
    if (newlyUnlocked) {
      SFX.tabUnlock();
      setTimeout(() => {
        showToast(
          `✅ ${newlyUnlocked.label.replace(/[^\w\s]/g, "").trim()} unlocked!`,
        );
        switchTab(newlyUnlocked.id, cat);
      }, 300);
    }
  }
}

function rebuildTabBar(cat) {
  const tabBar = document.getElementById("ing-tabs");
  if (!tabBar) return;
  tabBar.innerHTML = "";
  cat.tabs.forEach((tab, i) => {
    const unlocked = isTabUnlocked(cat, tab.id);
    const btn = document.createElement("button");
    btn.className =
      "ing-tab" +
      (state.activeTab === tab.id ? " active" : "") +
      (!unlocked ? " tab-locked" : "");
    btn.dataset.tab = tab.id;
    btn.innerHTML = unlocked ? tab.label : `🔒 ${tab.label}`;
    btn.onclick = () => {
      if (!isTabUnlocked(cat, tab.id)) {
        SFX.tabLocked();
        const prevTab = cat.tabs[i - 1];
        showToast(
          `Pick a ${prevTab.label.replace(/[^\w\s]/g, "").trim()} first!`,
        );
        btn.classList.remove("tab-locked-shake");
        void btn.offsetWidth;
        btn.classList.add("tab-locked-shake");
        btn.addEventListener(
          "animationend",
          () => btn.classList.remove("tab-locked-shake"),
          { once: true },
        );
        return;
      }
      switchTab(tab.id, cat);
    };
    tabBar.appendChild(btn);
  });
  renderStepIndicator(cat);
}

function updateIngBadge() {
  document.getElementById("ing-badge").textContent =
    state.selectedIngredients.length;
}

function updateIngCta() {
  const cta = document.getElementById("ing-cta");
  const hint = document.getElementById("ing-hint");
  const cat = INGREDIENTS[state.category];
  const satisfied = requiredTabsSatisfied(cat);

  if (satisfied) {
    cta.removeAttribute("disabled");
    cta.classList.add("ready");
    hint.style.opacity = "0";
  } else {
    cta.setAttribute("disabled", "");
    cta.classList.remove("ready");
    // Show what's still needed
    const order = getTabOrder(cat);
    const missingTab = order
      .slice(0, 2)
      .find((id) => countPicksInTab(cat, id) === 0);
    const tabLabel =
      cat.tabs
        .find((t) => t.id === missingTab)
        ?.label.replace(/[^\w\s]/g, "")
        .trim() || "";
    hint.textContent = missingTab
      ? `Pick at least one ${tabLabel} to continue`
      : "Select ingredients to continue";
    hint.style.opacity = "1";
  }
}

// ──────────────────────────────────────────────
//  CUP VISUALISER
// ──────────────────────────────────────────────

function renderCup() {
  const cat = INGREDIENTS[state.category];
  if (!cat) return;
  const layers = document.getElementById("cup-layers");
  const foam = document.getElementById("cup-foam-layer");
  const straw = document.getElementById("cup-straw");
  const bubbles = document.getElementById("cup-bubbles");
  const ings = state.selectedIngredients;

  layers.innerHTML = "";
  if (ings.length === 0) {
    const ghost = document.createElement("div");
    ghost.className = "cup-layer";
    ghost.style.flex = "1";
    ghost.style.background = "rgba(75,29,110,0.06)";
    layers.appendChild(ghost);
  } else {
    ings.forEach((ing, i) => {
      const layer = document.createElement("div");
      layer.className = "cup-layer";
      layer.style.background = ing.color;
      layer.style.opacity = "0.82";
      layer.style.flex = "1";
      layer.style.animation = `layerIn 0.4s ease ${i * 0.06}s both`;
      layers.appendChild(layer);
    });
  }

  if (cat.hasFoam && ings.length > 0) {
    foam.style.display = "block";
    foam.style.animation = "foamPop 0.4s ease";
  } else foam.style.display = "none";

  straw.style.display = cat.hasStraw ? "block" : "none";

  if (cat.isIced && ings.length > 0) {
    bubbles.innerHTML = "";
    for (let i = 0; i < 5; i++) {
      const b = document.createElement("div");
      b.className = "bubble";
      b.style.left = 10 + Math.random() * 80 + "%";
      b.style.animationDelay = Math.random() * 2 + "s";
      b.style.width = b.style.height = 4 + Math.random() * 6 + "px";
      bubbles.appendChild(b);
    }
  }
  mirrorCupToName();
}

function mirrorCupToName() {
  const cat = INGREDIENTS[state.category];
  if (!cat) return;
  const srcLayers = document.getElementById("cup-layers");
  const destLayers = document.getElementById("name-cup-layers");
  if (destLayers) destLayers.innerHTML = srcLayers.innerHTML;
  const srcFoam = document.getElementById("cup-foam-layer");
  const destFoam = document.getElementById("name-cup-foam");
  if (destFoam) destFoam.style.display = srcFoam.style.display;
  const srcStraw = document.getElementById("cup-straw");
  const destStraw = document.getElementById("name-cup-straw");
  if (destStraw) destStraw.style.display = srcStraw.style.display;
}

// ──────────────────────────────────────────────
//  SCREEN 3 — NAME IT
// ──────────────────────────────────────────────

function goToName() {
  const cat = INGREDIENTS[state.category];
  if (!requiredTabsSatisfied(cat)) return;
  SFX.navForward();
  mirrorCupToName();
  buildIngsSummary();
  buildSuggestions();
  const input = document.getElementById("drink-name-input");
  input.value = state.drinkName || "";
  updateNameChar(input);
  checkNameCta();
  showScreen("screen-name");
}

function buildIngsSummary() {
  const wrap = document.getElementById("name-ings-summary");
  wrap.innerHTML = "";
  state.selectedIngredients.forEach((ing) => {
    const pill = document.createElement("span");
    pill.className = "ing-pill";
    pill.style.setProperty("--chip-color", ing.color);
    pill.textContent = ing.emoji + " " + ing.label;
    wrap.appendChild(pill);
  });
}

function buildSuggestions() {
  const cat = INGREDIENTS[state.category];
  const wrap = document.getElementById("sug-chips");
  wrap.innerHTML = "";
  (cat.suggestions || []).forEach((name) => {
    const chip = document.createElement("button");
    chip.className = "sug-chip";
    chip.textContent = name;
    chip.onclick = (e) => {
      rippleBtn(chip, e);
      SFX.selectCat();
      const input = document.getElementById("drink-name-input");
      input.value = name;
      state.drinkName = name;
      updateNameChar(input);
      checkNameCta();
    };
    wrap.appendChild(chip);
  });
}

function onNameInput(input) {
  state.drinkName = input.value.trim();
  updateNameChar(input);
  checkNameCta();
  if (!onNameInput._last || Date.now() - onNameInput._last > 80) {
    SFX.nameType();
    onNameInput._last = Date.now();
  }
}

function updateNameChar(input) {
  document.getElementById("name-char").textContent = input.value.length + "/32";
}

function checkNameCta() {
  const cta = document.getElementById("name-cta");
  if (state.drinkName.length > 0) {
    cta.removeAttribute("disabled");
    cta.classList.add("ready");
  } else {
    cta.setAttribute("disabled", "");
    cta.classList.remove("ready");
  }
}

function backToIngredients() {
  SFX.navBack();
  showScreen("screen-ingredients");
}

// ──────────────────────────────────────────────
//  SCREEN 4 — REVEAL
// ──────────────────────────────────────────────

function goToReveal() {
  if (!state.drinkName) return;
  SFX.reveal();
  const match = matchDrink(state.category, state.selectedIngredients);

  document.getElementById("reveal-your-name").textContent =
    '"' + state.drinkName + '"';

  const ingsWrap = document.getElementById("reveal-your-ings");
  ingsWrap.innerHTML = "";
  state.selectedIngredients.forEach((ing) => {
    const pill = document.createElement("span");
    pill.className = "ing-pill small";
    pill.style.setProperty("--chip-color", ing.color);
    pill.textContent = ing.emoji + " " + ing.label;
    ingsWrap.appendChild(pill);
  });

  document.getElementById("reveal-match-name").textContent = match.name;
  document.getElementById("reveal-match-desc").textContent = match.desc;
  const img = document.getElementById("reveal-img");
  img.style.display = "block";
  img.src = match.image;
  img.alt = match.name;
  document.getElementById("reveal-cta").href = match.url;

  spawnConfetti();
  showScreen("screen-reveal");
  setTimeout(() => {
    const imgWrap = document.querySelector(".reveal-img-wrap");
    if (imgWrap) spawnSparkles(imgWrap, 8);
  }, 500);
}

function spawnConfetti() {
  const wrap = document.getElementById("reveal-confetti");
  wrap.innerHTML = "";
  const colors = [
    "#4B1D6E",
    "#F5A800",
    "#9B7AB8",
    "#F3EDF8",
    "#6B3A8E",
    "#FFF",
  ];
  for (let i = 0; i < 32; i++) {
    const p = document.createElement("div");
    p.className = "confetti-piece";
    p.style.left = Math.random() * 100 + "%";
    p.style.top = Math.random() * 100 + "%";
    p.style.background = colors[Math.floor(Math.random() * colors.length)];
    p.style.animationDelay = Math.random() * 0.8 + "s";
    p.style.transform = `rotate(${Math.random() * 360}deg)`;
    if (Math.random() > 0.5) p.style.borderRadius = "50%";
    wrap.appendChild(p);
  }
}

// ──────────────────────────────────────────────
//  RESET
// ──────────────────────────────────────────────

function reset() {
  SFX.reset();
  state.category = null;
  state.selectedIngredients = [];
  state.drinkName = "";
  state.activeTab = null;
  document
    .querySelectorAll(".cat-card")
    .forEach((b) => b.classList.remove("selected"));
  const cta = document.getElementById("cat-cta");
  cta.setAttribute("disabled", "");
  cta.classList.remove("ready");
  showScreen("screen-category");
}

// ──────────────────────────────────────────────
//  INIT
// ──────────────────────────────────────────────

function attachRipples() {
  document.querySelectorAll(".pill-btn, .ghost-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => rippleBtn(btn, e));
  });
}

document.addEventListener("DOMContentLoaded", () => {
  attachRipples();
  document.addEventListener(
    "pointerdown",
    () => {
      if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
    },
    { once: true },
  );
});

// ──────────────────────────────────────────────
//  MIXING SCREEN
//  Intercepts goToName() — runs the blender
//  animation for ~2.8s then advances to name screen.
// ──────────────────────────────────────────────

const MIXING_STATUSES = [
  "Combining flavours…",
  "Blending to perfection…",
  "Almost there…",
  "Your drink is taking shape!",
];

function startMixing() {
  const cat = INGREDIENTS[state.category];
  if (!requiredTabsSatisfied(cat)) return;

  SFX.navForward();

  // Set blender liquid colour = blend of selected ingredient colours
  setBlenderColour();

  // Populate ingredient emoji parade
  const parade = document.getElementById("mixing-ingredients");
  parade.innerHTML = "";
  state.selectedIngredients.forEach((ing, i) => {
    const badge = document.createElement("span");
    badge.className = "mix-ing-badge";
    badge.textContent = ing.emoji;
    badge.style.animationDelay = i * 0.15 + "s";
    parade.appendChild(badge);
  });

  // Spawn blender bubbles
  spawnBlenderBubbles();

  // Reset dots
  ["mix-dot-1", "mix-dot-2", "mix-dot-3"].forEach((id) => {
    const d = document.getElementById(id);
    d.classList.remove("active", "done");
  });
  document.getElementById("mixing-status").textContent = MIXING_STATUSES[0];

  showScreen("screen-mixing");

  // Run the timed mixing sequence
  runMixingSequence();
}

function setBlenderColour() {
  const liquid = document.getElementById("blender-liquid");
  if (!liquid || state.selectedIngredients.length === 0) return;

  // Mix all ingredient colours together visually
  const colours = state.selectedIngredients.map((i) => i.color);
  if (colours.length === 1) {
    liquid.style.background = colours[0];
  } else {
    const stops = colours
      .map((c, i) => `${c} ${Math.round((i / (colours.length - 1)) * 100)}%`)
      .join(", ");
    liquid.style.background = `linear-gradient(180deg, ${stops})`;
  }
}

function spawnBlenderBubbles() {
  const container = document.getElementById("blender-bubbles");
  if (!container) return;
  container.innerHTML = "";
  for (let i = 0; i < 8; i++) {
    const b = document.createElement("div");
    b.className = "blend-bubble";
    const size = 4 + Math.random() * 8;
    b.style.width = size + "px";
    b.style.height = size + "px";
    b.style.left = 10 + Math.random() * 80 + "%";
    b.style.bottom = Math.random() * 40 + "%";
    b.style.animationDuration = 0.8 + Math.random() * 0.8 + "s";
    b.style.animationDelay = Math.random() * 1 + "s";
    container.appendChild(b);
  }
}

function spawnSplashDrops() {
  const container = document.getElementById("blender-splash");
  if (!container) return;
  const colours = state.selectedIngredients.map((i) => i.color);
  for (let i = 0; i < 6; i++) {
    const drop = document.createElement("div");
    drop.className = "splash-drop";
    const size = 5 + Math.random() * 8;
    drop.style.width = size + "px";
    drop.style.height = size + "px";
    drop.style.background =
      colours[Math.floor(Math.random() * colours.length)] || "#F5A800";
    drop.style.left = 30 + Math.random() * 40 + "%";
    drop.style.top = 20 + Math.random() * 40 + "%";
    const angle = Math.random() * Math.PI * 2;
    const dist = 30 + Math.random() * 40;
    drop.style.setProperty("--tx", Math.cos(angle) * dist + "px");
    drop.style.setProperty("--ty", Math.sin(angle) * dist + "px");
    drop.style.animationDelay = Math.random() * 0.2 + "s";
    container.appendChild(drop);
    drop.addEventListener("animationend", () => drop.remove());
  }
}

function runMixingSequence() {
  const dots = [
    document.getElementById("mix-dot-1"),
    document.getElementById("mix-dot-2"),
    document.getElementById("mix-dot-3"),
  ];
  const statusEl = document.getElementById("mixing-status");

  // Phase 1 — dot 1 lights up
  setTimeout(() => {
    dots[0].classList.add("active");
    statusEl.style.animation = "none";
    void statusEl.offsetWidth;
    statusEl.style.animation = "";
    statusEl.textContent = MIXING_STATUSES[0];
    spawnSplashDrops();
    // Sound: blending
    [200, 220, 240, 220].forEach((f, i) =>
      setTimeout(
        () =>
          playTone({ freq: f, type: "sawtooth", duration: 0.08, volume: 0.06 }),
        i * 80,
      ),
    );
  }, 200);

  // Phase 2 — dot 2
  setTimeout(() => {
    dots[0].classList.remove("active");
    dots[0].classList.add("done");
    dots[1].classList.add("active");
    statusEl.style.animation = "none";
    void statusEl.offsetWidth;
    statusEl.style.animation = "";
    statusEl.textContent = MIXING_STATUSES[1];
    spawnSplashDrops();
    [280, 300, 320, 300].forEach((f, i) =>
      setTimeout(
        () =>
          playTone({ freq: f, type: "sawtooth", duration: 0.08, volume: 0.08 }),
        i * 70,
      ),
    );
  }, 1000);

  // Phase 3 — dot 3
  setTimeout(() => {
    dots[1].classList.remove("active");
    dots[1].classList.add("done");
    dots[2].classList.add("active");
    statusEl.style.animation = "none";
    void statusEl.offsetWidth;
    statusEl.style.animation = "";
    statusEl.textContent = MIXING_STATUSES[2];
    spawnSplashDrops();
    [350, 380, 420, 460].forEach((f, i) =>
      setTimeout(
        () =>
          playTone({ freq: f, type: "triangle", duration: 0.1, volume: 0.1 }),
        i * 60,
      ),
    );
  }, 1900);

  // Phase 4 — done! Triumphant ding then go to name screen
  setTimeout(() => {
    dots[2].classList.remove("active");
    dots[2].classList.add("done");
    statusEl.style.animation = "none";
    void statusEl.offsetWidth;
    statusEl.style.animation = "";
    statusEl.textContent = MIXING_STATUSES[3];
    spawnSplashDrops();
    // Happy rising tones
    [523, 659, 784].forEach((f, i) =>
      setTimeout(
        () =>
          playTone({
            freq: f,
            type: "triangle",
            duration: 0.18,
            volume: 0.2,
            freqEnd: f * 1.1,
          }),
        i * 90,
      ),
    );
  }, 2600);

  // Advance to name screen
  setTimeout(() => {
    mirrorCupToName();
    buildIngsSummary();
    buildSuggestions();
    const input = document.getElementById("drink-name-input");
    input.value = state.drinkName || "";
    updateNameChar(input);
    checkNameCta();
    showScreen("screen-name");
  }, 3000);
}
