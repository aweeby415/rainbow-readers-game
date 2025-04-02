// ================ WORDS.JS SECTION ================
console.log("Loading combined JavaScript file...");
// Add this at the beginning of your main JavaScript file to catch errors
window.addEventListener('error', function(e) {
  console.log('Error caught:', e.message, 'at', e.filename, 'line', e.lineno);
});

// Make sure the DOM is fully loaded before initializing the game
document.addEventListener('DOMContentLoaded', function() {
  // Initialize your game here
  initGame();
});

// Basic game initialization function (adjust based on your existing code)
function initGame() {
  try {
    // Your existing initialization code
    console.log('Game initialized successfully');
  } catch (error) {
    console.error('Failed to initialize game:', error);
  }
}
// Rainbow Readers Sight Word Levels
const WORD_LEVELS = {
    red: [
        "I",
        "can",
        "the",
        "we",
        "see"
    ],
    orange: [
        "a",
        "like",
        "to",
        "and",
        "go"
    ],
    yellow: [
        "you",
        "do",
        "my",
        "are",
        "he"
    ],
    green: [
        "with",
        "is",
        "little",
        "she",
        "was"
    ],
    blue: [
        "for",
        "have",
        "they",
        "of",
        "said"
    ],
    purple: [
        "want",
        "here",
        "me",
        "this",
        "what"
    ],
    pink: [
        "help",
        "too",
        "play",
        "has",
        "where"
    ],
    gold: [
        "look",
        "who",
        "good",
        "come",
        "does"
    ]
};

// Define the color properties for each level
const LEVEL_COLORS = {
    red: {
        name: "RED",
        primary: "#FF0000",
        gradient: ["#FF9999", "#FF4444", "#CC0000"],
        textColor: "#FFFFFF"
    },
    orange: {
        name: "ORANGE",
        primary: "#FF8800",
        gradient: ["#FFBB77", "#FF8800", "#EE7700"],
        textColor: "#FFFFFF"
    },
    yellow: {
        name: "YELLOW",
        primary: "#FFCC00",
        gradient: ["#FFEE88", "#FFCC00", "#EEBB00"],
        textColor: "#333333"
    },
    green: {
        name: "GREEN",
        primary: "#33CC33",
        gradient: ["#99EE99", "#33CC33", "#22BB22"],
        textColor: "#FFFFFF"
    },
    blue: {
        name: "BLUE",
        primary: "#3399FF",
        gradient: ["#99CCFF", "#3399FF", "#2288EE"],
        textColor: "#FFFFFF"
    },
    purple: {
        name: "PURPLE",
        primary: "#9966FF",
        gradient: ["#CC99FF", "#9966FF", "#8855EE"],
        textColor: "#FFFFFF"
    },
    pink: {
        name: "PINK",
        primary: "#FF66CC",
        gradient: ["#FFAADD", "#FF66CC", "#EE55BB"],
        textColor: "#FFFFFF"
    },
    gold: {
        name: "GOLD",
        primary: "#FFCC00",
        gradient: ["#FFEE88", "#FFCC00", "#FFBB00"],
        textColor: "#333333"
    }
};

// Order of the levels
const LEVEL_ORDER = ["red", "orange", "yellow", "green", "blue", "purple", "pink", "gold"];

console.log("Words data loaded successfully!");

// ================ GAME.JS SECTION ================

// DOM Elements
const gameCanvas = document.getElementById('game-canvas');
const ctx = gameCanvas.getContext('2d');
const wordDisplay = document.getElementById('word-display');
const revealedWord = document.getElementById('revealed-word');
const correctBtn = document.getElementById('correct-btn');
const tryAgainBtn = document.getElementById('try-again-btn');
const startBtn = document.getElementById('start-btn');
const helpBtn = document.getElementById('help-btn');
const scoreDisplay = document.getElementById('score');
const currentLevelText = document.getElementById('current-level-text');
const helpModal = document.getElementById('help-modal');
const celebrationModal = document.getElementById('celebration-modal');
const goldCelebrationModal = document.getElementById('gold-celebration-modal');
const celebrationMessage = document.getElementById('celebration-message');
const continueBtn = document.getElementById('continue-btn');
const playAgainBtn = document.getElementById('play-again-btn');
const closeButton = document.querySelector('.close-button');
const rainbowLayers = Array.from(document.querySelectorAll('.rainbow-layer'));
const potOfGold = document.getElementById('pot-of-gold');
const rainbowAnimation = document.getElementById('rainbow-animation');
const celebrationCoins = document.getElementById('celebration-coins');
const potAnimation = document.getElementById('pot-animation');
const allWordsContainer = document.getElementById('all-words');

// Game state
let currentLevel = 'red';
let currentLevelIndex = 0;
let mastered = {
    red: [],
    orange: [],
    yellow: [],
    green: [],
    blue: [],
    purple: [],
    pink: [],
    gold: []
};
let currentWords = [];
let activeWord = null;
let score = 0;
let balloons = [];
let gameRunning = false;
let animationFrameId = null;
let lastBalloonSpawn = 0;
let spawnInterval = 4000; // Time between balloon spawns (ms)
let canvasWidth, canvasHeight;

// Sound effects - create empty Audio objects first, then assign sources
// Sound effects - create empty Audio objects first, then assign sources
const popSound = new Audio();
const correctSound = new Audio();
const wrongSound = new Audio();
const levelUpSound = new Audio();
const finishSound = new Audio();

// Set sound sources
try {
    popSound.src = 'sounds/pop.mp3';
    correctSound.src = 'sounds/correct.mp3';
    wrongSound.src = 'sounds/wrong.mp3';
    levelUpSound.src = 'sounds/level-up.mp3';
    finishSound.src = 'sounds/gold-complete.mp3';
    console.log("Sound files assigned");
} catch (error) {
    console.error("Error loading sounds:", error);
}

// Initialize game when window loads
window.addEventListener('load', initGame);
window.addEventListener('resize', setCanvasSize);

// Button event listeners
startBtn.addEventListener('click', startGame);
helpBtn.addEventListener('click', showHelp);
closeButton.addEventListener('click', hideHelp);
correctBtn.addEventListener('click', handleCorrect);
tryAgainBtn.addEventListener('click', handleTryAgain);
continueBtn.addEventListener('click', continuePlaying);
playAgainBtn.addEventListener('click', resetGame);

// Touch and mouse events for canvas
gameCanvas.addEventListener('click', handleCanvasClick);
gameCanvas.addEventListener('touchstart', handleCanvasTouch);

// Initialize the game
function initGame() {
    console.log("Initializing game...");
    setCanvasSize();
    loadGameProgress();
    updateRainbowProgress();
    updateScoreDisplay();
    updateLevelIndicator();
    console.log("Game initialized");
}

// Set canvas size
function setCanvasSize() {
    const gameArea = document.querySelector('.game-area');
    canvasWidth = gameArea.clientWidth;
    canvasHeight = gameArea.clientHeight;
    
    gameCanvas.width = canvasWidth;
    gameCanvas.height = canvasHeight;
    
    // Redraw if game is running
    if (gameRunning) {
        drawGame();
    }
}

// Start the game
function startGame() {
    console.log("Starting game...");
    startBtn.classList.add('hidden');
    correctBtn.classList.add('hidden');
    tryAgainBtn.classList.add('hidden');
    
    resetCurrentLevel();
    gameRunning = true;
    lastBalloonSpawn = Date.now();
    
    // Start game loop
    gameLoop();
}

// Game loop
function gameLoop() {
    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // Check if we need to spawn a new balloon
    const currentTime = Date.now();
    if (currentTime - lastBalloonSpawn > spawnInterval && balloons.length < 3 && currentWords.length > 0) {
        spawnBalloon();
        lastBalloonSpawn = currentTime;
    }
    
    // Update and draw balloons
    updateBalloons();
    drawGame();
    
    // Continue the game loop
    animationFrameId = requestAnimationFrame(gameLoop);
}

// Reset current level words
function resetCurrentLevel() {
    // Get all words for current level that aren't mastered yet
    const allLevelWords = WORD_LEVELS[currentLevel];
    const masteredWords = mastered[currentLevel];
    
    currentWords = allLevelWords.filter(word => !masteredWords.includes(word));
    
    // If all words are mastered, player should move to next level
    if (currentWords.length === 0 && currentLevelIndex < LEVEL_ORDER.length - 1) {
        showLevelCompleteCelebration();
    } else if (currentWords.length === 0 && currentLevelIndex === LEVEL_ORDER.length - 1) {
        // All levels complete!
        showGoldCompleteCelebration();
    }
    
    // Clear any existing balloons
    balloons = [];
}

// Balloon class
class Balloon {
    constructor(word, color) {
        this.word = word;
        this.color = color;
        this.radius = 45;
        this.x = Math.random() * (canvasWidth - this.radius * 2) + this.radius;
        this.y = canvasHeight + this.radius;
        this.speed = 0.5 + Math.random() * 0.3; // Random speed between 0.5 and 0.8
        this.popped = false;
        this.highlight = {
            x: -15,
            y: -10,
            radius: 15
        };
        this.stringWave = 0;
        this.stringWaveSpeed = 0.05;
    }
    
    update() {
        if (this.popped) return;
        
        // Move balloon upward
        this.y -= this.speed;
        
        // Animate string wave
        this.stringWave += this.stringWaveSpeed;
        
        // If balloon goes off-screen, reset position
        if (this.y < -this.radius) {
            this.x = Math.random() * (canvasWidth - this.radius * 2) + this.radius;
            this.y = canvasHeight + this.radius;
        }
    }
    
    draw() {
        if (this.popped) return;
        
        // Draw balloon
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        
        // Create gradient for balloon
        const gradient = ctx.createRadialGradient(
            this.x - 10, this.y - 10, 5,
            this.x, this.y, this.radius
        );
        
        // Get colors from level settings
        const colors = LEVEL_COLORS[currentLevel].gradient;
        gradient.addColorStop(0, colors[0]);
        gradient.addColorStop(0.7, colors[1]);
        gradient.addColorStop(1, colors[2]);
        
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.strokeStyle = colors[1];
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw highlight
        ctx.beginPath();
        ctx.arc(this.x + this.highlight.x, this.y + this.highlight.y, this.highlight.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fill();
        
        // Draw smaller highlight
        ctx.beginPath();
        ctx.arc(this.x + this.highlight.x + 5, this.y + this.highlight.y + 5, 5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.fill();
        
        // Draw string with wave
        ctx.beginPath();
        const stringStartY = this.y + this.radius;
        const stringLength = 30;
        const waveAmplitude = 3;
        const waveOffset = Math.sin(this.stringWave) * waveAmplitude;
        
        ctx.moveTo(this.x, stringStartY);
        ctx.bezierCurveTo(
            this.x + waveOffset, stringStartY + stringLength * 0.3,
            this.x - waveOffset, stringStartY + stringLength * 0.6,
            this.x, stringStartY + stringLength
        );
        
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 2;
        ctx.setLineDash([2, 2]);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Draw word
        ctx.font = '28px "Comic Neue", cursive';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = LEVEL_COLORS[currentLevel].textColor;
        ctx.fillText(this.word, this.x, this.y);
    }
    
    isClicked(x, y) {
        // Check if click/tap is inside balloon
        const distance = Math.sqrt((x - this.x) ** 2 + (y - this.y) ** 2);
        return distance <= this.radius;
    }
    
    pop() {
        this.popped = true;
        try {
            popSound.play().catch(err => console.log("Sound play error:", err));
        } catch (e) {
            console.log("Pop sound error:", e);
        }
        activeWord = this.word;
        
        // Show word display
        wordDisplay.classList.remove('hidden');
        revealedWord.textContent = this.word;
        
        // Show verification buttons
        correctBtn.classList.remove('hidden');
        tryAgainBtn.classList.remove('hidden');
        
        // Pause game loop
        cancelAnimationFrame(animationFrameId);
        gameRunning = false;
    }
}

// Spawn a new balloon
function spawnBalloon() {
    if (currentWords.length === 0) return;
    
    // Get a random word from current level that's not already a balloon
    const availableWords = currentWords.filter(word => 
        !balloons.some(balloon => balloon.word === word)
    );
    
    if (availableWords.length === 0) return;
    
    const randomIndex = Math.floor(Math.random() * availableWords.length);
    const word = availableWords[randomIndex];
    
    balloons.push(new Balloon(word, currentLevel));
}

// Update all balloons
function updateBalloons() {
    balloons.forEach(balloon => balloon.update());
}

// Draw the game
function drawGame() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // Draw all balloons
    balloons.forEach(balloon => balloon.draw());
}

// Handle canvas click
function handleCanvasClick(e) {
    if (!gameRunning) return;
    
    const rect = gameCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    checkBalloonClick(x, y);
}

// Handle canvas touch
function handleCanvasTouch(e) {
    if (!gameRunning) return;
    
    e.preventDefault();
    
    const rect = gameCanvas.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const y = e.touches[0].clientY - rect.top;
    
    checkBalloonClick(x, y);
}

// Check if a balloon was clicked
function checkBalloonClick(x, y) {
    for (let i = 0; i < balloons.length; i++) {
        if (balloons[i].isClicked(x, y)) {
            balloons[i].pop();
            return;
        }
    }
}

// Handle correct answer
function handleCorrect() {
    if (!activeWord) return;
    
    try {
        correctSound.play().catch(err => console.log("Sound play error:", err));
    } catch (e) {
        console.log("Correct sound error:", e);
    }
    
    // Add word to mastered list
    if (!mastered[currentLevel].includes(activeWord)) {
        mastered[currentLevel].push(activeWord);
    }
    
    // Remove from current words list
    const index = currentWords.indexOf(activeWord);
    if (index !== -1) {
        currentWords.splice(index, 1);
    }
    
    // Remove from balloons array
    balloons = balloons.filter(balloon => !balloon.popped);
    
    // Update score
    score += 10;
    updateScoreDisplay();
    
    // Save progress
    saveGameProgress();
    
    // Hide word display and buttons
    resetWordDisplay();
    
    // Check if level is complete
    if (currentWords.length === 0) {
        if (currentLevelIndex < LEVEL_ORDER.length - 1) {
            showLevelCompleteCelebration();
        } else {
            showGoldCompleteCelebration();
        }
    } else {
        // Continue game
        resumeGame();
    }
}

// Handle incorrect answer
function handleTryAgain() {
    if (!activeWord) return;
    
    try {
        wrongSound.play().catch(err => console.log("Sound play error:", err));
    } catch (e) {
        console.log("Wrong sound error:", e);
    }
    
    // Return word to pool if it was removed
    if (!currentWords.includes(activeWord)) {
        currentWords.push(activeWord);
    }
    
    // Remove from balloons array
    balloons = balloons.filter(balloon => !balloon.popped);
    
    // Hide word display and buttons
    resetWordDisplay();
    
    // Continue game
    resumeGame();
}

// Reset word display
function resetWordDisplay() {
    wordDisplay.classList.add('hidden');
    revealedWord.textContent = '';
    correctBtn.classList.add('hidden');
    tryAgainBtn.classList.add('hidden');
    
    activeWord = null;
}

// Resume game after pause
function resumeGame() {
    gameRunning = true;
    lastBalloonSpawn = Date.now() - spawnInterval; // Spawn a new balloon immediately
    gameLoop();
}

// Show help modal
function showHelp() {
    helpModal.classList.remove('hidden');
}

// Hide help modal
function hideHelp() {
    helpModal.classList.add('hidden');
}

// Show level complete celebration
function showLevelCompleteCelebration() {
    try {
        levelUpSound.play().catch(err => console.log("Sound play error:", err));
    } catch (e) {
        console.log("Level up sound error:", e);
    }
    
    // Update celebration message
    const currentLevelName = LEVEL_COLORS[currentLevel].name;
    const nextLevelIndex = currentLevelIndex + 1;
    const nextLevel = LEVEL_ORDER[nextLevelIndex];
    const nextLevelName = LEVEL_COLORS[nextLevel].name;
    
    celebrationMessage.innerHTML = `
        <p>You completed the ${currentLevelName} level!</p>
        <p>Now moving to ${nextLevelName} level.</p>
    `;
    
    // Create rainbow animation
    createRainbowCelebration(currentLevelIndex);
    
    // Show modal
    celebrationModal.classList.remove('hidden');
}

// Show gold level complete celebration
function showGoldCompleteCelebration() {
    try {
        finishSound.play().catch(err => console.log("Sound play error:", err));
    } catch (e) {
        console.log("Finish sound error:", e);
    }
    
    // Create pot of gold animation
    createPotOfGoldCelebration();
    
    // Create word coins
    createWordCoins();
    
    // Show modal
    goldCelebrationModal.classList.remove('hidden');
}

// Create rainbow celebration
function createRainbowCelebration(completedLevelIndex) {
    rainbowAnimation.innerHTML = '';
    celebrationCoins.innerHTML = '';
    
    // Create rainbow arcs
    for (let i = 0; i <= completedLevelIndex; i++) {
        const level = LEVEL_ORDER[i];
        const color = LEVEL_COLORS[level].primary;
        
        const arc = document.createElement('div');
        arc.style.position = 'absolute';
        arc.style.width = `${300 - i * 30}px`;
        arc.style.height = `${150 - i * 15}px`;
        arc.style.borderRadius = `${150 - i * 15}px ${150 - i * 15}px 0 0`;
        arc.style.borderTop = `10px solid ${color}`;
        arc.style.borderLeft = `10px solid ${color}`;
        arc.style.borderRight = `10px solid ${color}`;
        arc.style.bottom = '0';
        arc.style.left = '50%';
        arc.style.transform = 'translateX(-50%)';
        
        rainbowAnimation.appendChild(arc);
    }
    
    // Create coins for completed level
    const level = LEVEL_ORDER[completedLevelIndex];
    const words = WORD_LEVELS[level];
    
    words.forEach(word => {
        const coin = document.createElement('div');
        coin.className = 'word-coin';
        coin.textContent = word;
        coin.style.position = 'absolute';
        coin.style.left = `${Math.random() * 80 + 10}%`;
        coin.style.top = `${Math.random() * 60 + 20}%`;
        coin.style.animation = `float ${Math.random() * 2 + 2}s infinite alternate`;
        
        celebrationCoins.appendChild(coin);
    });
    
    // Add float animation if it doesn't exist
    if (!document.querySelector('style#float-animation')) {
        const style = document.createElement('style');
        style.id = 'float-animation';
        style.textContent = `
            @keyframes float {
                0% { transform: translateY(0); }
                100% { transform: translateY(-15px); }
            }
        `;
        document.head.appendChild(style);
    }
}

// Create pot of gold celebration
function createPotOfGoldCelebration() {
    potAnimation.innerHTML = '';
    
    // Create pot
    const pot = document.createElement('div');
    pot.style.position = 'absolute';
    pot.style.width = '100px';
    pot.style.height = '80px';
    pot.style.bottom = '0';
    pot.style.left = '50%';
    pot.style.transform = 'translateX(-50%)';
    pot.style.backgroundColor = '#8B4513';
    pot.style.borderRadius = '50px 50px 0 0';
    
    // Create gold top
    const goldTop = document.createElement('div');
    goldTop.style.position = 'absolute';
    goldTop.style.width = '120px';
    goldTop.style.height = '30px';
    goldTop.style.top = '-15px';
    goldTop.style.left = '-10px';
    goldTop.style.backgroundColor = '#FFD700';
    goldTop.style.borderRadius = '50%';
    
    pot.appendChild(goldTop);
    potAnimation.appendChild(pot);
    
    // Create rainbow
    for (let i = 0; i < LEVEL_ORDER.length; i++) {
        const level = LEVEL_ORDER[i];
        const color = LEVEL_COLORS[level].primary;
        
        const arc = document.createElement('div');
        arc.style.position = 'absolute';
        arc.style.width = `${220 - i * 20}px`;
        arc.style.height = `${110 - i * 10}px`;
        arc.style.borderRadius = `${110 - i * 10}px ${110 - i * 10}px 0 0`;
        arc.style.borderTop = `8px solid ${color}`;
        arc.style.borderLeft = `8px solid ${color}`;
        arc.style.borderRight = `8px solid ${color}`;
        arc.style.bottom = '60px';
        arc.style.left = '50%';
        arc.style.transform = 'translateX(-50%)';
        
        potAnimation.appendChild(arc);
    }
}

// Create word coins for gold celebration
function createWordCoins() {
    allWordsContainer.innerHTML = '';
    
    // Get all mastered words from all levels
    LEVEL_ORDER.forEach(level => {
        mastered[level].forEach(word => {
            const coin = document.createElement('div');
            coin.className = 'word-coin';
            coin.textContent = word;
            
            allWordsContainer.appendChild(coin);
        });
    });
}

// Continue playing after level completion
function continuePlaying() {
    celebrationModal.classList.add('hidden');
    
    // Move to next level
    currentLevelIndex++;
    currentLevel = LEVEL_ORDER[currentLevelIndex];
    
    // Update UI
    updateLevelIndicator();
    updateRainbowProgress();
    
    // Reset level
    resetCurrentLevel();
    
    // Continue game
    resumeGame();
}

// Reset game after completion
function resetGame() {
    goldCelebrationModal.classList.add('hidden');
    
    // Clear localStorage to fully reset progress
    localStorage.removeItem('rainbowReadersProgress');
    
    // Reset mastered words completely
    mastered = {
        red: [],
        orange: [],
        yellow: [],
        green: [],
        blue: [],
        purple: [],
        pink: [],
        gold: []
    };
    
    // Reset level and score
    currentLevelIndex = 0;
    currentLevel = LEVEL_ORDER[currentLevelIndex];
    score = 0;
    
    // Update UI
    updateLevelIndicator();
    updateRainbowProgress();
    updateScoreDisplay();
    
    // Reset level
    resetCurrentLevel();
    
    // Show start button
    startBtn.classList.remove('hidden');
}

// Update score display
function updateScoreDisplay() {
    scoreDisplay.textContent = score;
}

// Update level indicator
function updateLevelIndicator() {
    const levelName = LEVEL_COLORS[currentLevel].name;
    const levelColor = LEVEL_COLORS[currentLevel].primary;
    
    currentLevelText.textContent = `${levelName} LEVEL`;
    document.querySelector('.level-indicator').style.backgroundColor = levelColor;
}

// Update rainbow progress
function updateRainbowProgress() {
    // Highlight completed levels in rainbow
    LEVEL_ORDER.forEach((level, index) => {
        const isCompleted = mastered[level].length === WORD_LEVELS[level].length;
        const layerElement = rainbowLayers[index];
        
        if (isCompleted) {
            layerElement.classList.add('active');
        } else {
            layerElement.classList.remove('active');
        }
    });
    
    // Show pot of gold when all levels complete
    const allComplete = LEVEL_ORDER.every(level => 
        mastered[level].length === WORD_LEVELS[level].length
    );
    
    if (allComplete) {
        potOfGold.classList.add('active');
    } else {
        potOfGold.classList.remove('active');
    }
}

// Save game progress to localStorage
function saveGameProgress() {
    const gameData = {
        mastered,
        currentLevel,
        currentLevelIndex,
        score
    };
    
    try {
        localStorage.setItem('rainbowReadersProgress', JSON.stringify(gameData));
    } catch (e) {
        console.log("localStorage error:", e);
    }
}

// Load game progress from localStorage
function loadGameProgress() {
    try {
        const savedData = localStorage.getItem('rainbowReadersProgress');
        
        if (savedData) {
            const gameData = JSON.parse(savedData);
            
            mastered = gameData.mastered;
            currentLevel = gameData.currentLevel;
            currentLevelIndex = gameData.currentLevelIndex;
            score = gameData.score;
        }
    } catch (e) {
        console.log("Error loading saved game:", e);
    }
}

console.log("Combined game file loaded successfully!");
