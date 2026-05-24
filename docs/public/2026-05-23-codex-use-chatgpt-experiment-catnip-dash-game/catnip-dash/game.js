(() => {
  "use strict";

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");

  const W = 960;
  const H = 540;
  const GROUND_Y = 426;
  const CAT_X = 150;
  const CAT_SIZE = 96;

  const GRAVITY = 2200;
  const JUMP_VELOCITY = -820;
  const MAX_FALL = 1300;
  const COYOTE_TIME = 0.075;
  const JUMP_BUFFER = 0.1;
  const LAND_TIME = 0.1;
  const START_SPEED = 280;
  const MAX_SPEED = 620;
  const SPEED_RAMP = 9;
  const PAUSE_BUTTON = { x: 806, y: 52, w: 130, h: 38 };

  const State = Object.freeze({
    READY: "ready",
    PLAYING: "playing",
    PAUSED: "paused",
    GAME_OVER: "gameOver",
  });

  const assets = {
    cat: loadImage("assets/cat-atlas.png"),
    obstacles: loadImage("assets/obstacles-atlas.svg"),
    environment: loadImage("assets/environment-atlas.svg"),
  };

  const catFrames = {
    idle_0: frame(0, 0, 96),
    idle_1: frame(1, 0, 96),
    run_0: frame(2, 0, 96),
    run_1: frame(3, 0, 96),
    run_2: frame(0, 1, 96),
    run_3: frame(1, 1, 96),
    jump: frame(2, 1, 96),
    fall: frame(3, 1, 96),
    land_0: frame(0, 2, 96),
    land_1: frame(1, 2, 96),
    hit: frame(2, 2, 96),
  };

  const obstacleTypes = [
    obstacle("flower_pot", 0, 48, 58, 34, 46, 30),
    obstacle("fence", 1, 72, 64, 60, 50, 20),
    obstacle("yarn_ball", 2, 46, 46, 34, 34, 20),
    obstacle("crate", 3, 62, 62, 50, 50, 20),
    obstacle("puddle", 4, 76, 18, 62, 10, 10, -2),
  ];

  const clouds = [
    { x: 120, y: 72, frame: envFrame(0, 0), scale: 1.0 },
    { x: 470, y: 112, frame: envFrame(1, 0), scale: 0.82 },
    { x: 790, y: 62, frame: envFrame(0, 0), scale: 0.72 },
  ];

  const hills = [
    { x: 0, frame: envFrame(2, 0), scale: 2.35, y: 294 },
    { x: 310, frame: envFrame(3, 0), scale: 1.8, y: 316 },
    { x: 610, frame: envFrame(2, 0), scale: 2.15, y: 302 },
  ];

  const bushes = [
    { x: 80, frame: envFrame(0, 2), scale: 0.95 },
    { x: 360, frame: envFrame(1, 2), scale: 0.85 },
    { x: 670, frame: envFrame(0, 2), scale: 0.8 },
  ];

  const game = {
    state: State.READY,
    lastTime: 0,
    time: 0,
    groundOffset: 0,
    speed: START_SPEED,
    score: 0,
    best: readBest(),
    milestone: 0,
    milestoneTimer: 0,
    spawnTimer: 1.2,
    birdTimer: 3.5,
    obstacles: [],
    birds: [],
    cat: {
      footY: GROUND_Y,
      vy: 0,
      grounded: true,
      coyote: COYOTE_TIME,
      jumpBuffer: 0,
      landTimer: 0,
      hitTimer: 0,
      animTime: 0,
    },
  };

  const random = (min, max) => min + Math.random() * (max - min);

  function loadImage(src) {
    const image = new Image();
    const entry = { image, loaded: false, failed: false };
    image.onload = () => {
      entry.loaded = true;
    };
    image.onerror = () => {
      entry.failed = true;
    };
    image.src = src;
    return entry;
  }

  function frame(col, row, size) {
    return { sx: col * size, sy: row * size, sw: size, sh: size };
  }

  function envFrame(col, row) {
    return frame(col, row, 128);
  }

  function obstacle(name, col, w, h, cw, ch, weight, yOffset = 0) {
    return {
      name,
      frame: frame(col, 0, 96),
      w,
      h,
      cw,
      ch,
      weight,
      yOffset,
    };
  }

  function readBest() {
    try {
      return Number(localStorage.getItem("catnipDash.bestScore")) || 0;
    } catch {
      return 0;
    }
  }

  function writeBest(value) {
    game.best = Math.max(game.best, value);
    try {
      localStorage.setItem("catnipDash.bestScore", String(game.best));
    } catch {
      // Session memory is enough when storage is blocked.
    }
  }

  function resetRun() {
    game.time = 0;
    game.groundOffset = 0;
    game.speed = START_SPEED;
    game.score = 0;
    game.milestone = 0;
    game.milestoneTimer = 0;
    game.spawnTimer = random(1.0, 1.4);
    game.birdTimer = random(4, 7);
    game.obstacles.length = 0;
    game.birds.length = 0;
    game.cat.footY = GROUND_Y;
    game.cat.vy = 0;
    game.cat.grounded = true;
    game.cat.coyote = COYOTE_TIME;
    game.cat.jumpBuffer = 0;
    game.cat.landTimer = 0;
    game.cat.hitTimer = 0;
    game.cat.animTime = 0;
  }

  function startGame() {
    resetRun();
    game.state = State.PLAYING;
  }

  function requestJump() {
    if (game.state === State.READY || game.state === State.GAME_OVER) {
      startGame();
      return;
    }

    if (game.state !== State.PLAYING) return;
    game.cat.jumpBuffer = JUMP_BUFFER;
  }

  function togglePause() {
    if (game.state === State.PLAYING) {
      game.state = State.PAUSED;
    } else if (game.state === State.PAUSED) {
      game.state = State.PLAYING;
    }
  }

  function onKeyDown(event) {
    if (["Space", "ArrowUp"].includes(event.code)) {
      event.preventDefault();
    }

    if (event.code === "Space" || event.code === "ArrowUp" || event.code === "KeyW") {
      if (event.repeat && game.state === State.PLAYING) return;
      requestJump();
    } else if (event.code === "KeyP") {
      togglePause();
    } else if (event.code === "Escape" && (game.state === State.PLAYING || game.state === State.PAUSED)) {
      togglePause();
    }
  }

  function onPointer(event) {
    event.preventDefault();
    const point = getCanvasPoint(event);
    if (point && canTogglePause() && isInside(point, PAUSE_BUTTON)) {
      togglePause();
      return;
    }
    requestJump();
  }

  window.addEventListener("keydown", onKeyDown, { passive: false });
  canvas.addEventListener("pointerdown", onPointer, { passive: false });

  function getCanvasPoint(event) {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    return {
      x: ((event.clientX - rect.left) / rect.width) * W,
      y: ((event.clientY - rect.top) / rect.height) * H,
    };
  }

  function isInside(point, rect) {
    return point.x >= rect.x && point.x <= rect.x + rect.w && point.y >= rect.y && point.y <= rect.y + rect.h;
  }

  function canTogglePause() {
    return game.state === State.PLAYING || game.state === State.PAUSED;
  }

  function update(dt) {
    if (game.state === State.PAUSED) return;

    game.time += dt;
    game.cat.animTime += dt;

    updateDecor(dt);

    if (game.state === State.READY) {
      game.groundOffset += START_SPEED * 0.35 * dt;
      return;
    }

    if (game.state === State.GAME_OVER) {
      game.cat.hitTimer += dt;
      return;
    }

    game.speed = Math.min(MAX_SPEED, game.speed + SPEED_RAMP * dt);
    game.groundOffset += game.speed * dt;
    game.score += game.speed * dt * 0.035;

    const scoreInt = Math.floor(game.score);
    if (scoreInt > game.best) writeBest(scoreInt);
    if (scoreInt > 0 && scoreInt % 100 === 0 && scoreInt !== game.milestone) {
      game.milestone = scoreInt;
      game.milestoneTimer = 1;
    }
    game.milestoneTimer = Math.max(0, game.milestoneTimer - dt);

    updateCat(dt);
    updateObstacles(dt);
    detectCollisions();
  }

  function updateCat(dt) {
    const cat = game.cat;
    cat.jumpBuffer = Math.max(0, cat.jumpBuffer - dt);
    cat.coyote = cat.grounded ? COYOTE_TIME : Math.max(0, cat.coyote - dt);

    if (cat.jumpBuffer > 0 && cat.coyote > 0) {
      cat.vy = JUMP_VELOCITY;
      cat.grounded = false;
      cat.coyote = 0;
      cat.jumpBuffer = 0;
    }

    if (!cat.grounded) {
      cat.vy = Math.min(MAX_FALL, cat.vy + GRAVITY * dt);
      cat.footY += cat.vy * dt;

      if (cat.footY >= GROUND_Y) {
        cat.footY = GROUND_Y;
        cat.vy = 0;
        cat.grounded = true;
        cat.coyote = COYOTE_TIME;
        cat.landTimer = LAND_TIME;
      }
    } else {
      cat.landTimer = Math.max(0, cat.landTimer - dt);
    }
  }

  function updateObstacles(dt) {
    game.spawnTimer -= dt;
    for (const item of game.obstacles) {
      item.x -= game.speed * dt;
      if (item.type.name === "yarn_ball") {
        item.spin += dt * game.speed * 0.012;
      }
    }

    game.obstacles = game.obstacles.filter((item) => item.x + item.type.w > -80);

    if (game.spawnTimer <= 0) {
      const spawned = spawnObstacleSet();
      game.spawnTimer = spawned ? nextSpawnInterval() : 0.18;
    }
  }

  function updateDecor(dt) {
    const cloudSpeed = (game.state === State.PLAYING ? game.speed : START_SPEED) * 0.12;
    for (const cloud of clouds) {
      cloud.x -= cloudSpeed * dt * cloud.scale;
      if (cloud.x < -160) cloud.x = W + random(40, 220);
    }

    const hillSpeed = (game.state === State.PLAYING ? game.speed : START_SPEED) * 0.22;
    for (const hill of hills) {
      hill.x -= hillSpeed * dt;
      if (hill.x < -300) hill.x = W + random(0, 120);
    }

    const bushSpeed = (game.state === State.PLAYING ? game.speed : START_SPEED) * 0.55;
    for (const bush of bushes) {
      bush.x -= bushSpeed * dt;
      if (bush.x < -150) bush.x = W + random(60, 220);
    }

    game.birdTimer -= dt;
    if (game.state === State.PLAYING && game.birdTimer <= 0) {
      game.birds.push({
        x: W + 30,
        y: random(70, 178),
        speed: random(90, 140),
        flap: random(0, 1),
      });
      game.birdTimer = random(6, 11);
    }

    for (const bird of game.birds) {
      bird.x -= (bird.speed + game.speed * 0.18) * dt;
      bird.flap += dt;
    }
    game.birds = game.birds.filter((bird) => bird.x > -50);
  }

  function nextSpawnInterval() {
    const t = (game.speed - START_SPEED) / (MAX_SPEED - START_SPEED);
    return random(lerp(1.25, 0.78, t), lerp(1.9, 1.25, t));
  }

  function spawnObstacleSet() {
    const last = game.obstacles[game.obstacles.length - 1];
    const t = (game.speed - START_SPEED) / (MAX_SPEED - START_SPEED);
    const minSpace = lerp(260, 330, t);
    const baseX = W + random(30, 90);

    if (last && baseX - (last.x + last.type.w) < minSpace) {
      return false;
    }

    const first = chooseObstacle();
    game.obstacles.push(makeObstacle(first, baseX));

    if (game.score > 300 && Math.random() < 0.22) {
      const secondAllowed = first.name === "puddle" ? ["yarn_ball", "flower_pot"] : ["puddle"];
      const secondType = obstacleTypes.find((type) => secondAllowed.includes(type.name)) || chooseObstacle();
      game.obstacles.push(makeObstacle(secondType, baseX + random(190, 230)));
    }

    return true;
  }

  function makeObstacle(type, x) {
    return {
      type,
      x,
      y: GROUND_Y - type.h + type.yOffset,
      spin: 0,
    };
  }

  function chooseObstacle() {
    const total = obstacleTypes.reduce((sum, item) => sum + item.weight, 0);
    let pick = Math.random() * total;
    for (const item of obstacleTypes) {
      pick -= item.weight;
      if (pick <= 0) return item;
    }
    return obstacleTypes[0];
  }

  function detectCollisions() {
    const catBox = getCatBox();
    for (const item of game.obstacles) {
      if (intersects(catBox, getObstacleBox(item))) {
        game.state = State.GAME_OVER;
        writeBest(Math.floor(game.score));
        game.cat.hitTimer = 0;
        return;
      }
    }
  }

  function getCatBox() {
    return {
      x: CAT_X + 26,
      y: game.cat.footY - 64,
      w: 50,
      h: 58,
    };
  }

  function getObstacleBox(item) {
    const type = item.type;
    return {
      x: item.x + (type.w - type.cw) / 2,
      y: item.y + (type.h - type.ch) / 2,
      w: type.cw,
      h: type.ch,
    };
  }

  function intersects(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.imageSmoothingEnabled = true;

    drawSky();
    drawParallax();
    drawGround();
    drawObstacles();
    drawCat();
    drawHud();
  }

  function drawSky() {
    const sky = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
    sky.addColorStop(0, "#86d7ff");
    sky.addColorStop(0.55, "#bdeeff");
    sky.addColorStop(1, "#e8ffe4");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);
  }

  function drawParallax() {
    for (const cloud of clouds) {
      drawAtlas(assets.environment, cloud.frame, cloud.x, cloud.y, 128 * cloud.scale, 64 * cloud.scale, "cloud");
    }

    for (const hill of hills) {
      drawAtlas(assets.environment, hill.frame, hill.x, hill.y, 128 * hill.scale, 96 * hill.scale, "hill");
    }

    for (const bird of game.birds) {
      const birdFrame = Math.floor(bird.flap / 0.18) % 2 === 0 ? envFrame(2, 1) : envFrame(3, 1);
      drawAtlas(assets.environment, birdFrame, bird.x, bird.y, 32, 32, "bird");
    }

    for (const bush of bushes) {
      drawAtlas(assets.environment, bush.frame, bush.x, 364, 128 * bush.scale, 64 * bush.scale, "bush");
    }
  }

  function drawGround() {
    const grassFrame = envFrame(0, 1);
    const dirtFrame = envFrame(1, 1);
    const offset = -(game.groundOffset % 128);

    for (let x = offset; x < W + 128; x += 128) {
      drawAtlas(assets.environment, grassFrame, x, GROUND_Y, 128, 32, "grass");
      drawAtlas(assets.environment, dirtFrame, x, GROUND_Y + 32, 128, H - GROUND_Y - 32, "dirt");
    }

    ctx.fillStyle = "rgba(45, 30, 18, 0.18)";
    ctx.fillRect(0, GROUND_Y, W, 4);
  }

  function drawObstacles() {
    for (const item of game.obstacles) {
      ctx.save();
      if (item.type.name === "yarn_ball") {
        ctx.translate(item.x + item.type.w / 2, item.y + item.type.h / 2);
        ctx.rotate(item.spin);
        drawAtlas(assets.obstacles, item.type.frame, -item.type.w / 2, -item.type.h / 2, item.type.w, item.type.h, item.type.name);
      } else {
        drawAtlas(assets.obstacles, item.type.frame, item.x, item.y, item.type.w, item.type.h, item.type.name);
      }
      ctx.restore();
    }
  }

  function drawCat() {
    const frameName = getCatFrame();
    const drawY = game.cat.footY - CAT_SIZE;
    drawAtlas(assets.cat, catFrames[frameName], CAT_X, drawY, CAT_SIZE, CAT_SIZE, "cat");
  }

  function getCatFrame() {
    if (game.state === State.GAME_OVER) return "hit";
    const cat = game.cat;
    if (game.state === State.READY) {
      return Math.floor(cat.animTime / 0.2) % 2 === 0 ? "idle_0" : "idle_1";
    }
    if (!cat.grounded) {
      if (cat.vy < -60) return "jump";
      if (cat.vy > 60) return "fall";
    }
    if (cat.landTimer > 0) {
      return cat.landTimer > LAND_TIME / 2 ? "land_0" : "land_1";
    }
    const duration = lerp(0.09, 0.06, (game.speed - START_SPEED) / (MAX_SPEED - START_SPEED));
    return ["run_0", "run_1", "run_2", "run_3"][Math.floor(cat.animTime / duration) % 4];
  }

  function drawHud() {
    ctx.save();
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#243046";
    ctx.strokeStyle = "rgba(255,255,255,0.75)";
    ctx.lineWidth = 5;

    if (game.state === State.READY) {
      drawCenteredText("Catnip Dash", 130, "700 54px system-ui, sans-serif", "#243046");
      drawCenteredText("Jump the garden clutter.", 174, "22px system-ui, sans-serif", "#34435c");
      drawCenteredText("Press Space or Tap to Jump", 226, "700 24px system-ui, sans-serif", "#7b3b2d");
      if (game.best > 0) drawCenteredText(`Best: ${game.best}`, 266, "20px system-ui, sans-serif", "#34435c");
    }

    if (game.state === State.PLAYING || game.state === State.PAUSED || game.state === State.GAME_OVER) {
      drawTextWithStroke(`Score ${Math.floor(game.score)}`, 24, 34, "700 23px system-ui, sans-serif", "#243046", "left");
      drawTextWithStroke(`Best ${game.best}`, 936, 34, "700 23px system-ui, sans-serif", "#243046", "right");
      if (game.state === State.PLAYING) {
        drawPauseButton("Pause");
      }
    }

    if (game.milestoneTimer > 0 && game.state === State.PLAYING) {
      ctx.globalAlpha = Math.min(1, game.milestoneTimer * 2);
      drawCenteredText("Speed Up!", 92, "700 27px system-ui, sans-serif", "#b34a2e");
      ctx.globalAlpha = 1;
    }

    if (game.state === State.PAUSED) {
      drawOverlay();
      drawPauseButton("Resume");
      drawCenteredText("Paused", 232, "700 44px system-ui, sans-serif", "#fff4d8");
      drawCenteredText("Press P or tap Resume", 282, "22px system-ui, sans-serif", "#fff4d8");
    }

    if (game.state === State.GAME_OVER) {
      drawOverlay();
      drawCenteredText("Game Over", 210, "700 50px system-ui, sans-serif", "#fff4d8");
      drawCenteredText(`Score: ${Math.floor(game.score)}`, 266, "24px system-ui, sans-serif", "#fff4d8");
      drawCenteredText(`Best: ${game.best}`, 300, "24px system-ui, sans-serif", "#fff4d8");
      const pulse = 0.8 + Math.sin(game.time * 8) * 0.2;
      ctx.globalAlpha = pulse;
      drawCenteredText("Press Space or Tap to Restart", 356, "700 23px system-ui, sans-serif", "#ffdf73");
      ctx.globalAlpha = 1;
    }

    ctx.restore();
  }

  function drawOverlay() {
    ctx.fillStyle = "rgba(20, 24, 39, 0.58)";
    ctx.fillRect(0, 0, W, H);
  }

  function drawPauseButton(label) {
    ctx.save();
    ctx.fillStyle = "rgba(255, 244, 216, 0.78)";
    ctx.strokeStyle = "rgba(36, 48, 70, 0.55)";
    ctx.lineWidth = 2;
    roundedRect(PAUSE_BUTTON.x, PAUSE_BUTTON.y, PAUSE_BUTTON.w, PAUSE_BUTTON.h, 8);
    ctx.fill();
    ctx.stroke();
    drawTextWithStroke(label, PAUSE_BUTTON.x + PAUSE_BUTTON.w / 2, PAUSE_BUTTON.y + PAUSE_BUTTON.h / 2, "700 18px system-ui, sans-serif", "#243046", "center");
    ctx.restore();
  }

  function roundedRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function drawCenteredText(text, y, font, color) {
    drawTextWithStroke(text, W / 2, y, font, color, "center");
  }

  function drawTextWithStroke(text, x, y, font, color, align) {
    ctx.font = font;
    ctx.textAlign = align;
    ctx.lineWidth = 6;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.72)";
    ctx.strokeText(text, x, y);
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
  }

  function drawAtlas(asset, source, x, y, w, h, label) {
    if (asset.loaded) {
      ctx.drawImage(asset.image, source.sx, source.sy, source.sw, source.sh, x, y, w, h);
      return;
    }

    ctx.fillStyle = asset.failed ? "#ff7a70" : "#d8d8d8";
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = "#333";
    ctx.strokeRect(x, y, w, h);
    ctx.fillStyle = "#222";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, x + w / 2, y + h / 2);
  }

  function lerp(a, b, t) {
    return a + (b - a) * Math.max(0, Math.min(1, t));
  }

  function loop(timestamp) {
    if (!game.lastTime) game.lastTime = timestamp;
    const dt = Math.min(0.033, (timestamp - game.lastTime) / 1000);
    game.lastTime = timestamp;
    update(dt);
    draw();
    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
})();
