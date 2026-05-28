(function () {
  const canvas = document.getElementById('snake-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const CELL = 20;
  const COLS = canvas.width / CELL;
  const ROWS = canvas.height / CELL;
  const TICK_MS = 120;
  const SLOW_TICK_MS = TICK_MS * 2;
  const FOOD_COUNT = 3;

  const COLORS = {
    bg: '#0d1117',
    snake: '#818cf8',
    snakeHead: '#a5b4fc',
    food: '#94a3b8',
    text: '#64748b',
  };

  let snake, direction, nextDirection, foods, score, intervalId, running, gameOver, hasInput;
  // Guess touch vs. keyboard from media query, then keep it accurate based on actual input events.
  let usingTouch =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(hover: none) and (pointer: coarse)').matches;

  function reset() {
    const midX = Math.floor(COLS / 2);
    const midY = Math.floor(ROWS / 2);
    snake = [
      { x: midX, y: midY },
      { x: midX - 1, y: midY },
      { x: midX - 2, y: midY },
    ];
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    gameOver = false;
    hasInput = false;
    score = 0;
    foods = [];
    while (foods.length < FOOD_COUNT) addFood();
    draw();
  }

  function isOccupied(x, y) {
    return (
      snake.some((s) => s.x === x && s.y === y) ||
      foods.some((f) => f.x === x && f.y === y)
    );
  }

  function addFood() {
    let spot;
    let attempts = 0;
    do {
      spot = {
        x: Math.floor(Math.random() * COLS),
        y: Math.floor(Math.random() * ROWS),
      };
      attempts += 1;
    } while (isOccupied(spot.x, spot.y) && attempts < 500);
    if (!isOccupied(spot.x, spot.y)) foods.push(spot);
  }

  function start() {
    if (running) return;
    if (gameOver) reset();
    running = true;
    intervalId = setInterval(tick, hasInput ? TICK_MS : SLOW_TICK_MS);
  }

  function stop() {
    running = false;
    clearInterval(intervalId);
    gameOver = true;
  }

  function tick() {
    direction = nextDirection;
    const head = {
      x: (snake[0].x + direction.x + COLS) % COLS,
      y: (snake[0].y + direction.y + ROWS) % ROWS,
    };

    if (snake.some((s) => s.x === head.x && s.y === head.y)) {
      stop();
      draw();
      return;
    }

    snake.unshift(head);

    const eatenIndex = foods.findIndex((f) => f.x === head.x && f.y === head.y);
    if (eatenIndex !== -1) {
      score += 1;
      foods.splice(eatenIndex, 1);
      addFood();
    } else {
      snake.pop();
    }

    draw();
  }

  function draw() {
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = COLORS.food;
    foods.forEach((f) => {
      ctx.beginPath();
      ctx.arc(
        f.x * CELL + CELL / 2,
        f.y * CELL + CELL / 2,
        CELL / 2 - 2,
        0,
        Math.PI * 2
      );
      ctx.fill();
    });

    snake.forEach((segment, i) => {
      ctx.fillStyle = i === 0 ? COLORS.snakeHead : COLORS.snake;
      const pad = i === 0 ? 1 : 2;
      ctx.fillRect(
        segment.x * CELL + pad,
        segment.y * CELL + pad,
        CELL - pad * 2,
        CELL - pad * 2
      );
    });

    if (gameOver) {
      ctx.fillStyle = 'rgba(13, 17, 23, 0.75)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.textAlign = 'center';
      ctx.fillStyle = COLORS.snakeHead;
      ctx.font = '600 24px Inter, sans-serif';
      ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 24);
      ctx.fillStyle = COLORS.text;
      ctx.font = '500 14px Inter, sans-serif';
      ctx.fillText('Score: ' + score, canvas.width / 2, canvas.height / 2 + 2);
      const restartText = usingTouch ? 'Tap To Restart' : 'Press Space To Restart';
      ctx.fillText(restartText, canvas.width / 2, canvas.height / 2 + 24);
    }
  }

  function setDirection(x, y) {
    if (direction.x + x === 0 && direction.y + y === 0) return;
    nextDirection = { x, y };
  }

  function noteFirstInput() {
    if (hasInput) return;
    hasInput = true;
    if (running) {
      clearInterval(intervalId);
      intervalId = setInterval(tick, TICK_MS);
    }
  }

  function restartOrStart() {
    if (running) return;
    if (gameOver) reset();
    start();
  }

  document.addEventListener('keydown', (e) => {
    const key = e.key;
    if (key === ' ' || key === 'Spacebar') {
      e.preventDefault();
      usingTouch = false;
      restartOrStart();
      if (gameOver) draw();
      return;
    }

    if (!running && !gameOver) return;

    const map = {
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
    };
    const dir = map[key];
    if (dir) {
      e.preventDefault();
      usingTouch = false;
      noteFirstInput();
      setDirection(dir[0], dir[1]);
    }
  });

  const SWIPE_THRESHOLD = 20;
  let touchStartX = 0;
  let touchStartY = 0;

  canvas.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1) return;
    e.preventDefault();
    usingTouch = true;
    if (gameOver) draw();
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: false });

  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
  }, { passive: false });

  canvas.addEventListener('touchend', (e) => {
    if (e.changedTouches.length !== 1) return;
    e.preventDefault();
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (absDx < SWIPE_THRESHOLD && absDy < SWIPE_THRESHOLD) {
      restartOrStart();
      return;
    }

    if (!running) return;

    const dirX = absDx > absDy ? (dx > 0 ? 1 : -1) : 0;
    const dirY = absDx > absDy ? 0 : (dy > 0 ? 1 : -1);
    noteFirstInput();
    setDirection(dirX, dirY);
  }, { passive: false });

  reset();
  start();
})();
