let canvas = document.getElementById("gameCanvas");
let ctx = canvas.getContext("2d");

canvas.width = window.innerWidth - 5;
canvas.height = window.innerHeight * 0.5;

width = ctx.canvas.width;
height = ctx.canvas.height;

var score = 0;
var isGameOver = false;

let max = 5;
let min = 1;

var initialX = Math.floor(Math.random() * (max - min + 1) + min);
var initialY = Math.floor(Math.random() * (max - min + 1) + min);

// Set up ball object
let ball = {
    x: width / 2,
    y: height / 2,
    dx: initialX,
    dy: initialY,
    radius: 10
};

// Set up paddle objects
let paddle1 = {
    x: 0,
    y: height / 2 - 50,
    width: 10,
    height: 100,
    dy: 0
};

let paddle2 = {
    x: width - 10,
    y: height / 2 - 50,
    width: 10,
    height: 100,
    dy: 0
};

// Draw ball
function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = "aliceblue";
    ctx.fill();
    ctx.closePath();
}

// Draw paddles
function drawPaddle(paddle) {
    ctx.beginPath();
    ctx.rect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.fillStyle = "#D0BCD5";
    ctx.fill();
    ctx.closePath();
}

// Move paddles
function movePaddles() {
    paddle1.y += paddle1.dy;
    paddle2.y += paddle2.dy;

    if (paddle1.y < 0) {
        paddle1.y = 0;
    } else if (paddle1.y + paddle1.height > canvas.height) {
        paddle1.y = canvas.height - paddle1.height;
    }

    if (paddle2.y < 0) {
        paddle2.y = 0;
    } else if (paddle2.y + paddle2.height > canvas.height) {
        paddle2.y = canvas.height - paddle2.height;
    }
}

// Move ball
function moveBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    if (ball.y + ball.radius > height || ball.y - ball.radius < 0) {
        ball.dy = -ball.dy;
    }

    if (ball.x + ball.radius > width || ball.x - ball.radius < 0) {
        ball.dx = -ball.dx;
    }

    if (ball.x - ball.radius < paddle1.x + paddle1.width &&
        ball.y > paddle1.y &&
        ball.y < paddle1.y + paddle1.height) {
        ball.dx = -ball.dx;
        score += 1;
    }

    if (ball.x + ball.radius > paddle2.x &&
        ball.y > paddle2.y &&
        ball.y < paddle2.y + paddle2.height) {
        ball.dx = -ball.dx;
        score += 1;
    }
}

function checkGameOver() {
    if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width) {
        isGameOver = true;
    }
}

// Render game
function render() {
    ctx.clearRect(0, 0, width, height);

    checkGameOver();
    if (isGameOver) {
        $.ajax({
            url: "/Game/UpdateHighScore",
            type: "POST",
            data: { score: score, gameId: 2 },
            success: function (result) {
                window.location.href = "/Game";
            },
            error: function (err) {
                alert(err);
                window.location.href = "/Game";
            }
        });
        return;
    }

    drawBall();
    drawPaddle(paddle1);
    drawPaddle(paddle2);
    movePaddles();
    moveBall();

    document.querySelector("#scoreText").innerHTML = `Score: ${score}`;

    window.requestAnimationFrame(render);
}

// Handle key events
document.addEventListener("keydown", function (e) {
    if (e.code === "KeyW") {
        paddle1.dy = -5;
    } else if (e.code === "KeyS") {
        paddle1.dy = 5;
    }

    if (e.code === "ArrowUp") {
        paddle2.dy = -5;
    } else if (e.code === "ArrowDown") {
        paddle2.dy = 5;
    }
});

document.addEventListener("keyup", function (e) {
    if (e.code === "KeyW" || e.code === "KeyS") {
        paddle1.dy = 0;
    }

    if (e.code === "ArrowUp" || e.code === "ArrowDown") {
        paddle2.dy = 0;
    }
});

// Start game
render();