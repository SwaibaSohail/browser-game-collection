const categories = {
  science: ["atom", "gravity", "evolution", "neuron", "photosynthesis"],
  movies: ["inception", "avatar", "gladiator", "titanic", "matrix"],
  sports: ["football", "cricket", "tennis", "hockey", "swimming"],
  history: ["pyramid", "revolution", "empire", "colosseum", "renaissance"],
};

const hangmanStages = [
  `  _______
 |     |
 |     
 |     
 |     
 |
_|_`,
  `  _______
 |     |
 |     O
 |     
 |     
 |
_|_`,
  `  _______
 |     |
 |     O
 |     |
 |     
 |
_|_`,
  `  _______
 |     |
 |     O
 |    /|
 |     
 |
_|_`,
  `  _______
 |     |
 |     O
 |    /|\\
 |     
 |
_|_`,
  `  _______
 |     |
 |     O
 |    /|\\
 |    / 
 |
_|_`,
  `  _______
 |     |
 |     O
 |    /|\\
 |    / \\
 |
_|_`,
];

let currentWord = "";
let displayWord = "";
let wrongGuesses = 0;
const maxWrong = 6;
let player = "";
let gameEnded = false;
let selectedCategory = "";

function startGame() {
  const usernameInput = document.getElementById("username").value.trim();
  if (!usernameInput) return alert("Please enter a username!");

  player = usernameInput;
  selectedCategory = document.getElementById("category").value;

  // Pick random word from selected category
  currentWord =
    categories[selectedCategory][
      Math.floor(Math.random() * categories[selectedCategory].length)
    ];
  displayWord = "_".repeat(currentWord.length);
  wrongGuesses = 0;
  gameEnded = false;

  document.getElementById("setup").classList.add("hidden");
  document.getElementById("game").classList.remove("hidden");
  document.getElementById("result").classList.add("hidden");

  document.getElementById("current-category").textContent =
    document.getElementById("category").options[
      document.getElementById("category").selectedIndex
    ].text;
  document.getElementById("wrong-count").textContent = `0/${maxWrong}`;
  document.getElementById("turn").textContent = player;

  updateDisplay();
  createLetters();
  updateLeaderboard();
}

function createLetters() {
  const lettersContainer = document.getElementById("letters");
  lettersContainer.innerHTML = "";

  for (let i = 65; i <= 90; i++) {
    const btn = document.createElement("button");
    const letter = String.fromCharCode(i);
    btn.textContent = letter;
    btn.classList.add("letter-btn");
    btn.onclick = () => guessLetter(letter.toLowerCase(), btn);
    lettersContainer.appendChild(btn);
  }
}

function guessLetter(letter, btn) {
  if (gameEnded) return;

  btn.disabled = true;

  if (currentWord.includes(letter)) {
    // Correct guess
    btn.classList.add("correct");
    let newDisplay = "";
    for (let i = 0; i < currentWord.length; i++) {
      if (currentWord[i] === letter) {
        newDisplay += letter;
      } else {
        newDisplay += displayWord[i];
      }
    }
    displayWord = newDisplay;
  } else {
    btn.classList.add("incorrect");
    wrongGuesses++;
    document.getElementById(
      "wrong-count"
    ).textContent = `${wrongGuesses}/${maxWrong}`;
  }

  updateDisplay();

  if (displayWord === currentWord) {
    gameEnded = true;
    showResult(true);
    addScore(player, 10);
    updateLeaderboard();
  } else if (wrongGuesses >= maxWrong) {
    gameEnded = true;
    showResult(false);
    addScore(player, -5);
    updateLeaderboard();
  }
}

function showResult(isWin) {
  const resultDiv = document.getElementById("result");
  resultDiv.classList.remove("hidden");

  if (isWin) {
    resultDiv.textContent = `🎉 Congratulations ${player}! You guessed the word: ${currentWord.toUpperCase()}! +10 points`;
    resultDiv.className = "win";
  } else {
    resultDiv.textContent = `❌ Game Over! The word was: ${currentWord.toUpperCase()}. -5 points`;
    resultDiv.className = "lose";
  }
}

function updateDisplay() {
  document.getElementById("word").textContent = displayWord.split("").join(" ");
  document.getElementById("hangman-drawing").textContent =
    hangmanStages[wrongGuesses];
}

function addScore(username, points) {
  let scores = JSON.parse(localStorage.getItem("hangmanScores")) || {};
  if (!scores[username]) scores[username] = 0;
  scores[username] += points;
  localStorage.setItem("hangmanScores", JSON.stringify(scores));
}

function updateLeaderboard() {
  let scores = JSON.parse(localStorage.getItem("hangmanScores")) || {};
  const scoresList = document.getElementById("scores");
  scoresList.innerHTML = "";

  // Sort scores in descending order
  const sortedScores = Object.entries(scores).sort((a, b) => b[1] - a[1]);

  if (sortedScores.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No scores yet. Play a game!";
    scoresList.appendChild(li);
    return;
  }

  sortedScores.forEach(([name, score], index) => {
    const li = document.createElement("li");

    const rankSpan = document.createElement("span");
    rankSpan.className = "rank";
    rankSpan.textContent = `#${index + 1}`;

    const nameSpan = document.createElement("span");
    nameSpan.textContent = name;

    const scoreSpan = document.createElement("span");
    scoreSpan.className = score >= 0 ? "positive-score" : "negative-score";
    scoreSpan.textContent = `${score} pts`;

    li.appendChild(rankSpan);
    li.appendChild(nameSpan);
    li.appendChild(scoreSpan);

    scoresList.appendChild(li);
  });
}

function restartGame() {
  // Reset the current game with the same word
  displayWord = "_".repeat(currentWord.length);
  wrongGuesses = 0;
  gameEnded = false;

  document.getElementById("result").classList.add("hidden");
  document.getElementById("wrong-count").textContent = `0/${maxWrong}`;

  const letterButtons = document.querySelectorAll(".letter-btn");
  letterButtons.forEach((btn) => {
    btn.disabled = false;
    btn.classList.remove("correct", "incorrect");
  });

  updateDisplay();
}

function newGame() {
  // Go back to setup screen
  document.getElementById("setup").classList.remove("hidden");
  document.getElementById("game").classList.add("hidden");
}

// Initialize the game
document.addEventListener("DOMContentLoaded", function () {
  updateLeaderboard();
});
