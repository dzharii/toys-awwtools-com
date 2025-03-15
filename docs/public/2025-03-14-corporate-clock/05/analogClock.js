
function drawAnalogClock() {
    const canvas = document.getElementById("analog-clock");
    const ctx = canvas.getContext("2d");

    function updateClock() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        ctx.arc(50, 50, 40, 0, 2 * Math.PI);
        ctx.stroke();
    }
    setInterval(updateClock, 1000);
}

