class Maze {
    constructor(canvas, width, height, cellSize) {
        this.canvas = canvas;
        this.width = width;
        this.height = height;
        this.startTime = new Date().getTime();
        this.cellSize = cellSize;
        this.ctx = canvas.getContext("2d");
        this.grid = this.initializeGrid();
        this.generateMaze();
        this.player = { x: width - 1 , y: height - 1 };
        this.finish = { x: 0, y: 0};
        this.isGameOver = false;
        this.timerText = document.getElementById("timer");
        this.finalTime = 0;

        this.updateTimer = this.updateTimer.bind(this);
        
        setInterval(this.updateTimer, 1000);
    }

    // Initialize the grid with all walls
    initializeGrid() {
        let grid = [];
        for (let i = 0; i < this.height; i++) {
            grid.push([]);
            for (let j = 0; j < this.width; j++) {
                grid[i].push({
                    x: j,
                    y: i,
                    visited: false,
                    walls: {
                        top: true,
                        right: true,
                        bottom: true,
                        left: true
                    }
                });
            }
        }
        return grid;
    }

    // Generate the maze using recursive backtracking algorithm
    generateMaze() {
        let stack = [];
        let current = this.grid[0][0];
        current.visited = true;

        while (true) {
            let neighbors = this.getNeighbors(current);
            if (neighbors.length > 0) {
                let next = neighbors[Math.floor(Math.random() * neighbors.length)];
                this.removeWalls(current, next);
                stack.push(current);
                current = next;
                current.visited = true;
            } else if (stack.length > 0) {
                current = stack.pop();
            } else {
                break;
            }
        }
    }

    // Get all unvisited neighbors of a cell
    getNeighbors(cell) {
        const neighbors = [];

        if (cell.x > 0) {
            neighbors.push(this.grid[cell.y][cell.x - 1]); // Left neighbor
        }

        if (cell.y > 0) {
            neighbors.push(this.grid[cell.y - 1][cell.x]); // Top neighbor
        }

        if (cell.x < this.width - 1) {
            neighbors.push(this.grid[cell.y][cell.x + 1]); // Right neighbor
        }

        if (cell.y < this.height - 1) {
            neighbors.push(this.grid[cell.y + 1][cell.x]); // Bottom neighbor
        }

        return neighbors.filter(neighbor => !neighbor.visited);
    }

    // Remove walls between two cells
    removeWalls(current, next) {

        let dx = current.x - next.x;
        let dy = current.y - next.y;

        if (dx === 1) {
            current.walls.left = false;
            next.walls.right = false;
        } else if (dx === -1) {
            current.walls.right = false;
            next.walls.left = false;
        } else if (dy === 1) {
            current.walls.top = false;
            next.walls.bottom = false;
        } else if (dy === -1) {
            current.walls.bottom = false;
            next.walls.top = false;
        }
    }

    // Draw the maze on the canvas
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < this.width; j++) {

                let cell = this.grid[i][j];
                let x = j * this.cellSize;
                let y = i * this.cellSize;

                if (cell.walls.top) {
                    this.drawLine(x, y, x + this.cellSize, y);
                }

                if (cell.walls.right) {
                    this.drawLine(x + this.cellSize, y, x + this.cellSize, y + this.cellSize);
                }

                if (cell.walls.bottom) {
                    this.drawLine(x, y + this.cellSize, x + this.cellSize, y + this.cellSize);
                }

                if (cell.walls.left) {
                    this.drawLine(x, y, x, y + this.cellSize);
                }
            }
        }

        this.drawPlayer();
        this.drawFinish();
    }

    // Draw a line on the canvas
    drawLine(x1, y1, x2, y2) {
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.strokeStyle = "black";
        this.ctx.stroke();
    }

    // Draw the player on the canvas
    drawPlayer() {
        let x = this.player.x * this.cellSize;
        let y = this.player.y * this.cellSize;
        this.ctx.fillStyle = "#D0BCD5";
        this.ctx.fillRect(x, y, this.cellSize, this.cellSize);
    }

    // Draw the finish on the canvas
    drawFinish() {
        let x = this.finish.x * this.cellSize;
        let y = this.finish.y * this.cellSize;
        this.ctx.fillStyle = "#226CE0";
        this.ctx.fillRect(x, y, this.cellSize, this.cellSize);
    }

    // Move the player
    movePlayer(direction) {
        if (this.isGameOver) {
            return;
        }

        let x = this.player.x;
        let y = this.player.y;

        console.log(direction);
        console.log(x);
        console.log(y);

        if (direction === "up") {
            if (y > 0 && !this.grid[y][x].walls.top) {
                this.player.y -= 1;
            }
        } else if (direction === "right") {
            if (x < this.width - 1 && !this.grid[y][x].walls.right) {
                this.player.x += 1;
            }
        } else if (direction === "down") {
            if (y < this.height - 1 && !this.grid[y][x].walls.bottom) {
                this.player.y += 1;
            }
        } else if (direction === "left") {
            if (x > 0 && !this.grid[y][x].walls.left) {
                this.player.x -= 1;
            }
        }

        if (this.player.x === this.finish.x && this.player.y === this.finish.y) {
            this.isGameOver = true;
            this.draw();
            this.displayGameOver();
            this.stopTimer();
        } else {
            this.draw();
        }

    }

    // Display game over message
    displayGameOver() {
        let message = document.createElement("div");
        message.classList.add("game-over");
        message.textContent = "Game Over!";
        document.body.appendChild(message);
    }

    updateTimer() {
        let elapsedTime = new Date().getTime() - this.startTime; // calculate elapsed time
        let minutes = Math.floor(elapsedTime / (60 * 1000)); // calculate minutes
        let seconds = Math.floor((elapsedTime / 1000) % 60); // calculate seconds
        // format the time with leading zeros if necessary
        let minutesString = minutes.toString().padStart(2, "0");
        let secondsString = seconds.toString().padStart(2, "0");

        this.finalTime = minutes * 60 + seconds;
        this.timerText.textContent = `Time: ${minutesString}:${secondsString}`; // update the timer element
    }

    stopTimer() {
        clearInterval(this.updateTimer); // stop the timer
        let score = 10000 / this.finalTime;
        $.ajax({
            url: "/Game/UpdateHighScore",
            type: "POST",
            data: { score: score, gameId: 1 },
            success: function (result) {
                window.location.href = "/Game";
            },
            error: function (err) {
                console.log(err);
                window.location.href = "/Game";
            }
        }); // Update highscore;
    }
}

let canvas = document.getElementById("maze-canvas");
let maze = new Maze(canvas, 40, 20, 30);

// Draw the initial maze
maze.draw();

// Handle keyboard input for player movement
$(document).keydown(function (event) {
    switch (event.which) {
        case 37: // left
            maze.movePlayer("left");
            break;
        case 38: // up
            maze.movePlayer("up");
            break;
        case 39: // right
            maze.movePlayer("right");
            break;
        case 40: // down
            maze.movePlayer("down");
            break;
    }
    event.preventDefault();
});