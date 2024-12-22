const items = {
    wolf: { img: "image/волк.png", eaten: ["goat"] },
    goat: { img: "image/Коз.png", eaten: ["cabbage"] },
    cabbage: { img: "image/капуста.png", eaten: [] },
    boat: { img: "image/лодка.png", boatCapacity: 1 },
};

let leftBank = ["wolf", "goat", "cabbage"];
let rightBank = [];
let boat = [];
let boatPosition = "left";
let moves = 0;
let gameOver = false;

const leftBankDiv = document.getElementById("left-bank");
const rightBankDiv = document.getElementById("right-bank");
const boatDiv = document.getElementById("boat");
const movesDiv = document.getElementById("moves");
const resetButton = document.getElementById("reset-button");
const messageDiv = document.getElementById("message");
const gameOverDiv = document.getElementById("game-over");
const startScreen = document.getElementById("start-screen");
const instructionsScreen = document.getElementById("instructions-screen");
const gameContainer = document.getElementById("game-container");
const startButton = document.getElementById("start-button");
const startGameButton = document.getElementById("start-game-button");
const lossMessageOverlay = document.getElementById("loss-message-overlay");
const lossMessage = document.getElementById("loss-message");
const lossOkButton = document.getElementById("loss-ok-button");
const winMessageOverlay = document.getElementById("win-message-overlay");
const winMessage = document.getElementById("win-message");
const backgroundMusic = document.getElementById("background-music");
const musicToggleButton = document.getElementById("music-toggle-button");
const game = document.getElementById("game");

let isMusicPlaying = false;
let timerInterval;
let startTime;
const timerDiv = document.getElementById("timer");
const leaderboardContainer = document.getElementById("leaderboard-container");
const leaderboardTableBody = document.getElementById("leaderboard-body");
const leaderboardToggleButton = document.getElementById("leaderboard-toggle-button");
const submitScoreButton = document.getElementById("submit-score-button");
const backToStartButton = document.getElementById("back-to-start-button");

let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];

document.addEventListener("DOMContentLoaded", () => {
    const leaderboardFromStartButton = document.getElementById("leaderboard-from-start");
    const backToGameButton = document.getElementById("back-to-game");

    const leaderboardContainer = document.getElementById("leaderboard-container");
    const startScreen = document.getElementById("start-screen");
    const gameContainer = document.getElementById("game-container");

    function showLeaderboard() {
        leaderboardContainer.style.display = "block";
        startScreen.style.display = "none";
        gameContainer.style.display = "none";
        updateLeaderboard();
    }

    function backToMenu() {
        leaderboardContainer.style.display = "none";
        if (gameContainer.style.display === "flex") {
            gameContainer.style.display = "flex";
        } else {
            startScreen.style.display = "flex";
        }
    }

    if (leaderboardFromStartButton) {
        leaderboardFromStartButton.addEventListener("click", showLeaderboard);
    }
    if (backToGameButton) {
        backToGameButton.addEventListener("click", backToMenu);
    }
});

function displayGameState() {
    if (!leftBankDiv || !rightBankDiv || !boatDiv || !movesDiv) return;
    leftBankDiv.innerHTML = "";
    rightBankDiv.innerHTML = "";
    boatDiv.innerHTML = "";
    movesDiv.textContent = `Ходы: ${moves}`;

    boatDiv.innerHTML = `<img src="${items.boat.img}" alt="Лодка" style="cursor: pointer;">`;

    boat.forEach((item) => {
        const img = document.createElement("img");
        img.src = items[item].img;
        img.alt = item;
        img.dataset.item = item;
        img.style.cursor = "pointer";
        img.classList.add("character");
        img.classList.add("onBoat");

        img.classList.add(`${item}-img`);

        img.addEventListener("click", () => {
            moveItem(item, "boat");
        });
        boatDiv.appendChild(img);
    });

    updateBank(leftBank, leftBankDiv, "left");
    updateBank(rightBank, rightBankDiv, "right");

    if (boatPosition === "left") {
        boatDiv.classList.remove("right");
        boatDiv.style.left = "280px";
        boatDiv.style.transform = "scaleX(1)";
    } else {
        boatDiv.classList.add("right");
        boatDiv.style.left = "840px";
        boatDiv.style.transform = "scaleX(-1)";
    }
}

function updateBank(bank, bankDiv, bankName) {
    if (!bankDiv) return;
    bank.forEach((item) => {
        const img = document.createElement("img");
        img.src = items[item].img;
        img.alt = item;
        img.dataset.item = item;
        img.classList.add("character");
        img.style.cursor = "pointer";
        img.addEventListener("click", () => {
            moveItem(item, bankName);
        });
        bankDiv.appendChild(img);
    });
}

boatDiv.addEventListener("click", function () {
    if (!gameOver) {
        boatPosition = boatPosition === "left" ? "right" : "left";
        displayGameState();
    }
});

function moveItem(item, source) {
    if (gameOver) return;
    if (boat.length >= 2 && source !== "boat") return;
    if (source === "boat" && !boat.includes(item)) return;

    moves++;
    if (movesDiv) {
        movesDiv.textContent = `Ходы: ${moves}`;
    }

    if (source === "left") {
        leftBank = leftBank.filter((i) => i !== item);
        boat.push(item);
    } else if (source === "right") {
        rightBank = rightBank.filter((i) => i !== item);
        boat.push(item);
    } else if (source === "boat") {
        boat = boat.filter((i) => i !== item);
        if (boatPosition === "left") {
            leftBank.push(item);
        } else {
            rightBank.push(item);
        }
    }
    displayGameState();
    if (!gameOver) checkWin();
    if (!gameOver) checkLose();
}

function startTimer() {
    stopTimer();

    startTime = Date.now();
    timerInterval = setInterval(() => {
        const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
        const minutes = Math.floor(elapsedTime / 60)
            .toString()
            .padStart(2, "0");
        const seconds = (elapsedTime % 60).toString().padStart(2, "0");
        if (timerDiv) {
            timerDiv.textContent = `${minutes}:${seconds}`;
        }
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
}
function checkWin() {
    if (rightBank.length === 3) {
        stopTimer();
        winMessage.innerHTML = `<img src="image/we-win.gif" alt="We Win">
           <input type="text" id="playerName" placeholder="Введите ваше имя">`;
        winMessageOverlay.style.display = "flex";
        gameOver = true;
    }
}
function checkLose() {
    const onLeft = leftBank;
    const onRight = rightBank;
    let loseMessage = "";
    const checkBank = (bank) => {
        if (bank.includes("wolf") && bank.includes("goat")) {
            loseMessage = "Волк съел козу!";
            return true;
        }
        if (bank.includes("goat") && bank.includes("cabbage")) {
            loseMessage = "Коза съела капусту!";
            return true;
        }
        return false;
    };

    if (checkBank(onLeft) || checkBank(onRight)) {
        if (lossMessage) {
            lossMessage.textContent = loseMessage;
        }
        if (lossMessageOverlay) {
            lossMessageOverlay.style.display = "flex";
        }
        gameOver = true;
        return true;
    }
    return false;
}

function resetGame() {
    leftBank = ["wolf", "goat", "cabbage"];
    rightBank = [];
    boat = [];
    boatPosition = "left";
    moves = 0;
    gameOver = false;
    if (gameOverDiv) {
        gameOverDiv.style.display = "none";
    }
    if (winMessageOverlay) {
        winMessageOverlay.style.display = "none";
    }
    if (messageDiv) {
        messageDiv.textContent = "";
    }
    displayGameState();
    startTimer();
}
submitScoreButton.addEventListener("click", function () {
    const playerNameInput = document.getElementById("playerName");
    const playerName = playerNameInput.value.trim();

    if (playerName) {
        const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
        const score = {
            name: playerName,
            time: elapsedTime,
            moves: moves,
            date: new Date().toLocaleDateString(),
        };
        leaderboard.push(score);
        leaderboard.sort((a, b) => a.time - b.time);
        localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
        winMessageOverlay.style.display = "none";
        showLeaderboard();
    } else {
        alert("Пожалуйста, введите свое имя!");
    }
});

function showLeaderboard() {
    leaderboardTableBody.innerHTML = "";

    leaderboard.forEach((entry, index) => {
        const row = document.createElement("tr");

        const number = document.createElement("td");
        number.textContent = index + 1;
        row.appendChild(number);

        const name = document.createElement("td");
        name.textContent = entry.name;
        row.appendChild(name);

        const time = document.createElement("td");
        time.textContent = entry.time;
        row.appendChild(time);

        const moves = document.createElement("td");
        moves.textContent = entry.moves;
        row.appendChild(moves);

        const date = document.createElement("td");
        date.textContent = entry.date;
        row.appendChild(date);
        leaderboardTableBody.appendChild(row);
    });
}
leaderboardToggleButton.addEventListener("click", () => {
    leaderboardContainer.style.display = leaderboardContainer.style.display === "none" ? "block" : "none";
    game.style.display = game.style.display === "none" ? "flex" : "none";
});
backToStartButton.addEventListener("click", () => {
    gameContainer.style.display = "none";
    startScreen.style.display = "flex";
    resetGame();
});

startButton.addEventListener("click", () => {
    startScreen.style.display = "none";
    instructionsScreen.style.display = "block";
});

startGameButton.addEventListener("click", () => {
    instructionsScreen.style.display = "none";
    gameContainer.style.display = "flex";
    displayGameState();
    backgroundMusic.play();
    isMusicPlaying = true;
    musicToggleButton.style.backgroundImage = 'url("image/-i.jpg")';
    startTimer();
});

resetButton.addEventListener("click", () => {
    stopTimer();
    resetGame();
});

musicToggleButton.addEventListener("click", () => {
    if (isMusicPlaying) {
        backgroundMusic.pause();
        isMusicPlaying = false;
        musicToggleButton.style.backgroundImage = 'url("image/i.webp")';
    } else {
        backgroundMusic.play();
        isMusicPlaying = true;
        musicToggleButton.style.backgroundImage = 'url("image/-i.jpg")';
    }
});
document.addEventListener("DOMContentLoaded", () => {
    if (gameOverDiv) {
        gameOverDiv.innerHTML = `
            <div class="game-over-container">
                <img src="image/game-over-game.gif" alt="Game Over">
                <button id="restart-button" class="restart-button">Начать сначала</button>
            </div>`;
        const restartButton = document.getElementById("restart-button");
        restartButton.addEventListener("click", resetGame);
    }

    if (lossOkButton) {
        lossOkButton.addEventListener("click", function () {
            if (lossMessageOverlay) {
                lossMessageOverlay.style.display = "none";
            }
            if (gameOverDiv) {
                gameOverDiv.style.display = "block";
            }
        });
    }

    showLeaderboard();
});
