(function () {
  const canvas = document.getElementById('snake-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const CELL = 20;
  const COLS = canvas.width / CELL;
  const ROWS = canvas.height / CELL;
  const TICK_MS = 120;
  const FOOD_COUNT = 3;

  const COLORS = {
    bg: '#0d1117',
    snake: '#818cf8',
    snakeHead: '#a5b4fc',
    food: '#94a3b8',
    text: '#64748b',
  };

  let snake, direction, nextDirection, foods, intervalId, running, gameOver;

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
    intervalId = setInterval(tick, TICK_MS);
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
      ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 8);
      ctx.fillStyle = COLORS.text;
      ctx.font = '500 14px Inter, sans-serif';
      ctx.fillText('Press Space To Restart', canvas.width / 2, canvas.height / 2 + 20);
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
  start();
})();
