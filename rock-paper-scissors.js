// Rock-Paper-Scissors Game Logic
class RockPaperScissors {
    constructor() {
        this.choices = ['rock', 'paper', 'scissors'];
        this.emojis = { rock: '🪨', paper: '📄', scissors: '✂️' };
        this.scores = { player: 0, computer: 0, draw: 0 };
        this.choiceBtns = document.querySelectorAll('.choice-btn');
        this.statusDisplay = document.getElementById('rps-status');
        this.resultDisplay = document.getElementById('rps-result');
        this.choicesDisplay = document.getElementById('rps-choices-display');
        this.resetBtn = document.getElementById('rps-reset');
        
        this.init();
    }

    init() {
        this.choiceBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleChoice(e));
        });
        this.resetBtn.addEventListener('click', () => this.resetScores());
    }

    handleChoice(e) {
        const playerChoice = e.currentTarget.getAttribute('data-choice');
        const computerChoice = this.choices[Math.floor(Math.random() * this.choices.length)];
        
        this.choicesDisplay.innerHTML = `
            <span>${this.emojis[playerChoice]}</span>
            <span style="color: var(--neon-yellow);">VS</span>
            <span>${this.emojis[computerChoice]}</span>
        `;

        const result = this.determineWinner(playerChoice, computerChoice);
        this.displayResult(result);
        this.updateScoreDisplay();
    }

    determineWinner(player, computer) {
        if (player === computer) {
            this.scores.draw++;
            return 'draw';
        }

        if (
            (player === 'rock' && computer === 'scissors') ||
            (player === 'paper' && computer === 'rock') ||
            (player === 'scissors' && computer === 'paper')
        ) {
            this.scores.player++;
            return 'win';
        } else {
            this.scores.computer++;
            return 'lose';
        }
    }

    displayResult(result) {
        const messages = {
            win: { text: '🎉 You Win! 🎉', color: 'var(--neon-yellow)' },
            lose: { text: '💔 Computer Wins! 💔', color: 'var(--neon-pink)' },
            draw: { text: '🤝 It\'s a Draw! 🤝', color: 'var(--neon-cyan)' }
        };

        const message = messages[result];
        this.resultDisplay.innerHTML = `<span class="win-message" style="color: ${message.color}">${message.text}</span>`;
        this.statusDisplay.textContent = 'Make Your Next Choice!';
    }

    updateScoreDisplay() {
        document.getElementById('rps-score-player').textContent = this.scores.player;
        document.getElementById('rps-score-computer').textContent = this.scores.computer;
        document.getElementById('rps-score-draw').textContent = this.scores.draw;
    }

    resetScores() {
        this.scores = { player: 0, computer: 0, draw: 0 };
        this.updateScoreDisplay();
        this.resultDisplay.innerHTML = '';
        this.choicesDisplay.innerHTML = '';
        this.statusDisplay.textContent = 'Make Your Choice!';
    }
}

// Initialize Game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const rockPaperScissors = new RockPaperScissors();
});
