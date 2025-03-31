game.js
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

// Handle recording
function handleRecording() {
    // In a real implementation, this would access the microphone
    // For this demo, we'll simulate recording with visual feedback
    
    recordBtn.style.backgroundColor = '#FF0000';
    recordBtn.querySelector('.mic-icon').style.backgroundColor = '#FF0000';
    
    // Simulate recording for 2 seconds
    setTimeout(() => {
        recordBtn.style.backgroundColor = '';
        recordBtn.querySelector('.mic-icon').style.backgroundColor = 'white';
    }, 2000);
}

// Handle correct answer
function handleCorrect() {
    if (!activeWord) return;
    
    correctSound.play();
    
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
    
    wrongSound.play();
    
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
    recordBtn.classList.add('hidden');
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
    levelUpSound.play();
    
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
    finishSound.play();
    
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
    
    // Preserve mastered words but reset current level to beginning
    currentLevelIndex = 0;
    currentLevel = LEVEL_ORDER[currentLevelIndex];
    
    // Update UI
    updateLevelIndicator();
    updateRainbowProgress();
    
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
    
    localStorage.setItem('rainbowReadersProgress', JSON.stringify(gameData));
}

// Load game progress from localStorage
function loadGameProgress() {
    const savedData = localStorage.getItem('rainbowReadersProgress');
    
    if (savedData) {
        const gameData = JSON.parse(savedData);
        
        mastered = gameData.mastered;
        currentLevel = gameData.currentLevel;
        currentLevelIndex = gameData.currentLevelIndex;
        score = gameData.score;
    }
}