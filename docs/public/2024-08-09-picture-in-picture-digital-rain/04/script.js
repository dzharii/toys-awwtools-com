document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('matrixCanvas');
    const ctx = canvas.getContext('2d');
    const video = document.getElementById('videoElement');
    const pipButton = document.getElementById('pipButton');

    let w, h;
    const resizeCanvas = () => {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const fontSize = 20;
    const rowSpacing = 20;

    // Array of greenish emoji for the digital rain effect
    const emojis = ["🍀", "🌿", "🌱", "🍏", "🐸", "🥦", "🥒", "💚"];

    // Create an array to hold the y-coordinate for each column.
    const columns = Array(Math.floor(w / fontSize)).fill(0);

    function draw() {
        // Create a fading effect by drawing a semi-transparent rectangle over the canvas.
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(0, 0, w, h);

        // Set the font for drawing emoji.
        ctx.font = fontSize + 'pt monospace';

        let pad = 0;
        columns.forEach((y, ind) => {
            // Choose a random emoji from the list.
            const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
            ctx.fillText(randomEmoji, ind * fontSize + pad, y);
            pad += Math.floor(fontSize / 2);

            // Reset the column if it goes off-screen; otherwise, increment its y position.
            if (y > h && Math.random() > 0.975) {
                columns[ind] = 0;
            } else {
                columns[ind] = y + (rowSpacing + Math.random() * 10);
            }
        });
    }

    // Capture the stream from the canvas for Picture-in-Picture mode.
    const stream = canvas.captureStream(30); // 30 FPS
    video.srcObject = stream;

    // Start the digital rain animation.
    setInterval(draw, 80);

    // Enable Picture-in-Picture if supported.
    if ('pictureInPictureEnabled' in document) {
        pipButton.disabled = false;
        pipButton.addEventListener('click', async function() {
            try {
                if (!document.pictureInPictureElement) {
                    await video.requestPictureInPicture();
                } else {
                    await document.exitPictureInPicture();
                }
            } catch (error) {
                console.error("Failed to enter Picture-in-Picture mode:", error);
            }
        });
    } else {
        pipButton.disabled = true;
        pipButton.textContent = "PiP not supported";
    }
});
