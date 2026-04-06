// Tic-Tac-Toe Game Logic
class TicTacToe {
    constructor() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.scores = { X: 0, O: 0, draw: 0 };
        this.cells = document.querySelectorAll('.cell');
        this.statusDisplay = document.getElementById('ttt-status');
        this.resetBtn = document.getElementById('ttt-reset');
        
        this.init();
    }

    init() {
        this.cells.forEach(cell => {
            cell.addEventListener('click', (e) => this.handleCellClick(e));
        });
        this.resetBtn.addEventListener('click', () => this.resetGame());
    }

    handleCellClick(e) {
        const clickedCell = e.target;
        const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

        if (this.board[clickedCellIndex] !== '' || !this.gameActive) {
            return;
        }

        this.board[clickedCellIndex] = this.currentPlayer;
        clickedCell.textContent = this.currentPlayer;
        clickedCell.classList.add('taken', this.currentPlayer.toLowerCase());

        this.checkResult();
    }

    checkResult() {
        const winningConditions = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6] // Diagonals
        ];

        let roundWon = false;
        for (let condition of winningConditions) {
            const [a, b, c] = condition;
            if (this.board[a] === '' || this.board[b] === '' || this.board[c] === '') {
                continue;
            }
            if (this.board[a] === this.board[b] && this.board[b] === this.board[c]) {
                roundWon = true;
                break;
            }
        }

        if (roundWon) {
            this.statusDisplay.innerHTML = `<span class="win-message">🎉 Player ${this.currentPlayer} Wins! 🎉</span>`;
            this.gameActive = false;
            this.scores[this.currentPlayer]++;
            this.updateScoreDisplay();
            return;
        }

        const roundDraw = !this.board.includes('');
        if (roundDraw) {
            this.statusDisplay.innerHTML = `<span class="win-message">🤝 It's a Draw! 🤝</span>`;
            this.gameActive = false;
            this.scores.draw++;
            this.updateScoreDisplay();
            return;
        }

        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        this.statusDisplay.textContent = `Player ${this.currentPlayer}'s Turn`;
    }

    updateScoreDisplay() {
        document.getElementById('ttt-score-x').textContent = this.scores.X;
        document.getElementById('ttt-score-o').textContent = this.scores.O;
        document.getElementById('ttt-score-draw').textContent = this.scores.draw;
    }

    resetGame() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.statusDisplay.textContent = "Player X's Turn";
        this.cells.forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('taken', 'x', 'o');
        });
    }
}

// Initialize Game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const ticTacToe = new TicTacToe();
});
