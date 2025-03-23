/* script.js */

// Immediately Invoked Function Expression to avoid global namespace pollution
(function () {
  'use strict';

  // Retrieve canvas and context
  const canvas = document.getElementById('radarCanvas');
  const ctx = canvas.getContext('2d');

  // Offscreen canvas for static background rendering
  const offscreenCanvas = document.createElement('canvas');
  const offscreenCtx = offscreenCanvas.getContext('2d');

  // Global variables for canvas dimensions and drawing parameters
  let canvasWidth, canvasHeight, centerX, centerY, radarRadius;

  // Animation control variables
  let startTime = null;
  const rotationDuration = 8000; // 8 seconds for full rotation

  // Store current mouse position for interactivity
  let mouseX = 0, mouseY = 0;
  let hoveredTask = null;

  // Define sample tasks (data model)
  const tasks = [
    { "title": "Fix login bug",         "dueDate": "2025-03-28", "status": "open",         "url": "https://example.com/task/1" },
    { "title": "Implement feature X",   "dueDate": "2025-04-05", "status": "in-progress",  "url": "https://example.com/task/2" },
    { "title": "Code review PR#42",      "dueDate": "2025-03-18", "status": "closed",       "url": "https://example.com/task/3" },
    { "title": "Write unit tests",       "dueDate": "2025-03-01", "status": "closed",       "url": "https://example.com/task/4" }
  ];

  // Process tasks: sort by dueDate ascending and assign quadrant and computed angle
  function processTasks() {
    // Sort tasks by dueDate ascending
    tasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    // Define quadrants with angle ranges in degrees
    // Open: 270°–360°, In-Progress: 0°–90°, Closed (recent ≤7 days): 180°–270°, Closed (older): 90°–180°
    const quadrants = {
      open: { range: [270, 360], tasks: [] },
      inProgress: { range: [0, 90], tasks: [] },
      closedRecent: { range: [180, 270], tasks: [] },
      closedOlder: { range: [90, 180], tasks: [] }
    };

    const now = new Date();

    // Classify each task into its quadrant
    tasks.forEach(task => {
      if (task.status === 'open') {
        quadrants.open.tasks.push(task);
      } else if (task.status === 'in-progress') {
        quadrants.inProgress.tasks.push(task);
      } else if (task.status === 'closed') {
        // Calculate difference in days between dueDate and now (absolute difference)
        const dueDate = new Date(task.dueDate);
        const diffTime = Math.abs(now - dueDate);
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        if (diffDays <= 7) {
          quadrants.closedRecent.tasks.push(task);
        } else {
          quadrants.closedOlder.tasks.push(task);
        }
      }
    });

    // For each quadrant, distribute tasks evenly across the quadrant's angular range
    Object.keys(quadrants).forEach(key => {
      const quadrant = quadrants[key];
      const { range, tasks: quadrantTasks } = quadrant;
      const count = quadrantTasks.length;
      if (count === 0) return;
      const startAngle = range[0];
      const endAngle = range[1];
      const step = (endAngle - startAngle) / (count + 1);
      quadrantTasks.forEach((task, index) => {
        // Calculate angle in degrees and convert to radians for drawing
        const angleDeg = startAngle + step * (index + 1);
        task.angle = angleDeg * Math.PI / 180;
        // Also store a classification property for label color and dot style
        task.classification = key;
      });
    });
  }

  // Setup canvas dimensions and recalc drawing parameters
  function resizeCanvas() {
    const container = canvas.parentElement;
    // Get computed width and height in CSS pixels
    const rect = container.getBoundingClientRect();
    canvasWidth = rect.width;
    canvasHeight = rect.height;

    // Adjust for devicePixelRatio for crisp rendering
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvasWidth * dpr;
    canvas.height = canvasHeight * dpr;

    // Also resize offscreen canvas accordingly
    offscreenCanvas.width = canvas.width;
    offscreenCanvas.height = canvas.height;

    // Scale contexts
    ctx.setTransform(1, 0, 0, 1, 0, 0); // reset any previous transform
    ctx.scale(dpr, dpr);
    offscreenCtx.setTransform(1, 0, 0, 1, 0, 0);
    offscreenCtx.scale(dpr, dpr);

    // Recalculate center and radar radius (with 10px padding)
    centerX = canvasWidth / 2;
    centerY = canvasHeight / 2;
    radarRadius = Math.min(canvasWidth, canvasHeight) / 2 - 10;

    // Re-render static layer
    renderStaticLayer();
  }

  // Render static background to offscreen canvas (radar circle, grid, scanlines, vignette, labels)
  function renderStaticLayer() {
    // Clear offscreen canvas
    offscreenCtx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw radar circle with radial gradient fill and neon green circumference
    const gradient = offscreenCtx.createRadialGradient(centerX, centerY, radarRadius * 0.1, centerX, centerY, radarRadius);
    gradient.addColorStop(0, "#161616");
    gradient.addColorStop(1, "#2B2B2B");

    offscreenCtx.beginPath();
    offscreenCtx.arc(centerX, centerY, radarRadius, 0, Math.PI * 2);
    offscreenCtx.fillStyle = gradient;
    offscreenCtx.fill();
    offscreenCtx.lineWidth = 2;
    offscreenCtx.strokeStyle = "#39FF14";
    offscreenCtx.stroke();

    // Draw polar grid: 4 concentric circles (0.25R, 0.5R, 0.75R, R)
    offscreenCtx.lineWidth = 1;
    offscreenCtx.strokeStyle = "rgba(255,255,255,0.05)";
    for (let i = 1; i <= 4; i++) {
      offscreenCtx.beginPath();
      offscreenCtx.arc(centerX, centerY, (radarRadius * i) / 4, 0, Math.PI * 2);
      offscreenCtx.stroke();
    }

    // Draw 8 radial lines every 45°
    for (let angle = 0; angle < 360; angle += 45) {
      const rad = angle * Math.PI / 180;
      offscreenCtx.beginPath();
      offscreenCtx.moveTo(centerX, centerY);
      offscreenCtx.lineTo(centerX + radarRadius * Math.cos(rad), centerY + radarRadius * Math.sin(rad));
      offscreenCtx.stroke();
    }

    // Draw scanlines: horizontal lines every 4px across the canvas
    offscreenCtx.strokeStyle = "rgba(255,255,255,0.03)";
    for (let y = 0; y < canvasHeight; y += 4) {
      offscreenCtx.beginPath();
      offscreenCtx.moveTo(0, y);
      offscreenCtx.lineTo(canvasWidth, y);
      offscreenCtx.stroke();
    }

    // Draw vignette: radial gradient from transparent center to dark edges
    const vignetteGradient = offscreenCtx.createRadialGradient(centerX, centerY, radarRadius * 0.1, centerX, centerY, radarRadius);
    vignetteGradient.addColorStop(0, "rgba(0,0,0,0)");
    vignetteGradient.addColorStop(1, "rgba(0,0,0,0.6)");
    offscreenCtx.fillStyle = vignetteGradient;
    offscreenCtx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw labels for tasks
    offscreenCtx.font = "10px monospace";
    offscreenCtx.textAlign = "center";
    offscreenCtx.textBaseline = "middle";

    // For each task, draw label 12px outside the circle along its computed angle
    tasks.forEach(task => {
      const labelRadius = radarRadius + 12;
      const labelX = centerX + labelRadius * Math.cos(task.angle);
      const labelY = centerY + labelRadius * Math.sin(task.angle);
      // Set color based on classification: neon green for open/in-progress, gray for closed
      if (task.classification === "open" || task.classification === "inProgress") {
        offscreenCtx.fillStyle = "#39FF14";
      } else {
        offscreenCtx.fillStyle = "#AAAAAA";
      }
      offscreenCtx.fillText(task.title, labelX, labelY);
    });
  }

  // Render dynamic layer: rotating sweep wedge and task dots with pulse animation
  function renderDynamicLayer(timestamp) {
    // Clear dynamic layer (only the main canvas, but preserve static background by drawing it first)
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.drawImage(offscreenCanvas, 0, 0, canvasWidth, canvasHeight);

    // Determine elapsed time for rotation
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    const rotationProgress = (elapsed % rotationDuration) / rotationDuration;
    const sweepAngle = rotationProgress * 360; // in degrees

    // Convert sweep angle to radians for drawing
    const sweepAngleRad = sweepAngle * Math.PI / 180;

    // Save context and move to center
    ctx.save();
    ctx.translate(centerX, centerY);
    // Rotate canvas so that the sweep wedge starts at the current sweep angle
    ctx.rotate(sweepAngleRad);

    // Draw sweep wedge: 2° arc (in radians: 2 * Math.PI / 180)
    const wedgeAngle = 2 * Math.PI / 180;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radarRadius, 0, wedgeAngle);
    ctx.closePath();

    // Create linear gradient for the wedge: from the start (solid neon green) to transparent
    const grad = ctx.createLinearGradient(0, 0, radarRadius * Math.cos(wedgeAngle), radarRadius * Math.sin(wedgeAngle));
    grad.addColorStop(0, "#39FF14");
    grad.addColorStop(1, "rgba(57,255,20,0)");
    ctx.fillStyle = grad;

    // Set glow effect
    ctx.shadowBlur = 8;
    ctx.shadowColor = "#39FF14";
    ctx.fill();
    ctx.restore();

    // Draw task dots and handle pulse animation
    tasks.forEach(task => {
      // Compute task dot position: place dot at (radarRadius - 4) along task.angle
      const dotBaseRadius = (task.classification === "closed") ? 3 : 4;
      const baseDotRadius = (task.classification === "closedRecent" || task.classification === "closedOlder") ? 3 : 4;
      const dotX = centerX + (radarRadius - 4) * Math.cos(task.angle);
      const dotY = centerY + (radarRadius - 4) * Math.sin(task.angle);

      // Determine dot fill style and shadow based on task classification
      let dotFill = "#888888";
      let shadowBlur = 0;
      if (task.classification === "open") {
        dotFill = "#39FF14";
        shadowBlur = 6;
      } else if (task.classification === "inProgress") {
        dotFill = "#FFD700";
        shadowBlur = 6;
      }

      // Check if the sweep is near the task angle (within ±1° in radians)
      const taskAngleDeg = task.angle * 180 / Math.PI;
      let sweepNormalized = sweepAngle;
      if (sweepNormalized < 0) sweepNormalized += 360;
      let angleDiff = Math.abs(sweepNormalized - taskAngleDeg);
      if (angleDiff > 180) angleDiff = 360 - angleDiff;

      let pulseOffset = 0;
      let pulseOpacity = 1;
      if (angleDiff <= 1) {
        // Calculate a pulse factor oscillating over 200ms
        const pulseTime = elapsed % 200;
        const pulseProgress = pulseTime / 200;
        // Oscillate radius addition between 0 and 2 pixels
        pulseOffset = 2 * Math.abs(Math.sin(pulseProgress * Math.PI));
        // Oscillate opacity between 0.8 and 1
        pulseOpacity = 0.8 + 0.2 * Math.abs(Math.sin(pulseProgress * Math.PI));
      }

      ctx.beginPath();
      ctx.arc(dotX, dotY, baseDotRadius + pulseOffset, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fillStyle = dotFill;
      ctx.globalAlpha = pulseOpacity;
      if (shadowBlur > 0) {
        ctx.shadowBlur = shadowBlur;
        ctx.shadowColor = dotFill;
      } else {
        ctx.shadowBlur = 0;
      }
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
    });

    // Draw tooltip if a task is hovered
    if (hoveredTask) {
      drawTooltip(hoveredTask, mouseX, mouseY);
    }

    // Request next animation frame
    window.requestAnimationFrame(renderDynamicLayer);
  }

  // Draw tooltip near the mouse cursor with task details
  function drawTooltip(task, x, y) {
    const tooltipPadding = 8;
    const tooltipFont = "9px monospace";
    const tooltipText = `${task.title} (${task.dueDate})`;

    ctx.font = tooltipFont;
    const textMetrics = ctx.measureText(tooltipText);
    const textWidth = textMetrics.width;
    const textHeight = 9; // approximate height for 9px font

    // Define tooltip box dimensions
    const boxWidth = textWidth + tooltipPadding * 2;
    const boxHeight = textHeight + tooltipPadding * 2;

    // Adjust tooltip position if near canvas edge
    let boxX = x + 12;
    let boxY = y + 12;
    if (boxX + boxWidth > canvasWidth) {
      boxX = x - boxWidth - 12;
    }
    if (boxY + boxHeight > canvasHeight) {
      boxY = y - boxHeight - 12;
    }

    // Draw tooltip background
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.75)";
    ctx.strokeStyle = "#39FF14";
    ctx.lineWidth = 1;
    ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
    ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

    // Draw tooltip text
    ctx.fillStyle = "#FFFFFF";
    ctx.font = tooltipFont;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(tooltipText, boxX + tooltipPadding, boxY + tooltipPadding);
    ctx.restore();
  }

  // Check if mouse is hovering near any task dot or label area
  function checkHover(x, y) {
    hoveredTask = null;
    // Iterate tasks and check proximity
    for (let task of tasks) {
      // Compute dot position
      const dotBaseRadius = (task.classification === "closed" || task.classification === "closedRecent" || task.classification === "closedOlder") ? 3 : 4;
      const dotX = centerX + (radarRadius - 4) * Math.cos(task.angle);
      const dotY = centerY + (radarRadius - 4) * Math.sin(task.angle);
      const dx = x - dotX;
      const dy = y - dotY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      // Consider a hit if within dot radius + 2px
      if (distance <= dotBaseRadius + 2) {
        hoveredTask = task;
        return;
      }

      // Also check label area: approximate a rectangle around the label text
      const labelRadius = radarRadius + 12;
      const labelX = centerX + labelRadius * Math.cos(task.angle);
      const labelY = centerY + labelRadius * Math.sin(task.angle);
      ctx.font = "10px monospace";
      const textWidth = ctx.measureText(task.title).width;
      const textHeight = 10; // approximate height
      // Define rectangle centered at labelX, labelY
      const rectX = labelX - textWidth / 2 - 2;
      const rectY = labelY - textHeight / 2 - 2;
      const rectWidth = textWidth + 4;
      const rectHeight = textHeight + 4;
      if (x >= rectX && x <= rectX + rectWidth && y >= rectY && y <= rectY + rectHeight) {
        hoveredTask = task;
        return;
      }
    }
  }

  // Event listener for mouse movement to update hover state and cursor style
  canvas.addEventListener('mousemove', function (e) {
    // Get bounding rect for proper coordinates
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
    checkHover(mouseX, mouseY);
    // Change cursor style if hovering a task
    if (hoveredTask) {
      canvas.style.cursor = "pointer";
    } else {
      canvas.style.cursor = "default";
    }
  });

  // Event listener for click to open task URL if hovered
  canvas.addEventListener('click', function () {
    if (hoveredTask) {
      window.open(hoveredTask.url, '_blank');
    }
  });

  // Listen for window resize to adjust canvas size and redraw static layer
  window.addEventListener('resize', resizeCanvas);

  // Initialize tasks and canvas then start animation
  processTasks();
  resizeCanvas();
  window.requestAnimationFrame(renderDynamicLayer);
})();

