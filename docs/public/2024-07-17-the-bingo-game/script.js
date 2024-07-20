
document.addEventListener('DOMContentLoaded', () => {
    const BINGO_SIZE = 5;
    const MIN_NUMBER = 1;
    const MAX_NUMBER = 99;
    const BINGO_NUMBERS = [...Array(MAX_NUMBER).keys()].map(n => padNumber(n + 1));

    let intervalId;
    let isPaused = false;
    let isRunning = false;
    let lastTime = 0;

    const bingoTable = document.querySelector('#bingo-table tbody');
    const bingoHeaders = document.querySelectorAll('#bingo-table th');
    const startButton = document.getElementById('start-button');
    const pauseButton = document.getElementById('pause-button');
    const resetButton = document.getElementById('reset-button');
    const waterfallContainer = document.getElementById('waterfall-container');

    function padNumber(number) {
        return number.toString().padStart(2, '0');
    }

    function getRandomNumber(existingNumbers) {
        let number;
        do {
            number = padNumber(Math.floor(Math.random() * (MAX_NUMBER - MIN_NUMBER + 1)) + MIN_NUMBER);
        } while (existingNumbers.has(number));
        existingNumbers.add(number);
        return number;
    }

    function generateBingoCard() {
        bingoTable.innerHTML = '';
        const numbers = new Set();

        for (let i = 0; i < BINGO_SIZE; i++) {
            const row = document.createElement('tr');
            for (let j = 0; j < BINGO_SIZE; j++) {
                const num = getRandomNumber(numbers);

                const cell = document.createElement('td');
                cell.textContent = num;
                row.appendChild(cell);
            }
            bingoTable.appendChild(row);
        }
    }

    function generateWaterfallRow() {
        const row = document.createElement('div');
        row.className = 'waterfall-row';

        for (let i = 0; i < BINGO_SIZE; i++) {
            const number = padNumber(Math.floor(Math.random() * (MAX_NUMBER - MIN_NUMBER + 1)) + MIN_NUMBER);
            const cell = document.createElement('div');
            cell.textContent = number;
            row.appendChild(cell);
        }

        return row;
    }

    function checkForBingo(number) {
        const cells = bingoTable.querySelectorAll('td');
        let bingoRow;

        cells.forEach(cell => {
            if (cell.textContent === number) {
                cell.classList.add('highlight');
            }
        });

        const rows = bingoTable.querySelectorAll('tr');
        rows.forEach(row => {
            const highlightedCells = row.querySelectorAll('.highlight');
            if (highlightedCells.length === BINGO_SIZE) {
                bingoRow = row;
            }
        });

        return bingoRow;
    }

    function startWaterfall(timestamp) {
        if (!isRunning) return;
        if (!isPaused && (timestamp - lastTime) > 1000) {
            lastTime = timestamp;

            const waterfallRow = generateWaterfallRow();
            const existingRows = waterfallContainer.querySelectorAll('.waterfall-row');
            waterfallContainer.insertBefore(waterfallRow, waterfallContainer.firstChild);

            if (existingRows.length >= 4) {
                waterfallContainer.removeChild(existingRows[existingRows.length - 1]);
            }

            requestAnimationFrame(() => {
                waterfallRow.style.opacity = '1';
            });

            const cells = waterfallRow.querySelectorAll('div');
            cells.forEach(cell => {
                const bingoRow = checkForBingo(cell.textContent);
                if (bingoRow) {
                    isRunning = false;
                    bingoHeaders.forEach(header => header.classList.add('bingo-gradient'));
                    bingoRow.classList.add('bingo-row');
                }
            });
        }
        requestAnimationFrame(startWaterfall);
    }

    function startGame() {
        if (isRunning) return;
        isRunning = true;
        isPaused = false;
        requestAnimationFrame(startWaterfall);
    }

    function pauseGame() {
        if (!isRunning) return;
        isPaused = !isPaused;
        pauseButton.textContent = isPaused ? 'Resume' : 'Pause';
    }

    function resetGame() {
        isRunning = false;
        isPaused = false;
        pauseButton.textContent = 'Pause';
        generateBingoCard();
        waterfallContainer.innerHTML = '';
        bingoHeaders.forEach(header => header.classList.remove('bingo-gradient'));
    }

    startButton.addEventListener('click', startGame);
    pauseButton.addEventListener('click', pauseGame);
    resetButton.addEventListener('click', resetGame);

    generateBingoCard();
});

