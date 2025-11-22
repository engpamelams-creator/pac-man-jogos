let scoreElement;
let highScoreElement;
let livesElement;
let gameOverElement;
let gameWinElement;

document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  const startBtn = document.getElementById("start-button");
  const restartBtn = document.getElementById("restart-button");
  const gameOverEl = document.getElementById("game-over");
  const youWinEl = document.getElementById("you-win");
  const messages = document.querySelector(".game-messages");
  const scoreEl = document.getElementById("score");
  const highScoreEl = document.getElementById("high-score");
  const livesEl = document.getElementById("lives");

  let gameState = "stopped"; // "stopped" | "playing" | "ended"
  let fps = 30;
  let gameInterval = null;

  let score = 0;
  let lives = 3;
  let highScore = parseInt(localStorage.getItem("highScore")) || 0;

  function adjustCanvasSize() {
    const size = Math.min(window.innerWidth * 0.8, 500);
    canvas.width = size;
    canvas.height = size;
  }
  window.addEventListener("resize", adjustCanvasSize);
  adjustCanvasSize();

  function resetGameState() {
    score = 0;
    lives = 3;
    scoreEl.textContent = score;
    livesEl.textContent = lives;
    gameOverEl.style.display = "none";
    youWinEl.style.display = "none";
    messages.style.display = "none";
    canvas.style.filter = "none";
    // redefinir mapa, pacman, fantasmas etc (funções globais em game.js / pacman.js / ghost.js)
    if (typeof originalMap !== "undefined") {
      map = JSON.parse(JSON.stringify(originalMap));
    }
    if (typeof createNewPacman === "function") createNewPacman();
    if (typeof createGhosts === "function") createGhosts();
    if (typeof countFood === "function") countFood();
  }

  function startGame() {
    if (gameState === "stopped" || gameState === "ended") {
      resetGameState();
      gameState = "playing";
      startBtn.disabled = true;
      restartBtn.disabled = false;
      if (gameInterval) clearInterval(gameInterval);
      gameInterval = setInterval(gameLoop, 1000 / fps);
    }
  }

  function endGame(win = false) {
    gameState = "ended";
    if (gameInterval) clearInterval(gameInterval);
    messages.style.display = "flex";
    if (win) {
      youWinEl.style.display = "block";
      canvas.style.filter = "blur(3px)";
    } else {
      gameOverEl.style.display = "block";
      canvas.style.filter = "grayscale(100%)";
    }
    if (score > highScore) {
      highScore = score;
      localStorage.setItem("highScore", highScore);
      highScoreEl.textContent = highScore;
    }
    restartBtn.disabled = false;
    startBtn.disabled = false;
  }

  function updateScore(newScore) {
    score = newScore;
    scoreEl.textContent = score;
  }
  function updateLives(newLives) {
    lives = newLives;
    livesEl.textContent = lives;
  }

  // expor para o escopo global (game.js chama updateScore/updateLives/updateHighScore)
  window.updateScore = updateScore;
  window.updateLives = updateLives;
  window.updateHighScore = (h) => {
    highScore = h;
    highScoreEl.textContent = highScore;
    localStorage.setItem("highScore", highScore);
  };
  window.endGameUI = endGame; // opcional, para encerrar via outros módulos

  startBtn.addEventListener("click", startGame);
  restartBtn.addEventListener("click", () => {
    startGame();
  });

  window.addEventListener("keydown", (event) => {
    if (gameState === "playing") {
      const k = event.keyCode;
      if (typeof pacman !== "undefined") {
        if (k === 37 || k === 65) pacman.nextDirection = DIRECTION_LEFT;
        if (k === 38 || k === 87) pacman.nextDirection = DIRECTION_UP;
        if (k === 39 || k === 68) pacman.nextDirection = DIRECTION_RIGHT;
        if (k === 40 || k === 83) pacman.nextDirection = DIRECTION_BOTTOM;
      }
    }
  });

  function gameLoop() {
    if (gameState !== "playing") return;
    if (typeof update === "function") update();
    if (typeof draw === "function") draw();
    // Detect win/lose a partir do estado gerado em game.js
    // Ex.: se game.js definir gameState global, podemos encerrar via condição externa
    if (typeof window.gameState !== "undefined" && window.gameState === "gameover") {
      endGame(false);
    } else if (typeof window.gameState !== "undefined" && window.gameState === "win") {
      endGame(true);
    }
  }

  highScoreEl.textContent = highScore;
  resetGameState();
});
