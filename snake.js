(function () {
  const canvas = document.getElementById('snake-canvas');
  const scoreEl = document.getElementById('snake-score');
  const statusEl = document.getElementById('snake-status');
  if (!canvas || !scoreEl || !statusEl) return;

  const ctx = canvas.getContext('2d');
  const CELL = 20;
  const COLS = canvas.width / CELL;
  const ROWS = canvas.height / CELL;
  const TICK_MS = 120;
  const FOOD_COUNT = 3;

  const COLORS = {
    bg: '#1e293b',
    grid: '#334155',
    snake: '#818cf8',
    snakeHead: '#a5b4fc',
    food: '#94a3b8',
    text: '#64748b',
  };

  let snake, direction, nextDirection, foods, score, intervalId, running, gameOver;

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
    score = 0;
    scoreEl.textContent = '0';
    gameOver = false;
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
    statusEl.textContent = '';
    intervalId = setInterval(tick, TICK_MS);
  }

  function stop(message) {
    running = false;
    clearInterval(intervalId);
    gameOver = true;
    statusEl.textContent = message;
  }

  function tick() {
    direction = nextDirection;
    const head = {
      x: (snake[0].x + direction.x + COLS) % COLS,
      y: (snake[0].y + direction.y + ROWS) % ROWS,
    };

    if (snake.some((s) => s.x === head.x && s.y === head.y)) {
      stop('Game over — press Space to restart');
      draw();
      return;
    }

    snake.unshift(head);

    const eatenIndex = foods.findIndex((f) => f.x === head.x && f.y === head.y);
    if (eatenIndex !== -1) {
      score += 1;
      scoreEl.textContent = String(score);
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

    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= COLS; x++) {
      ctx.beginPath();
      ctx.moveTo(x * CELL, 0);
      ctx.lineTo(x * CELL, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y <= ROWS; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * CELL);
      ctx.lineTo(canvas.width, y * CELL);
      ctx.stroke();
    }

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
      ctx.fillStyle = COLORS.text;
      ctx.font = '500 14px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2);
    }
  }

  function setDirection(x, y) {
    if (direction.x + x === 0 && direction.y + y === 0) return;
    nextDirection = { x, y };
  }

  document.addEventListener('keydown', (e) => {
    const key = e.key;
    if (key === ' ' || key === 'Spacebar') {
      e.preventDefault();
      if (!running) {
        if (gameOver) reset();
        start();
      }
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
      setDirection(dir[0], dir[1]);
    }
  });

  reset();
})();
