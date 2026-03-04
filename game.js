(() => {
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");

  const WIDTH = 420;
  const HEIGHT = 640;

  const PLAYER_W = 24;
  const PLAYER_H = 30;
  const MOVE_SPEED = 5;
  const GRAVITY = 0.42;
  const MAX_FALL_SPEED = 10;
  const JUMP_SPEED = -9.5;

  const PLATFORM_H = 14;
  const PLATFORM_MIN_W = 70;
  const PLATFORM_MAX_W = 130;
  const PLATFORM_GAP_Y = 85;
  const SCROLL_SPEED_BASE = 1.8;
  const SCROLL_SPEED_INC = 0.012;
  const TOTAL_FLOORS = 100;

  const COLORS = {
    bg: "#111827",
    normal: "#60a5fa",
    fragile: "#f59e0b",
    spike: "#ef4444",
    player: "#34d399",
    playerFace: "#a7f3d0",
    ui: "#f9fafb",
    sub: "#d1d5db",
  };

  const keys = {
    left: false,
    right: false,
  };

  let running = true;
  let gameOver = false;
  let win = false;

  let platforms = [];
  let passedFloors = 0;
  let scrollSpeed = SCROLL_SPEED_BASE;

  let playerX = WIDTH / 2 - PLAYER_W / 2;
  let playerY = HEIGHT - 120;
  let vy = 0;

  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function createPlatform(y) {
    const w = randInt(PLATFORM_MIN_W, PLATFORM_MAX_W);
    const x = randInt(8, WIDTH - w - 8);

    const r = Math.random();
    let kind = "normal";
    if (r < 0.12) {
      kind = "fragile";
    } else if (r < 0.22) {
      kind = "spike";
    }

    return { x, y, w, h: PLATFORM_H, kind };
  }

  function resetGame() {
    platforms = [];
    passedFloors = 0;
    scrollSpeed = SCROLL_SPEED_BASE;

    playerX = WIDTH / 2 - PLAYER_W / 2;
    playerY = HEIGHT - 120;
    vy = 0;

    platforms.push({ x: WIDTH / 2 - 60, y: HEIGHT - 60, w: 120, h: PLATFORM_H, kind: "normal" });

    let y = HEIGHT - 60 - PLATFORM_GAP_Y;
    while (y > -PLATFORM_GAP_Y) {
      platforms.push(createPlatform(y));
      y -= PLATFORM_GAP_Y;
    }

    running = true;
    gameOver = false;
    win = false;
  }

  function movePlayer() {
    if (keys.left) {
      playerX -= MOVE_SPEED;
    }
    if (keys.right) {
      playerX += MOVE_SPEED;
    }

    if (playerX < -PLAYER_W) {
      playerX = WIDTH;
    }
    if (playerX > WIDTH) {
      playerX = -PLAYER_W;
    }

    vy += GRAVITY;
    if (vy > MAX_FALL_SPEED) {
      vy = MAX_FALL_SPEED;
    }

    const oldBottom = playerY + PLAYER_H;
    playerY += vy;
    const newBottom = playerY + PLAYER_H;

    if (vy > 0) {
      for (let i = 0; i < platforms.length; i += 1) {
        const p = platforms[i];
        const touchY = oldBottom <= p.y && p.y <= newBottom;
        const touchX = playerX + PLAYER_W > p.x && playerX < p.x + p.w;

        if (touchY && touchX) {
          if (p.kind === "spike") {
            gameOver = true;
            running = false;
            return;
          }

          playerY = p.y - PLAYER_H;
          vy = JUMP_SPEED;

          if (p.kind === "fragile") {
            platforms.splice(i, 1);
          }
          break;
        }
      }
    }
  }

  function scrollWorld() {
    scrollSpeed = SCROLL_SPEED_BASE + passedFloors * SCROLL_SPEED_INC;

    for (const p of platforms) {
      p.y -= scrollSpeed;
    }
    playerY -= scrollSpeed;

    if (playerY + PLAYER_H < 0) {
      gameOver = true;
      running = false;
      return;
    }

    const kept = [];
    for (const p of platforms) {
      if (p.y + p.h >= 0) {
        kept.push(p);
      } else {
        passedFloors += 1;
      }
    }
    platforms = kept;

    let highestY = platforms.length ? Math.max(...platforms.map((p) => p.y)) : 0;
    while (platforms.length < 10) {
      highestY += PLATFORM_GAP_Y;
      platforms.push(createPlatform(highestY));
    }

    if (passedFloors >= TOTAL_FLOORS) {
      win = true;
      running = false;
    }

    if (playerY > HEIGHT) {
      gameOver = true;
      running = false;
    }
  }

  function drawBackground() {
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    ctx.globalAlpha = 0.06;
    for (let i = 0; i < 10; i += 1) {
      const y = ((i * 64) + (performance.now() * 0.02)) % HEIGHT;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, y, WIDTH, 1);
    }
    ctx.globalAlpha = 1;
  }

  function drawPlatforms() {
    for (const p of platforms) {
      ctx.fillStyle = COLORS[p.kind] || COLORS.normal;
      ctx.fillRect(p.x, p.y, p.w, p.h);
    }
  }

  function drawPlayer() {
    ctx.fillStyle = COLORS.player;
    ctx.fillRect(playerX, playerY, PLAYER_W, PLAYER_H);

    ctx.fillStyle = COLORS.playerFace;
    ctx.fillRect(playerX + 4, playerY + 4, PLAYER_W - 8, 8);
  }

  function drawUI() {
    const left = Math.max(0, TOTAL_FLOORS - passedFloors);

    ctx.fillStyle = COLORS.ui;
    ctx.font = "bold 20px Consolas, monospace";
    ctx.fillText(`剩余楼层: ${left}`, 12, 30);

    ctx.fillStyle = COLORS.sub;
    ctx.font = "13px Consolas, monospace";
    ctx.fillText("A/D 或 ←/→ 移动", 12, 52);

    if (win || gameOver) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      ctx.textAlign = "center";
      ctx.fillStyle = win ? "#fef3c7" : "#fecaca";
      ctx.font = "bold 42px Consolas, monospace";
      ctx.fillText(win ? "YOU WIN" : "GAME OVER", WIDTH / 2, HEIGHT / 2 - 14);

      ctx.fillStyle = "#f3f4f6";
      ctx.font = "18px Consolas, monospace";
      ctx.fillText("Press R to restart", WIDTH / 2, HEIGHT / 2 + 26);
      ctx.textAlign = "start";
    }
  }

  function loop() {
    if (running) {
      movePlayer();
      if (running) {
        scrollWorld();
      }
    }

    drawBackground();
    drawPlatforms();
    drawPlayer();
    drawUI();

    requestAnimationFrame(loop);
  }

  window.addEventListener("keydown", (e) => {
    const key = e.key.toLowerCase();
    if (key === "a" || e.key === "ArrowLeft") {
      keys.left = true;
    }
    if (key === "d" || e.key === "ArrowRight") {
      keys.right = true;
    }
    if (key === "r" && (gameOver || win)) {
      resetGame();
    }
  });

  window.addEventListener("keyup", (e) => {
    const key = e.key.toLowerCase();
    if (key === "a" || e.key === "ArrowLeft") {
      keys.left = false;
    }
    if (key === "d" || e.key === "ArrowRight") {
      keys.right = false;
    }
  });

  resetGame();
  requestAnimationFrame(loop);
})();
