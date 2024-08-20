
document.addEventListener('DOMContentLoaded', () => {
    const pilesContainer = document.getElementById('piles');
    const aliceScoreElem = document.getElementById('alice-score');
    const bobScoreElem = document.getElementById('bob-score');
    const alicePanel = document.getElementById('alice-panel');
    const bobPanel = document.getElementById('bob-panel');
    const startGameBtn = document.getElementById('start-game');
    const restartGameBtn = document.getElementById('restart-game');
    const endGameBtn = document.getElementById('end-game');
    const currentMDisplay = document.getElementById('current-m');
    const maxPilesDisplay = document.getElementById('max-piles');
    const currentMoveElem = document.getElementById('current-move');
    const logList = document.getElementById('log-list');

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

        let stonesTaken = 0;
        for (let i = 0; i < X; i++) {
            stonesTaken += piles[i];
        }

        aliceScore += stonesTaken;
        piles.splice(0, X);
        M = Math.max(M, X);
        updateScores();

        logMove('Alice', X, stonesTaken);

        if (piles.length === 0) {
            endGame();
            return;
        }

        switchPlayer('Bob');
        setTimeout(bobMove, 1000);
    }

    function bobMove() {
        const X = Math.min(2 * M, piles.length);
        let stonesTaken = 0;
        for (let i = 0; i < X; i++) {
            stonesTaken += piles[i];
        }

        bobScore += stonesTaken;
        piles.splice(0, X);
        M = Math.max(M, X);
        updateScores();

        logMove('Bob', X, stonesTaken);

        if (piles.length === 0) {
            endGame();
            return;
        }

        switchPlayer('Alice');
    }

    function updateScores() {
        aliceScoreElem.innerText = aliceScore;
        bobScoreElem.innerText = bobScore;
        currentMDisplay.innerText = M;
        maxPilesDisplay.innerText = Math.min(2 * M, piles.length);

        renderPiles();
        updateCurrentMove();
    }

    function updateCurrentMove() {
        if (currentPlayer === 'Alice') {
            currentMoveElem.innerText = `Alice can take up to ${Math.min(2 * M, piles.length)} piles.`;
        } else {
            currentMoveElem.innerText = `Bob is deciding...`;
        }
    }

    function logMove(player, X, stonesTaken) {
        const logEntry = document.createElement('li');
        logEntry.innerText = `${player} took ${X} piles (${stonesTaken} stones)`;
        logList.appendChild(logEntry);
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
        updateCurrentMove();
    }

    function restartGame() {
        piles = [];
        aliceScore = 0;
        bobScore = 0;
        M = 1;
        currentPlayer = 'Alice';
        logList.innerHTML = '';
        startGameBtn.disabled = false;
        updateScores();
        renderPiles();
        updateCurrentMove();
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


