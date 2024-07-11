
document.addEventListener("DOMContentLoaded", () => {
    const gameArea = document.getElementById('gameArea');
    const scoreDisplay = document.getElementById('score');
    const messageDisplay = document.getElementById('message');
    let score = 0;
    let ballSpeed = 2;
    let gameInterval;
    let ballCreationInterval;

    function createBall() {
        const ball = document.createElement('div');
        ball.classList.add('ball');
        const startPosition = Math.random() < 0.5 ? 'left' : 'right';
        ball.style.left = startPosition === 'left' ? '20px' : '260px';
        ball.style.top = '0px';
        ball.dataset.position = startPosition;
        gameArea.appendChild(ball);
    }

    function updateBalls() {
        const balls = document.querySelectorAll('.ball');
        balls.forEach(ball => {
            let ballTop = parseInt(ball.style.top);
            if (ballTop >= 380) {
                endGame();
                return;
            }
            ball.style.top = ballTop + ballSpeed + 'px';
        });
    }

    function catchBall(position) {
        const balls = document.querySelectorAll(`.ball[data-position='${position}']`);
        balls.forEach(ball => {
            let ballTop = parseInt(ball.style.top);
            if (ballTop >= 360 && ballTop <= 380) {
                ball.remove();
                score += 10;
                scoreDisplay.textContent = `Score: ${score}`;
            }
        });
    }

    function endGame() {
        clearInterval(gameInterval);
        clearInterval(ballCreationInterval);
        messageDisplay.textContent = "Game Over!";
        document.removeEventListener('keydown', handleKeydown);
    }

    function handleKeydown(event) {
        if (event.code === 'ShiftLeft') {
            catchBall('left');
        } else if (event.code === 'ShiftRight') {
            catchBall('right');
        }
    }

    function startGame() {
        score = 0;
        ballSpeed = 2;
        scoreDisplay.textContent = 'Score: 0';
        messageDisplay.textContent = '';
        gameArea.innerHTML = '';
        clearInterval(gameInterval);
        clearInterval(ballCreationInterval);

        gameInterval = setInterval(() => {
            updateBalls();
            ballSpeed += 0.01; // Increase speed over time
        }, 100);

        ballCreationInterval = setInterval(createBall, 1000);

        document.addEventListener('keydown', handleKeydown);
    }

    startGame();
});

