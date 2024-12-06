document.addEventListener("DOMContentLoaded", function () {
  const canvas = document.getElementById("matrixCanvas");
  const ctx = canvas.getContext("2d");
  const video = document.getElementById("videoElement");
  const pipButton = document.getElementById("pipButton");

  let w, h;
  const resizeCanvas = () => {
    w = canvas.width = 800;
    h = canvas.height = 600;
  };

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
  const fontSize = 20;
  const rowSpacing = 20;
  const columns = Array(Math.floor(w / fontSize)).fill(0);

  function generateUUID() {
    var d = new Date().getTime();

    var d2 =
      (typeof performance !== "undefined" &&
        performance.now &&
        performance.now() * 1000) ||
      0;

    return "{xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx}".replace(
      /[xy]/g,
      function (c) {
        var r = Math.random() * 16;
        if (d > 0) {
          r = (d + r) % 16 | 0;
          d = Math.floor(d / 16);
        } else {
          r = (d2 + r) % 16 | 0;
          d2 = Math.floor(d2 / 16);
        }

        return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
      }
    );
  }

  function draw() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "green";
    ctx.font = fontSize + "pt monospace";
    let pad = 0;
    let uud = generateUUID();
    let nextChar = 0;
    columns.forEach((y, ind) => {
      uud = generateUUID();
      const text = uud[nextChar];
      nextChar = nextChar + 1;
      if (nextChar >= uud.length) {
        nextChar = 0;
      }

      ctx.fillText(text, ind * fontSize + pad, y);
      pad += Math.floor(fontSize / 2);
      // Randomly reset the end of the column if it exceeds the canvas height

      if (y > h && Math.random() > 0.975) {
        columns[ind] = 0;
      } else {
        // Different speed for each column
        columns[ind] = y + (rowSpacing + Math.random() * 10);
      }
    });
  }

  // Capture the stream from the canvas
  const stream = canvas.captureStream(30); // 30 FPS
  video.srcObject = stream;
  // Start the digital rain animation
  setInterval(draw, 50);
  // Ensure the video starts playing
  video.play();
  // Check if Picture-in-Picture is supported

  if ("pictureInPictureEnabled" in document) {
    pipButton.disabled = false;
    pipButton.addEventListener("click", async function () {
      try {
        // Ensure video is playing before entering PiP
        await video.play();
        // Add a small delay to ensure the stream is ready

        setTimeout(async () => {
          if (!document.pictureInPictureElement) {
            await video.requestPictureInPicture();
          } else {
            await document.exitPictureInPicture();
          }
        }, 100); // 100ms delay to ensure the video stream is ready
      } catch (error) {
        console.error("Failed to enter Picture-in-Picture mode:", error);
      }
    });
  } else {
    pipButton.disabled = true;

    pipButton.textContent = "PiP not supported";
  }
});
