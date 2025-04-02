// Rainbow Readers Game
console.log("Loading game.js...");

// Make sure the DOM is fully loaded before initializing the game
document.addEventListener('DOMContentLoaded', function() {
    // Wait a short time to ensure all resources are loaded
    setTimeout(initGameAfterLoad, 500);
});

function initGameAfterLoad() {
    try {
        // DOM Elements - Get all elements needed for the game
        const gameCanvas = document.getElementById('game-canvas');
        const ctx = gameCanvas ? gameCanvas.getContext('2d') : null;
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
        
        // Check if all required elements exist
        if (!gameCanvas || !ctx || !wordDisplay || !revealedWord || !correctBtn || 
            !tryAgainBtn || !startBtn || !helpBtn || !scoreDisplay || !currentLevelText) {
            console.error("Missing required DOM elements");
            alert("Could not initialize game: Missing elements");
            return;
        }
        
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
        
        // Preload sounds to ensure they're ready
        function preloadSounds() {
            try {
                [popSound, correctSound, wrongSound, levelUpSound, finishSound].forEach(sound => {
                    sound.load();
                    // Add error handling for sounds
                    sound.onerror = (e) => console.log("Sound error:", e);
                });
            } catch (e) {
                console.log("Sound preload error:", e);
            }
        }
        
        // Safe sound playing function
        function playSound(sound) {
            try {
                // Reset the sound to beginning and play
                sound.currentTime = 0;
                let playPromise = sound.play();
                
                if (playPromise !== undefined) {
                    playPromise.catch(err => {
                        console.log("Sound play error:", err);
                    });
                }
            } catch (e) {
                console.log("Error playing sound:", e);
            }
        }
        
        // Initialize the game
        function initGame() {
            console.log("Initializing game...");
            
            // Add window resize event listener
            window.addEventListener('resize', setCanvasSize);
            
            // Add button event listeners
            startBtn.addEventListener('click', startGame);
            helpBtn.addEventListener('click', showHelp);
            closeButton.addEventListener('click', hideHelp);
            correctBtn.addEventListener('click', handleCorrect);
            tryAgainBtn.addEventListener('click', handleTryAgain);
            continueBtn.addEventListener('click', continuePlaying);
            playAgainBtn.addEventListener('click', resetGame);
            
            // Add touch and mouse events for canvas
            gameCanvas.addEventListener('click', handleCanvasClick);
            gameCanvas.addEventListener('touchstart', handleCanvasTouch);
            
            // Set up the game
            setCanvasSize();
            loadGameProgress();
            updateRainbowProgress();
            updateScoreDisplay();
            updateLevelIndicator();
            preloadSounds();
            
            console.log("Game initialized successfully");
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
                playSound(popSound);
                
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
            
            playSound(correctSound);
            
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
            
            playSound(wrongSound);
            
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
            playSound(levelUpSound);
            
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
            playSound(finishSound);
            
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
