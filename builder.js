// -------------------------
// Builder JS
// -------------------------

window.addEventListener("DOMContentLoaded", () => {
  const backBtn = document.getElementById("backBtn");
  const startARBtn = document.getElementById("startARBtn");
  const saveBtn = document.getElementById("saveBtn");
  const uploadMind = document.getElementById("uploadMind");
  const uploadModel = document.getElementById("uploadModel");
  const scanUI = document.getElementById("scanUI");

  // -------------------------
  // SUPABASE
  // -------------------------
  const SUPABASE_URL = "https://jsqnbafwdjojvfldylok.supabase.co";
  const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpzcW5iYWZ3ZGpvanZmbGR5bG9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxMDQ4MzQsImV4cCI6MjA4OTY4MDgzNH0.yB_O_qUjIE2x9lrPWrtU4N7pzMMgYNLmEpRyMcGx4rw";
  const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  window.__sb = sb; // expose for slot bar — avoids multiple GoTrueClient instances

  // Core state
  let mindURL = null;
  let mindFile = null;
  let modelURL = "model.glb";
  let modelFile = null;
  let destroying = false;
  let selectedAnimation = ""; // "" = play all / first
  // If the page set window.__builderMode, respect it; otherwise default to "image"
  let arMode = ["free", "face"].includes(window.__builderMode)
    ? window.__builderMode
    : "image";

  // Hide mode toggle if builder mode is locked by the host page
  if (window.__builderMode) {
    const modeToggle = document.getElementById("modeToggle");
    if (modeToggle) modeToggle.style.display = "none";
  }

  // -------------------------
  // CTA STATE
  // -------------------------
  const cta = {
    enabled: false,
    label: "Shop Now",
    url: "",
    bgColor: "#00fff7",
    textColor: "#000000",
    radius: 10,
    fontSize: 14,
  };

  // -------------------------
  // AR PANEL LIVE OVERLAYS
  // Inject overlay elements directly into .ar-panel so they appear in the live preview
  // -------------------------
  function ensureAROverlays() {
    const arPanel = document.querySelector(".ar-panel");
    if (!arPanel) return;

    if (!document.getElementById("arCTAOverlay")) {
      const btn = document.createElement("a");
      btn.id = "arCTAOverlay";
      btn.style.cssText = `
        position: absolute;
        bottom: 60px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 20;
        display: none;
        padding: 12px 24px;
        font-family: 'Orbitron', sans-serif;
        font-weight: 700;
        letter-spacing: 1px;
        text-decoration: none;
        cursor: pointer;
        pointer-events: auto;
        white-space: nowrap;
        transition: opacity 0.2s, box-shadow 0.2s;
        box-shadow: 0 4px 20px rgba(0,0,0,0.4);
      `;
      btn.target = "_blank";
      arPanel.appendChild(btn);
    }

    if (!document.getElementById("arTextOverlay")) {
      const txt = document.createElement("div");
      txt.id = "arTextOverlay";
      txt.style.cssText = `
        position: absolute;
        z-index: 20;
        display: none;
        padding: 8px 14px;
        border-radius: 6px;
        pointer-events: none;
        max-width: 80%;
        text-align: center;
        word-wrap: break-word;
      `;
      arPanel.appendChild(txt);
    }

    if (!document.getElementById("arImageOverlay")) {
      const img = document.createElement("img");
      img.id = "arImageOverlay";
      img.style.cssText = `
        position: absolute;
        z-index: 20;
        display: none;
        pointer-events: none;
        max-width: 80%;
      `;
      arPanel.appendChild(img);
    }
  }

  // Call once DOM is ready
  ensureAROverlays();

  // -------------------------
  // CTA WIRING
  // -------------------------
  function syncCtaPreview() {
    // Sidebar mini-preview
    const preview = document.getElementById("ctaPreview");
    if (preview) {
      const label =
        document.getElementById("ctaLabel")?.value.trim() || "Shop Now";
      preview.textContent = label;
      preview.style.background = cta.bgColor;
      preview.style.color = cta.textColor;
      preview.style.borderRadius = `${cta.radius}px`;
      preview.style.fontSize = `${cta.fontSize}px`;
    }

    // AR panel live overlay
    const arBtn = document.getElementById("arCTAOverlay");
    if (!arBtn) return;
    const label =
      document.getElementById("ctaLabel")?.value.trim() || "Shop Now";
    arBtn.textContent = label;
    arBtn.style.background = cta.bgColor;
    arBtn.style.color = cta.textColor;
    arBtn.style.borderRadius = `${cta.radius}px`;
    arBtn.style.fontSize = `${cta.fontSize}px`;
    arBtn.href = cta.url || "#";
    arBtn.style.display = cta.enabled ? "block" : "none";
  }

  document.getElementById("ctaEnabled")?.addEventListener("change", (e) => {
    cta.enabled = e.target.checked;
    syncCtaPreview();
  });

  document.getElementById("ctaLabel")?.addEventListener("input", (e) => {
    cta.label = e.target.value;
    syncCtaPreview();
  });

  document.getElementById("ctaURL")?.addEventListener("input", (e) => {
    cta.url = e.target.value;
  });

  document.getElementById("ctaBgColor")?.addEventListener("input", (e) => {
    cta.bgColor = e.target.value;
    syncCtaPreview();
  });

  document.getElementById("ctaTextColor")?.addEventListener("input", (e) => {
    cta.textColor = e.target.value;
    syncCtaPreview();
  });

  document.getElementById("ctaRadius")?.addEventListener("input", (e) => {
    cta.radius = parseInt(e.target.value, 10);
    document.getElementById("ctaRadiusVal").textContent = `${cta.radius}px`;
    syncCtaPreview();
  });

  document.getElementById("ctaFontSize")?.addEventListener("input", (e) => {
    cta.fontSize = parseInt(e.target.value, 10);
    document.getElementById("ctaFontVal").textContent = `${cta.fontSize}px`;
    syncCtaPreview();
  });

  // -------------------------
  // MUSIC STATE + WIRING
  // -------------------------
  const music = {
    enabled: false,
    file: null,
    url: null, // blob URL for preview; replaced by public URL on save
    publicURL: null,
    volume: 0.8,
    loop: true,
  };

  // Accordion toggle (reuse same pattern as transform/CTA)
  document.getElementById("musicToggle")?.addEventListener("click", () => {
    const body = document.getElementById("musicBody");
    const btn = document.getElementById("musicToggle");
    if (!body) return;
    const open = body.style.display === "block";
    body.style.display = open ? "none" : "block";
    btn.setAttribute("aria-expanded", String(!open));
    const chevron = btn.querySelector(".transform-chevron");
    if (chevron) chevron.style.transform = open ? "" : "rotate(90deg)";
  });

  document.getElementById("musicEnabled")?.addEventListener("change", (e) => {
    music.enabled = e.target.checked;
  });

  document.getElementById("musicVolume")?.addEventListener("input", (e) => {
    music.volume = parseInt(e.target.value, 10) / 100;
    const valEl = document.getElementById("musicVolumeVal");
    if (valEl) valEl.textContent = e.target.value + "%";
  });

  document.getElementById("musicLoop")?.addEventListener("change", (e) => {
    music.loop = e.target.checked;
  });

  // Drop zone click → open file picker
  const musicDropZone = document.getElementById("musicDropZone");
  const musicInput = document.getElementById("uploadMusic");

  musicDropZone?.addEventListener("click", () => musicInput?.click());
  musicDropZone?.addEventListener("dragover", (e) => {
    e.preventDefault();
    musicDropZone.style.borderColor = "#00fff7";
    musicDropZone.style.background = "rgba(0,255,247,0.06)";
  });
  musicDropZone?.addEventListener("dragleave", () => {
    musicDropZone.style.borderColor = "rgba(0,255,247,0.3)";
    musicDropZone.style.background = "rgba(0,255,247,0.02)";
  });
  musicDropZone?.addEventListener("drop", (e) => {
    e.preventDefault();
    musicDropZone.style.borderColor = "rgba(0,255,247,0.3)";
    musicDropZone.style.background = "rgba(0,255,247,0.02)";
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("audio/")) setMusicFile(file);
  });

  musicInput?.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) setMusicFile(file);
    e.target.value = "";
  });

  function setMusicFile(file) {
    if (file.size > 20 * 1024 * 1024) {
      showPopup("Audio file must be under 20 MB");
      return;
    }
    if (music.url) URL.revokeObjectURL(music.url);
    music.file = file;
    music.url = URL.createObjectURL(file);
    music.publicURL = null;

    const status = document.getElementById("musicStatus");
    const nameEl = document.getElementById("musicFileName");
    if (status) status.style.display = "block";
    if (nameEl) nameEl.textContent = `♪ ${file.name}`;

    showPopup("Audio file ready ✓");
  }

  document.getElementById("musicRemoveBtn")?.addEventListener("click", (e) => {
    e.stopPropagation();
    if (music.url) URL.revokeObjectURL(music.url);
    music.file = null;
    music.url = null;
    music.publicURL = null;
    const status = document.getElementById("musicStatus");
    if (status) status.style.display = "none";
    if (musicInput) musicInput.value = "";
    showPopup("Audio removed");
  });

  // -------------------------
  // OVERLAY TEXT STATE + WIRING
  // -------------------------
  const overlayText = {
    enabled: false,
    content: "",
    fontSize: 20,
    color: "#ffffff",
    bgColor: "#000000",
    bgOpacity: 0.5,
    x: 50,
    y: 85,
  };

  function syncOverlayTextPreview() {
    // Sidebar mini-preview
    const preview = document.getElementById("overlayTextPreview");
    if (preview) {
      const text = overlayText.content || "Your message here…";
      preview.textContent = text;
      preview.style.fontSize =
        Math.max(10, Math.round(overlayText.fontSize * 0.7)) + "px";
      preview.style.color = overlayText.color;
      const hex0 = overlayText.bgColor.replace("#", "");
      const r0 = parseInt(hex0.slice(0, 2), 16),
        g0 = parseInt(hex0.slice(2, 4), 16),
        b0 = parseInt(hex0.slice(4, 6), 16);
      preview.style.background =
        overlayText.bgOpacity > 0
          ? `rgba(${r0},${g0},${b0},${overlayText.bgOpacity})`
          : "transparent";
      preview.style.left = overlayText.x + "%";
      preview.style.top = overlayText.y + "%";
      preview.style.transform = "translate(-50%, -50%)";
      preview.style.bottom = "auto";
    }
    // AR panel live overlay
    const arTxt = document.getElementById("arTextOverlay");
    if (arTxt) {
      const text = overlayText.content || "Your message here…";
      arTxt.textContent = text;
      arTxt.style.fontSize = overlayText.fontSize + "px";
      arTxt.style.color = overlayText.color;
      const hex = overlayText.bgColor.replace("#", "");
      const r = parseInt(hex.slice(0, 2), 16),
        g = parseInt(hex.slice(2, 4), 16),
        b = parseInt(hex.slice(4, 6), 16);
      arTxt.style.background =
        overlayText.bgOpacity > 0
          ? `rgba(${r},${g},${b},${overlayText.bgOpacity})`
          : "transparent";
      arTxt.style.left = overlayText.x + "%";
      arTxt.style.top = overlayText.y + "%";
      arTxt.style.transform = "translate(-50%, -50%)";
      arTxt.style.display =
        overlayText.enabled && overlayText.content.trim() ? "block" : "none";
    }
  }

  document
    .getElementById("overlayTextEnabled")
    ?.addEventListener("change", (e) => {
      overlayText.enabled = e.target.checked;
      syncOverlayTextPreview();
    });
  document
    .getElementById("overlayTextContent")
    ?.addEventListener("input", (e) => {
      overlayText.content = e.target.value;
      syncOverlayTextPreview();
    });
  document.getElementById("overlayTextSize")?.addEventListener("input", (e) => {
    overlayText.fontSize = parseInt(e.target.value, 10);
    const el = document.getElementById("overlayTextSizeVal");
    if (el) el.textContent = overlayText.fontSize + "px";
    syncOverlayTextPreview();
  });
  document
    .getElementById("overlayTextColor")
    ?.addEventListener("input", (e) => {
      overlayText.color = e.target.value;
      syncOverlayTextPreview();
    });
  document.getElementById("overlayTextBg")?.addEventListener("input", (e) => {
    overlayText.bgColor = e.target.value;
    syncOverlayTextPreview();
  });
  document
    .getElementById("overlayTextBgOpacity")
    ?.addEventListener("change", (e) => {
      overlayText.bgOpacity = parseFloat(e.target.value);
      syncOverlayTextPreview();
    });
  document.getElementById("overlayTextX")?.addEventListener("input", (e) => {
    overlayText.x = parseInt(e.target.value, 10);
    const el = document.getElementById("overlayTextXVal");
    if (el) el.textContent = overlayText.x + "%";
    syncOverlayTextPreview();
  });
  document.getElementById("overlayTextY")?.addEventListener("input", (e) => {
    overlayText.y = parseInt(e.target.value, 10);
    const el = document.getElementById("overlayTextYVal");
    if (el) el.textContent = overlayText.y + "%";
    syncOverlayTextPreview();
  });

  // -------------------------
  // OVERLAY IMAGE STATE + WIRING
  // -------------------------
  const overlayImage = {
    enabled: false,
    file: null,
    url: null,
    publicURL: null,
    size: 20,
    opacity: 100,
    x: 50,
    y: 10,
  };

  function syncOverlayImagePreview() {
    // Sidebar mini-preview
    const img = document.getElementById("overlayImagePreview");
    if (img) {
      img.style.width = overlayImage.size + "%";
      img.style.opacity = overlayImage.opacity / 100;
      img.style.left = overlayImage.x + "%";
      img.style.top = overlayImage.y + "%";
      img.style.transform = "translate(-50%, 0)";
    }
    // AR panel live overlay
    const arImg = document.getElementById("arImageOverlay");
    if (arImg) {
      const src = overlayImage.url || overlayImage.publicURL || "";
      if (src && arImg.src !== src) arImg.src = src;
      arImg.style.width = overlayImage.size + "%";
      arImg.style.opacity = overlayImage.opacity / 100;
      arImg.style.left = overlayImage.x + "%";
      arImg.style.top = overlayImage.y + "%";
      arImg.style.transform = "translate(-50%, 0)";
      arImg.style.display = overlayImage.enabled && src ? "block" : "none";
    }
  }

  const overlayImgDropZone = document.getElementById("overlayImgDropZone");
  const overlayImgInput = document.getElementById("uploadOverlayImage");

  overlayImgDropZone?.addEventListener("click", () => overlayImgInput?.click());
  overlayImgDropZone?.addEventListener("dragover", (e) => {
    e.preventDefault();
    overlayImgDropZone.style.borderColor = "#00fff7";
  });
  overlayImgDropZone?.addEventListener("dragleave", () => {
    overlayImgDropZone.style.borderColor = "rgba(0,255,247,0.3)";
  });
  overlayImgDropZone?.addEventListener("drop", (e) => {
    e.preventDefault();
    overlayImgDropZone.style.borderColor = "rgba(0,255,247,0.3)";
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) setOverlayImageFile(file);
  });
  overlayImgInput?.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) setOverlayImageFile(file);
    e.target.value = "";
  });

  function setOverlayImageFile(file) {
    if (file.size > 5 * 1024 * 1024) {
      showPopup("Image must be under 5 MB");
      return;
    }
    if (overlayImage.url) URL.revokeObjectURL(overlayImage.url);
    overlayImage.file = file;
    overlayImage.url = URL.createObjectURL(file);
    overlayImage.publicURL = null;
    const status = document.getElementById("overlayImgStatus");
    const nameEl = document.getElementById("overlayImgFileName");
    if (status) status.style.display = "block";
    if (nameEl) nameEl.textContent = "🖼 " + file.name;
    const img = document.getElementById("overlayImagePreview");
    if (img) {
      img.src = overlayImage.url;
      img.style.display = "block";
    }
    const arImg = document.getElementById("arImageOverlay");
    if (arImg) {
      arImg.src = overlayImage.url;
    }
    syncOverlayImagePreview();
    showPopup("Overlay image ready ✓");
  }

  document
    .getElementById("overlayImgRemoveBtn")
    ?.addEventListener("click", (e) => {
      e.stopPropagation();
      if (overlayImage.url) URL.revokeObjectURL(overlayImage.url);
      overlayImage.file = null;
      overlayImage.url = null;
      overlayImage.publicURL = null;
      const status = document.getElementById("overlayImgStatus");
      if (status) status.style.display = "none";
      const img = document.getElementById("overlayImagePreview");
      if (img) {
        img.src = "";
        img.style.display = "none";
      }
      if (overlayImgInput) overlayImgInput.value = "";
      showPopup("Overlay image removed");
    });

  document
    .getElementById("overlayImageEnabled")
    ?.addEventListener("change", (e) => {
      overlayImage.enabled = e.target.checked;
      syncOverlayImagePreview();
    });
  document
    .getElementById("overlayImageSize")
    ?.addEventListener("input", (e) => {
      overlayImage.size = parseInt(e.target.value, 10);
      const el = document.getElementById("overlayImageSizeVal");
      if (el) el.textContent = overlayImage.size + "%";
      syncOverlayImagePreview();
    });
  document
    .getElementById("overlayImageOpacity")
    ?.addEventListener("input", (e) => {
      overlayImage.opacity = parseInt(e.target.value, 10);
      const el = document.getElementById("overlayImageOpacityVal");
      if (el) el.textContent = overlayImage.opacity + "%";
      syncOverlayImagePreview();
    });
  document.getElementById("overlayImageX")?.addEventListener("input", (e) => {
    overlayImage.x = parseInt(e.target.value, 10);
    const el = document.getElementById("overlayImageXVal");
    if (el) el.textContent = overlayImage.x + "%";
    syncOverlayImagePreview();
  });
  document.getElementById("overlayImageY")?.addEventListener("input", (e) => {
    overlayImage.y = parseInt(e.target.value, 10);
    const el = document.getElementById("overlayImageYVal");
    if (el) el.textContent = overlayImage.y + "%";
    syncOverlayImagePreview();
  });

  // -------------------------
  // INTRO POPUP STATE + WIRING
  // -------------------------
  const introPopup = {
    enabled: false,
    title: "",
    message: "",
    btnLabel: "",
    accent: "#00fff7",
    imageFile: null,
    imageURL: null,
    imagePublicURL: null,
  };

  function syncIntroPreview() {
    const titleEl = document.getElementById("introPreviewTitle");
    const msgEl = document.getElementById("introPreviewMsg");
    const btnEl = document.getElementById("introPreviewBtn");
    const imgEl = document.getElementById("introPreviewImg");
    const box = document.getElementById("introPopupPreview");

    if (titleEl) titleEl.textContent = introPopup.title || "Welcome!";
    if (titleEl) titleEl.style.color = introPopup.accent;
    if (msgEl)
      msgEl.textContent =
        introPopup.message || "Point your camera at the target image to begin…";
    if (btnEl) {
      btnEl.textContent = introPopup.btnLabel || "Let's Go!";
      btnEl.style.background = introPopup.accent;
      btnEl.style.color = "#000";
    }
    if (box)
      box.style.borderColor = introPopup.accent
        .replace(")", ",0.35)")
        .replace("rgb", "rgba");
    if (imgEl && introPopup.imageURL) {
      imgEl.src = introPopup.imageURL;
      imgEl.style.display = "block";
    } else if (imgEl) {
      imgEl.style.display = "none";
    }
  }

  document
    .getElementById("introPopupEnabled")
    ?.addEventListener("change", (e) => {
      introPopup.enabled = e.target.checked;
    });
  document.getElementById("introPopupTitle")?.addEventListener("input", (e) => {
    introPopup.title = e.target.value;
    syncIntroPreview();
  });
  document
    .getElementById("introPopupMessage")
    ?.addEventListener("input", (e) => {
      introPopup.message = e.target.value;
      syncIntroPreview();
    });
  document.getElementById("introPopupBtn")?.addEventListener("input", (e) => {
    introPopup.btnLabel = e.target.value;
    syncIntroPreview();
  });
  document
    .getElementById("introPopupAccent")
    ?.addEventListener("input", (e) => {
      introPopup.accent = e.target.value;
      syncIntroPreview();
    });

  const introImgDropZone = document.getElementById("introImgDropZone");
  const introImgInput = document.getElementById("uploadIntroImage");

  introImgDropZone?.addEventListener("click", () => introImgInput?.click());
  introImgDropZone?.addEventListener("dragover", (e) => {
    e.preventDefault();
    introImgDropZone.style.borderColor = "#9b5cff";
  });
  introImgDropZone?.addEventListener("dragleave", () => {
    introImgDropZone.style.borderColor = "rgba(155,92,255,0.35)";
  });
  introImgDropZone?.addEventListener("drop", (e) => {
    e.preventDefault();
    introImgDropZone.style.borderColor = "rgba(155,92,255,0.35)";
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) setIntroImageFile(file);
  });
  introImgInput?.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) setIntroImageFile(file);
    e.target.value = "";
  });

  function setIntroImageFile(file) {
    if (file.size > 5 * 1024 * 1024) {
      showPopup("Image must be under 5 MB");
      return;
    }
    if (introPopup.imageURL) URL.revokeObjectURL(introPopup.imageURL);
    introPopup.imageFile = file;
    introPopup.imageURL = URL.createObjectURL(file);
    introPopup.imagePublicURL = null;
    const status = document.getElementById("introImgStatus");
    const nameEl = document.getElementById("introImgFileName");
    if (status) status.style.display = "block";
    if (nameEl) nameEl.textContent = "🎨 " + file.name;
    syncIntroPreview();
    showPopup("Intro image ready ✓");
  }

  document
    .getElementById("introImgRemoveBtn")
    ?.addEventListener("click", (e) => {
      e.stopPropagation();
      if (introPopup.imageURL) URL.revokeObjectURL(introPopup.imageURL);
      introPopup.imageFile = null;
      introPopup.imageURL = null;
      introPopup.imagePublicURL = null;
      const status = document.getElementById("introImgStatus");
      if (status) status.style.display = "none";
      if (introImgInput) introImgInput.value = "";
      syncIntroPreview();
      showPopup("Intro image removed");
    });

  // -------------------------
  // IMAGE TARGET UPLOAD + COMPILE
  // -------------------------
  const dropZone = document.getElementById("imageDropZone");
  const imageInput = document.getElementById("uploadTargetImages");
  const previewList = document.getElementById("imagePreviewList");
  const compileBtn = document.getElementById("compileBtn");
  const compileStatus = document.getElementById("compileStatus");

  let targetImageFiles = [];

  dropZone?.addEventListener("click", () => imageInput?.click());
  dropZone?.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("drag-over");
  });
  dropZone?.addEventListener("dragleave", () =>
    dropZone.classList.remove("drag-over"),
  );
  dropZone?.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("drag-over");
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith("image/"),
    );
    addTargetImages(files);
  });

  imageInput?.addEventListener("change", (e) => {
    addTargetImages(Array.from(e.target.files));
    e.target.value = "";
  });

  function addTargetImages(files) {
    files.forEach((file) => {
      if (
        targetImageFiles.find(
          (f) => f.name === file.name && f.size === file.size,
        )
      )
        return;
      targetImageFiles.push(file);
      renderPreview(file);
    });
    updateCompileBtn();
  }

  function renderPreview(file) {
    const url = URL.createObjectURL(file);
    const item = document.createElement("div");
    item.className = "preview-item";
    item.dataset.name = file.name;
    item.innerHTML = `
      <img src="${url}" alt="${file.name}" title="${file.name}" />
      <button class="preview-remove" title="Remove">✕</button>
    `;
    item.querySelector(".preview-remove").addEventListener("click", (e) => {
      e.stopPropagation();
      targetImageFiles = targetImageFiles.filter(
        (f) => !(f.name === file.name && f.size === file.size),
      );
      URL.revokeObjectURL(url);
      item.remove();
      updateCompileBtn();
    });
    previewList.appendChild(item);
  }

  function updateCompileBtn() {
    if (!compileBtn) return;
    compileBtn.style.display = targetImageFiles.length > 0 ? "block" : "none";
    if (targetImageFiles.length === 0 && compileStatus) {
      compileStatus.style.display = "none";
    }
  }

  let compileAborted = false;

  compileBtn?.addEventListener("click", async () => {
    if (targetImageFiles.length === 0) return;

    compileAborted = false;
    compileBtn.disabled = true;
    compileStatus.style.display = "block";
    compileStatus.className = "compile-status loading";
    compileStatus.innerHTML = `
      Resizing image${targetImageFiles.length > 1 ? "s" : ""}...
      <div class="progress-bar-wrap"><div class="progress-bar-fill" id="compileProgress" style="width:5%"></div></div>
      <div style="margin-top:8px"><button id="cancelCompileBtn" style="font-size:11px;padding:4px 10px;border-radius:4px;border:1px solid rgba(255,77,240,0.5);background:transparent;color:#ff4df0;cursor:pointer;font-family:sans-serif;">✕ Cancel</button></div>
    `;

    document
      .getElementById("cancelCompileBtn")
      ?.addEventListener("click", () => {
        compileAborted = true;
        compileStatus.className = "compile-status error";
        compileStatus.innerHTML = `✕ Cancelled.`;
        compileBtn.disabled = false;
      });

    try {
      if (!window.MINDAR || !window.MINDAR.IMAGE) {
        await loadScript(
          "https://cdn.jsdelivr.net/npm/mind-ar@1.2.0/dist/mindar-image.prod.js",
        );
      }
      if (compileAborted) return;

      setProgress(15);

      const images = await Promise.all(targetImageFiles.map(fileToImage));
      if (compileAborted) return;

      setProgress(35);
      compileStatus.innerHTML = `
        Compiling features... <span id="compilePercent" style="color:#00fff7">0%</span>
        <div style="font-size:11px;opacity:0.5;margin-top:2px">Usually 10–30s — larger/complex images take longer</div>
        <div class="progress-bar-wrap"><div class="progress-bar-fill" id="compileProgress" style="width:35%"></div></div>
        <div style="margin-top:8px"><button id="cancelCompileBtn2" style="font-size:11px;padding:4px 10px;border-radius:4px;border:1px solid rgba(255,77,240,0.5);background:transparent;color:#ff4df0;cursor:pointer;font-family:sans-serif;">✕ Cancel</button></div>
      `;
      document
        .getElementById("cancelCompileBtn2")
        ?.addEventListener("click", () => {
          compileAborted = true;
          compileStatus.className = "compile-status error";
          compileStatus.innerHTML = `✕ Cancelled.`;
          compileBtn.disabled = false;
        });

      const compiler = new window.MINDAR.IMAGE.Compiler();

      const compilePromise = (async () => {
        await compiler.compileImageTargets(images, (progress) => {
          if (compileAborted) return;
          const pct = Math.round(progress * 100);
          const el = document.getElementById("compilePercent");
          if (el) el.textContent = pct + "%";
          setProgress(35 + Math.round(progress * 55));
        });
        return compiler.exportData();
      })();

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("TIMEOUT")), 90000),
      );

      const buffer = await Promise.race([compilePromise, timeoutPromise]);
      if (compileAborted) return;

      const blob = new Blob([buffer]);
      mindFile = new File([blob], "targets.mind", {
        type: "application/octet-stream",
      });

      if (mindURL) URL.revokeObjectURL(mindURL);
      mindURL = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = mindURL;
      a.download = "targets.mind";
      a.click();

      setProgress(100);
      compileStatus.className = "compile-status success";
      compileStatus.innerHTML = `✓ Compiled! <strong>targets.mind</strong> downloaded & ready.<br/><span style="opacity:0.7;font-size:11px">Click Start AR to preview, or Save Project to save your experience.</span>`;
      showPopup("Compiled! .mind file ready ✓");
    } catch (err) {
      if (compileAborted) return;
      console.error("Compile error:", err);
      const isTimeout = err.message === "TIMEOUT";
      compileStatus.className = "compile-status error";
      compileStatus.innerHTML = isTimeout
        ? `✗ Timed out (90s).<br/><span style="font-size:11px;opacity:0.8">Try a different image — high-contrast images with lots of detail compile fastest.</span>`
        : `✗ Compile failed: ${err.message || "Unknown error"}`;
      showPopup(isTimeout ? "Compile timed out" : "Compile failed");
    }

    compileBtn.disabled = false;
  });

  function setProgress(pct) {
    const bar = document.getElementById("compileProgress");
    if (bar) bar.style.width = pct + "%";
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }
      const s = document.createElement("script");
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  function fileToImage(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        const MAX = 600;
        let { width, height } = img;
        if (width > MAX || height > MAX) {
          const ratio = Math.min(MAX / width, MAX / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        const resized = new Image();
        resized.onload = () => resolve(resized);
        resized.onerror = reject;
        resized.src = canvas.toDataURL("image/jpeg", 0.92);
      };
      img.onerror = reject;
      img.src = url;
    });
  }

  // -------------------------
  // ANIMATION DETECTION FROM GLB
  // -------------------------
  // Parse animation names directly from the GLB binary JSON chunk.
  // This is reliable regardless of THREE version — no loader needed.
  async function parseAnimationsFromGLBBinary(file) {
    try {
      const buf = await file.arrayBuffer();
      const view = new DataView(buf);
      // GLB header: magic(4) version(4) length(4) = 12 bytes
      // Chunk 0: chunkLength(4) chunkType(4) chunkData
      const magic = view.getUint32(0, true);
      if (magic !== 0x46546c67) return []; // not a GLB
      const chunk0Length = view.getUint32(12, true);
      const chunk0Type = view.getUint32(16, true);
      if (chunk0Type !== 0x4e4f534a) return []; // chunk 0 must be JSON
      const jsonBytes = new Uint8Array(buf, 20, chunk0Length);
      const jsonStr = new TextDecoder().decode(jsonBytes);
      const json = JSON.parse(jsonStr);
      const anims = json.animations || [];
      return anims.map((a) => a.name || "").filter((n) => n.trim() !== "");
    } catch (e) {
      console.warn("GLB binary parse failed:", e);
      return [];
    }
  }

  async function extractAnimationsFromGLB(file) {
    // First try fast binary parse — works for all Blender exports
    const binaryNames = await parseAnimationsFromGLBBinary(file);
    if (binaryNames.length > 0) {
      console.log(
        "[AR Builder] Animations found via binary parse:",
        binaryNames,
      );
      return binaryNames;
    }

    // Fallback: try GLTFLoader from A-Frame's bundled THREE
    try {
      const THREE = window.THREE || (window.AFRAME && window.AFRAME.THREE);
      if (!THREE) return [];

      const { GLTFLoader } = await importGLTFLoader(THREE);
      if (!GLTFLoader) return [];

      const url = URL.createObjectURL(file);
      return new Promise((resolve) => {
        const loader = new GLTFLoader();
        loader.load(
          url,
          (gltf) => {
            URL.revokeObjectURL(url);
            const names = (gltf.animations || []).map((clip) => clip.name);
            console.log("[AR Builder] Animations found via GLTFLoader:", names);
            resolve(names);
          },
          undefined,
          (err) => {
            console.warn("GLTFLoader fallback error:", err);
            URL.revokeObjectURL(url);
            resolve([]);
          },
        );
      });
    } catch (e) {
      console.warn("Animation extraction fallback failed:", e);
      return [];
    }
  }

  function importGLTFLoader(THREE) {
    return new Promise((resolve) => {
      // A-Frame 1.3 bundles THREE r137 with GLTFLoader on THREE.GLTFLoader
      if (THREE.GLTFLoader) {
        resolve({ GLTFLoader: THREE.GLTFLoader });
        return;
      }
      // Try importing from the three/examples path bundled with A-Frame
      const script = document.createElement("script");
      script.src =
        "https://cdn.jsdelivr.net/npm/three@0.137.0/examples/js/loaders/GLTFLoader.js";
      script.onload = () => resolve({ GLTFLoader: THREE.GLTFLoader || null });
      script.onerror = () => resolve({ GLTFLoader: null });
      document.head.appendChild(script);
    });
  }

  let _lastAnimations = [];
  function renderAnimationPicker(animations) {
    _lastAnimations = animations || [];
    window.__lastAnimations = _lastAnimations;
    const section = document.getElementById("animationSection");
    const select = document.getElementById("animationSelect");
    const badge = document.getElementById("animationCount");
    const noClips = document.getElementById("animationNoClips");

    if (!section || !select) return;

    section.style.display = "block";

    if (!animations || animations.length === 0) {
      select.style.display = "none";
      if (noClips) noClips.style.display = "block";
      if (badge) badge.textContent = "";
      selectedAnimation = "";
      window.__selectedClip = "";
      return;
    }

    // Hide the "no clips" message, show the select
    if (noClips) noClips.style.display = "none";
    select.style.display = "block";

    // Populate options — one entry per clip, no Auto/None options
    select.innerHTML = "";

    animations.forEach((name) => {
      const opt = document.createElement("option");
      opt.value = name;
      opt.textContent = name;
      select.appendChild(opt);
    });

    if (badge)
      badge.textContent = `${animations.length} clip${animations.length !== 1 ? "s" : ""} found`;

    // Auto-select the first clip
    selectedAnimation = animations[0];
    window.__selectedClip = animations[0];
    select.value = animations[0];

    // Replace the element to remove any stacked listeners from previous uploads
    const freshSelect = select.cloneNode(true);
    select.parentNode.replaceChild(freshSelect, select);

    freshSelect.addEventListener("change", () => {
      selectedAnimation = freshSelect.value;
      window.__selectedClip = selectedAnimation;
      const label =
        selectedAnimation === "__none__"
          ? "No animation — static pose"
          : selectedAnimation
            ? `Animation: ${selectedAnimation}`
            : "Animation: Auto";
      showPopup(label);
      hotReloadAnimation();
    });
  }

  // Expose the current animation list globally so model-builder can populate
  // its own picker after a project restore (no fresh file upload in that path)
  window.__getAnimationList = function () {
    return _lastAnimations || [];
  };

  function hotReloadAnimation() {
    const model = document.getElementById("model");
    if (!model) return;
    applyAnimationMixer(model, selectedAnimation);

    // Keep the live transform overlay in sync
    const animDisplay = document.getElementById("arAnimDisplay");
    if (animDisplay) {
      animDisplay.textContent =
        selectedAnimation === "__none__" ? "none" : selectedAnimation || "auto";
    }
  }

  function applyAnimationMixer(modelEl, clipName) {
    if (clipName === "__none__") {
      // Stop all actions via the live mixer component if it exists
      const comp = modelEl.components && modelEl.components["animation-mixer"];
      if (comp && comp._mixer) {
        comp._mixer.stopAllAction();
        comp._active = [];
      }
      modelEl.removeAttribute("animation-mixer");
      return;
    }

    const mixerStr = clipName
      ? `clip: ${clipName}; loop: repeat; crossFadeDuration: 0.3`
      : "loop: repeat; crossFadeDuration: 0.3";

    // If the component is already initialised (mixer exists), update it directly
    // instead of destroy/re-create — which loses the model-loaded event.
    const comp = modelEl.components && modelEl.components["animation-mixer"];
    if (comp && comp._mixer) {
      // Update the schema data so data.clip reflects the new choice
      comp.data.clip = clipName || "*";
      comp._play();
      return;
    }

    // Component not yet initialised — set/replace the attribute normally.
    // (First load, or after a __none__ removal.)
    modelEl.removeAttribute("animation-mixer");
    requestAnimationFrame(() => {
      modelEl.setAttribute("animation-mixer", mixerStr);
    });
  }

  // -------------------------
  // MANUAL CLIP NAME INPUT
  // -------------------------
  document.getElementById("manualClipInput")?.addEventListener("focus", (e) => {
    e.target.style.borderColor = "rgba(0,255,247,0.7)";
  });
  document.getElementById("manualClipInput")?.addEventListener("blur", (e) => {
    e.target.style.borderColor = "rgba(0,255,247,0.25)";
  });
  document
    .getElementById("manualClipInput")
    ?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") applyManualClip();
    });
  document
    .getElementById("applyManualClipBtn")
    ?.addEventListener("click", applyManualClip);

  function applyManualClip() {
    const input = document.getElementById("manualClipInput");
    const status = document.getElementById("manualClipStatus");
    const val = input?.value.trim();
    if (!val) {
      if (status) {
        status.textContent = "⚠ Enter a clip name first";
        status.style.display = "block";
        status.style.color = "#ff4df0";
      }
      return;
    }
    selectedAnimation = val;
    window.__selectedClip = val;
    // Deselect the dropdown so it doesn't conflict
    const sel = document.getElementById("animationSelect");
    if (sel) sel.value = "";
    if (status) {
      status.textContent = `✓ Using clip: "${val}"`;
      status.style.display = "block";
      status.style.color = "#00fff7";
    }
    showPopup(`Clip set: ${val}`);
    hotReloadAnimation();
  }

  // -------------------------
  // TRANSFORM STATE
  // -------------------------
  const transform = {
    scale: 0.2,
    posX: 0,
    posY: 0, // 0 = sits on top of the image plane
    posZ: 0,
    rotX: 0,
    rotY: 0,
    rotZ: 0,
  };

  const DEFAULTS = { ...transform };

  // -------------------------
  // SLIDER WIRING
  // -------------------------
  function bindSlider(id, valId, key, isRot) {
    const slider = document.getElementById(id);
    const display = document.getElementById(valId);
    if (!slider || !display) return;
    slider.addEventListener("input", () => {
      const v = parseFloat(slider.value);
      transform[key] = v;
      display.textContent = isRot ? `${v}°` : v.toFixed(2);
      applyTransformToModel();
    });
  }

  bindSlider("scaleSlider", "scaleVal", "scale", false);
  bindSlider("posXSlider", "posXVal", "posX", false);
  bindSlider("posYSlider", "posYVal", "posY", false);
  bindSlider("posZSlider", "posZVal", "posZ", false);
  bindSlider("rotXSlider", "rotXVal", "rotX", true);
  bindSlider("rotYSlider", "rotYVal", "rotY", true);
  bindSlider("rotZSlider", "rotZVal", "rotZ", true);

  // Sync initial display values to new defaults
  document.getElementById("posYVal") &&
    (document.getElementById("posYVal").textContent = "0.00");
  const posYSlider = document.getElementById("posYSlider");
  if (posYSlider) posYSlider.value = 0;

  document
    .getElementById("resetTransformBtn")
    ?.addEventListener("click", () => {
      Object.assign(transform, DEFAULTS);

      const map = [
        ["scaleSlider", "scaleVal", "scale", false],
        ["posXSlider", "posXVal", "posX", false],
        ["posYSlider", "posYVal", "posY", false],
        ["posZSlider", "posZVal", "posZ", false],
        ["rotXSlider", "rotXVal", "rotX", true],
        ["rotYSlider", "rotYVal", "rotY", true],
        ["rotZSlider", "rotZVal", "rotZ", true],
      ];

      map.forEach(([sliderId, valId, key, isRot]) => {
        const s = document.getElementById(sliderId);
        const v = document.getElementById(valId);
        if (s) s.value = DEFAULTS[key];
        if (v)
          v.textContent = isRot
            ? `${DEFAULTS[key]}°`
            : DEFAULTS[key].toFixed(2);
      });

      applyTransformToModel();
      showPopup("Transform reset ✓");
    });

  // -------------------------
  // APPLY TRANSFORM TO LIVE MODEL
  // -------------------------
  function applyTransformToModel() {
    const model = document.getElementById("model");
    if (!model) return;

    const s = transform.scale;
    model.setAttribute("scale", `${s} ${s} ${s}`);
    model.setAttribute(
      "position",
      `${transform.posX} ${transform.posY} ${transform.posZ}`,
    );
    model.setAttribute(
      "rotation",
      `${transform.rotX} ${transform.rotY} ${transform.rotZ}`,
    );
    refreshAROverlay();
  }

  // -------------------------
  // POPUP TOAST
  // -------------------------
  function showPopup(message) {
    const popup = document.getElementById("popup");
    if (!popup) return;
    popup.textContent = message;
    popup.classList.remove("hidden");
    setTimeout(() => popup.classList.add("show"), 10);
    setTimeout(() => {
      popup.classList.remove("show");
      setTimeout(() => popup.classList.add("hidden"), 300);
    }, 3000);
  }
  // Expose so slot bar JS can trigger toasts
  window.__showPopup = showPopup;

  // -------------------------
  // -------------------------
  function showSaveSuccessModal(qrURL, viewerURL) {
    // Simply show a success toast — no QR code modal
    showPopup("✓ Project saved successfully!");
  }

  // -------------------------
  // RESTORE PROJECT FROM DB ROW
  // Called by slot bar whenever a slot is activated (on load + slot switch)
  // -------------------------
  function restoreProject(row) {
    if (!row) {
      // Empty slot — reset everything to defaults
      mindURL = null;
      mindFile = null;
      modelURL = "model.glb";
      modelFile = null;
      selectedAnimation = "";
      arMode = ["free", "face"].includes(window.__builderMode)
        ? window.__builderMode
        : "image";
      Object.assign(transform, DEFAULTS);
      Object.assign(cta, {
        enabled: false,
        label: "Shop Now",
        url: "",
        bgColor: "#00fff7",
        textColor: "#000000",
        radius: 10,
        fontSize: 14,
      });
      Object.assign(music, {
        enabled: false,
        file: null,
        url: null,
        publicURL: null,
        volume: 0.8,
        loop: true,
      });
      Object.assign(overlayText, {
        enabled: false,
        content: "",
        fontSize: 20,
        color: "#ffffff",
        bgColor: "#000000",
        bgOpacity: 0.5,
        x: 50,
        y: 85,
      });
      Object.assign(overlayImage, {
        enabled: false,
        file: null,
        url: null,
        publicURL: null,
        size: 20,
        opacity: 100,
        x: 50,
        y: 10,
      });
      Object.assign(introPopup, {
        enabled: false,
        title: "",
        message: "",
        btnLabel: "",
        accent: "#00fff7",
        imageFile: null,
        imageURL: null,
        imagePublicURL: null,
      });
      _syncAllUI();
      return;
    }

    // --- Mode ---
    if (row.mode) {
      arMode = row.mode;
      document.querySelectorAll(".mode-btn").forEach((b) => {
        b.classList.toggle("mode-btn-active", b.dataset.mode === arMode);
      });
      const imageSection = document.getElementById("imageTrackerSection");
      if (arMode === "free") {
        if (imageSection) imageSection.style.display = "none";
      } else {
        if (imageSection) imageSection.style.display = "block";
      }
    }

    // --- Mind / target file ---
    if (row.mind_url) {
      mindURL = row.mind_url;
      mindFile = null;
      const status = document.getElementById("compileStatus");
      if (status) {
        status.style.display = "block";
        status.textContent = "✓ Target loaded from saved project";
        status.style.color = "#00fff7";
      }
    }

    // --- Model ---
    if (row.model_url) {
      modelURL = row.model_url;
      window.__currentModelSrc = modelURL; // expose for face/model builder overrides
      modelFile = null;
      const modelStatus = document.getElementById("modelStatus");
      const modelName = document.getElementById("modelFileName");
      if (modelStatus) modelStatus.style.display = "block";
      if (modelName)
        modelName.textContent = "✓ Model loaded from saved project";

      // Fetch and scan the saved model for animations so the picker is populated
      // even without a fresh file upload
      (async () => {
        try {
          const resp = await fetch(row.model_url);
          const blob = await resp.blob();
          const file = new File([blob], "model.glb", {
            type: "model/gltf-binary",
          });
          const animations = await extractAnimationsFromGLB(file);
          renderAnimationPicker(animations);
          // Re-apply the saved clip after picker is ready
          const savedClip = row.animation_clip || "";
          if (savedClip) {
            selectedAnimation = savedClip;
            window.__selectedClip = savedClip;
            const sel = document.getElementById("animationSelect");
            if (sel) sel.value = savedClip;
          }
        } catch (err) {
          console.warn(
            "[restoreProject] Could not scan animations from saved model:",
            err,
          );
        }
      })();
    }

    // --- Transform ---
    if (row.transform_scale !== undefined && row.transform_scale !== null) {
      transform.scale = parseFloat(row.transform_scale);
      transform.posX = parseFloat(row.transform_pos_x ?? 0);
      transform.posY = parseFloat(row.transform_pos_y ?? 0);
      transform.posZ = parseFloat(row.transform_pos_z ?? 0);
      transform.rotX = parseFloat(row.transform_rot_x ?? 0);
      transform.rotY = parseFloat(row.transform_rot_y ?? 0);
      transform.rotZ = parseFloat(row.transform_rot_z ?? 0);
      _syncSliders();
    }

    // --- Animation clip ---
    if (row.animation_clip !== undefined)
      selectedAnimation = row.animation_clip || "";
    window.__selectedClip = selectedAnimation;

    // --- CTA ---
    if (row.cta_enabled !== undefined) {
      cta.enabled = !!row.cta_enabled;
      cta.label = row.cta_label || "Shop Now";
      cta.url = row.cta_url || "";
      cta.bgColor = row.cta_bg_color || "#00fff7";
      cta.textColor = row.cta_text_color || "#000000";
      cta.radius = row.cta_radius ?? 10;
      cta.fontSize = row.cta_font_size ?? 14;
      const f = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.value = val;
      };
      const fc = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.checked = val;
      };
      fc("ctaEnabled", cta.enabled);
      f("ctaLabel", cta.label);
      f("ctaURL", cta.url);
      f("ctaBgColor", cta.bgColor);
      f("ctaTextColor", cta.textColor);
      f("ctaRadius", cta.radius);
      f("ctaFontSize", cta.fontSize);
      const rv = document.getElementById("ctaRadiusVal");
      if (rv) rv.textContent = cta.radius + "px";
      const fv = document.getElementById("ctaFontVal");
      if (fv) fv.textContent = cta.fontSize + "px";
      syncCtaPreview();
    }

    // --- Music ---
    if (row.music_enabled !== undefined) {
      music.enabled = !!row.music_enabled;
      music.publicURL = row.music_url || null;
      music.url = row.music_url || null;
      music.volume = (row.music_volume ?? 80) / 100;
      music.loop = row.music_loop !== false;
      const f = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.value = val;
      };
      const fc = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.checked = val;
      };
      fc("musicEnabled", music.enabled);
      f("musicVolume", Math.round(music.volume * 100));
      fc("musicLoop", music.loop);
      const vv = document.getElementById("musicVolumeVal");
      if (vv) vv.textContent = Math.round(music.volume * 100) + "%";
      if (row.music_url) {
        const st = document.getElementById("musicStatus");
        const nm = document.getElementById("musicFileName");
        if (st) st.style.display = "block";
        if (nm) nm.textContent = "♪ Saved audio loaded";
      }
    }

    // --- Overlay text ---
    if (row.overlay_text_enabled !== undefined) {
      overlayText.enabled = !!row.overlay_text_enabled;
      overlayText.content = row.overlay_text_content || "";
      overlayText.fontSize = row.overlay_text_size ?? 20;
      overlayText.color = row.overlay_text_color || "#ffffff";
      overlayText.bgColor = row.overlay_text_bg_color || "#000000";
      overlayText.bgOpacity = row.overlay_text_bg_opacity ?? 0.5;
      overlayText.x = row.overlay_text_x ?? 50;
      overlayText.y = row.overlay_text_y ?? 85;
      const f = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.value = val;
      };
      const fc = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.checked = val;
      };
      fc("overlayTextEnabled", overlayText.enabled);
      f("overlayTextContent", overlayText.content);
      f("overlayTextSize", overlayText.fontSize);
      f("overlayTextColor", overlayText.color);
      f("overlayTextBg", overlayText.bgColor);
      f("overlayTextBgOpacity", overlayText.bgOpacity);
      f("overlayTextX", overlayText.x);
      f("overlayTextY", overlayText.y);
      const sv = document.getElementById("overlayTextSizeVal");
      if (sv) sv.textContent = overlayText.fontSize + "px";
      const xv = document.getElementById("overlayTextXVal");
      if (xv) xv.textContent = overlayText.x + "%";
      const yv = document.getElementById("overlayTextYVal");
      if (yv) yv.textContent = overlayText.y + "%";
      syncOverlayTextPreview();
    }

    // --- Overlay image ---
    if (row.overlay_image_enabled !== undefined) {
      overlayImage.enabled = !!row.overlay_image_enabled;
      overlayImage.publicURL = row.overlay_image_url || null;
      overlayImage.url = row.overlay_image_url || null;
      overlayImage.size = row.overlay_image_size ?? 20;
      overlayImage.opacity = row.overlay_image_opacity ?? 100;
      overlayImage.x = row.overlay_image_x ?? 50;
      overlayImage.y = row.overlay_image_y ?? 10;
      const f = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.value = val;
      };
      const fc = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.checked = val;
      };
      fc("overlayImageEnabled", overlayImage.enabled);
      f("overlayImageSize", overlayImage.size);
      f("overlayImageOpacity", overlayImage.opacity);
      f("overlayImageX", overlayImage.x);
      f("overlayImageY", overlayImage.y);
      const sv = document.getElementById("overlayImageSizeVal");
      if (sv) sv.textContent = overlayImage.size + "%";
      const ov = document.getElementById("overlayImageOpacityVal");
      if (ov) ov.textContent = overlayImage.opacity + "%";
      const xv = document.getElementById("overlayImageXVal");
      if (xv) xv.textContent = overlayImage.x + "%";
      const yv = document.getElementById("overlayImageYVal");
      if (yv) yv.textContent = overlayImage.y + "%";
      if (row.overlay_image_url) {
        const st = document.getElementById("overlayImgStatus");
        const nm = document.getElementById("overlayImgFileName");
        const pr = document.getElementById("overlayImagePreview");
        if (st) st.style.display = "block";
        if (nm) nm.textContent = "🖼 Saved overlay image loaded";
        if (pr) {
          pr.src = row.overlay_image_url;
          pr.style.display = "block";
        }
      }
      syncOverlayImagePreview();
    }

    // --- Intro popup ---
    if (row.intro_popup_enabled !== undefined) {
      introPopup.enabled = !!row.intro_popup_enabled;
      introPopup.title = row.intro_popup_title || "";
      introPopup.message = row.intro_popup_message || "";
      introPopup.btnLabel = row.intro_popup_btn_label || "";
      introPopup.accent = row.intro_popup_accent || "#00fff7";
      introPopup.imagePublicURL = row.intro_popup_image_url || null;
      introPopup.imageURL = row.intro_popup_image_url || null;
      const f = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.value = val;
      };
      const fc = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.checked = val;
      };
      fc("introPopupEnabled", introPopup.enabled);
      f("introPopupTitle", introPopup.title);
      f("introPopupMessage", introPopup.message);
      f("introPopupBtn", introPopup.btnLabel);
      f("introPopupAccent", introPopup.accent);
      if (row.intro_popup_image_url) {
        const st = document.getElementById("introImgStatus");
        const nm = document.getElementById("introImgFileName");
        if (st) st.style.display = "block";
        if (nm) nm.textContent = "🎨 Saved intro image loaded";
      }
      syncIntroPreview();
    }

    showPopup(`Project "${row.project_name || "Untitled"}" loaded ✓`);
  }

  // Sync all transform sliders from the transform object
  function _syncSliders() {
    const map = [
      ["scaleSlider", "scaleVal", "scale", false],
      ["posXSlider", "posXVal", "posX", false],
      ["posYSlider", "posYVal", "posY", false],
      ["posZSlider", "posZVal", "posZ", false],
      ["rotXSlider", "rotXVal", "rotX", true],
      ["rotYSlider", "rotYVal", "rotY", true],
      ["rotZSlider", "rotZVal", "rotZ", true],
    ];
    map.forEach(([sliderId, valId, key, isRot]) => {
      const s = document.getElementById(sliderId);
      const v = document.getElementById(valId);
      if (s) s.value = transform[key];
      if (v)
        v.textContent = isRot
          ? `${transform[key]}°`
          : transform[key].toFixed(2);
    });
    applyTransformToModel();
  }

  // Sync all UI previews (used for empty-slot reset)
  function _syncAllUI() {
    _syncSliders();
    syncCtaPreview();
    syncOverlayTextPreview();
    syncOverlayImagePreview();
    syncIntroPreview();
    [
      "modelStatus",
      "compileStatus",
      "musicStatus",
      "overlayImgStatus",
      "introImgStatus",
    ].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.style.display = "none";
    });
    const oiPreview = document.getElementById("overlayImagePreview");
    if (oiPreview) {
      oiPreview.src = "";
      oiPreview.style.display = "none";
    }
    // Reset mode buttons to image
    document
      .querySelectorAll(".mode-btn")
      .forEach((b) =>
        b.classList.toggle("mode-btn-active", b.dataset.mode === "image"),
      );
    const imageSection = document.getElementById("imageTrackerSection");
    if (imageSection) imageSection.style.display = "block";
  }

  // Expose so the slot bar can call it on slot activation
  window.__restoreProject = restoreProject;

  // -------------------------
  // BACKGROUND VIDEO PICKER
  // -------------------------
  let selectedBg = "background1.mp4"; // default

  document.querySelectorAll(".bg-pick-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      selectedBg = btn.dataset.src;
      document
        .querySelectorAll(".bg-pick-btn")
        .forEach((b) => b.classList.remove("bg-pick-active"));
      btn.classList.add("bg-pick-active");
      showPopup(
        `Background ${selectedBg.replace("background", "").replace(".mp4", "")} selected`,
      );

      // If preview is already running, swap the live background video
      const liveBg = document.getElementById("previewBgVideo");
      if (liveBg) {
        liveBg.src = selectedBg;
        liveBg.play().catch(() => {});
      }
    });
  });

  // ── RECORD BUTTON ──────────────────────────────────────────────────────
  // Captures everything the user sees: AR canvas + all HTML overlays
  // by compositing them onto a hidden canvas each frame via html2canvas.
  const recordBtn = document.getElementById("recordBtn");
  let _recorder = null;
  let _recChunks = [];

  if (recordBtn) {
    recordBtn.addEventListener("click", async () => {
      // ── STOP ────────────────────────────────────────────────────────────
      if (_recorder && _recorder.state === "recording") {
        _recorder.stop();
        return;
      }

      const arPanel = document.querySelector(".ar-panel");

      // ── FIND THE ACTIVE AR CANVAS ────────────────────────────────────────
      // Face tracker: #faceScene canvas (MindAR composites camera+model here)
      // Image tracker: #sceneWrapper canvas (A-Frame WebGL)
      // Model builder: #sceneWrapper3D canvas (Three.js)
      const arCanvas =
        document.querySelector("#faceScene canvas") ||
        document.querySelector("#sceneWrapper canvas") ||
        document.querySelector("#sceneWrapper3D canvas") ||
        arPanel?.querySelector("canvas");

      if (!arCanvas) {
        showPopup("Start the AR preview first, then record.");
        return;
      }

      try {
        _recChunks = [];

        const panelRect = arPanel.getBoundingClientRect();
        const W = Math.round(panelRect.width);
        const H = Math.round(panelRect.height);

        const compositeCanvas = document.createElement("canvas");
        compositeCanvas.width = W;
        compositeCanvas.height = H;
        const ctx = compositeCanvas.getContext("2d");

        let _rafId = null;

        function drawFrame() {
          ctx.clearRect(0, 0, W, H);

          // Layer 1: background video (model builder — #previewBgVideo)
          const bgVideo = document.getElementById("previewBgVideo");
          if (bgVideo && bgVideo.readyState >= 2) {
            ctx.drawImage(bgVideo, 0, 0, W, H);
          }

          // Layer 2: camera feed video (image tracking — MindAR injects a <video>
          // separate from the WebGL canvas; face tracking composites into canvas directly)
          if (!document.getElementById("faceScene")) {
            const camVideo = arPanel.querySelector(
              "video:not(#previewBgVideo)",
            );
            if (camVideo && camVideo.readyState >= 2) {
              ctx.drawImage(camVideo, 0, 0, W, H);
            }
          }

          // Layer 3: AR/WebGL canvas — model, face tracking, 3D scene
          if (arCanvas.width > 0 && arCanvas.height > 0) {
            try {
              ctx.drawImage(arCanvas, 0, 0, W, H);
            } catch (_) {}
          }

          // Layer 4: HTML overlays — CTA button, text overlay, image overlay
          arPanel
            .querySelectorAll(
              "a[id$='Overlay'], div[id$='Overlay'], img[id$='Overlay']",
            )
            .forEach((el) => {
              if (el.style.display === "none") return;
              const style = window.getComputedStyle(el);
              if (
                style.display === "none" ||
                style.visibility === "hidden" ||
                style.opacity === "0"
              )
                return;
              const elRect = el.getBoundingClientRect();
              if (elRect.width === 0 || elRect.height === 0) return;
              const x = elRect.left - panelRect.left;
              const y = elRect.top - panelRect.top;
              ctx.save();
              ctx.globalAlpha = parseFloat(style.opacity) || 1;
              const bgColor = style.backgroundColor;
              if (
                bgColor &&
                bgColor !== "rgba(0, 0, 0, 0)" &&
                bgColor !== "transparent"
              ) {
                ctx.fillStyle = bgColor;
                const r = parseFloat(style.borderRadius) || 0;
                if (r > 0 && ctx.roundRect) {
                  ctx.beginPath();
                  ctx.roundRect(x, y, elRect.width, elRect.height, r);
                  ctx.fill();
                } else {
                  ctx.fillRect(x, y, elRect.width, elRect.height);
                }
              }
              if (el.tagName === "IMG" && el.complete && el.naturalWidth > 0) {
                ctx.drawImage(el, x, y, elRect.width, elRect.height);
              }
              const text =
                el.childNodes.length === 1 && el.firstChild?.nodeType === 3
                  ? el.textContent.trim()
                  : "";
              if (text) {
                ctx.fillStyle = style.color || "#fff";
                ctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(text, x + elRect.width / 2, y + elRect.height / 2);
              }
              ctx.restore();
            });

          _rafId = requestAnimationFrame(drawFrame);
        }

        drawFrame();

        const compositeStream = compositeCanvas.captureStream(30);

        const mimeType =
          [
            "video/mp4;codecs=avc1",
            "video/mp4",
            "video/webm;codecs=vp9",
            "video/webm",
          ].find((t) => MediaRecorder.isTypeSupported(t)) || "video/webm";

        _recorder = new MediaRecorder(compositeStream, {
          mimeType,
          videoBitsPerSecond: 8_000_000,
        });

        _recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) _recChunks.push(e.data);
        };

        _recorder.onstop = () => {
          cancelAnimationFrame(_rafId);
          compositeStream.getTracks().forEach((t) => t.stop());
          recordBtn.textContent = "⏳ Saving…";
          const ismp4 = mimeType.startsWith("video/mp4");
          const ext = ismp4 ? "mp4" : "webm";
          const blob = new Blob(_recChunks, { type: mimeType });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `ar-preview-${Date.now()}.${ext}`;
          a.click();
          setTimeout(() => URL.revokeObjectURL(url), 10_000);
          showPopup(`✓ Saved as ${ext.toUpperCase()}!`);
          recordBtn.textContent = "⏺ Record";
          recordBtn.classList.remove("recording");
          _recorder = null;
        };

        _recorder.start(200);
        recordBtn.textContent = "⏹ Stop & Save";
        recordBtn.classList.add("recording");
        showPopup("Recording — click Stop & Save when done.");
      } catch (err) {
        console.error("Record error:", err);
        showPopup("Recording failed: " + err.message);
        recordBtn.textContent = "⏺ Record";
        recordBtn.classList.remove("recording");
        _recorder = null;
      }
    });
  }
  // ── END RECORD BUTTON ───────────────────────────────────────────────────

  // -------------------------
  // MODE TOGGLE
  // -------------------------
  document.querySelectorAll(".mode-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      arMode = btn.dataset.mode;
      document
        .querySelectorAll(".mode-btn")
        .forEach((b) => b.classList.remove("mode-btn-active"));
      btn.classList.add("mode-btn-active");

      const imageSection = document.getElementById("imageTrackerSection");
      const panelSub = document.getElementById("panelSub");

      if (arMode === "free") {
        imageSection && (imageSection.style.display = "none");
        if (panelSub)
          panelSub.textContent =
            "Upload a 3D model — no target image needed. The model will appear in front of the camera.";
      } else {
        imageSection && (imageSection.style.display = "");
        if (panelSub)
          panelSub.textContent =
            "Upload target images to compile, or drop in an existing .mind file";
      }
    });
  });

  // -------------------------
  // BACK BUTTON
  // -------------------------
  backBtn?.addEventListener("click", () => {
    destroyScene(() => {
      window.location.href = "index.html";
    });
  });

  // -------------------------
  // FILE UPLOADS
  // -------------------------
  uploadMind?.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    mindFile = file;
    if (mindURL) URL.revokeObjectURL(mindURL);
    mindURL = URL.createObjectURL(file);
    showPopup(".mind file ready ✓");
  });

  uploadModel?.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    modelFile = file;
    if (modelURL.startsWith("blob:")) URL.revokeObjectURL(modelURL);
    modelURL = URL.createObjectURL(file);
    window.__currentModelSrc = modelURL; // expose for face/model builder overrides
    showPopup("3D Model ready ✓");

    // Show the section in a "scanning" state while we read the file
    const animationSection = document.getElementById("animationSection");
    const animationSelect = document.getElementById("animationSelect");
    const animationCount = document.getElementById("animationCount");
    const animationNoClips = document.getElementById("animationNoClips");

    if (animationSection) {
      animationSection.style.display = "block";
      if (animationSelect) animationSelect.style.display = "none";
      if (animationNoClips) animationNoClips.style.display = "none";
      if (animationCount)
        animationCount.textContent = "Scanning for animations…";
    }

    const animations = await extractAnimationsFromGLB(file);
    renderAnimationPicker(animations);

    if (animations.length > 0) {
      showPopup(
        `Found ${animations.length} animation${animations.length !== 1 ? "s" : ""} ✓`,
      );
    } else {
      showPopup("Model loaded — no animations found");
    }
  });

  // -------------------------

  // -------------------------
  // SKETCHFAB — direct redirect
  // -------------------------
  document.getElementById("sketchfabBtn")?.addEventListener("click", () => {
    window.open(
      "https://sketchfab.com/search?type=models&features=downloadable",
      "_blank",
    );
  });

  // -------------------------
  // START AR
  // -------------------------
  startARBtn?.addEventListener("click", () => {
    if (arMode === "free") {
      destroyScene(() => {
        scanUI.style.display = "none";
        injectFreeScene(modelURL);
        showPopup("Starting camera...");
      });
      return;
    }

    if (!mindURL) {
      showPopup("Upload a .mind file first");
      return;
    }

    destroyScene(() => {
      scanUI.style.display = "none";
      injectScene(mindURL, modelURL);
      showPopup("Starting camera...");
    });
  });

  // -------------------------
  // SAVE PROJECT
  // -------------------------
  saveBtn?.addEventListener("click", async () => {
    if (arMode === "image" && !mindFile && !mindURL) {
      showPopup("Upload or compile a .mind file first");
      return;
    }
    if (arMode === "face" && !modelURL && !modelFile) {
      showPopup("Upload a 3D model (.glb) first");
      return;
    }

    // ---- Require login before saving ----
    // Use userId from slot system if available, else fall back to a fresh session check
    let userId =
      typeof window.__getUserId === "function" ? window.__getUserId() : null;
    if (!userId) {
      const {
        data: { session },
      } = await sb.auth.getSession();
      if (!session) {
        showPopup("Please log in to save your project");
        return;
      }
      userId = session.user.id;
    }

    // Single project per builder type — always slot 1
    const activeSlot = 1;

    // Read the editable project name (fallback to default if blank)
    const projectName =
      document.getElementById("projectNameInput")?.value.trim() ||
      "Image Tracker";

    saveBtn.disabled = true;
    saveBtn.textContent = "Uploading...";

    try {
      const timestamp = Date.now();

      let mindPublicURL = null;

      if (arMode === "image") {
        const fileName = `projects/${userId}/${timestamp}/targets.mind`;

        const fileToUpload = mindFile
          ? mindFile
          : await fetch(mindURL)
              .then((r) => r.blob())
              .then(
                (b) =>
                  new File([b], "targets.mind", {
                    type: "application/octet-stream",
                  }),
              );

        const { error: uploadError } = await sb.storage
          .from("ar-projects")
          .upload(fileName, fileToUpload, {
            upsert: true,
            contentType: "application/octet-stream",
          });

        if (uploadError) throw new Error(uploadError.message);

        const { data: urlData } = sb.storage
          .from("ar-projects")
          .getPublicUrl(fileName);
        mindPublicURL = urlData.publicUrl;
      }

      let finalModelURL = modelURL;
      if (modelFile && modelURL.startsWith("blob:")) {
        saveBtn.textContent = "Uploading model...";
        const glbFileName = `projects/${userId}/${timestamp}/model.glb`;
        const { error: glbError } = await sb.storage
          .from("ar-projects")
          .upload(glbFileName, modelFile, {
            upsert: true,
            contentType: "model/gltf-binary",
          });
        if (glbError)
          throw new Error("Model upload failed: " + glbError.message);
        const { data: glbUrlData } = sb.storage
          .from("ar-projects")
          .getPublicUrl(glbFileName);
        finalModelURL = glbUrlData.publicUrl;
      }

      // Upload background music if provided
      let finalMusicURL = null;
      if (music.enabled && music.file) {
        saveBtn.textContent = "Uploading audio...";
        const ext = music.file.name.split(".").pop() || "mp3";
        const audioFileName = `projects/${userId}/${timestamp}/music.${ext}`;
        const { error: audioError } = await sb.storage
          .from("ar-projects")
          .upload(audioFileName, music.file, {
            upsert: true,
            contentType: music.file.type || "audio/mpeg",
          });
        if (audioError)
          throw new Error("Audio upload failed: " + audioError.message);
        const { data: audioUrlData } = sb.storage
          .from("ar-projects")
          .getPublicUrl(audioFileName);
        finalMusicURL = audioUrlData.publicUrl;
      }

      // Upload overlay image if provided
      let finalOverlayImgURL = null;
      if (overlayImage.enabled && overlayImage.file) {
        saveBtn.textContent = "Uploading overlay image...";
        const ext = overlayImage.file.name.split(".").pop() || "png";
        const fileName = `projects/${userId}/${timestamp}/overlay.${ext}`;
        const { error: oiErr } = await sb.storage
          .from("ar-projects")
          .upload(fileName, overlayImage.file, {
            upsert: true,
            contentType: overlayImage.file.type,
          });
        if (oiErr)
          throw new Error("Overlay image upload failed: " + oiErr.message);
        const { data: oiData } = sb.storage
          .from("ar-projects")
          .getPublicUrl(fileName);
        finalOverlayImgURL = oiData.publicUrl;
      }

      // Upload intro popup image if provided
      let finalIntroImgURL = null;
      if (introPopup.enabled && introPopup.imageFile) {
        saveBtn.textContent = "Uploading intro image...";
        const ext = introPopup.imageFile.name.split(".").pop() || "png";
        const fileName = `projects/${userId}/${timestamp}/intro.${ext}`;
        const { error: iiErr } = await sb.storage
          .from("ar-projects")
          .upload(fileName, introPopup.imageFile, {
            upsert: true,
            contentType: introPopup.imageFile.type,
          });
        if (iiErr)
          throw new Error("Intro image upload failed: " + iiErr.message);
        const { data: iiData } = sb.storage
          .from("ar-projects")
          .getPublicUrl(fileName);
        finalIntroImgURL = iiData.publicUrl;
      }

      const base = window.location.href.replace(/\/[^/]*$/, "/");
      // No expires for saved projects — only test previews use the 30-min expiry
      const params = new URLSearchParams({
        mode: arMode,
        model: finalModelURL,
        scale: transform.scale,
        posX: transform.posX,
        posY: transform.posY,
        posZ: transform.posZ,
        rotX: transform.rotX,
        rotY: transform.rotY,
        rotZ: transform.rotZ,
      });

      // Pass selected background video (model builder only)
      const activeBg = window.__selectedBg;
      if (activeBg) params.set("bg", activeBg);

      if (arMode === "image" && mindPublicURL) {
        params.set("mind", mindPublicURL);
      }

      // Include selected animation clip if one is chosen (or explicitly disabled)
      if (selectedAnimation) {
        params.set("clip", selectedAnimation);
      }

      // Include CTA button params if enabled
      if (cta.enabled && cta.url) {
        params.set("ctaEnabled", "1");
        params.set("ctaLabel", cta.label || "Shop Now");
        params.set("ctaURL", cta.url);
        params.set("ctaBg", cta.bgColor);
        params.set("ctaText", cta.textColor);
        params.set("ctaRadius", cta.radius);
        params.set("ctaFont", cta.fontSize);
      }

      // Include background music params if enabled and uploaded
      if (music.enabled && finalMusicURL) {
        params.set("music", finalMusicURL);
        params.set("musicVol", Math.round(music.volume * 100));
        params.set("musicLoop", music.loop ? "1" : "0");
      }

      // Include overlay text params
      if (overlayText.enabled && overlayText.content.trim()) {
        params.set("otEnabled", "1");
        params.set("otContent", overlayText.content);
        params.set("otSize", overlayText.fontSize);
        params.set("otColor", overlayText.color);
        params.set("otBg", overlayText.bgColor);
        params.set("otBgOp", overlayText.bgOpacity);
        params.set("otX", overlayText.x);
        params.set("otY", overlayText.y);
      }

      // Include overlay image params
      if (overlayImage.enabled && finalOverlayImgURL) {
        params.set("oiEnabled", "1");
        params.set("oiSrc", finalOverlayImgURL);
        params.set("oiSize", overlayImage.size);
        params.set("oiOpacity", overlayImage.opacity);
        params.set("oiX", overlayImage.x);
        params.set("oiY", overlayImage.y);
      }

      // Include intro popup params
      if (introPopup.enabled) {
        params.set("ipEnabled", "1");
        params.set("ipTitle", introPopup.title || "Welcome!");
        params.set(
          "ipMsg",
          introPopup.message ||
            "Point your camera at the target image to begin…",
        );
        params.set("ipBtn", introPopup.btnLabel || "Let's Go!");
        params.set("ipAccent", introPopup.accent);
        if (finalIntroImgURL) params.set("ipImg", finalIntroImgURL);
      }

      const viewerURL = `${base}viewer.html?${params.toString()}`;

      // ---- Save project record to DB (upsert into active slot) ----
      const { data: savedRows, error: dbError } = await sb
        .from("ar_projects")
        .upsert(
          {
            user_id: userId,
            builder_type: window.__builderMode || "image",
            slot_number: activeSlot,
            project_name: projectName,
            viewer_url: viewerURL,
            mind_url: mindPublicURL,
            model_url: finalModelURL,
            mode: arMode,
            created_at: new Date().toISOString(),

            // Transform
            transform_scale: transform.scale,
            transform_pos_x: transform.posX,
            transform_pos_y: transform.posY,
            transform_pos_z: transform.posZ,
            transform_rot_x: transform.rotX,
            transform_rot_y: transform.rotY,
            transform_rot_z: transform.rotZ,

            // Animation
            animation_clip: selectedAnimation || null,

            // CTA button
            cta_enabled: cta.enabled && !!cta.url,
            cta_label: cta.label || null,
            cta_url: cta.url || null,
            cta_bg_color: cta.bgColor || null,
            cta_text_color: cta.textColor || null,
            cta_radius: cta.radius,
            cta_font_size: cta.fontSize,

            // Background music
            music_enabled: music.enabled && !!finalMusicURL,
            music_url: finalMusicURL || null,
            music_volume: Math.round(music.volume * 100),
            music_loop: music.loop,

            // Overlay text
            overlay_text_enabled:
              overlayText.enabled && !!overlayText.content.trim(),
            overlay_text_content: overlayText.content || null,
            overlay_text_size: overlayText.fontSize,
            overlay_text_color: overlayText.color || null,
            overlay_text_bg_color: overlayText.bgColor || null,
            overlay_text_bg_opacity: overlayText.bgOpacity,
            overlay_text_x: overlayText.x,
            overlay_text_y: overlayText.y,

            // Overlay image
            overlay_image_enabled: overlayImage.enabled && !!finalOverlayImgURL,
            overlay_image_url: finalOverlayImgURL || null,
            overlay_image_size: overlayImage.size,
            overlay_image_opacity: overlayImage.opacity,
            overlay_image_x: overlayImage.x,
            overlay_image_y: overlayImage.y,

            // Intro popup
            intro_popup_enabled: introPopup.enabled,
            intro_popup_title: introPopup.title || null,
            intro_popup_message: introPopup.message || null,
            intro_popup_btn_label: introPopup.btnLabel || null,
            intro_popup_accent: introPopup.accent || null,
            intro_popup_image_url: finalIntroImgURL || null,
          },
          {
            onConflict: "user_id,builder_type",
          },
        )
        .select("*")
        .maybeSingle();

      if (dbError) {
        // Non-fatal: files already uploaded, save still worked.
        console.error("DB save error:", dbError.message);
        showPopup(
          "\u26a0 Project saved but DB record failed: " + dbError.message,
        );
      } else if (savedRows) {
        // Notify slot bar so it refreshes the card
        if (typeof window.__onProjectSaved === "function") {
          window.__onProjectSaved(savedRows);
        }
      }

      // Re-fetch the full row — upsert on conflict may return null for savedRows,
      // so this is the reliable way to get the project id for the short QR URL.
      let qrURL = viewerURL; // fallback if fetch fails
      try {
        const cacheKey = "ar_project_" + (window.__builderMode || "image");
        const { data: freshRow } = await sb
          .from("ar_projects")
          .select("*")
          .eq("user_id", userId)
          .eq("builder_type", window.__builderMode || "image")
          .eq("slot_number", 1)
          .maybeSingle();
        if (freshRow) {
          localStorage.setItem(cacheKey, JSON.stringify(freshRow));
          if (freshRow.id) {
            qrURL = `${base}viewer.html?id=${freshRow.id}`;
          }
          if (typeof window.__onProjectSaved === "function") {
            window.__onProjectSaved(freshRow);
          }
        }
      } catch (_) {}

      console.log("[QR] qrURL length:", qrURL.length, "qrURL:", qrURL);
      showSaveSuccessModal(qrURL, viewerURL);
    } catch (err) {
      console.error("Save error:", err);
      showPopup("Save failed: " + err.message);
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = "Save";
    }
  });

  // -------------------------
  // INJECT FREE-VIEW SCENE (no image tracking)
  // -------------------------
  function injectFreeScene(glbURL) {
    destroying = false;

    const s = transform.scale;
    const posStr = `${transform.posX} ${transform.posY} ${transform.posZ}`;
    const rotStr = `${transform.rotX} ${transform.rotY} ${transform.rotZ}`;
    const scaleStr = `${s} ${s} ${s}`;

    const mixerAttr = selectedAnimation
      ? `clip: ${selectedAnimation}; loop: repeat; crossFadeDuration: 0.3`
      : `loop: repeat; crossFadeDuration: 0.3`;

    const arPanel = document.querySelector(".ar-panel");

    const wrapper = document.createElement("div");
    wrapper.id = "sceneWrapper";
    wrapper.style.cssText = `
      position: absolute;
      top: 0; left: 0;
      width: 100%;
      height: 100%;
      z-index: 5;
      background: #000;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    wrapper.innerHTML = `
      <video
        id="previewBgVideo"
        src="${selectedBg}"
        autoplay
        loop
        muted
        playsinline
        style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0;pointer-events:none;"
      ></video>

      <a-scene
        id="scene"
        vr-mode-ui="enabled: false"
        device-orientation-permission-ui="enabled: false"
        renderer="colorManagement: true; alpha: true;"
        webgl-renderer="antialias: true; preserveDrawingBuffer: true;"
        embedded
      >
        <a-assets timeout="30000">
          <a-asset-item id="modelAsset" src="${glbURL}" response-type="arraybuffer"></a-asset-item>
        </a-assets>

        <a-camera look-controls="enabled: false" position="0 0 0.5"></a-camera>

        <a-gltf-model
          id="model"
          src="#modelAsset"
          position="${posStr}"
          scale="${scaleStr}"
          rotation="${rotStr}"
          animation-mixer="${mixerAttr}"
        ></a-gltf-model>
      </a-scene>

      <div id="arTransformOverlay" style="
        position: absolute;
        bottom: 12px; left: 12px;
        z-index: 10;
        background: rgba(0,0,0,0.75);
        border: 1px solid rgba(255,255,255,0.15);
        border-radius: 10px;
        padding: 10px 14px;
        font-family: 'Orbitron', sans-serif;
        font-size: 10px;
        color: rgba(255,255,255,0.6);
        line-height: 1.8;
        backdrop-filter: blur(8px);
        pointer-events: none;
      ">
        <div style="color:#ff4df0; margin-bottom:4px; letter-spacing:1px;">🌀 FREE VIEW</div>
        <div>Scale &nbsp;<span id="arScaleDisplay" style="color:#ffc800">${s.toFixed(2)}</span></div>
        <div>Pos &nbsp;&nbsp;<span id="arPosDisplay" style="color:#fff">${posStr}</span></div>
        <div>Rot &nbsp;&nbsp;<span id="arRotDisplay" style="color:#fff">${rotStr}</span></div>
        <div>Anim &nbsp;<span id="arAnimDisplay" style="color:#ff4df0">${selectedAnimation || "auto"}</span></div>
      </div>

      <button id="closeARBtn" style="
        position: absolute;
        top: 12px; right: 12px;
        z-index: 10;
        background: rgba(0,0,0,0.7);
        color: white;
        border: 2px solid rgba(255,255,255,0.6);
        border-radius: 8px;
        padding: 8px 16px;
        font-family: 'Orbitron', sans-serif;
        font-size: 12px;
        cursor: pointer;
      ">✕ Stop AR</button>
    `;

    arPanel.appendChild(wrapper);

    wrapper
      .querySelector("#closeARBtn")
      .addEventListener("click", () => destroyScene());

    const scene = wrapper.querySelector("#scene");
    scene.addEventListener("loaded", () => {
      if (destroying) return;
      showPopup("3D Viewer live 🌀");
      hookSlidersToAROverlay();
    });

    const timeout = setTimeout(() => {
      if (destroying) return;
      showPopup("Camera taking long... check browser permissions");
    }, 10000);

    scene.addEventListener("loaded", () => clearTimeout(timeout), {
      once: true,
    });
  }

  // -------------------------
  // INJECT SCENE
  // -------------------------
  function injectScene(targetURL, glbURL) {
    destroying = false;

    const s = transform.scale;
    const posStr = `${transform.posX} ${transform.posY} ${transform.posZ}`;
    const rotStr = `${transform.rotX} ${transform.rotY} ${transform.rotZ}`;
    const scaleStr = `${s} ${s} ${s}`;

    // Build animation-mixer attribute
    const mixerAttr = selectedAnimation
      ? `clip: ${selectedAnimation}; loop: repeat; crossFadeDuration: 0.3`
      : `loop: repeat; crossFadeDuration: 0.3`;

    const arPanel = document.querySelector(".ar-panel");

    const wrapper = document.createElement("div");
    wrapper.id = "sceneWrapper";
    wrapper.style.cssText = `
      position: absolute;
      top: 0; left: 0;
      width: 100%;
      height: 100%;
      z-index: 5;
      background: #000;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    wrapper.innerHTML = `
      <a-scene
        id="scene"
        mindar-image="imageTargetSrc: ${targetURL}; uiScanning: no;"
        vr-mode-ui="enabled: false"
        device-orientation-permission-ui="enabled: false"
        renderer="colorManagement: true; alpha: true;"
        webgl-renderer="antialias: true; preserveDrawingBuffer: true;"
        embedded
      >
        <a-assets timeout="30000">
          <a-asset-item id="modelAsset" src="${glbURL}" response-type="arraybuffer"></a-asset-item>
        </a-assets>

        <a-camera look-controls="enabled: false" position="0 0 0"></a-camera>

        <a-entity mindar-image-target="targetIndex: 0">
          <a-gltf-model
            id="model"
            src="#modelAsset"
            position="${posStr}"
            scale="${scaleStr}"
            rotation="${rotStr}"
            animation-mixer="${mixerAttr}"
          ></a-gltf-model>
        </a-entity>
      </a-scene>

      <div id="arScanOverlay" style="
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        pointer-events: none;
        z-index: 8;
      ">
        <div style="
          width: 180px;
          height: 180px;
          border: 2px solid rgba(0,255,247,0.6);
          border-radius: 12px;
          box-shadow: 0 0 0 9999px rgba(0,0,0,0.45);
          position: relative;
        ">
          <span style="position:absolute;top:-2px;left:-2px;width:20px;height:20px;border-top:3px solid #00fff7;border-left:3px solid #00fff7;border-radius:4px 0 0 0;"></span>
          <span style="position:absolute;top:-2px;right:-2px;width:20px;height:20px;border-top:3px solid #00fff7;border-right:3px solid #00fff7;border-radius:0 4px 0 0;"></span>
          <span style="position:absolute;bottom:-2px;left:-2px;width:20px;height:20px;border-bottom:3px solid #00fff7;border-left:3px solid #00fff7;border-radius:0 0 0 4px;"></span>
          <span style="position:absolute;bottom:-2px;right:-2px;width:20px;height:20px;border-bottom:3px solid #00fff7;border-right:3px solid #00fff7;border-radius:0 0 4px 0;"></span>
          <div id="arScanLine" style="
            position:absolute;
            top:0; left:0; right:0;
            height:2px;
            background:linear-gradient(90deg,transparent,#00fff7,transparent);
            animation: scanLine 1.8s ease-in-out infinite;
          "></div>
        </div>
        <p style="margin-top:18px;font-family:'Orbitron',sans-serif;font-size:11px;color:rgba(255,255,255,0.7);letter-spacing:2px;">POINT AT TARGET IMAGE</p>
      </div>

      <style>
        @keyframes scanLine {
          0%   { top: 0; }
          50%  { top: calc(100% - 2px); }
          100% { top: 0; }
        }
      </style>

      <div id="arTransformOverlay" style="
        position: absolute;
        bottom: 12px; left: 12px;
        z-index: 10;
        background: rgba(0,0,0,0.75);
        border: 1px solid rgba(255,255,255,0.15);
        border-radius: 10px;
        padding: 10px 14px;
        font-family: 'Orbitron', sans-serif;
        font-size: 10px;
        color: rgba(255,255,255,0.6);
        line-height: 1.8;
        backdrop-filter: blur(8px);
        pointer-events: none;
      ">
        <div style="color:#00fff7; margin-bottom:4px; letter-spacing:1px;">LIVE TRANSFORM</div>
        <div>Scale &nbsp;<span id="arScaleDisplay" style="color:#ffc800">${s.toFixed(2)}</span></div>
        <div>Pos &nbsp;&nbsp;<span id="arPosDisplay" style="color:#fff">${posStr}</span></div>
        <div>Rot &nbsp;&nbsp;<span id="arRotDisplay" style="color:#fff">${rotStr}</span></div>
        <div>Anim &nbsp;<span id="arAnimDisplay" style="color:#ff4df0">${selectedAnimation || "auto"}</span></div>
      </div>

      <button id="closeARBtn" style="
        position: absolute;
        top: 12px; right: 12px;
        z-index: 10;
        background: rgba(0,0,0,0.7);
        color: white;
        border: 2px solid rgba(255,255,255,0.6);
        border-radius: 8px;
        padding: 8px 16px;
        font-family: 'Orbitron', sans-serif;
        font-size: 12px;
        cursor: pointer;
      ">✕ Stop AR</button>
    `;

    arPanel.appendChild(wrapper);

    const scene = wrapper.querySelector("#scene");
    wrapper
      .querySelector("#closeARBtn")
      .addEventListener("click", () => destroyScene());

    scene.addEventListener("arReady", () => {
      if (destroying) return;
      showPopup("Camera live — point at your target image 🎯");
      hookSlidersToAROverlay();
    });

    scene.addEventListener("targetFound", () => {
      const overlay = document.getElementById("arScanOverlay");
      if (overlay) overlay.style.display = "none";
    });

    scene.addEventListener("targetLost", () => {
      const overlay = document.getElementById("arScanOverlay");
      if (overlay) overlay.style.display = "flex";
    });

    const timeout = setTimeout(() => {
      if (destroying) return;
      showPopup("Camera taking long... check browser permissions");
    }, 10000);

    scene.addEventListener("arReady", () => clearTimeout(timeout), {
      once: true,
    });

    scene.addEventListener("arError", (e) => {
      clearTimeout(timeout);
      console.error("MindAR error:", e);
      showPopup("AR Error — check your .mind file and try again");
      destroyScene();
    });
  }

  function hookSlidersToAROverlay() {
    [
      "scaleSlider",
      "posXSlider",
      "posYSlider",
      "posZSlider",
      "rotXSlider",
      "rotYSlider",
      "rotZSlider",
    ].forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener("input", refreshAROverlay);
    });
  }

  function refreshAROverlay() {
    const s = transform.scale;
    const posStr = `${transform.posX.toFixed(2)} ${transform.posY.toFixed(2)} ${transform.posZ.toFixed(2)}`;
    const rotStr = `${transform.rotX} ${transform.rotY} ${transform.rotZ}`;

    const sd = document.getElementById("arScaleDisplay");
    const pd = document.getElementById("arPosDisplay");
    const rd = document.getElementById("arRotDisplay");
    if (sd) sd.textContent = s.toFixed(2);
    if (pd) pd.textContent = posStr;
    if (rd) rd.textContent = rotStr;
  }

  // -------------------------
  // DESTROY SCENE
  // -------------------------
  function destroyScene(callback) {
    const wrapper = document.getElementById("sceneWrapper");

    if (!wrapper) {
      callback?.();
      return;
    }

    if (destroying) return;
    destroying = true;

    const scene = wrapper.querySelector("a-scene");

    function removeDom() {
      try {
        wrapper.remove();
      } catch (_) {}
      scanUI.style.display = "flex";
      destroying = false;
      callback?.();
    }

    if (!scene) {
      removeDom();
      return;
    }

    const mindSystem =
      scene.systems?.["mindar-image-system"] || scene.systems?.["mindar-image"];

    if (mindSystem) {
      try {
        mindSystem.stop();
        mindSystem.unpause?.();
      } catch (_) {}
    }

    if (navigator.mediaDevices) {
      navigator.mediaDevices.enumerateDevices().catch(() => {});
    }

    wrapper.querySelectorAll("video").forEach((v) => {
      try {
        const stream = v.srcObject;
        if (stream) {
          stream.getTracks().forEach((t) => t.stop());
          v.srcObject = null;
        }
      } catch (_) {}
    });

    setTimeout(removeDom, 100);
  }
});
