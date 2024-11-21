// ECMAScript 3 compliant JavaScript for canvas drawing application
(function () {
    // Reference to the canvas and its context
    var canvas = document.getElementById('drawingCanvas');
    var context;

    // Ensure the canvas matches the window size
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // Draw initial "Hello World" text on the canvas
        context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas
        context.font = "30px Arial";
        context.fillStyle = "black";
        context.fillText("Hello World", 50, 50); // Position text
    }

    // Variables for mouse tracking
    var isDrawing = false;
    var lastX = 0;
    var lastY = 0;

    // Start drawing when the mouse is pressed
    function startDrawing(e) {
        isDrawing = true;
        lastX = e.clientX - canvas.offsetLeft;
        lastY = e.clientY - canvas.offsetTop;
    }

    // Stop drawing when the mouse is released
    function stopDrawing() {
        isDrawing = false;
    }

    // Draw on the canvas as the mouse moves
    function draw(e) {
        if (!isDrawing) {
            return;
        }
        var mouseX = e.clientX - canvas.offsetLeft;
        var mouseY = e.clientY - canvas.offsetTop;

        context.beginPath();
        context.moveTo(lastX, lastY); // Start from the last position
        context.lineTo(mouseX, mouseY); // Draw to the current position
        context.strokeStyle = "black";
        context.lineWidth = 2;
        context.stroke();
        context.closePath();

        lastX = mouseX;
        lastY = mouseY;
    }

    // Attach event listeners
    window.onload = resizeCanvas; // Resize canvas on load
    window.onresize = resizeCanvas; // Resize canvas on window resize
    canvas.onmousedown = startDrawing;
    canvas.onmouseup = stopDrawing;
    canvas.onmousemove = draw;
})();
