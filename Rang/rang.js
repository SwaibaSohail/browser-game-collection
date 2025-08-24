// Game state
const gameState = {
  players: [
    { name: "You", score: 0, cards: [], isHuman: true },
    { name: "AI Player 2", score: 0, cards: [], isHuman: false },
    { name: "AI Player 3", score: 0, cards: [], isHuman: false },
    { name: "AI Player 4", score: 0, cards: [], isHuman: false },
  ],
  currentPlayerIndex: 0,
  trumpSuit: "hearts",
  deck: [],
  centerCards: [],
  gamePhase: "waiting", // waiting, dealing, playing, roundEnd, gameEnd
  selectedCard: null,
  leadingSuit: null,
  gameActive: true,
};

// Card data
const suits = ["hearts", "diamonds", "clubs", "spades"];
const values = [
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
  "A",
];
const suitSymbols = {
  hearts: "♥",
  diamonds: "♦",
  clubs: "♣",
  spades: "♠",
};

// Card values for comparison
const cardValues = {
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
  7: 7,
  8: 8,
  9: 9,
  10: 10,
  J: 11,
  Q: 12,
  K: 13,
  A: 14,
};

// DOM Elements
const playerCardsContainer = document.getElementById("player-cards");
const centerCardsContainer = document.getElementById("center-cards");
const playBtn = document.getElementById("play-btn");
const dealBtn = document.getElementById("deal-btn");
const passBtn = document.getElementById("pass-btn");
const restartBtn = document.getElementById("restart-btn");
const rulesBtn = document.getElementById("rules-btn");
const currentTurnEl = document.querySelector(".current-turn");
const trumpSuitEl = document.querySelector(".trump-card");
const gameMessageEl = document.getElementById("game-message");
const scoreEls = [
  document.getElementById("score-1"),
  document.getElementById("score-2"),
  document.getElementById("score-3"),
  document.getElementById("score-4"),
];

// Modal elements
const restartModal = document.getElementById("restart-modal");
const restartConfirm = document.getElementById("restart-confirm");
const restartCancel = document.getElementById("restart-cancel");

// Initialize game
function initGame() {
  createDeck();
  updateUI();
  setupEventListeners();
}

// Create a deck of cards
function createDeck() {
  gameState.deck = [];
  for (let suit of suits) {
    for (let value of values) {
      gameState.deck.push({ suit, value });
    }
  }
}

// Shuffle the deck
function shuffleDeck() {
  for (let i = gameState.deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [gameState.deck[i], gameState.deck[j]] = [
      gameState.deck[j],
      gameState.deck[i],
    ];
  }
}

// Deal cards to players
function dealCards() {
  if (gameState.gamePhase !== "waiting" && gameState.gamePhase !== "roundEnd")
    return;

  gameState.gamePhase = "dealing";
  disableButton(dealBtn);

  // Reset game state
  gameState.centerCards = [];
  gameState.leadingSuit = null;
  centerCardsContainer.innerHTML = "";

  // Shuffle and deal
  shuffleDeck();
  for (let i = 0; i < 4; i++) {
    gameState.players[i].cards = gameState.deck.splice(0, 5);
  }

  // Randomly select trump suit
  gameState.trumpSuit = suits[Math.floor(Math.random() * suits.length)];

  // Randomly select starting player
  gameState.currentPlayerIndex = Math.floor(Math.random() * 4);

  gameState.gamePhase = "playing";
  updateUI();

  // If first player is AI, let them play
  if (!gameState.players[gameState.currentPlayerIndex].isHuman) {
    setTimeout(() => playAI(), 1000);
  }
}

// Play a card for the current player
function playCard(cardIndex) {
  if (gameState.gamePhase !== "playing") return;
  if (
    gameState.currentPlayerIndex !== 0 &&
    !gameState.players[gameState.currentPlayerIndex].isHuman
  )
    return;

  const player = gameState.players[gameState.currentPlayerIndex];
  const card = player.cards[cardIndex];

  // Validate card if it's not the first card of the trick
  if (gameState.centerCards.length > 0) {
    if (card.suit !== gameState.leadingSuit) {
      // Check if player has cards of the leading suit
      const hasLeadingSuit = player.cards.some(
        (c) => c.suit === gameState.leadingSuit
      );
      if (hasLeadingSuit) {
        showMessage("You must follow the leading suit!");
        return;
      }
    }
  } else {
    // First card of the trick sets the leading suit
    gameState.leadingSuit = card.suit;
  }

  // Remove card from player's hand
  player.cards.splice(cardIndex, 1);

  // Add card to center
  gameState.centerCards.push({
    playerIndex: gameState.currentPlayerIndex,
    card: card,
  });

  // Display card in center
  displayCenterCard(card, gameState.currentPlayerIndex);

  // Move to next player
  nextPlayer();
}

// AI player logic
function playAI() {
  if (gameState.gamePhase !== "playing") return;
  if (gameState.players[gameState.currentPlayerIndex].isHuman) return;

  const player = gameState.players[gameState.currentPlayerIndex];
  let cardIndex = 0;

  // Simple AI logic
  if (gameState.centerCards.length === 0) {
    // First player in trick - play a random card
    cardIndex = Math.floor(Math.random() * player.cards.length);
  } else {
    // Not first player - try to follow suit
    const leadingSuit = gameState.leadingSuit;
    const cardsOfSuit = player.cards
      .map((card, index) => (card.suit === leadingSuit ? index : -1))
      .filter((index) => index !== -1);

    if (cardsOfSuit.length > 0) {
      // Play a random card of the leading suit
      cardIndex = cardsOfSuit[Math.floor(Math.random() * cardsOfSuit.length)];
    } else {
      // No cards of leading suit - play a random card
      cardIndex = Math.floor(Math.random() * player.cards.length);
    }
  }

  const card = player.cards[cardIndex];

  // Remove card from player's hand
  player.cards.splice(cardIndex, 1);

  // Add card to center
  gameState.centerCards.push({
    playerIndex: gameState.currentPlayerIndex,
    card: card,
  });

  // Display card in center
  displayCenterCard(card, gameState.currentPlayerIndex);

  // Move to next player after a short delay
  setTimeout(() => nextPlayer(), 1000);
}

// Display a card in the center
function displayCenterCard(card, playerIndex) {
  const cardEl = document.createElement("div");
  cardEl.className = `played-card ${
    card.suit === "hearts" || card.suit === "diamonds" ? "red" : "black"
  }`;
  cardEl.innerHTML = `${card.value}<div class="card-suit">${
    suitSymbols[card.suit]
  }</div>`;

  // Position based on player
  const positions = [
    { bottom: "10px", left: "50%", transform: "translateX(-50%)" }, // Player 1 (bottom)
    { top: "10px", left: "50%", transform: "translateX(-50%)" }, // Player 2 (top)
    { top: "50%", left: "10px", transform: "translateY(-50%)" }, // Player 3 (left)
    { top: "50%", right: "10px", transform: "translateY(-50%)" }, // Player 4 (right)
  ];

  Object.assign(cardEl.style, positions[playerIndex]);
  centerCardsContainer.appendChild(cardEl);
}

// Move to next player
function nextPlayer() {
  // Clear center if trick is complete
  if (gameState.centerCards.length === 4) {
    setTimeout(() => {
      centerCardsContainer.innerHTML = "";

      // Determine trick winner
      const trickWinner = determineTrickWinner();
      gameState.players[trickWinner].score += 10;
      gameState.currentPlayerIndex = trickWinner;

      showMessage(`${gameState.players[trickWinner].name} wins the trick!`);
      updateUI();

      // Check if round is over
      if (gameState.players[0].cards.length === 0) {
        endRound();
      } else if (!gameState.players[gameState.currentPlayerIndex].isHuman) {
        setTimeout(() => playAI(), 1500);
      }

      gameState.centerCards = [];
      gameState.leadingSuit = null;
    }, 1500);
    return;
  }

  // Move to next player
  gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % 4;
  updateUI();

  // If next player is AI, let them play
  if (!gameState.players[gameState.currentPlayerIndex].isHuman) {
    setTimeout(() => playAI(), 1000);
  }
}

// Determine the winner of a trick
function determineTrickWinner() {
  const leadingSuit = gameState.centerCards[0].card.suit;
  let winningIndex = 0;
  let highestValue = 0;

  for (let i = 0; i < gameState.centerCards.length; i++) {
    const playedCard = gameState.centerCards[i].card;
    const cardVal = cardValues[playedCard.value];

    // Check if card is trump
    const isTrump = playedCard.suit === gameState.trumpSuit;
    const isLeadingSuit = playedCard.suit === leadingSuit;

    // Trump cards beat non-trump cards
    if (
      isTrump &&
      (!isTrumpCard(gameState.centerCards[winningIndex].card) ||
        cardVal > highestValue)
    ) {
      winningIndex = i;
      highestValue = cardVal;
    }
    // If same suit, higher value wins
    else if (
      isLeadingSuit &&
      !isTrumpCard(gameState.centerCards[winningIndex].card)
    ) {
      if (cardVal > highestValue) {
        winningIndex = i;
        highestValue = cardVal;
      }
    }
  }

  return gameState.centerCards[winningIndex].playerIndex;
}

// Check if a card is a trump card
function isTrumpCard(card) {
  return card.suit === gameState.trumpSuit;
}

// End the current round
function endRound() {
  gameState.gamePhase = "roundEnd";

  // Determine round winner
  let maxScore = -1;
  let roundWinners = [];

  // Find the highest score
  for (let i = 0; i < 4; i++) {
    if (gameState.players[i].score > maxScore) {
      maxScore = gameState.players[i].score;
    }
  }

  // Find all players with the highest score
  for (let i = 0; i < 4; i++) {
    if (gameState.players[i].score === maxScore) {
      roundWinners.push(i);
    }
  }

  // If there's a tie, handle it appropriately
  if (roundWinners.length > 1) {
    // In case of a tie, the player with the most tricks wins
    // For simplicity, we'll just pick the first one for now
    // You could implement more complex tie-breaking logic here
    showMessage(
      `It's a tie between ${roundWinners
        .map((i) => gameState.players[i].name)
        .join(" and ")} with ${maxScore} points!`
    );
  } else {
    showMessage(
      `${
        gameState.players[roundWinners[0]].name
      } wins the round with ${maxScore} points!`
    );
  }

  enableButton(dealBtn);
}

// Update the UI based on game state
function updateUI() {
  // Update player names and scores
  document.querySelectorAll(".player").forEach((el, i) => {
    el.classList.toggle("active", i === gameState.currentPlayerIndex);
    el.querySelector(".player-name").textContent = gameState.players[i].name;
  });

  // Update scores
  for (let i = 0; i < 4; i++) {
    scoreEls[i].textContent = gameState.players[i].score;
  }

  // Update current turn
  currentTurnEl.textContent = gameState.players[gameState.currentPlayerIndex]
    .isHuman
    ? "Your turn to play"
    : `${gameState.players[gameState.currentPlayerIndex].name}'s turn`;

  // Update trump suit
  trumpSuitEl.textContent = suitSymbols[gameState.trumpSuit];
  trumpSuitEl.className =
    "trump-card " +
    (gameState.trumpSuit === "hearts" || gameState.trumpSuit === "diamonds"
      ? "red"
      : "black");

  // Update player cards
  updatePlayerCards();

  // Update button states
  updateButtonStates();
}

// Update the player's cards display
function updatePlayerCards() {
  playerCardsContainer.innerHTML = "";

  gameState.players[0].cards.forEach((card, index) => {
    const cardEl = document.createElement("div");
    cardEl.className = `card selectable ${
      card.suit === "hearts" || card.suit === "diamonds" ? "red" : "black"
    }`;
    cardEl.innerHTML = `${card.value}<div class="card-suit">${
      suitSymbols[card.suit]
    }</div>`;
    cardEl.dataset.index = index;

    cardEl.addEventListener("click", () => {
      if (
        gameState.currentPlayerIndex === 0 &&
        gameState.gamePhase === "playing"
      ) {
        document
          .querySelectorAll(".card")
          .forEach((c) => (c.style.border = ""));
        cardEl.style.border = "3px solid #fdbb2d";
        gameState.selectedCard = index;
        enableButton(playBtn);
      }
    });

    playerCardsContainer.appendChild(cardEl);
  });
}

// Update button states based on game phase
function updateButtonStates() {
  if (gameState.gamePhase === "waiting" || gameState.gamePhase === "roundEnd") {
    enableButton(dealBtn);
    disableButton(playBtn);
    disableButton(passBtn);
  } else if (gameState.gamePhase === "playing") {
    disableButton(dealBtn);

    if (gameState.currentPlayerIndex === 0) {
      enableButton(passBtn);

      if (gameState.selectedCard !== null) {
        enableButton(playBtn);
      } else {
        disableButton(playBtn);
      }
    } else {
      disableButton(playBtn);
      disableButton(passBtn);
    }
  }
}

// Show a message to the player
function showMessage(message) {
  gameMessageEl.textContent = message;
  gameMessageEl.style.display = "block";

  setTimeout(() => {
    gameMessageEl.style.display = "none";
  }, 3000);
}

// Restart the game
function restartGame() {
  // Reset game state
  gameState.players.forEach((player) => {
    player.score = 0;
    player.cards = [];
  });
  gameState.currentPlayerIndex = 0;
  gameState.trumpSuit = "hearts";
  gameState.centerCards = [];
  gameState.gamePhase = "waiting";
  gameState.selectedCard = null;
  gameState.leadingSuit = null;
  gameState.gameActive = true;

  createDeck();
  centerCardsContainer.innerHTML = "";
  updateUI();
  showMessage("Game restarted!");

  // Hide restart modal
  restartModal.style.display = "none";
}

// Helper functions for button states
function enableButton(button) {
  button.disabled = false;
}

function disableButton(button) {
  button.disabled = true;
}

// Set up event listeners
function setupEventListeners() {
  // Deal cards button
  dealBtn.addEventListener("click", dealCards);

  // Play card button
  playBtn.addEventListener("click", () => {
    if (gameState.selectedCard !== null) {
      playCard(gameState.selectedCard);
      gameState.selectedCard = null;
      disableButton(playBtn);
    }
  });

  // Pass button
  passBtn.addEventListener("click", () => {
    showMessage("You passed your turn");
    nextPlayer();
  });

  // Restart button
  restartBtn.addEventListener("click", () => {
    restartModal.style.display = "flex";
  });

  // Restart confirmation
  restartConfirm.addEventListener("click", restartGame);

  // Restart cancellation
  restartCancel.addEventListener("click", () => {
    restartModal.style.display = "none";
  });

  // Rules button
  rulesBtn.addEventListener("click", () => {
    alert(
      "RANG Game Rules:\n\n" +
        "1. RANG is a trick-taking card game for 4 players\n" +
        "2. Each player is dealt 5 cards\n" +
        "3. Players take turns playing cards following suit if possible\n" +
        "4. The highest card of the leading suit wins the trick\n" +
        "5. Trump cards beat all other suits\n" +
        "6. The player with the most points at the end wins!"
    );
  });
}

// Initialize the game when page loads
window.addEventListener("load", initGame);
