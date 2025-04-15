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

  {
    name: "Rainbow Circle",
    description:
      "Colorful rainbow circular gradient that highlights the center emoji",
    impl: function (ctx) {
      const width = ctx.canvas.width;
      const height = ctx.canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;

      // Create radial gradient from outer to inner
      const gradient = ctx.createRadialGradient(
        centerX,
        centerY,
        width * 0.8,
        centerX,
        centerY,
        width * 0.1
      );

      // Rainbow colors with high transparency at the end
      gradient.addColorStop(0, "rgba(255, 0, 0, 0.2)"); // Red
      gradient.addColorStop(0.16, "rgba(255, 125, 0, 0.2)"); // Orange
      gradient.addColorStop(0.33, "rgba(255, 255, 0, 0.2)"); // Yellow
      gradient.addColorStop(0.5, "rgba(0, 255, 0, 0.2)"); // Green
      gradient.addColorStop(0.66, "rgba(0, 125, 255, 0.2)"); // Blue
      gradient.addColorStop(0.83, "rgba(75, 0, 130, 0.2)"); // Indigo
      gradient.addColorStop(1, "rgba(250, 250, 250, 1)"); // White center

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    },
  },

  {
    name: "Spotlight",
    description: "Soft spotlight effect that focuses on the center",
    impl: function (ctx) {
      const width = ctx.canvas.width;
      const height = ctx.canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;

      // Create a subtle vignette effect
      const gradient = ctx.createRadialGradient(
        centerX,
        centerY,
        width * 0.1,
        centerX,
        centerY,
        width * 0.7
      );

      const hue = Math.floor(Math.random() * 360);
      gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
      gradient.addColorStop(1, `hsla(${hue}, 40%, 85%, 0.7)`);

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    },
  },

  {
    name: "Whirlpool",
    description: "Spiral pattern that draws attention to the center",
    impl: function (ctx) {
      const width = ctx.canvas.width;
      const height = ctx.canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;

      // Background color
      ctx.fillStyle = "rgb(250, 250, 250)";
      ctx.fillRect(0, 0, width, height);

      // Spiral properties
      const hue = Math.floor(Math.random() * 360);
      const spiralColor = `hsla(${hue}, 70%, 75%, 0.4)`;
      const spirals = 4 + Math.floor(Math.random() * 4);
      const rotation = Math.random() * Math.PI * 2;

      ctx.strokeStyle = spiralColor;
      ctx.lineWidth = 1;

      // Draw spiral
      for (let i = 0; i < spirals; i++) {
        const angleOffset = (i / spirals) * Math.PI * 2;

        ctx.beginPath();

        for (let angle = 0; angle < 10; angle += 0.1) {
          const radius = angle * (width / 40);
          const x = centerX + radius * Math.cos(angle + angleOffset + rotation);
          const y = centerY + radius * Math.sin(angle + angleOffset + rotation);

          if (angle === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.stroke();
      }
    },
  },

  {
    name: "Ripples",
    description: "Water-like ripple effect emanating from the center",
    impl: function (ctx) {
      const width = ctx.canvas.width;
      const height = ctx.canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;

      // Background fill
      ctx.fillStyle = "rgb(248, 248, 248)";
      ctx.fillRect(0, 0, width, height);

      // Ripple properties
      const hue = Math.floor(Math.random() * 360);
      const rippleColor = `hsla(${hue}, 60%, 80%, 0.15)`;
      const rippleCount = 3 + Math.floor(Math.random() * 3);
      const maxRadius = width * 0.8;

      ctx.strokeStyle = rippleColor;
      ctx.lineWidth = 2;

      // Draw concentric circles
      for (let i = 1; i <= rippleCount; i++) {
        const radius = (maxRadius / rippleCount) * i;

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();
      }
    },
  },

  {
    name: "Starburst",
    description: "Radiating lines from the center creating a starburst effect",
    impl: function (ctx) {
      const width = ctx.canvas.width;
      const height = ctx.canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;

      // Background fill
      ctx.fillStyle = "rgb(250, 250, 250)";
      ctx.fillRect(0, 0, width, height);

      // Starburst properties
      const hue = Math.floor(Math.random() * 360);
      const rayColor = `hsla(${hue}, 70%, 70%, 0.2)`;
      const rayCount = 12 + Math.floor(Math.random() * 12);
      const maxLength = width * 0.7;
      const rotation = Math.random() * Math.PI * 2;

      ctx.strokeStyle = rayColor;
      ctx.lineWidth = 1;

      // Draw rays
      for (let i = 0; i < rayCount; i++) {
        const angle = (i / rayCount) * Math.PI * 2 + rotation;
        const endX = centerX + maxLength * Math.cos(angle);
        const endY = centerY + maxLength * Math.sin(angle);

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
      }
    },
  },

  {
    name: "Psychedelic Waves",
    description: "Colorful wavy patterns inspired by psychedelic art",
    impl: function (ctx) {
      const width = ctx.canvas.width;
      const height = ctx.canvas.height;

      // Background
      ctx.fillStyle = "rgba(250, 250, 250, 1)";
      ctx.fillRect(0, 0, width, height);

      // Wave properties
      const baseHue = Math.floor(Math.random() * 360);
      const layerCount = 3;
      const frequency = 0.05 + Math.random() * 0.1;
      const amplitude = 5 + Math.random() * 5;
      const center = 20 + Math.random() * 10;

      for (let layer = 0; layer < layerCount; layer++) {
        // Different hue for each layer
        const hue = (baseHue + layer * 120) % 360;
        ctx.strokeStyle = `hsla(${hue}, 70%, 70%, 0.15)`;
        ctx.lineWidth = 3;

        const yOffset = layer * (height / (layerCount + 1));

        ctx.beginPath();

        for (let x = 0; x < width; x++) {
          // Create more complex wave patterns
          const y =
            yOffset +
            amplitude * Math.sin(x * frequency) +
            amplitude * Math.cos(x * frequency * 0.7 + layer);

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.stroke();
      }

      // Clear center area for better emoji visibility
      const centerRadius = width * 0.25;
      ctx.globalCompositeOperation = "destination-out";

      const centerGradient = ctx.createRadialGradient(
        width / 2,
        height / 2,
        0,
        width / 2,
        height / 2,
        centerRadius
      );

      centerGradient.addColorStop(0, "rgba(255, 255, 255, 0.7)");
      centerGradient.addColorStop(1, "rgba(255, 255, 255, 0)");

      ctx.fillStyle = centerGradient;
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, centerRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalCompositeOperation = "source-over";
    },
  },

  {
    name: "Circuit Board",
    description: "Electronic circuit board inspired pattern",
    impl: function (ctx) {
      const width = ctx.canvas.width;
      const height = ctx.canvas.height;

      // Background
      ctx.fillStyle = "rgb(248, 248, 248)";
      ctx.fillRect(0, 0, width, height);

      // Circuit properties
      const hue = Math.floor(Math.random() * 60); // Green/blue hues work well
      const lineColor = `hsla(${hue}, 70%, 50%, 0.2)`;
      const nodeColor = `hsla(${hue}, 70%, 50%, 0.3)`;
      const gridSize = 8;
      const nodeSize = 2;
      const nodeProbability = 0.3;

      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 1;

      // Create circuit grid avoiding the center
      const centerX = width / 2;
      const centerY = height / 2;
      const clearRadius = width * 0.25; // Don't draw circuits in center

      // Draw horizontal lines
      for (let y = 0; y <= height; y += gridSize) {
        ctx.beginPath();

        let inLine = false;
        for (let x = 0; x <= width; x += gridSize) {
          // Skip center area
          const distFromCenter = Math.sqrt(
            Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
          );

          if (distFromCenter < clearRadius) {
            if (inLine) {
              ctx.stroke();
              inLine = false;
            }
            continue;
          }

          if (!inLine) {
            ctx.moveTo(x, y);
            inLine = true;
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.stroke();
      }

      // Draw vertical lines
      for (let x = 0; x <= width; x += gridSize) {
        ctx.beginPath();

        let inLine = false;
        for (let y = 0; y <= height; y += gridSize) {
          // Skip center area
          const distFromCenter = Math.sqrt(
            Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
          );

          if (distFromCenter < clearRadius) {
            if (inLine) {
              ctx.stroke();
              inLine = false;
            }
            continue;
          }

          if (!inLine) {
            ctx.moveTo(x, y);
            inLine = true;
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.stroke();
      }

      // Add circuit nodes
      ctx.fillStyle = nodeColor;

      for (let x = 0; x <= width; x += gridSize) {
        for (let y = 0; y <= height; y += gridSize) {
          // Skip center area
          const distFromCenter = Math.sqrt(
            Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
          );
          if (distFromCenter < clearRadius) continue;

          if (Math.random() < nodeProbability) {
            ctx.beginPath();
            ctx.arc(x, y, nodeSize, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    },
  },

  {
    name: "Polka Dots",
    description: "Classic polka dot pattern with a clear central area",
    impl: function (ctx) {
      const width = ctx.canvas.width;
      const height = ctx.canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;

      // Background
      ctx.fillStyle = "rgb(250, 250, 250)";
      ctx.fillRect(0, 0, width, height);

      // Dot properties
      const hue = Math.floor(Math.random() * 360);
      const dotColor = `hsla(${hue}, 60%, 75%, 0.3)`;
      const dotSize = 3 + Math.random() * 4;
      const dotSpacing = 12 + Math.random() * 4;
      const clearRadius = width * 0.25; // Don't place dots in center

      ctx.fillStyle = dotColor;

      // Draw grid of dots
      for (let x = dotSpacing; x < width; x += dotSpacing) {
        for (let y = dotSpacing; y < height; y += dotSpacing) {
          // Skip center area
          const distFromCenter = Math.sqrt(
            Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
          );
          if (distFromCenter < clearRadius) continue;

          ctx.beginPath();
          ctx.arc(x, y, dotSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    },
  },

  {
    name: "Cosmic Background",
    description: "Starfield with subtle nebula effects",
    impl: function (ctx) {
      const width = ctx.canvas.width;
      const height = ctx.canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;

      // Create dark background with gradient
      const bgGradient = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        width * 0.8
      );

      // Choose nebula color
      const hue = Math.floor(Math.random() * 360);

      bgGradient.addColorStop(0, "rgba(255, 255, 255, 1)");
      bgGradient.addColorStop(0.5, `hsla(${hue}, 40%, 90%, 0.8)`);
      bgGradient.addColorStop(1, `hsla(${hue}, 60%, 85%, 0.4)`);

      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);

      // Add stars
      const starCount = 30 + Math.floor(Math.random() * 40);
      const starSizes = [0.5, 1, 1.5];

      for (let i = 0; i < starCount; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;

        // Skip center area
        const distFromCenter = Math.sqrt(
          Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
        );
        if (distFromCenter < width * 0.25) continue;

        const starSize =
          starSizes[Math.floor(Math.random() * starSizes.length)];
        const brightness = 0.5 + Math.random() * 0.5;

        ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
        ctx.beginPath();
        ctx.arc(x, y, starSize, 0, Math.PI * 2);
        ctx.fill();
      }
    },
  },

  {
    name: "Diagonal Plaid",
    description: "Subtle diagonal plaid pattern with clear center",
    impl: function (ctx) {
      const width = ctx.canvas.width;
      const height = ctx.canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;

      // Background
      ctx.fillStyle = "rgb(250, 250, 250)";
      ctx.fillRect(0, 0, width, height);

      // Plaid properties
      const hue = Math.floor(Math.random() * 360);
      const lineColor = `hsla(${hue}, 50%, 75%, 0.15)`;
      const lineColor2 = `hsla(${(hue + 30) % 360}, 50%, 75%, 0.15)`;
      const lineWidth = 4;
      const lineSpacing = 12;
      const angle = Math.PI / 4; // 45 degrees
      const clearRadius = width * 0.25;

      ctx.save();

      // Draw first set of diagonal lines
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = lineWidth;

      ctx.translate(centerX, centerY);
      ctx.rotate(angle);
      ctx.translate(-centerX, -centerY);

      // Create a clipping path to avoid center
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, width, height);
      ctx.arc(centerX, centerY, clearRadius, 0, Math.PI * 2, true);
      ctx.clip();

      // Draw lines
      for (let pos = -width; pos < width + height; pos += lineSpacing) {
        ctx.beginPath();
        ctx.moveTo(pos, 0);
        ctx.lineTo(pos, height);
        ctx.stroke();
      }

      ctx.restore(); // Restore from clip

      // Draw second set of perpendicular lines
      ctx.rotate(-angle * 2);
      ctx.strokeStyle = lineColor2;

      // Create a clipping path to avoid center
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, width, height);
      ctx.arc(centerX, centerY, clearRadius, 0, Math.PI * 2, true);
      ctx.clip();

      for (let pos = -width; pos < width + height; pos += lineSpacing) {
        ctx.beginPath();
        ctx.moveTo(pos, 0);
        ctx.lineTo(pos, height);
        ctx.stroke();
      }

      ctx.restore(); // Restore from clip

      ctx.restore(); // Restore rotation
    },
  },
];

// Make the array available globally
window.backgroundGenerators = backgroundGenerators;
