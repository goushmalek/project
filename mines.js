// Mines Level-Based Challenge Game
class MinesGame {
    constructor() {
        this.grid = document.getElementById('minesGrid');
        this.startBtn = document.getElementById('startGame');
        this.newGameBtn = document.getElementById('newGame');
        this.minesCountSelect = document.getElementById('minesCount');
        this.gameStatus = document.getElementById('gameStatus');
        this.currentLevelDisplay = document.getElementById('currentLevel');
        this.tilesRevealedDisplay = document.getElementById('tilesRevealed');
        this.bestLevelDisplay = document.getElementById('bestLevel');
        this.gamesPlayedDisplay = document.getElementById('gamesPlayed');
        
        this.gameActive = false;
        this.currentLevel = 0;
        this.tilesRevealed = 0;
        this.bestLevel = 0;
        this.gamesPlayed = 0;
        this.totalTiles = 25;
        this.minePositions = [];
        this.revealedTiles = [];
        
        this.init();
    }

    init() {
        this.createGrid();
        this.loadStats();
        
        this.startBtn.addEventListener('click', () => this.startGame());
        this.newGameBtn.addEventListener('click', () => this.resetGame());
    }

    createGrid() {
        this.grid.innerHTML = '';
        for (let i = 0; i < this.totalTiles; i++) {
            const tile = document.createElement('div');
            tile.className = 'mine-tile disabled';
            tile.dataset.index = i;
            tile.addEventListener('click', () => this.revealTile(i));
            this.grid.appendChild(tile);
        }
    }

    startGame() {
        if (this.gameActive) {
            this.showNotification('⚠️ Game already in progress!');
            return;
        }
        
        this.gameActive = true;
        this.currentLevel = 0;
        this.tilesRevealed = 0;
        this.revealedTiles = [];
        this.gamesPlayed++;
        
        this.placeMines();
        this.enableTiles();
        
        this.gameStatus.textContent = `Level ${this.currentLevel + 1}: Find all safe tiles! Avoid the mines! 💣`;
        this.gameStatus.classList.remove('warning', 'success');
        
        this.minesCountSelect.disabled = true;
        this.startBtn.disabled = true;
        
        this.updateDisplay();
        this.showNotification('🎮 Game started! Good luck!');
    }

    placeMines() {
        const minesCount = parseInt(this.minesCountSelect.value);
        this.minePositions = [];
        
        while (this.minePositions.length < minesCount) {
            const pos = Math.floor(Math.random() * this.totalTiles);
            if (!this.minePositions.includes(pos)) {
                this.minePositions.push(pos);
            }
        }
    }

    enableTiles() {
        const tiles = document.querySelectorAll('.mine-tile');
        tiles.forEach(tile => {
            tile.classList.remove('disabled', 'revealed', 'safe', 'mine');
            tile.textContent = '';
        });
    }

    revealTile(index) {
        if (!this.gameActive) return;
        if (this.revealedTiles.includes(index)) return;
        
        const tile = document.querySelector(`[data-index="${index}"]`);
        tile.classList.add('revealed');
        this.revealedTiles.push(index);
        
        if (this.minePositions.includes(index)) {
            // Hit a mine!
            tile.classList.add('mine');
            tile.textContent = '💣';
            this.gameOver();
        } else {
            // Safe tile!
            tile.classList.add('safe');
            tile.textContent = '💎';
            this.tilesRevealed++;
            this.updateDisplay();
            
            // Check if level complete (all safe tiles revealed)
            const safeTiles = this.totalTiles - this.minePositions.length;
            if (this.tilesRevealed >= safeTiles) {
                this.levelComplete();
            }
        }
    }

    levelComplete() {
        this.currentLevel++;
        
        if (this.currentLevel > this.bestLevel) {
            this.bestLevel = this.currentLevel;
            this.saveStats();
        }
        
        this.gameStatus.textContent = `🎉 Level ${this.currentLevel} Complete! Starting next level...`;
        this.gameStatus.classList.add('success');
        this.gameStatus.classList.remove('warning');
        
        this.showNotification(`🎉 Level ${this.currentLevel} Complete!`);
        
        // Reset for next level
        setTimeout(() => {
            this.tilesRevealed = 0;
            this.revealedTiles = [];
            this.placeMines();
            this.enableTiles();
            this.gameStatus.textContent = `Level ${this.currentLevel + 1}: Find all safe tiles!`;
            this.gameStatus.classList.remove('success');
            this.updateDisplay();
        }, 2000);
    }

    gameOver() {
        this.gameActive = false;
        this.disableTiles();
        this.revealAllMines();
        
        this.gameStatus.textContent = `💥 GAME OVER! You reached Level ${this.currentLevel}`;
        this.gameStatus.classList.add('warning');
        this.gameStatus.classList.remove('success');
        
        this.minesCountSelect.disabled = false;
        this.startBtn.disabled = false;
        
        this.updateDisplay();
        this.saveStats();
        
        this.showNotification(`💥 Game Over at Level ${this.currentLevel}! ${this.tilesRevealed} tiles revealed.`);
    }

    revealAllMines() {
        const tiles = document.querySelectorAll('.mine-tile');
        this.minePositions.forEach(pos => {
            const tile = tiles[pos];
            if (!tile.classList.contains('revealed')) {
                tile.classList.add('revealed', 'mine');
                tile.textContent = '💣';
            }
        });
    }

    disableTiles() {
        const tiles = document.querySelectorAll('.mine-tile');
        tiles.forEach(tile => tile.classList.add('disabled'));
    }

    resetGame() {
        this.gameActive = false;
        this.currentLevel = 0;
        this.tilesRevealed = 0;
        this.revealedTiles = [];
        
        this.createGrid();
        this.minesCountSelect.disabled = false;
        this.startBtn.disabled = false;
        
        this.gameStatus.textContent = 'Choose difficulty and start the game!';
        this.gameStatus.classList.remove('warning', 'success');
        
        this.updateDisplay();
    }

    updateDisplay() {
        const minesCount = parseInt(this.minesCountSelect.value);
        const safeTiles = this.totalTiles - minesCount;
        
        this.currentLevelDisplay.textContent = this.currentLevel;
        this.tilesRevealedDisplay.textContent = `${this.tilesRevealed} / ${safeTiles}`;
        this.bestLevelDisplay.textContent = this.bestLevel;
        this.gamesPlayedDisplay.textContent = this.gamesPlayed;
    }

    saveStats() {
        localStorage.setItem('mines_bestLevel', this.bestLevel);
        localStorage.setItem('mines_gamesPlayed', this.gamesPlayed);
    }

    loadStats() {
        this.bestLevel = parseInt(localStorage.getItem('mines_bestLevel') || '0');
        this.gamesPlayed = parseInt(localStorage.getItem('mines_gamesPlayed') || '0');
        this.updateDisplay();
    }

    showNotification(message) {
        const existing = document.querySelector('.mines-notification');
        if (existing) existing.remove();

        const notification = document.createElement('div');
        notification.className = 'mines-notification';
        notification.style.cssText = `
            position: fixed;
            top: 150px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 255, 255, 0.95);
            color: #000;
            padding: 1rem 2rem;
            border-radius: 10px;
            font-weight: bold;
            z-index: 10000;
            box-shadow: 0 0 20px rgba(0, 255, 255, 0.8);
            font-family: 'Orbitron', sans-serif;
            font-size: 1.1rem;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transition = 'opacity 0.5s';
            setTimeout(() => notification.remove(), 500);
        }, 2500);
    }
}

// Initialize game
document.addEventListener('DOMContentLoaded', () => {
    const minesGame = new MinesGame();
});
