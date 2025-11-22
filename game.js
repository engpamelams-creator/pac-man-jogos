// ================== CONFIG INICIAL / CANVAS ==================
let canvas = document.getElementById("canvas");
let canvasContext = canvas.getContext("2d");
const pacmanFrames = document.getElementById("animation");
const ghostFrames = document.getElementById("ghosts");
let restartButton; // obtido no DOMContentLoaded

// ================== ESTADOS DO JOGO ==================
const GAME_STATE_PLAYING = "playing";
const GAME_STATE_GAMEOVER = "gameover";
const GAME_STATE_WIN = "win";
const GAME_STATE_PAUSED = "paused";

let gameState = GAME_STATE_PLAYING;
let lives = 3;
let score = 0;
let highScore = parseInt(localStorage.getItem("highScore")) || 0;

// ================== CONFIG VISUAL ==================
let createRect = (x, y, width, height, color) => {
    canvasContext.fillStyle = color;
    canvasContext.fillRect(x, y, width, height);
};

const DIRECTION_RIGHT = 4;
const DIRECTION_UP = 3;
const DIRECTION_LEFT = 2;
const DIRECTION_BOTTOM = 1;

let ghostCount = 4;
let ghostImageLocations = [
    { x: 0, y: 0 },
    { x: 176, y: 0 },
    { x: 0, y: 121 },
    { x: 176, y: 121 },
];

let fps = 30;
let pacman;
let oneBlockSize = 20;
let ghosts = [];
let wallSpaceWidth = oneBlockSize / 1.6;
let wallOffset = (oneBlockSize - wallSpaceWidth) / 2;
let wallInnerColor = "black";
let foodCount = 0;

// ================== MAPA ==================
let map = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1],
    [1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1],
    [1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1],
    [1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 1, 2, 1, 2, 2, 2, 2, 2, 2, 2, 1, 2, 1, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1],
    [2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2],
    [1, 1, 1, 1, 1, 2, 1, 2, 1, 2, 2, 2, 1, 2, 1, 2, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 2, 1, 2, 2, 2, 2, 2, 2, 2, 1, 2, 1, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 2, 2, 2, 1, 1, 1, 1, 1, 2, 2, 2, 1, 1, 1, 1, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1],
    [1, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 1],
    [1, 1, 2, 2, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 2, 2, 1, 1],
    [1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1],
    [1, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];
let originalMap = JSON.parse(JSON.stringify(map));

// alvos para "inteligência" dos fantasmas (cantos do mapa)
let randomTargetsForGhosts = [
    { x: 1 * oneBlockSize, y: 1 * oneBlockSize },
    { x: 1 * oneBlockSize, y: (map.length - 2) * oneBlockSize },
    { x: (map[0].length - 2) * oneBlockSize, y: oneBlockSize },
    {
        x: (map[0].length - 2) * oneBlockSize,
        y: (map.length - 2) * oneBlockSize,
    },
];

// ================== FUNÇÕES DE CONTAGEM / CRIAÇÃO ==================
let countFood = () => {
    foodCount = 0;
    for (let i = 0; i < map.length; i++) {
        for (let j = 0; j < map[0].length; j++) {
            if (map[i][j] == 2) {
                foodCount++;
            }
        }
    }
};

let createNewPacman = () => {
    pacman = new Pacman(
        oneBlockSize,
        oneBlockSize,
        oneBlockSize,
        oneBlockSize,
        oneBlockSize / 5
    );
};

let createGhosts = () => {
    ghosts = [];
    for (let i = 0; i < ghostCount; i++) {
        let newGhost = new Ghost(
            9 * oneBlockSize + (i % 2 == 0 ? 0 : 1) * oneBlockSize,
            10 * oneBlockSize + (i % 2 == 0 ? 0 : 1) * oneBlockSize,
            oneBlockSize,
            oneBlockSize,
            pacman.speed / 2,
            ghostImageLocations[i % 4].x,
            ghostImageLocations[i % 4].y,
            124,
            116,
            6 + i
        );
        ghosts.push(newGhost);
    }
};

// ================== LOOP & RESOLUÇÃO RESPONSIVA ==================
let gameInterval = null;
let lastTime = 0;
const frameDuration = 1000 / fps;

// deixa o canvas com resolução fixa interna, mas tamanho visual responsivo
function setupCanvasResolution() {
    const cols = map[0].length;
    const rows = map.length;

    // resolução interna (lógica do jogo)
    canvas.width = cols * oneBlockSize;
    canvas.height = rows * oneBlockSize;

    // tamanho visual responsivo (no CSS você pode complementar)
    resizeCanvas();
}

function resizeCanvas() {
    const maxSize = Math.min(window.innerWidth * 0.9, 600); // até 600px
    const cols = map[0].length;
    const rows = map.length;

    const scaleX = maxSize / (cols * oneBlockSize);
    const scaleY = maxSize / (rows * oneBlockSize);
    const scale = Math.min(scaleX, scaleY);

    canvas.style.width = cols * oneBlockSize * scale + "px";
    canvas.style.height = rows * oneBlockSize * scale + "px";
}

window.addEventListener("resize", resizeCanvas);

let gameLoop = (timestamp) => {
    if (!lastTime) lastTime = timestamp;
    const delta = timestamp - lastTime;

    if (delta >= frameDuration) {
        if (gameState === GAME_STATE_PLAYING) {
            update();
        }
        draw();
        lastTime = timestamp;
    }

    requestAnimationFrame(gameLoop);
};

// ================== CONTROLE DE ESTADO ==================
let restartGame = () => {
    lives = 3;
    score = 0;
    map = JSON.parse(JSON.stringify(originalMap));
    createNewPacman();
    createGhosts();
    countFood();
    updateScore(score);
    updateLives(lives);
    document.getElementById("game-over").style.display = "none";
    document.getElementById("you-win").style.display = "none";
    restartButton.style.display = "none";
    gameState = GAME_STATE_PLAYING;
};

let onGhostCollision = () => {
    lives--;
    updateLives(lives);
    if (lives <= 0) {
        gameState = GAME_STATE_GAMEOVER;
        if (score > highScore) {
            highScore = score;
            localStorage.setItem("highScore", highScore);
            updateHighScore(highScore);
        }
        document.getElementById("game-over").style.display = "block";
        restartButton.style.display = "block";
    } else {
        createNewPacman();
        createGhosts();
    }
};

// pausa com tecla "P"
function togglePause() {
    if (gameState === GAME_STATE_PLAYING) {
        gameState = GAME_STATE_PAUSED;
    } else if (gameState === GAME_STATE_PAUSED) {
        gameState = GAME_STATE_PLAYING;
    }
}

// ================== UPDATE & DRAW ==================
let update = () => {
    pacman.moveProcess();

    if (pacman.eat()) {
        score++;
        foodCount--;
        updateScore(score);

        if (foodCount === 0) {
            gameState = GAME_STATE_WIN;
            if (score > highScore) {
                highScore = score;
                localStorage.setItem("highScore", highScore);
                updateHighScore(highScore);
            }
            document.getElementById("you-win").style.display = "block";
            restartButton.style.display = "block";
        }
    }

    updateGhosts();

    if (pacman.checkGhostCollision(ghosts)) {
        onGhostCollision();
    }
};

let drawFoods = () => {
    for (let i = 0; i < map.length; i++) {
        for (let j = 0; j < map[0].length; j++) {
            if (map[i][j] == 2) {
                createRect(
                    j * oneBlockSize + oneBlockSize / 3,
                    i * oneBlockSize + oneBlockSize / 3,
                    oneBlockSize / 3,
                    oneBlockSize / 3,
                    "#FEB897"
                );
            }
        }
    }
};

let draw = () => {
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);
    createRect(0, 0, canvas.width, canvas.height, "black");
    drawWalls();
    drawFoods();
    drawGhosts();
    pacman.draw();
};

let drawWalls = () => {
    for (let i = 0; i < map.length; i++) {
        for (let j = 0; j < map[0].length; j++) {
            if (map[i][j] == 1) {
                createRect(
                    j * oneBlockSize,
                    i * oneBlockSize,
                    oneBlockSize,
                    oneBlockSize,
                    "#342DCA"
                );
                if (j > 0 && map[i][j - 1] == 1) {
                    createRect(
                        j * oneBlockSize,
                        i * oneBlockSize + wallOffset,
                        wallSpaceWidth + wallOffset,
                        wallSpaceWidth,
                        wallInnerColor
                    );
                }

                if (j < map[0].length - 1 && map[i][j + 1] == 1) {
                    createRect(
                        j * oneBlockSize + wallOffset,
                        i * oneBlockSize + wallOffset,
                        wallSpaceWidth + wallOffset,
                        wallSpaceWidth,
                        wallInnerColor
                    );
                }

                if (i < map.length - 1 && map[i + 1][j] == 1) {
                    createRect(
                        j * oneBlockSize + wallOffset,
                        i * oneBlockSize + wallOffset,
                        wallSpaceWidth,
                        wallSpaceWidth + wallOffset,
                        wallInnerColor
                    );
                }

                if (i > 0 && map[i - 1][j] == 1) {
                    createRect(
                        j * oneBlockSize + wallOffset,
                        i * oneBlockSize,
                        wallSpaceWidth,
                        wallSpaceWidth + wallOffset,
                        wallInnerColor
                    );
                }
            }
        }
    }
};

// ================== INICIALIZAÇÃO ==================
document.addEventListener("DOMContentLoaded", () => {
    restartButton = document.getElementById("restart-button");

    updateHighScore(highScore);
    setupCanvasResolution();
    countFood();
    createNewPacman();
    createGhosts();

    if (restartButton) {
        restartButton.addEventListener("click", restartGame);
    }

    window.addEventListener("keydown", (event) => {
        let k = event.keyCode;

        // Pausar com P
        if (event.key === "p" || event.key === "P") {
            togglePause();
            return;
        }

        if (gameState !== GAME_STATE_PLAYING) return;

        setTimeout(() => {
            if (k == 37 || k == 65) {
                pacman.nextDirection = DIRECTION_LEFT;
            } else if (k == 38 || k == 87) {
                pacman.nextDirection = DIRECTION_UP;
            } else if (k == 39 || k == 68) {
                pacman.nextDirection = DIRECTION_RIGHT;
            } else if (k == 40 || k == 83) {
                pacman.nextDirection = DIRECTION_BOTTOM;
            }
        }, 1);
    });

    // iniciar o loop com requestAnimationFrame (mais suave e inteligente)
    requestAnimationFrame(gameLoop);
});
