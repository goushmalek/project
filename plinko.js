// Plinko Prediction Game Logic
class PlinkoGame {
    constructor() {
        this.canvas = document.getElementById('plinkoCanvas');
        this.dropBtn = document.getElementById('dropBall');
        this.resetBtn = document.getElementById('resetStats');
        this.gameStatus = document.getElementById('gameStatus');
        this.targetBoxes = document.querySelectorAll('.target-box');
        this.totalDropsDisplay = document.getElementById('totalDrops');
        this.correctPredictionsDisplay = document.getElementById('correctPredictions');
        this.successRateDisplay = document.getElementById('successRate');
        
        this.selectedSlot = null;
        this.isDropping = false;
        this.totalDrops = 0;
        this.correctPredictions = 0;
        
        this.pegs = [];
        this.rows = 12;
        this.pegSpacing = 45;
        
        this.init();
    }

    init() {
        this.createPegs();
        
        this.targetBoxes.forEach(box => {
            box.addEventListener('click', () => this.selectTarget(box));
        });
        
        this.dropBtn.addEventListener('click', () => this.dropBall());
        this.resetBtn.addEventListener('click', () => this.resetStats());
    }

    createPegs() {
        const canvasWidth = this.canvas.offsetWidth;
        const canvasHeight = this.canvas.offsetHeight;
        
        for (let row = 0; row < this.rows; row++) {
            const pegsInRow = row + 3;
            const rowWidth = pegsInRow * this.pegSpacing;
            const startX = (canvasWidth - rowWidth) / 2;
            const y = 50 + row * this.pegSpacing;
            
            for (let col = 0; col < pegsInRow; col++) {
                const x = startX + col * this.pegSpacing + this.pegSpacing / 2;
                this.createPeg(x, y);
            }
        }
    }

    createPeg(x, y) {
        const peg = document.createElement('div');
        peg.className = 'peg';
        peg.style.left = `${x}px`;
        peg.style.top = `${y}px`;
        this.canvas.appendChild(peg);
        this.pegs.push({ x, y });
    }

    selectTarget(box) {
        if (this.isDropping) return;
        
        // Remove previous selection
        this.targetBoxes.forEach(b => b.classList.remove('selected'));
        
        // Select new target
        box.classList.add('selected');
        this.selectedSlot = parseInt(box.dataset.slot);
        
        // Enable drop button
        this.dropBtn.disabled = false;
        
        this.gameStatus.textContent = `Target selected: Box ${this.selectedSlot + 1}. Drop the ball!`;
        this.gameStatus.classList.remove('success', 'fail');
    }

    async dropBall() {
        if (this.isDropping || this.selectedSlot === null) return;
        
        this.isDropping = true;
        this.dropBtn.disabled = true;
        
        // Clear previous results
        this.targetBoxes.forEach(box => box.classList.remove('correct', 'wrong'));
        
        const ball = document.createElement('div');
        ball.className = 'ball';
        this.canvas.appendChild(ball);
        
        const canvasWidth = this.canvas.offsetWidth;
        let x = canvasWidth / 2;
        let y = 10;
        let velocityX = 0;
        let velocityY = 0;
        const gravity = 0.5;
        
        ball.style.left = `${x}px`;
        ball.style.top = `${y}px`;
        
        const animate = () => {
            velocityY += gravity;
            y += velocityY;
            x += velocityX;
            
            // Check collision with pegs
            for (let peg of this.pegs) {
                const dx = x - peg.x;
                const dy = y - peg.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 15) {
                    // Bounce off peg
                    const direction = Math.random() > 0.5 ? 1 : -1;
                    velocityX = direction * 2;
                    velocityY = Math.abs(velocityY) * 0.7;
                }
            }
            
            // Boundaries
            if (x < 10) {
                x = 10;
                velocityX *= -0.5;
            }
            if (x > canvasWidth - 10) {
                x = canvasWidth - 10;
                velocityX *= -0.5;
            }
            
            ball.style.left = `${x}px`;
            ball.style.top = `${y}px`;
            
            // Check if ball reached bottom
            if (y >= this.canvas.offsetHeight - 30) {
                const landedSlot = this.getSlotIndex(x, canvasWidth);
                this.checkPrediction(landedSlot);
                
                setTimeout(() => {
                    ball.remove();
                    this.isDropping = false;
                }, 1000);
            } else {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }

    getSlotIndex(x, canvasWidth) {
        const slotWidth = canvasWidth / 9;
        let index = Math.floor(x / slotWidth);
        return Math.max(0, Math.min(index, 8));
    }

    checkPrediction(landedSlot) {
        this.totalDrops++;
        
        const targetBox = document.querySelector(`[data-slot="${landedSlot}"]`);
        
        if (landedSlot === this.selectedSlot) {
            // Correct prediction!
            this.correctPredictions++;
            targetBox.classList.add('correct');
            this.gameStatus.textContent = `🎉 CORRECT! Ball landed in Box ${landedSlot + 1}!`;
            this.gameStatus.classList.add('success');
            this.gameStatus.classList.remove('fail');
            this.showNotification(`🎯 Perfect prediction! Ball landed in Box ${landedSlot + 1}!`);
        } else {
            // Wrong prediction
            targetBox.classList.add('wrong');
            this.targetBoxes[this.selectedSlot].classList.add('wrong');
            this.gameStatus.textContent = `❌ Wrong! Ball landed in Box ${landedSlot + 1}, not Box ${this.selectedSlot + 1}`;
            this.gameStatus.classList.add('fail');
            this.gameStatus.classList.remove('success');
            this.showNotification(`❌ Ball landed in Box ${landedSlot + 1}. Try again!`);
        }
        
        this.updateStats();
        this.selectedSlot = null;
        this.targetBoxes.forEach(box => box.classList.remove('selected'));
    }

    updateStats() {
        this.totalDropsDisplay.textContent = this.totalDrops;
        this.correctPredictionsDisplay.textContent = this.correctPredictions;
        
        const successRate = this.totalDrops > 0 
            ? Math.round((this.correctPredictions / this.totalDrops) * 100) 
            : 0;
        this.successRateDisplay.textContent = `${successRate}%`;
    }

    resetStats() {
        this.totalDrops = 0;
        this.correctPredictions = 0;
        this.selectedSlot = null;
        this.updateStats();
        this.targetBoxes.forEach(box => {
            box.classList.remove('selected', 'correct', 'wrong');
        });
        this.gameStatus.textContent = 'Choose a target box below and drop the ball!';
        this.gameStatus.classList.remove('success', 'fail');
        this.dropBtn.disabled = true;
        this.showNotification('📊 Stats reset!');
    }

    showNotification(message) {
        const existing = document.querySelector('.plinko-notification');
        if (existing) existing.remove();

        const notification = document.createElement('div');
        notification.className = 'plinko-notification';
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
    const plinkoGame = new PlinkoGame();
});
