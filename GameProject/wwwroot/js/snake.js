const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const startButton = document.getElementById('start-btn');
const difficulty = document.getElementById('difficulty');
const speed = document.getElementById('speed');
const reverse = document.getElementById('reverse');

let speedChangeCountdown = 0;
let reverseChangeCountdown = 0;

let score = 0;
let gameSpeed = 7;
let gameSpeedMultiplier = 1;
let dx = gameSpeed;
let dy = 0;

let snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
    { x: 7, y: 10 }
];

let apple = { x: 5, y: 5 };

let intervalId = null;

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function drawSnakePart(snakePart) {
    ctx.fillStyle = 'lightgreen';
    ctx.strokeStyle = 'darkgreen';
    ctx.fillRect(snakePart.x * 10, snakePart.y * 10, 10, 10);
    ctx.strokeRect(snakePart.x * 10, snakePart.y * 10, 10, 10);
}

function drawApple() {
    ctx.fillStyle = 'red';
    ctx.strokeStyle = 'darkred';
    ctx.fillRect(apple.x * 10, apple.y * 10, 10, 10);
    ctx.strokeRect(apple.x * 10, apple.y * 10, 10, 10);
}

function drawSnake() {
    snake.forEach(drawSnakePart);
}

function moveSnake() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head);

    const didEatApple = snake[0].x === apple.x && snake[0].y === apple.y;
    if (didEatApple) {
        score += 10;
        scoreDisplay.innerHTML = score;
        generateApple();
        if (score % 50 === 0) {
            gameSpeedMultiplier += 0.5;
        }
    } else {
        snake.pop();
    }
}

function generateApple() {
    apple.x = getRandomInt(canvas.width / 10);
    apple.y = getRandomInt(canvas.height / 10);
}

function endGame() {
    clearInterval(intervalId);
    alert('Game over!');
    startButton.disabled = false;
}

function isSnakeOutOfBounds() {
    const head = snake[0];
    return head.x < 0 || head.x > (canvas.width / 10) - 1 ||
        head.y < 0 || head.y > (canvas.height / 10) - 1;
}

function isSnakeTouchingItself() {
    const head = snake[0];
    return snake.slice(1).some(snakePart => snakePart.x === head.x && snakePart.y === head.y);
}

function handleDifficultyChange() {
    gameSpeed = parseInt(difficulty.value);
    dx = gameSpeed;
    dy = 0;
}

function handleSpeedChange() {
    gameSpeedMultiplier = parseFloat(speed.value);
}

function handleReverseChange() {
    reverseChangeCountdown = 10;
}

function handleKeyDown(event) {
    switch (event.keyCode) {
        case 37:
            if (dx !== gameSpeed && reverseChangeCountdown === 0) {
                dx = -gameSpeed;
                dy = 0;
            }
            break;
        case 38:
            if (dy !== gameSpeed && reverseChangeCountdown === 0) {
                dx = 0;
                dy = -gameSpeed;
            }
            break;
        case 39:
            if (dx !== -gameSpeed && reverseChangeCountdown === 0) {
                dx = gameSpeed;
                dy = 0;
            }
            break;
        case 40:
            if (dy !== -gameSpeed && reverseChangeCountdown === 0) {
                dx = 0;
                dy = gameSpeed;
            }
            break;
    }
    if (reverseChangeCountdown === 0 && Math.random() < 0.1) {
        handleReverseChange();
    }
}

function update() {
    moveSnake();

    if (isSnakeOutOfBounds() || isSnakeTouchingItself()) {
        endGame();
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawSnake();
    drawApple();

    if (speedChangeCountdown === 0 && Math.random() < 0.1) {
        gameSpeedMultiplier += 0.5;
        speedChangeCountdown = 5;
    }

    if (reverseChangeCountdown > 0) {
        reverseChangeCountdown--;
    }

    if (speedChangeCountdown > 0) {
        speedChangeCountdown--;
    }

    if (speedChangeCountdown === 1) {
        gameSpeedMultiplier -= 0.5;
    }

    intervalId = setTimeout(() => {
        update();
    }, 1000 / (gameSpeed * gameSpeedMultiplier));
}

function startGame() {
    startButton.disabled = true;
    score = 0;
    scoreDisplay.innerHTML = score;
    gameSpeedMultiplier = 1;
    dx = gameSpeed;
    dy = 0;
    generateApple();
    intervalId = setTimeout(() => {
        update();
    }, 1000 / (gameSpeed * gameSpeedMultiplier));
}

startButton.addEventListener('click', startGame);
difficulty.addEventListener('change', handleDifficultyChange);
speed.addEventListener('change', handleSpeedChange);
reverse.addEventListener('change', handleReverseChange);
document.addEventListener('keydown', handleKeyDown);