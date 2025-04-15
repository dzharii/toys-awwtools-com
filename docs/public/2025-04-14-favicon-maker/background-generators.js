// Array of background pattern generators
const backgroundGenerators = [
  {
    name: "Soft Gradient",
    description: "Smooth gradient with soft pastel colors",
    impl: function (ctx) {
      const width = ctx.canvas.width;
      const height = ctx.canvas.height;

      // Choose random soft colors
      const hue1 = Math.floor(Math.random() * 360);
      const hue2 = (hue1 + 30 + Math.floor(Math.random() * 60)) % 360;

      const gradient = ctx.createLinearGradient(
        0,
        0,
        width * (0.5 + Math.random() * 0.5),
        height * (0.5 + Math.random() * 0.5)
      );

      gradient.addColorStop(0, `hsla(${hue1}, 60%, 85%, 0.4)`);
      gradient.addColorStop(1, `hsla(${hue2}, 60%, 85%, 0.4)`);

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    },
  },

  {
    name: "Dotted Pattern",
    description: "Small scattered dots with varying opacity",
    impl: function (ctx) {
      const width = ctx.canvas.width;
      const height = ctx.canvas.height;

      // Set background
      ctx.fillStyle = "rgba(245, 245, 245, 1)";
      ctx.fillRect(0, 0, width, height);

      // Choose dot color
      const hue = Math.floor(Math.random() * 360);
      const dotColor = `hsla(${hue}, 70%, 75%, 0.6)`;

      // Generate dots
      const dotCount = 20 + Math.floor(Math.random() * 40);
      ctx.fillStyle = dotColor;

      for (let i = 0; i < dotCount; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const radius = 0.5 + Math.random() * 1.5;
        const alpha = 0.1 + Math.random() * 0.4;

        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
    },
  },

  {
    name: "Subtle Grid",
    description: "Light grid pattern with thin lines",
    impl: function (ctx) {
      const width = ctx.canvas.width;
      const height = ctx.canvas.height;

      // Set background
      ctx.fillStyle = "rgba(248, 248, 248, 1)";
      ctx.fillRect(0, 0, width, height);

      // Choose grid color and properties
      const hue = Math.floor(Math.random() * 360);
      const gridColor = `hsla(${hue}, 30%, 60%, 0.1)`;
      const gridSize = 5 + Math.floor(Math.random() * 5);

      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 0.5;

      // Draw vertical lines
      for (let x = 0; x <= width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Draw horizontal lines
      for (let y = 0; y <= height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    },
  },

  {
    name: "Stripes",
    description: "Diagonal stripes with soft colors",
    impl: function (ctx) {
      const width = ctx.canvas.width;
      const height = ctx.canvas.height;

      // Set background
      ctx.fillStyle = "rgba(250, 250, 250, 1)";
      ctx.fillRect(0, 0, width, height);

      // Choose stripe properties
      const hue = Math.floor(Math.random() * 360);
      const stripeColor = `hsla(${hue}, 60%, 80%, 0.2)`;
      const stripeWidth = 3 + Math.floor(Math.random() * 5);
      const stripeGap = 3 + Math.floor(Math.random() * 5);
      const angle = (Math.random() * Math.PI) / 4;

      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.rotate(angle);
      ctx.translate(-width / 2, -height / 2);

      ctx.fillStyle = stripeColor;

      const diagonal = Math.sqrt(width * width + height * height);
      const step = stripeWidth + stripeGap;
      const startX = -diagonal;

      for (let x = startX; x < diagonal; x += step) {
        ctx.fillRect(x, -diagonal, stripeWidth, diagonal * 2);
      }

      ctx.restore();
    },
  },

  {
    name: "Noise Texture",
    description: "Subtle noise texture with faint color",
    impl: function (ctx) {
      const width = ctx.canvas.width;
      const height = ctx.canvas.height;

      // Create a light background
      ctx.fillStyle = "rgba(250, 250, 250, 1)";
      ctx.fillRect(0, 0, width, height);

      // Choose a subtle hue
      const hue = Math.floor(Math.random() * 360);

      // Create noise
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const noise = Math.random() * 10;
        data[i] += noise; // R
        data[i + 1] += noise; // G
        data[i + 2] += noise; // B

        // Add a subtle hue
        const strength = 0.05 + Math.random() * 0.05;
        data[i] += Math.sin((hue * Math.PI) / 180) * strength;
        data[i + 1] += Math.sin(((hue + 120) * Math.PI) / 180) * strength;
        data[i + 2] += Math.sin(((hue + 240) * Math.PI) / 180) * strength;
      }

      ctx.putImageData(imageData, 0, 0);
    },
  },

  {
    name: "Bubbles",
    description: "Soft transparent bubbles with varying sizes",
    impl: function (ctx) {
      const width = ctx.canvas.width;
      const height = ctx.canvas.height;

      // Set background
      ctx.fillStyle = "rgba(248, 248, 248, 1)";
      ctx.fillRect(0, 0, width, height);

      // Choose bubble color
      const hue = Math.floor(Math.random() * 360);
      const bubbleCount = 5 + Math.floor(Math.random() * 10);

      // Draw bubbles
      for (let i = 0; i < bubbleCount; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const radius = 3 + Math.random() * 15;

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);

        gradient.addColorStop(0, `hsla(${hue}, 70%, 80%, 0.1)`);
        gradient.addColorStop(0.5, `hsla(${hue}, 70%, 80%, 0.05)`);
        gradient.addColorStop(1, `hsla(${hue}, 70%, 80%, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    },
  },

  {
    name: "Confetti",
    description: "Scattered tiny colorful rectangles",
    impl: function (ctx) {
      const width = ctx.canvas.width;
      const height = ctx.canvas.height;

      // Set background
      ctx.fillStyle = "rgba(250, 250, 250, 1)";
      ctx.fillRect(0, 0, width, height);

      const baseHue = Math.floor(Math.random() * 360);
      const count = 20 + Math.floor(Math.random() * 30);

      for (let i = 0; i < count; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = 1 + Math.random() * 2;

        // Use complementary colors within a range
        const hue = (baseHue + Math.floor(Math.random() * 60)) % 360;
        const alpha = 0.05 + Math.random() * 0.2;

        ctx.fillStyle = `hsla(${hue}, 70%, 70%, ${alpha})`;
        ctx.fillRect(x, y, size, size);
      }
    },
  },

  {
    name: "Waves",
    description: "Subtle wave pattern with translucent colors",
    impl: function (ctx) {
      const width = ctx.canvas.width;
      const height = ctx.canvas.height;

      // Set background
      ctx.fillStyle = "rgba(248, 248, 248, 1)";
      ctx.fillRect(0, 0, width, height);

      // Wave properties
      const hue = Math.floor(Math.random() * 360);
      const wavesCount = 2 + Math.floor(Math.random() * 3);
      const amplitude = 5 + Math.random() * 10;
      const frequency = 0.01 + Math.random() * 0.05;

      ctx.strokeStyle = `hsla(${hue}, 60%, 80%, 0.2)`;
      ctx.lineWidth = 1;

      for (let wave = 0; wave < wavesCount; wave++) {
        const waveOffset = wave * (height / wavesCount);
        const phaseShift = Math.random() * Math.PI * 2;

        ctx.beginPath();

        for (let x = 0; x < width; x++) {
          const y =
            waveOffset + amplitude * Math.sin(x * frequency + phaseShift);

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.stroke();
      }
    },
  },
  // more background generators can be added here:
];

// Make the array available globally
window.backgroundGenerators = backgroundGenerators;
