
document.addEventListener('DOMContentLoaded', () => {
    const pilesContainer = document.getElementById('piles');
    const aliceScoreElem = document.getElementById('alice-score');
    const bobScoreElem = document.getElementById('bob-score');
    const alicePanel = document.getElementById('alice-panel');
    const bobPanel = document.getElementById('bob-panel');
    const startGameBtn = document.getElementById('start-game');
    const restartGameBtn = document.getElementById('restart-game');
    const endGameBtn = document.getElementById('end-game');

    let piles = [];
    let aliceScore = 0;
    let bobScore = 0;
    let currentPlayer = 'Alice';
    let M = 1;

    startGameBtn.addEventListener('click', startGame);
    restartGameBtn.addEventListener('click', restartGame);
    endGameBtn.addEventListener('click', endGame);

    function startGame() {
        piles = generatePiles();
        renderPiles();
        updateScores();
        switchPlayer('Alice');
        startGameBtn.disabled = true;
    }

    function generatePiles() {
        return [2, 7, 9, 4, 4];  // For simplicity, using fixed values. This can be randomized or user-input.
    }

    function renderPiles() {
        pilesContainer.innerHTML = '';
        piles.forEach((pile, index) => {
            const pileElem = document.createElement('div');
            pileElem.className = 'pile';
            pileElem.innerText = pile;
            pileElem.addEventListener('click', () => handlePileClick(index));
            pilesContainer.appendChild(pileElem);
        });
    }

    function handlePileClick(index) {
        if (currentPlayer !== 'Alice') return;

        const X = index + 1;
        if (X > 2 * M) {
            alert(`Invalid move! You can only take up to ${2 * M} piles.`);
            return;
        }

        // Calculate the stones Alice will take
        let stonesTaken = 0;
        for (let i = 0; i < X; i++) {
            stonesTaken += piles[i];
        }

        // Update game state
        aliceScore += stonesTaken;
        piles.splice(0, X);
        M = Math.max(M, X);
        updateScores();

        // Check if the game is over
        if (piles.length === 0) {
            endGame();
            return;
        }

        // Switch to Bob's turn
        switchPlayer('Bob');
        setTimeout(bobMove, 1000); // Adding a delay for Bob's move
    }

    function bobMove() {
        // Simple strategy: Bob takes the maximum allowed piles
        const X = Math.min(2 * M, piles.length);
        let stonesTaken = 0;
        for (let i = 0; i < X; i++) {
            stonesTaken += piles[i];
        }

        bobScore += stonesTaken;
        piles.splice(0, X);
        M = Math.max(M, X);
        updateScores();

        // Check if the game is over
        if (piles.length === 0) {
            endGame();
            return;
        }

        // Switch back to Alice's turn
        switchPlayer('Alice');
    }

    function updateScores() {
        aliceScoreElem.innerText = aliceScore;
        bobScoreElem.innerText = bobScore;
        renderPiles();
    }

    function switchPlayer(player) {
        currentPlayer = player;
        if (player === 'Alice') {
            alicePanel.classList.add('active');
            bobPanel.classList.remove('active');
        } else {
            bobPanel.classList.add('active');
            alicePanel.classList.remove('active');
        }
    }

    function restartGame() {
        piles = [];
        aliceScore = 0;
        bobScore = 0;
        M = 1;
        currentPlayer = 'Alice';
        startGameBtn.disabled = false;
        updateScores();
        renderPiles();
    }

    function endGame() {
        let result;
        if (aliceScore > bobScore) {
            result = 'Alice wins!';
        } else if (bobScore > aliceScore) {
            result = 'Bob wins!';
        } else {
            result = 'It\'s a tie!';
        }
        alert(result);
        restartGame();
    }
});


