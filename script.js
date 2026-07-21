const contactBtn = document.getElementById("contactBtn");

if (contactBtn) {
  contactBtn.addEventListener("click", () => {
    const email = "sadeplayable@gmail.com";
    const subject = encodeURIComponent("Inquiry from Sade Website");
    const body = encodeURIComponent(
      "Hi,\n\nI'm interested in working with you.\n",
    );
    const gmailURL = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${subject}&body=${body}`;
    const win = window.open(gmailURL, "_blank");
    if (!win) {
      window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    }
  });
}

// --------------------------
// MOBILE DETECTION
// --------------------------
function isMobile() {
  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    ) || window.innerWidth < 768
  );
}

// --------------------------
// CREATE BUTTONS
// --------------------------
document.querySelectorAll(".create-btn").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const link = btn.getAttribute("data-link");

    const sb = window.client || window.supabaseClient;
    if (!sb) {
      alert("Auth not ready — please refresh the page.");
      return;
    }

    const {
      data: { session },
    } = await sb.auth.getSession();

    if (!session) {
      // Store the intended destination so we can redirect after login
      window._pendingBuilderLink = link;
      const modal = document.getElementById("authModal");
      if (modal) modal.style.display = "flex";
      return;
    }

    if (link) window.location.href = link;
  });
});

// After a successful login, redirect to builder if one was pending
(function () {
  const sb = window.client || window.supabaseClient;
  if (!sb) return;
  sb.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_IN" && session && window._pendingBuilderLink) {
      const dest = window._pendingBuilderLink;
      window._pendingBuilderLink = null;
      window.location.href = dest;
    }
  });
})();

// --------------------------
// MOBILE POPUP
// --------------------------
function showMobilePopup() {
  const existing = document.getElementById("mobilePopup");
  if (existing) {
    existing.style.display = "flex";
    return;
  }

  const overlay = document.createElement("div");
  overlay.id = "mobilePopup";
  overlay.style.cssText = `
    position: fixed; inset: 0; z-index: 9999;
    background: rgba(0,0,0,0.8); backdrop-filter: blur(12px);
    display: flex; align-items: center; justify-content: center;
    padding: 24px;
  `;

  overlay.innerHTML = `
    <div style="
      background: #111; border: 1.5px solid rgba(0,255,247,0.4);
      border-radius: 20px; padding: 36px 28px; max-width: 340px; width: 100%;
      text-align: center;
      box-shadow: 0 0 40px rgba(0,255,247,0.15), 0 0 80px rgba(255,77,240,0.1);
    ">
      <div style="font-size: 44px; margin-bottom: 16px;">🖥️</div>
      <h3 style="font-family: 'Orbitron', sans-serif; font-size: 16px; color: #fff; margin-bottom: 12px; letter-spacing: 1px;">
        Desktop Required
      </h3>
      <p style="font-family: 'Inter', sans-serif; font-size: 14px; color: rgba(255,255,255,0.65); line-height: 1.6; margin-bottom: 28px;">
        The AR Builder uses your camera and advanced tools that work best on a laptop or desktop. Please visit on a larger device to create your experience.
      </p>
      <button id="mobilePopupClose" style="
        padding: 12px 32px; border-radius: 10px;
        border: 1.5px solid #fff; background: transparent;
        color: #fff; font-family: 'Orbitron', sans-serif;
        font-size: 13px; cursor: pointer; transition: 0.3s;
      ">Got it</button>
    </div>
  `;

  document.body.appendChild(overlay);

  document.getElementById("mobilePopupClose").onclick = () =>
    (overlay.style.display = "none");
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) overlay.style.display = "none";
  });
}

// --------------------------
// VIDEO HOVER PLAY
// --------------------------
document.querySelectorAll(".ad-video").forEach((video) => {
  video.addEventListener("mouseenter", () => video.play());
  video.addEventListener("mouseleave", () => {
    video.pause();
    video.currentTime = 0;
  });
});

// --------------------------
// SHOW/HIDE EXTRA FIELDS
// --------------------------
function toggleExtraFields(show) {
  document.getElementById("firstName").style.display = show ? "block" : "none";
  document.getElementById("lastName").style.display = show ? "block" : "none";
}

// --------------------------
// CANVAS ANIMATION
// --------------------------
const canvas = document.getElementById("heroCanvas");
const ctx = canvas.getContext("2d");

let width = (canvas.width = window.innerWidth);
let height = (canvas.height = document.querySelector(".hero").offsetHeight);

window.addEventListener("resize", () => {
  width = canvas.width = window.innerWidth;
  height = canvas.height = document.querySelector(".hero").offsetHeight;
});

const dots = [];
for (let i = 0; i < 800; i++) {
  dots.push({
    x: Math.random() * width,
    y: Math.random() * height,
    size: Math.random() * 2 + 1,
    color: `hsl(${Math.random() * 360}, 80%, 60%)`,
    vx: (Math.random() - 0.5) * 0.2,
    vy: (Math.random() - 0.5) * 0.2,
  });
}

const mouse = { x: width / 2, y: height / 2 };

canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  mouse.x = e.clientX - rect.left;
  mouse.y = e.clientY - rect.top;
});

function animate() {
  ctx.clearRect(0, 0, width, height);

  for (let dot of dots) {
    dot.x += dot.vx;
    dot.y += dot.vy;

    if (dot.x > width) dot.x = 0;
    if (dot.x < 0) dot.x = width;
    if (dot.y > height) dot.y = 0;
    if (dot.y < 0) dot.y = height;

    const dx = dot.x - mouse.x;
    const dy = dot.y - mouse.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 120) {
      const angle = Math.atan2(dy, dx);
      const force = (120 - dist) / 10;
      dot.x += Math.cos(angle) * force;
      dot.y += Math.sin(angle) * force;
    }

    ctx.beginPath();
    ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
    ctx.fillStyle = dot.color;
    ctx.shadowBlur = 10;
    ctx.shadowColor = dot.color;
    ctx.fill();
  }

  requestAnimationFrame(animate);
}

animate();

// --------------------------
// CUSTOM CURSOR
// --------------------------
const cursorDot = document.querySelector(".cursor-dot");
const cursorGlow = document.querySelector(".cursor-glow");

let mouseX = 0,
  mouseY = 0,
  glowX = 0,
  glowY = 0;

window.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  if (cursorDot) {
    cursorDot.style.left = mouseX + "px";
    cursorDot.style.top = mouseY + "px";
  }
});

function animateCursor() {
  glowX += (mouseX - glowX) * 0.15;
  glowY += (mouseY - glowY) * 0.15;
  if (cursorGlow) {
    cursorGlow.style.left = glowX + "px";
    cursorGlow.style.top = glowY + "px";
  }
  requestAnimationFrame(animateCursor);
}
animateCursor();

// ==========================
// PRESET SELECTOR
// ==========================
document.querySelectorAll(".asset-option").forEach((img) => {
  img.addEventListener("click", () => {
    const type = img.dataset.type;
    const src = img.src;

    document
      .querySelectorAll(`.asset-option[data-type="${type}"]`)
      .forEach((el) => el.classList.remove("active"));

    img.classList.add("active");

    if (type === "onion") onionImg.src = src;
    if (type === "bg") bgImg.src = src;
    if (type === "man1") man1.src = src;
    if (type === "man2") man2.src = src;

    saveBuilder();
  });
});

// ─── Brand button — opens customise modal for any game ────────────────────────
const GAME_MAP = {
  driver: {
    key: "driverBrand",
    iframeId: "iframe-driver",
    src: "Driver/driver.html",
  },
  story: {
    key: "runnerBrand",
    iframeId: "iframe-story",
    src: "Runner/runner.html",
  },
  hopper: {
    key: "hopperBrand",
    iframeId: "iframe-stack",
    src: "Hopper/Hopper.html",
  },
  catcher: {
    key: "catcherBrand",
    iframeId: "iframe-catcher",
    src: "Catcher/catcher.html",
  },
};

// Fields that only appear for specific games
function updateModalFields(gameId) {
  const isDriver = gameId === "driver";
  const isRunner = gameId === "story";

  // Car and fuel — driver only
  ["carSection", "fuelSection"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.style.display = isDriver ? "" : "none";
  });

  // Skin tone — runner only
  const skinEl = document.getElementById("skinToneSection");
  if (skinEl) skinEl.style.display = isRunner ? "" : "none";

  // Coin image — driver and runner only (not hopper)
  const coinEl = document.getElementById("coinSection");
  if (coinEl) coinEl.style.display = isDriver || isRunner ? "" : "none";

  // Player + token — hopper only
  const isHopper = gameId === "hopper";
  ["playerSection", "tokenSection"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.style.display = isHopper ? "" : "none";
  });

  // Basket + good + bad — catcher only
  const isCatcher = gameId === "catcher";
  ["basketSection", "goodSection", "badSection"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.style.display = isCatcher ? "" : "none";
  });
}

document.querySelectorAll(".play-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const gameId = btn.getAttribute("data-game");
    const m = document.getElementById("driverCustomModal");
    if (m && GAME_MAP[gameId]) {
      m.dataset.targetGame = gameId;
      updateModalFields(gameId);
      m.style.display = "flex";
    }
  });
});

// ─── Customise Modal (shared by all games) ────────────────────────────────────
(function () {
  let logoDataURL = null;
  let carDataURL = null;
  let coinDataURL = null;
  let fuelDataURL = null;
  let selectedSkin = "mediumLight";
  let playerDataURL = null;
  let tokenDataURL = null;
  let basketDataURL = null;
  let goodDataURL = null;
  let badDataURL = null;

  const modal = document.getElementById("driverCustomModal");
  const closeBtn = document.getElementById("driverCustomClose");
  const launchBtn = document.getElementById("launchDriverBtn");
  if (!modal) return;

  closeBtn.addEventListener("click", () => (modal.style.display = "none"));
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.style.display = "none";
  });

  // ── Logo drop zone ──
  const logoDropZone = document.getElementById("logoDropZone");
  const logoFileInput = document.getElementById("logoFileInput");
  const logoPreview = document.getElementById("logoPreviewImg");
  const logoPreviewWrap = document.getElementById("logoPreviewWrap");
  const logoDropLabel = document.getElementById("logoDropLabel");

  logoDropZone.addEventListener("click", () => logoFileInput.click());
  logoDropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    logoDropZone.style.borderColor = "#00fff7";
  });
  logoDropZone.addEventListener("dragleave", () => {
    logoDropZone.style.borderColor = "rgba(0,255,247,0.3)";
  });
  logoDropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    logoDropZone.style.borderColor = "rgba(0,255,247,0.3)";
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith("image/")) readFile(f, "logo");
  });
  logoFileInput.addEventListener("change", (e) => {
    const f = e.target.files[0];
    if (f) readFile(f, "logo");
    e.target.value = "";
  });

  // ── Car / character drop zone ──
  const carDropZone = document.getElementById("carDropZone");
  const carFileInput = document.getElementById("carFileInput");
  const carPreview = document.getElementById("carPreviewImg");
  const carPreviewWrap = document.getElementById("carPreviewWrap");
  const carDropLabel = document.getElementById("carDropLabel");

  carDropZone.addEventListener("click", () => carFileInput.click());
  carDropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    carDropZone.style.borderColor = "#00fff7";
  });
  carDropZone.addEventListener("dragleave", () => {
    carDropZone.style.borderColor = "rgba(0,255,247,0.3)";
  });
  carDropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    carDropZone.style.borderColor = "rgba(0,255,247,0.3)";
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith("image/")) readFile(f, "car");
  });
  carFileInput.addEventListener("change", (e) => {
    const f = e.target.files[0];
    if (f) readFile(f, "car");
    e.target.value = "";
  });

  // ── Coin drop zone ──
  const coinDropZone = document.getElementById("coinDropZone");
  const coinFileInput = document.getElementById("coinFileInput");
  const coinPreview = document.getElementById("coinPreviewImg");
  const coinPreviewWrap = document.getElementById("coinPreviewWrap");
  const coinDropLabel = document.getElementById("coinDropLabel");

  coinDropZone.addEventListener("click", () => coinFileInput.click());
  coinDropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    coinDropZone.style.borderColor = "#00fff7";
  });
  coinDropZone.addEventListener("dragleave", () => {
    coinDropZone.style.borderColor = "rgba(0,255,247,0.3)";
  });
  coinDropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    coinDropZone.style.borderColor = "rgba(0,255,247,0.3)";
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith("image/")) readFile(f, "coin");
  });
  coinFileInput.addEventListener("change", (e) => {
    const f = e.target.files[0];
    if (f) readFile(f, "coin");
    e.target.value = "";
  });

  // ── Fuel drop zone ──
  const fuelDropZone = document.getElementById("fuelDropZone");
  const fuelFileInput = document.getElementById("fuelFileInput");
  const fuelPreview = document.getElementById("fuelPreviewImg");
  const fuelPreviewWrap = document.getElementById("fuelPreviewWrap");
  const fuelDropLabel = document.getElementById("fuelDropLabel");

  fuelDropZone.addEventListener("click", () => fuelFileInput.click());
  fuelDropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    fuelDropZone.style.borderColor = "#00fff7";
  });
  fuelDropZone.addEventListener("dragleave", () => {
    fuelDropZone.style.borderColor = "rgba(0,255,247,0.3)";
  });
  fuelDropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    fuelDropZone.style.borderColor = "rgba(0,255,247,0.3)";
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith("image/")) readFile(f, "fuel");
  });
  fuelFileInput.addEventListener("change", (e) => {
    const f = e.target.files[0];
    if (f) readFile(f, "fuel");
    e.target.value = "";
  });

  // ── Skin tone buttons ──
  document.querySelectorAll(".skin-btn").forEach((btn) => {
    // Mark default selected
    if (btn.dataset.skin === selectedSkin) btn.classList.add("selected");
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".skin-btn")
        .forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
      selectedSkin = btn.dataset.skin;
    });
  });

  // ── Player drop zone (Hopper) ──
  const playerDropZone = document.getElementById("playerDropZone");
  const playerFileInput = document.getElementById("playerFileInput");
  const playerPreview = document.getElementById("playerPreviewImg");
  const playerPreviewWrap = document.getElementById("playerPreviewWrap");
  const playerDropLabel = document.getElementById("playerDropLabel");
  if (playerDropZone) {
    playerDropZone.addEventListener("click", () => playerFileInput.click());
    playerDropZone.addEventListener("dragover", (e) => {
      e.preventDefault();
      playerDropZone.style.borderColor = "#00fff7";
    });
    playerDropZone.addEventListener("dragleave", () => {
      playerDropZone.style.borderColor = "rgba(0,255,247,0.3)";
    });
    playerDropZone.addEventListener("drop", (e) => {
      e.preventDefault();
      playerDropZone.style.borderColor = "rgba(0,255,247,0.3)";
      const f = e.dataTransfer.files[0];
      if (f && f.type.startsWith("image/")) readFile(f, "player");
    });
    playerFileInput.addEventListener("change", (e) => {
      const f = e.target.files[0];
      if (f) readFile(f, "player");
      e.target.value = "";
    });
  }

  // ── Token drop zone (Hopper) ──
  const tokenDropZone = document.getElementById("tokenDropZone");
  const tokenFileInput = document.getElementById("tokenFileInput");
  const tokenPreview = document.getElementById("tokenPreviewImg");
  const tokenPreviewWrap = document.getElementById("tokenPreviewWrap");
  const tokenDropLabel = document.getElementById("tokenDropLabel");
  if (tokenDropZone) {
    tokenDropZone.addEventListener("click", () => tokenFileInput.click());
    tokenDropZone.addEventListener("dragover", (e) => {
      e.preventDefault();
      tokenDropZone.style.borderColor = "#00fff7";
    });
    tokenDropZone.addEventListener("dragleave", () => {
      tokenDropZone.style.borderColor = "rgba(0,255,247,0.3)";
    });
    tokenDropZone.addEventListener("drop", (e) => {
      e.preventDefault();
      tokenDropZone.style.borderColor = "rgba(0,255,247,0.3)";
      const f = e.dataTransfer.files[0];
      if (f && f.type.startsWith("image/")) readFile(f, "token");
    });
    tokenFileInput.addEventListener("change", (e) => {
      const f = e.target.files[0];
      if (f) readFile(f, "token");
      e.target.value = "";
    });
  }

  // ── Catcher-specific drop zones ──
  function wireDrop(prefix, type) {
    const zone = document.getElementById(prefix + "DropZone");
    const input = document.getElementById(prefix + "FileInput");
    const lbl = document.getElementById(prefix + "DropLabel");
    const prev = document.getElementById(prefix + "PreviewImg");
    const wrap = document.getElementById(prefix + "PreviewWrap");
    if (!zone) return;
    zone.addEventListener("click", () => input.click());
    zone.addEventListener("dragover", (e) => {
      e.preventDefault();
      zone.style.borderColor = "#00fff7";
    });
    zone.addEventListener("dragleave", () => {
      zone.style.borderColor = "rgba(0,255,247,0.3)";
    });
    zone.addEventListener("drop", (e) => {
      e.preventDefault();
      zone.style.borderColor = "rgba(0,255,247,0.3)";
      const f = e.dataTransfer.files[0];
      if (f && f.type.startsWith("image/")) readFile(f, type);
    });
    input.addEventListener("change", (e) => {
      const f = e.target.files[0];
      if (f) readFile(f, type);
      e.target.value = "";
    });
  }
  wireDrop("basket", "basket");
  wireDrop("good", "good");
  wireDrop("bad", "bad");

  function readFile(file, type) {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataURL = ev.target.result;
      if (type === "logo") {
        logoDataURL = dataURL;
        logoPreview.src = dataURL;
        logoPreviewWrap.style.display = "block";
        logoDropLabel.textContent = file.name;
      } else if (type === "car") {
        carDataURL = dataURL;
        carPreview.src = dataURL;
        carPreviewWrap.style.display = "block";
        carDropLabel.textContent = file.name;
      } else if (type === "coin") {
        coinDataURL = dataURL;
        coinPreview.src = dataURL;
        coinPreviewWrap.style.display = "block";
        coinDropLabel.textContent = file.name;
      } else if (type === "fuel") {
        fuelDataURL = dataURL;
        fuelPreview.src = dataURL;
        fuelPreviewWrap.style.display = "block";
        fuelDropLabel.textContent = file.name;
      } else if (type === "player") {
        playerDataURL = dataURL;
        if (playerPreview) {
          playerPreview.src = dataURL;
          playerPreviewWrap.style.display = "block";
          playerDropLabel.textContent = file.name;
        }
      } else if (type === "token") {
        tokenDataURL = dataURL;
        if (tokenPreview) {
          tokenPreview.src = dataURL;
          tokenPreviewWrap.style.display = "block";
          tokenDropLabel.textContent = file.name;
        }
      } else if (type === "basket") {
        basketDataURL = dataURL;
        const p = document.getElementById("basketPreviewImg");
        const w = document.getElementById("basketPreviewWrap");
        const l = document.getElementById("basketDropLabel");
        if (p) {
          p.src = dataURL;
          w.style.display = "block";
          l.textContent = file.name;
        }
      } else if (type === "good") {
        goodDataURL = dataURL;
        const p = document.getElementById("goodPreviewImg");
        const w = document.getElementById("goodPreviewWrap");
        const l = document.getElementById("goodDropLabel");
        if (p) {
          p.src = dataURL;
          w.style.display = "block";
          l.textContent = file.name;
        }
      } else if (type === "bad") {
        badDataURL = dataURL;
        const p = document.getElementById("badPreviewImg");
        const w = document.getElementById("badPreviewWrap");
        const l = document.getElementById("badDropLabel");
        if (p) {
          p.src = dataURL;
          w.style.display = "block";
          l.textContent = file.name;
        }
      }
    };
    reader.readAsDataURL(file);
  }

  // ── Launch — save to the right sessionStorage key + reload right iframe ──
  launchBtn.addEventListener("click", () => {
    const config = {
      logo: logoDataURL || null,
      car: carDataURL || null,
      coin: coinDataURL || null,
      fuel: fuelDataURL || null,
      skin: selectedSkin,
      player: playerDataURL || null,
      token: tokenDataURL || null,
      basket: basketDataURL || null,
      good: goodDataURL || null,
      bad: badDataURL || null,
      color1: document.getElementById("brandColor1").value,
      color2: document.getElementById("brandColor2").value,
      color3: document.getElementById("brandColor3").value,
      color4: document.getElementById("brandColor4").value,
      cta:
        document.getElementById("ctaUrlInput").value.trim() ||
        "https://sadeplayable.com/",
    };

    const gameId = modal.dataset.targetGame || "driver";
    const game = GAME_MAP[gameId] || GAME_MAP.driver;

    sessionStorage.setItem(game.key, JSON.stringify(config));
    modal.style.display = "none";

    const iframe = document.getElementById(game.iframeId);
    if (iframe) {
      iframe.src = "";
      setTimeout(() => {
        iframe.src = game.src;
      }, 50);
    }
  });
})();

// --------------------------
// SCROLL TO TOP
// --------------------------
const scrollTopBtn = document.getElementById("scrollTopBtn");

window.addEventListener("scroll", () => {
  if (window.scrollY > 300) {
    scrollTopBtn.classList.add("show");
  } else {
    scrollTopBtn.classList.remove("show");
  }
});

scrollTopBtn.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// ==========================
// CHAT — REBUILD HTML FOR PROPER UI
// ==========================

// Inject overlay element if not present
if (!document.getElementById("chatOverlay")) {
  const overlay = document.createElement("div");
  overlay.id = "chatOverlay";
  document.body.appendChild(overlay);
}

// Rebuild chat header with avatar + status
const chatBox = document.getElementById("chatBox");
const oldHeader = chatBox.querySelector(".chat-header");

oldHeader.innerHTML = `
  <img class="chat-header-avatar" src="Esther Herbert.png" alt="Esther Herbert"
    onerror="this.outerHTML='<div class=\\'chat-avatar-fallback\\'>EH</div>'" />
  <div class="chat-header-info">
    <div class="chat-header-name">Esther Herbert</div>
    <div class="chat-header-status">Online now</div>
  </div>
  <button class="chat-header-close" id="closeChat">✕</button>
`;

// Rebuild chat body with proper bot row structure for first message
const chatBody = document.getElementById("chatBody");
chatBody.innerHTML = ``;

// Add input row at the bottom of chatBox
const inputRow = document.createElement("div");
inputRow.className = "chat-input-row";
inputRow.innerHTML = `
  <input type="text" id="chatInput" placeholder="Type a message…" />
  <button class="chat-send-btn" id="chatSendBtn">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/>
    </svg>
  </button>
`;
chatBox.appendChild(inputRow);

// Show opening bot message
showBotRow("Hello How can I help?");
showFaqButtons();

// --------------------------
// CHAT OPEN / CLOSE
// --------------------------
const chatTrigger = document.getElementById("chatTrigger");
const chatOverlay = document.getElementById("chatOverlay");

chatTrigger.addEventListener("click", () => {
  chatBox.classList.toggle("show");
  chatOverlay.classList.toggle("show");
});

document.addEventListener("click", (e) => {
  const closeBtn = document.getElementById("closeChat");
  if (closeBtn && closeBtn.contains(e.target)) {
    chatBox.classList.remove("show");
    chatOverlay.classList.remove("show");
  }
});

chatOverlay.addEventListener("click", () => {
  chatBox.classList.remove("show");
  chatOverlay.classList.remove("show");
});

// --------------------------
// CHAT HELPERS
// --------------------------

/** Add a bot row (avatar + bubble) */
function showBotRow(htmlContent) {
  const row = document.createElement("div");
  row.className = "chat-row-bot";
  row.innerHTML = `
  <img class="row-avatar-img" src="Esther Herbert.png" alt="EH"
    onerror="this.outerHTML='<div class=\\'row-avatar\\'>EH</div>'" />
  <div class="chat-bubble bot">${htmlContent}</div>
`;
  chatBody.appendChild(row);
  chatBody.scrollTop = chatBody.scrollHeight;
  return row.querySelector(".chat-bubble");
}

/** Add a user bubble (right-aligned) */
function showUserRow(text) {
  const row = document.createElement("div");
  row.className = "chat-row-user";
  row.innerHTML = `<div class="chat-bubble user">${escapeHtml(text)}</div>`;
  chatBody.appendChild(row);
  chatBody.scrollTop = chatBody.scrollHeight;
}

/** Typing indicator */
function showTyping() {
  const row = document.createElement("div");
  row.className = "chat-row-bot";
  row.id = "typingRow";
  row.innerHTML = `
    <div class="row-avatar">EH</div>
    <div class="chat-bubble bot">
      <div class="typing-indicator">
        <span></span><span></span><span></span>
      </div>
    </div>
  `;
  chatBody.appendChild(row);
  chatBody.scrollTop = chatBody.scrollHeight;
}

function removeTyping() {
  const t = document.getElementById("typingRow");
  if (t) t.remove();
}

/** Typewriter effect */
function typeInto(el, html, speed = 18) {
  // Strip tags for char-by-char, then set innerHTML at end for links
  // Simple approach: show plain text char by char, then set full html
  const plain = html.replace(/<[^>]+>/g, "");
  let i = 0;
  el.innerHTML = "";
  const interval = setInterval(() => {
    el.textContent = plain.slice(0, i + 1);
    i++;
    chatBody.scrollTop = chatBody.scrollHeight;
    if (i >= plain.length) {
      clearInterval(interval);
      el.innerHTML = html; // set final version with links
      chatBody.scrollTop = chatBody.scrollHeight;
    }
  }, speed);
}

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Render FAQ buttons */
function showFaqButtons() {
  const faqs = [
    "How do I create an experience?",
    "What are playable ads?",
    "How much does it cost?",
    "Can I try before I buy?",
    "What file formats do you support?",
    "How long does it take to build?",
    "Do I need to know how to code?",
    "Can I use my own branding?",
    "Is everything customizable?",
  ];

  const wrapper = document.createElement("div");
  wrapper.className = "faq-options";
  wrapper.id = "faqButtons";

  faqs.forEach((q) => {
    const btn = document.createElement("button");
    btn.className = "faq-btn";
    btn.textContent = q;
    btn.addEventListener("click", () => handleFaq(q));
    wrapper.appendChild(btn);
  });

  chatBody.appendChild(wrapper);
  chatBody.scrollTop = chatBody.scrollHeight;
}

// --------------------------
// FAQ LOGIC
// --------------------------
const EMAIL = "sadeplayables@gmail.com";
const EMAIL_LINK = `<a href="mailto:${EMAIL}">${EMAIL}</a>`;

const faqAnswers = {
  "How do I create an experience?": `It's easy! Pick an AR or Playable Ad template on the homepage and hit <strong>Customize</strong>. Upload your brand assets, tweak the settings, and your experience is ready to share — no code needed.`,

  "What are playable ads?": `Playable ads are interactive mini-games that let users <em>try</em> your brand before engaging. Think of it as a demo you can run as an ad — far more engaging than a static banner, and they come with built-in CTA tracking.`,

  "How much does it cost?": `Pricing depends on the scope of your experience. Drop us a line at ${EMAIL_LINK} and we'll put together a custom quote for you — usually within 24 hours.`,

  "Can I try before I buy?": `Absolutely. You can explore the builders and preview your customizations for free. When you're ready to publish or go live, that's when we talk production.`,

  "What file formats do you support?": `For images we accept <strong>PNG, JPG, WebP and SVG</strong>. For 3D models we support <strong>GLB/GLTF</strong>. Video assets should be <strong>MP4 (H.264)</strong>. If you have something else, reach out at ${EMAIL_LINK}.`,

  "How long does it take to build?": `Simple experiences using our templates can be ready in <strong>minutes</strong>. Custom builds or fully bespoke games typically take <strong>1–2 weeks</strong> depending on complexity. Email us at ${EMAIL_LINK} for a timeline estimate.`,

  "Do I need to know how to code?": `Not at all. Our builders are fully visual — just drag, drop, and upload. For more advanced custom builds, our team handles all the development on your behalf.`,

  "Can I use my own branding?": `Yes, 100%. You can upload your own logos, colours, fonts, characters, and sounds into every template. The goal is for it to feel completely on-brand.`,

  "Is everything customizable?": `Everything. From the game mechanics to the UI to the end screen CTA. You can build a demo yourself in the builder, or brief our team for a fully bespoke production. Questions? ${EMAIL_LINK}.`,
};

function handleFaq(question) {
  // Remove FAQ buttons
  const faqEl = document.getElementById("faqButtons");
  if (faqEl) faqEl.remove();

  // Show user bubble
  showUserRow(question);

  // Show typing, then reply
  showTyping();

  setTimeout(() => {
    removeTyping();
    const answer =
      faqAnswers[question] ||
      "Great question! Reach us at " +
        EMAIL_LINK +
        " and we'll get back to you shortly.";
    const bubble = showBotRow("");
    typeInto(bubble, answer, 14);

    // Re-show FAQ buttons after reply
    setTimeout(
      () => showFaqButtons(),
      answer.replace(/<[^>]+>/g, "").length * 14 + 500,
    );
  }, 900);
}

// --------------------------
// SEND CUSTOM MESSAGE
// --------------------------
const chatInput = document.getElementById("chatInput");
const chatSendBtn = document.getElementById("chatSendBtn");

function handleSend() {
  const text = chatInput.value.trim();
  if (!text) return;

  const faqEl = document.getElementById("faqButtons");
  if (faqEl) faqEl.remove();

  showUserRow(text);
  chatInput.value = "";

  showTyping();

  setTimeout(() => {
    removeTyping();
    const reply = `Thanks for your message! For a quick response, email us at ${EMAIL_LINK} — we usually reply within a few hours. 😊`;
    const bubble = showBotRow("");
    typeInto(bubble, reply, 14);
    setTimeout(
      () => showFaqButtons(),
      reply.replace(/<[^>]+>/g, "").length * 14 + 600,
    );
  }, 1000);
}

chatSendBtn.addEventListener("click", handleSend);

chatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") handleSend();
});

// Legacy stubs (kept in case other scripts reference them)
function sendMessage(text) {
  showUserRow(text);
}
function showBotMessage(text) {
  showBotRow(text);
}

// ── RECORDING ──────────────────────────────────────────────────────────────
// Strategy: send a message into the iframe telling the game canvas to start/stop
// recording via captureStream(). The blob is sent back via postMessage and we
// trigger a download on the parent page.

const activeRecordings = {}; // gameId → true/false

// Listen for blobs coming back from the game iframes
window.addEventListener("message", (e) => {
  if (e.data?.type !== "recordingBlob") return;
  const { gameId, blob64, mimeType } = e.data;

  // Decode base64 blob
  const byteChars = atob(blob64);
  const byteNums = new Uint8Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++)
    byteNums[i] = byteChars.charCodeAt(i);
  const blob = new Blob([byteNums], { type: mimeType });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `playable-ad-${gameId}-${Date.now()}.webm`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 8000);

  // Reset button
  const btn = document.querySelector(`.record-btn[data-game="${gameId}"]`);
  if (btn) {
    btn.textContent = "⏺ Record";
    btn.classList.remove("recording");
  }
  activeRecordings[gameId] = false;
});

document.querySelectorAll(".record-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const gameId = btn.dataset.game;
    const game = GAME_MAP[gameId];
    if (!game) return;

    const iframe = document.getElementById(game.iframeId);
    if (!iframe) return;

    if (!activeRecordings[gameId]) {
      // Start recording
      iframe.contentWindow.postMessage({ type: "startRecording" }, "*");
      activeRecordings[gameId] = true;
      btn.textContent = "⏹ Stop & Save";
      btn.classList.add("recording");
    } else {
      // Stop recording — game will send blob back
      iframe.contentWindow.postMessage({ type: "stopRecording", gameId }, "*");
      btn.textContent = "⏳ Saving…";
    }
  });
});
