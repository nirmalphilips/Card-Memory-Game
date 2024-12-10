"use strict";

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


const backImage = "images/back.png";
const blankImage = "images/blank.png";
let tries = 0;
let currentScore = 0;

document.addEventListener("DOMContentLoaded", () => {
    setupTabs();
    loadSettings();
    startGame();

    // Add listener for the "New Game" button
    document.getElementById("new_game").addEventListener("click", () => {
        // Clear the player name in localStorage and update the player tab
        localStorage.removeItem("player-name");
        document.getElementById("player-name").textContent = "Not Provided"; // Reset to default
        startGame(); // Restart the game
    });
});


function setupTabs() {
    const tabs = document.querySelectorAll(".tab-button");
    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
            document.querySelector(`#${tab.dataset.tab}-tab`).classList.add("active");
            tabs.forEach(b => b.classList.remove("active"));
            tab.classList.add("active");
        });
    });
}

function loadSettings() {
    const playerName = localStorage.getItem("playe-name") || "Not Provided"; // Default to "Not Provided"
    const numCards = localStorage.getItem("num_cards") || 8;

    // Update the player name display
    document.getElementById("player-name").textContent = playerName;
    document.getElementById("high-score-value").textContent = "0"; // Reset high score display

    // Handle the settings form submission
    document.getElementById("settings-form").addEventListener("submit", event => {
        event.preventDefault();

        // Save the new player name and number of cards
        const playerInput = document.getElementById("player-input").value;
        const numCards = document.getElementById("num-cards").value;
        localStorage.setItem("player_name", playerInput);
        localStorage.setItem("num_cards", numCards);

        // Update the player name display immediately
        document.getElementById("player-name").textContent = playerInput;

        alert("Settings saved!");

        // Redirect to Play Game tab
        document.querySelector("[data-tab='play']").click();

        // Restart the game with new settings
        startGame();
    });
}



function startGame() {
    tries = 0; // Reset tries
    currentScore = 0; // Reset current score
    document.getElementById("current-score-value").textContent = "0"; // Reset current score display


    // Clear the player name input field in the settings form
    document.getElementById("player-input").value = "";

    const numCards = parseInt(localStorage.getItem("num_cards")) || 8;
    const selectedCards = cardImages.slice(0, numCards / 2);
    const gameCards = [...selectedCards, ...selectedCards];
    shuffleArray(gameCards);

    const cardsContainer = document.getElementById("cards");
    cardsContainer.innerHTML = "";
    gameCards.forEach(cardSrc => {
        const card = document.createElement("img");
        card.src = backImage;
        card.dataset.cardSrc = cardSrc;
        card.addEventListener("click", handleCardClick);
        cardsContainer.appendChild(card);
    });
}





let isProcessing = false; // Add this variable globally

function handleCardClick(event) {
    if (isProcessing) return;  // Prevent clicks while processing a match

    const card = event.target;
    if (card.src.includes(blankImage) || card.classList.contains("flipped")) return;  // Ignore flipped cards

    card.src = card.dataset.cardSrc;  // Flip the card to show the front image
    card.classList.add("flipped");

    const flippedCards = Array.from(document.querySelectorAll(".flipped"));
    if (flippedCards.length === 2) {
        tries++;  // Increment tries on each flip
        isProcessing = true;

        setTimeout(() => {
            const [card1, card2] = flippedCards;

            // Check for a match
            if (card1.dataset.cardSrc === card2.dataset.cardSrc) {
                card1.src = blankImage;  // If matched, turn the cards blank
                card2.src = blankImage;
            } else {
                card1.src = backImage;   // If not matched, flip the cards back
                card2.src = backImage;
                // Apply penalty for incorrect tries
                updateCurrentScore();   // Update score after wrong attempt
            }

            card1.classList.remove("flipped");  // Reset flipped state
            card2.classList.remove("flipped");

            isProcessing = false;

            // Calculate total pairs matched and update current score
            const totalPairs = Array.from(document.querySelectorAll("#cards img"))
                .filter(card => card.src.includes(blankImage)).length / 2;

            updateCurrentScore(totalPairs);  // Update and display current score

            checkGameOver();  // Check if the game is over
        }, 1000);
    }
}




function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

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


function calculateScore(totalPairs, tries) {
    const pointsPerMatch = 10;  // Award 10 points per correct match
    const penaltyPerTry = 2;    // Deduct 2 points for each incorrect attempt

    // Calculate score from correct matches
    const matchesScore = totalPairs * pointsPerMatch;

    // Calculate penalty based on incorrect tries
    const penalty = (tries - totalPairs) * penaltyPerTry;

    // Return the score, making sure it's not negative
    return Math.max(matchesScore - penalty, 0);  // Ensure score is non-negative
}

function displayScores() {
    const scores = JSON.parse(localStorage.getItem("scores")) || [];
    const scoreboardTable = document.getElementById("scoreboard-table").getElementsByTagName('tbody')[0];
    scoreboardTable.innerHTML = ""; // Clear previous rows

    scores.forEach(score => {
        const row = scoreboardTable.insertRow();
        const playerCell = row.insertCell(0);
        const scoreCell = row.insertCell(1);
        const dateCell = row.insertCell(2);
        const difficultyCell = row.insertCell(3); // New column for difficulty

        playerCell.textContent = score.player;
        scoreCell.textContent = score.score;
        dateCell.textContent = score.date;
        difficultyCell.textContent = score.difficulty; // Add difficulty level
    });
}

function storeScore(score) {
    const playerName = localStorage.getItem("player_name") || "Player";
    const numCards = parseInt(localStorage.getItem("num_cards")) || 8; // Difficulty level
    const currentDate = new Date().toLocaleDateString();

    const scores = JSON.parse(localStorage.getItem("scores")) || [];
    scores.push({ player: playerName, score, date: currentDate, difficulty: `${numCards} cards` });
    localStorage.setItem("scores", JSON.stringify(scores));
    
     // Update High Score
     const highestScore = scores.reduce((max, entry) => Math.max(max, entry.score), 0);
     document.getElementById("high-score-value").textContent = `${highestScore}`; // Display high score
     
    displayScores();
}


function updateCurrentScore(totalPairs) {
    const pointsPerMatch = 10; // Points for each correct match
    const penaltyPerTry = 2;   // Points deducted for each incorrect attempt

    // Calculate score from correct matches
    const matchesScore = totalPairs * pointsPerMatch;

    // Calculate penalty based on incorrect tries
    const penalty = (tries - totalPairs) * penaltyPerTry;

    // Calculate and update current score
    currentScore = Math.max(matchesScore - penalty, 0);  // Ensure score is not negative
    document.getElementById("current-score-value").textContent = currentScore; // Display current score
}


function startGame() {
    tries = 0; // Reset tries
    const numCards = parseInt(localStorage.getItem("num_cards")) || 8;
    const selectedCards = cardImages.slice(0, numCards / 2);
    const gameCards = [...selectedCards, ...selectedCards];
    shuffleArray(gameCards);

    const cardsContainer = document.getElementById("cards");
    cardsContainer.innerHTML = "";
    gameCards.forEach(cardSrc => {
        const card = document.createElement("img");
        card.src = backImage;
        card.dataset.cardSrc = cardSrc;
        card.addEventListener("click", handleCardClick);
        cardsContainer.appendChild(card);
    });
}


if (card1.dataset.cardSrc === card2.dataset.cardSrc) {
    card1.src = blankImage;
    card2.src = blankImage;

    const totalPairs = Array.from(document.querySelectorAll("#cards img"))
        .filter(card => card.src.includes(blankImage)).length / 2;

    updateCurrentScore(totalPairs); // Update and display current score
}


