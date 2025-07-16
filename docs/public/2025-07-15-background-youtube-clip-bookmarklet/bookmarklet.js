javascript:(function () {
  /* ==== Configuration ==== */
  const PREFIX = "ytbm-";
  const ROOT_ID = PREFIX + "root";
  const STYLE_ID = PREFIX + "style";
  const STORAGE_OPACITY = PREFIX + "opacity";
  const STORAGE_CLIP = PREFIX + "clip";
  const PLAYLIST = [
    { id: "arYYwyD-tjw", title: "Powermetal Kiuas - Warrior Soul" },
    { id: "EOXA-VFo3mQ", title: "Keldian - Life and Death Under Strange New Suns" },
    { id: "OLoqIdCMZCE", title: "THE 69 EYES - 27 & Done" },
    { id: "ScMzIvxBSi4", title: "Lo-fi Chill Beats" },
    { id: "tAGnKpE4NCI", title: "Smells Like Teen Spirit" },
    { id: "dQw4w9WgXcQ", title: "Never Gonna Give You Up" }
  ];

  /* ==== Cleanup if already injected ==== */
  const oldRoot = document.getElementById(ROOT_ID);
  if (oldRoot) oldRoot.remove();
  const oldStyle = document.getElementById(STYLE_ID);
  if (oldStyle) oldStyle.remove();
  if (window[PREFIX + "destroy"]) {
    window[PREFIX + "destroy"]();
    delete window[PREFIX + "destroy"];
  }

  /* ==== CSS ==== */
  const css = `
/* Root */
#${ROOT_ID}{
  position:fixed;
  inset:0;
  z-index:2147483647;
  pointer-events:none;
}

/* Iframe */
#${ROOT_ID} iframe{
  width:100vw;
  height:100vh;
  border:0;
  pointer-events:none;
  opacity:0.8;
  transition:opacity 0.2s linear;
}

/* Control panel */
.${PREFIX}panel{
  position:fixed;
  top:20px;
  right:20px;
  width:240px;
  background:rgba(0,0,0,0.6);
  color:#fff;
  font-family:sans-serif;
  padding:8px;
  border-radius:12px;
  pointer-events:auto;
  user-select:none;
  cursor:move;
  z-index:2147483648;
}
.${PREFIX}panel *{
  pointer-events:auto;
  cursor:auto;
}
.${PREFIX}row{
  margin-bottom:8px;
  display:flex;
  align-items:center;
  gap:6px;
}
.${PREFIX}row:last-child{
  margin-bottom:0;
}
.${PREFIX}panel button,
.${PREFIX}panel select,
.${PREFIX}panel input[type="range"]{
  flex:1 1 auto;
  background:#222;
  color:#fff;
  border:1px solid #555;
  border-radius:6px;
  padding:4px;
  font-size:12px;
}
.${PREFIX}panel button{
  flex:0 0 auto;
}
`;
  const styleEl = document.createElement("style");
  styleEl.id = STYLE_ID;
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  /* ==== DOM ==== */
  const root = document.createElement("div");
  root.id = ROOT_ID;
  document.body.appendChild(root);

  const iframe = document.createElement("iframe");
  /* Allow autoplay with sound where the browser permits */
  iframe.allow = "autoplay; fullscreen";
  root.appendChild(iframe);

  const panel = document.createElement("div");
  panel.className = PREFIX + "panel";
  panel.innerHTML = `
    <div class="${PREFIX}row" style="cursor:move;font-weight:bold;">YT Background</div>
    <div class="${PREFIX}row">
      <label style="flex:0 0 60px;">Opacity</label>
      <input type="range" min="10" max="100" step="1">
    </div>
    <div class="${PREFIX}row">
      <button data-cmd="play">Pause</button>
      <button data-cmd="mute">Mute</button>
      <button data-cmd="close" style="background:#900;">✕</button>
    </div>
    <div class="${PREFIX}row">
      <select></select>
    </div>
    <div class="${PREFIX}row">
      <label style="flex:0 0 60px;">Volume</label>
      <input type="range" min="0" max="100" step="1" value="50">
    </div>
  `;
  document.body.appendChild(panel);

  /* ==== Utils ==== */
  function buildSrc(id) {
    return `https://www.youtube.com/embed/${id}?autoplay=1&controls=0&loop=1&mute=0&playlist=${id}&enablejsapi=1`;
  }

  function save(key, value) {
    try { sessionStorage.setItem(key, value); } catch (e) { /* noop */ }
  }

  function load(key, fallback) {
    try { return sessionStorage.getItem(key) || fallback; } catch (e) { return fallback; }
  }

  /* ==== Populate selector ==== */
  const selector = panel.querySelector("select");
  PLAYLIST.forEach((clip, idx) => {
    const opt = document.createElement("option");
    opt.value = idx;
    opt.textContent = clip.title;
    selector.appendChild(opt);
  });

  /* ==== State ==== */
  let currentIndex = parseInt(load(STORAGE_CLIP, "0"), 10);
  if (isNaN(currentIndex) || currentIndex < 0 || currentIndex >= PLAYLIST.length) currentIndex = 0;
  selector.value = String(currentIndex);
  let playerReady = false;
  let player;
  /* Browser policies may initially pause autoplay with sound; detect and resume on user interaction */
  let awaitingGesture = false;

  /* ==== Iframe & YouTube API ==== */
  function loadVideo(index) {
    const clip = PLAYLIST[index];
    iframe.src = buildSrc(clip.id);
  }

  function ensureAPI(callback) {
    if (window.YT && window.YT.Player) { callback(); return; }
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
    window.onYouTubeIframeAPIReady = function () {
      delete window.onYouTubeIframeAPIReady;
      callback();
    };
  }

  function initPlayer() {
    ensureAPI(function () {
      player = new YT.Player(iframe, {
        events: {
          onReady: function () {
            playerReady = true;
            player.setVolume(parseInt(volumeRange.value, 10));
          },
          onStateChange: function (e) {
            /* If autoplay with sound was blocked, wait for gesture then play */
            if (e.data === YT.PlayerState.UNSTARTED) {
              awaitingGesture = true;
              btnPlay.textContent = "Play";
            }
          }
        }
      });
    });
  }

  /* ==== Controls ==== */
  const opacityRange = panel.querySelector('input[type="range"]');
  const volumeRange = panel.querySelectorAll('input[type="range"]')[1];
  const btnPlay = panel.querySelector('button[data-cmd="play"]');
  const btnMute = panel.querySelector('button[data-cmd="mute"]');
  const btnClose = panel.querySelector('button[data-cmd="close"]');

  /* Load persisted opacity */
  const startOpacity = load(STORAGE_OPACITY, "80");
  iframe.style.opacity = (parseInt(startOpacity, 10) / 100).toString();
  opacityRange.value = startOpacity;

  opacityRange.addEventListener("input", function () {
    const val = parseInt(this.value, 10);
    iframe.style.opacity = (val / 100).toString();
    save(STORAGE_OPACITY, this.value);
  });

  volumeRange.addEventListener("input", function () {
    if (playerReady) { player.setVolume(parseInt(this.value, 10)); }
  });

  btnPlay.addEventListener("click", function () {
    if (!playerReady) { return; }
    if (awaitingGesture) {
      player.playVideo();
      awaitingGesture = false;
      this.textContent = "Pause";
      return;
    }
    const state = player.getPlayerState();
    if (state === YT.PlayerState.PLAYING) {
      player.pauseVideo();
      this.textContent = "Play";
    } else {
      player.playVideo();
      this.textContent = "Pause";
    }
  });

  btnMute.addEventListener("click", function () {
    if (!playerReady) { return; }
    if (player.isMuted()) {
      player.unMute();
      this.textContent = "Mute";
    } else {
      player.mute();
      this.textContent = "Unmute";
    }
  });

  btnClose.addEventListener("click", function () {
    root.remove();
    panel.remove();
    styleEl.remove();
    if (player && player.destroy) { player.destroy(); }
    delete window[PREFIX + "destroy"];
  });

  selector.addEventListener("change", function () {
    currentIndex = parseInt(this.value, 10);
    save(STORAGE_CLIP, String(currentIndex));
    btnPlay.textContent = "Pause";
    awaitingGesture = false;
    loadVideo(currentIndex);
  });

  /* ==== Drag logic ==== */
  (function enableDrag() {
    let startX, startY, startLeft, startTop, dragging = false;
    const handle = panel.firstElementChild;
    handle.addEventListener("mousedown", function (e) {
      e.preventDefault();
      dragging = true;
      startX = e.clientX;
      startY = e.clientY;
      const rect = panel.getBoundingClientRect();
      startLeft = rect.left;
      startTop = rect.top;
      document.addEventListener("mousemove", move);
      document.addEventListener("mouseup", up);
    });
    function move(e) {
      if (!dragging) { return; }
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      panel.style.left = (startLeft + dx) + "px";
      panel.style.top = (startTop + dy) + "px";
      panel.style.right = "auto";
      panel.style.bottom = "auto";
    }
    function up() {
      dragging = false;
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseup", up);
    }
  })();

  /* ==== Persist destroy for repeat runs ==== */
  window[PREFIX + "destroy"] = function () {
    root.remove();
    panel.remove();
    styleEl.remove();
    if (player && player.destroy) { player.destroy(); }
  };

  /* ==== Start ==== */
  loadVideo(currentIndex);
  initPlayer();
})();



