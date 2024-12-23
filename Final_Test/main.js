"use strict"; // Enables strict mode, which catches common coding errors and improves performance


// Array containing cards image path.
const cardImages = [
    "images/card_1.png", "images/card_2.png", "images/card_3.png",
    "images/card_4.png", "images/card_5.png", "images/card_6.png",
    "images/card_7.png", "images/card_8.png", "images/card_9.png",
    "images/card_10.png", "images/card_11.png", "images/card_12.png",
    "images/card_13.png", "images/card_14.png", "images/card_15.png",
    "images/card_16.png", "images/card_17.png", "images/card_18.png",
    "images/card_19.png", "images/card_20.png", "images/card_21.png",
    "images/card_22.png", "images/card_23.png", "images/card_24.png"
];

// Paths to the back and blank images for the cards
const backImage = "images/back.png";       
const blankImage = "images/blank.png";   

// Variables for tracking the game state.
let tries = 0;                              // Number of attempts made
let currentScore = 0;                       // Player's current score
let isProcessing = false;                   // prevent multiple card clicks 


// Function to shuffle the order,position of cards 
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));  // Random index.
        [array[i], array[j]] = [array[j], array[i]];    // Swap elements.
    }
}

// To setup and start the game when the page finishes loading
document.addEventListener("DOMContentLoaded", () => {
    setupTabs();    // Configure tab switching functionality.
    loadSettings(); // Load user settings.
    startGame();    // Initialize the game.

// Event listener for the "New Game" button.
    document.getElementById("new_game").addEventListener("click", () => {
        localStorage.setItem("player_name", "Not Provided");
        document.getElementById("player-name").textContent = "Not Provided";
        startGame(); // Restart the game.
    });
});

// Function that handles tab-switching in the interface.
function setupTabs() {
    const tabs = document.querySelectorAll(".tab-button");
    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            // Deactivate all tabs and activate the selected one.
            document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
            document.querySelector(`#${tab.dataset.tab}-tab`).classList.add("active");
            tabs.forEach(b => b.classList.remove("active"));
            tab.classList.add("active");
        });
    });
}


// Function that loads user settings from localStorage or set defaults.
function loadSettings() {
    // Retrieve player name from localStorage or set to Not Provided if not found
    let playerName = localStorage.getItem("player_name") || "Not Provided";
    document.getElementById("player-name").textContent = playerName;

    // Retrieve scores from localStorage or use an empty array
    const scores = JSON.parse(localStorage.getItem("scores")) || [];

    // Fetch player's high score or default to 0
    const playerScore = scores.find(score => score.player === playerName)?.score || 0;
    document.getElementById("high-score-value").textContent = `${playerScore}`;

    // Add event listener for settings form submission
    document.getElementById("settings-form").addEventListener("submit", event => {
        event.preventDefault(); // Prevent page refresh.

        // Save the new player name and number of cards
        const playerInput = document.getElementById("player-input").value.trim();
        const numCards = document.getElementById("num-cards").value;

        if (playerInput) {
            localStorage.setItem("player_name", playerInput); // Save player name
            document.getElementById("player-name").textContent = playerInput;
        }

        localStorage.setItem("num_cards", numCards); // Save number of cards.

        alert("Settings saved!");

        document.querySelector("[data-tab='play']").click(); // Switch to Play tab.

        startGame(); // Restart the game with updated settings.
    });
}


// Function that starts the game by resetting variables and displaying the cards.
function startGame() {
    tries = 0; // Reset tries
    currentScore = 0; // Reset current score
    document.getElementById("current-score-value").textContent = "0"; // Reset current score display

    const playerName = localStorage.getItem("player_name") || "Not Provided";
    const scores = JSON.parse(localStorage.getItem("scores")) || [];
    const playerHighScore = scores.find(score => score.player === playerName)?.score || 0;

    // Update high score display for the current player
    document.getElementById("high-score-value").textContent = playerHighScore;

    const numCards = parseInt(localStorage.getItem("num_cards")) || 8;
    const selectedCards = cardImages.slice(0, numCards / 2); // Choose pairs.
    const gameCards = [...selectedCards, ...selectedCards];  // Duplicate pairs.
    shuffleArray(gameCards); // Shuffle the cards.

    const cardsContainer = document.getElementById("cards");
    cardsContainer.innerHTML = ""; // Clear previous cards.
    gameCards.forEach(cardSrc => {
        const card = document.createElement("img");
        card.src = backImage;                                // Initially show the back of the card.
        card.dataset.cardSrc = cardSrc;                     // Store the card's front image.
        card.addEventListener("click", handleCardClick);    // Add click handler.
        cardsContainer.appendChild(card);
    });
}


// Function that handles card click events.
function handleCardClick(event) {
    if (isProcessing) return;  // Prevent clicks while processing a match

    const card = event.target;
    if (card.src.includes(blankImage) || card.classList.contains("flipped")) return;  // Ignore flipped cards

    card.src = card.dataset.cardSrc;  // Flip the card to show the front image
    card.classList.add("flipped");

    const flippedCards = Array.from(document.querySelectorAll(".flipped"));
    if (flippedCards.length === 2) {
        tries++;  // Increment tries
        isProcessing = true;

        setTimeout(() => {
            const [card1, card2] = flippedCards;

            // Check for a match
            if (card1.dataset.cardSrc === card2.dataset.cardSrc) {
                card1.src = blankImage;
                card2.src = blankImage;
            } else {
                card1.src = backImage;
                card2.src = backImage;
            }

            card1.classList.remove("flipped");
            card2.classList.remove("flipped");

            const matchedPairs = Array.from(document.querySelectorAll("#cards img"))
                .filter(card => card.src.includes(blankImage)).length / 2;

            // Update the score based on current matched pairs and tries
            updateCurrentScore(matchedPairs);

            isProcessing = false;

            checkGameOver(); // Check if the game is over
        }, 1000);
    }
}


// Function that checks if all pairs have been matched.
function checkGameOver() {
    const allCards = Array.from(document.querySelectorAll("#cards img"));
    const matchedCards = allCards.filter(card => card.src.includes(blankImage));

    if (matchedCards.length === allCards.length) {
        const totalPairs = matchedCards.length / 2;
        const score = calculateScore(totalPairs, tries); // Calculate score based on matches and tries
        storeScore(score); // Store the score
        alert(`Game over! Your score is: ${score}`); // Notify player of their score
    }
}


// Function that displays the scoreboard with saved scores
function displayScores() {
    const scores = JSON.parse(localStorage.getItem("scores")) || [];
    const scoreboardTable = document.getElementById("scoreboard-table").getElementsByTagName('tbody')[0];
    scoreboardTable.innerHTML = ""; // Clear previous rows

    scores.forEach(score => {
        const row = scoreboardTable.insertRow();
        const playerCell = row.insertCell(0);
        const scoreCell = row.insertCell(1);
        const dateCell = row.insertCell(2);
        const difficultyCell = row.insertCell(3); 

        playerCell.textContent = score.player;          //Dsiplay player name
        scoreCell.textContent = score.score;            //Displays score
        dateCell.textContent = score.date;              // Displays date
        difficultyCell.textContent = score.difficulty; // Add difficulty level (Number of cards)
    });
}


// Function that saves the player's score to localStorage.
function storeScore(score) {
    const playerName = localStorage.getItem("player_name") || "Player";
    const numCards = parseInt(localStorage.getItem("num_cards")) || 8; // Difficulty level
    const currentDate = new Date().toLocaleDateString();

    // Fetch existing scores
    const scores = JSON.parse(localStorage.getItem("scores")) || [];

    // Find the player's existing score
    const playerIndex = scores.findIndex(entry => entry.player === playerName);

    if (playerIndex !== -1) {
        // Player exists, update score if the new one is higher
        if (score > scores[playerIndex].score) {
            scores[playerIndex].score = score;
            scores[playerIndex].date = currentDate; // Update date
            scores[playerIndex].difficulty = `${numCards} cards`; // Update difficulty
        }
    } else {
        // New player, add to the scores
        scores.push({
            player: playerName,
            score: score,
            date: currentDate,
            difficulty: `${numCards} cards`
        });
    }

    // Save back to localStorage
    localStorage.setItem("scores", JSON.stringify(scores));

    // Refresh the scoreboard display
    displayScores();

    // Update high score display for the current player
    document.getElementById("high-score-value").textContent = scores.find(entry => entry.player === playerName).score;
}



// Function that Calculates the player's score based on matches and tries.
function calculateScore(totalPairs, tries) {
    const pointsPerMatch = 20;  // Award 10 points per correct match
    const penaltyPerTry = 2;    // Deduct 2 points for each incorrect attempt

    // Calculate score from correct matches
    const matchesScore = totalPairs * pointsPerMatch;

    // Calculate penalty based on incorrect tries
    const penalty = (tries - totalPairs) * penaltyPerTry;

    // Return the score, making sure it's not negative
    return Math.max(matchesScore - penalty, 0);  // Ensure score is non-negative
}

// Function that  Updates the live score on the game interface.
function updateCurrentScore(totalPairs) {
    const pointsPerMatch = 20; // Points for each correct match
    const penaltyPerTry = 2;   // Points deducted for incorrect tries

    // Calculate the score
    const matchesScore = totalPairs * pointsPerMatch;
    const penalty = Math.max(tries - totalPairs, 0) * penaltyPerTry;

    currentScore = Math.max(matchesScore - penalty, 0); // Ensure score is non-negative
    document.getElementById("current-score-value").textContent = currentScore; // Update display
}


