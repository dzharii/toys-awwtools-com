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

  // Global deadline is defined as the current date/time (for sample purposes)
  const globalDeadline = new Date();

  // Helper function: add days to a date
  function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  // Helper function: format a Date object as YYYY-MM-DD
  function formatDate(date) {
    const year = date.getFullYear();
    const month = ("0" + (date.getMonth()+1)).slice(-2);
    const day = ("0" + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  // Helper function: generate a random 6-digit number as string
  function generateRandomWorkitemId() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Array of possible owners
  const owners = ["Alice", "Bob", "Charlie", "Dana"];

  // Helper function: randomly pick an element from an array
  function randomChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  // Helper function: generate a task with dynamic relative due date
  function generateRandomTask(index, offsetDays, statusOverride) {
    const now = new Date();
    const dueDate = addDays(now, offsetDays);
    const statusOptions = ["open", "in-progress", "closed"];
    const status = statusOverride || randomChoice(statusOptions);
    const workitemId = generateRandomWorkitemId();
    return {
      title: "Task " + index,
      dueDate: formatDate(dueDate),
      status: status,
      url: "https://example.com/task/" + workitemId,
      owner: randomChoice(owners),
      workitemId: workitemId
    };
  }

  // Define initial tasks (4 tasks with specific relative dates)
  const tasks = [
    { 
      title: "Fix login bug", 
      dueDate: formatDate(addDays(globalDeadline, 2)), 
      status: "open", 
      url: "https://example.com/task/" + generateRandomWorkitemId(),
      owner: randomChoice(owners),
      workitemId: generateRandomWorkitemId()
    },
    { 
      title: "Implement feature X", 
      dueDate: formatDate(addDays(globalDeadline, 7)), 
      status: "in-progress", 
      url: "https://example.com/task/" + generateRandomWorkitemId(),
      owner: randomChoice(owners),
      workitemId: generateRandomWorkitemId()
    },
    { 
      title: "Code review PR#42", 
      dueDate: formatDate(addDays(globalDeadline, -2)), 
      status: "closed", 
      url: "https://example.com/task/" + generateRandomWorkitemId(),
      owner: randomChoice(owners),
      workitemId: generateRandomWorkitemId()
    },
    { 
      title: "Write unit tests", 
      dueDate: formatDate(addDays(globalDeadline, -10)), 
      status: "closed", 
      url: "https://example.com/task/" + generateRandomWorkitemId(),
      owner: randomChoice(owners),
      workitemId: generateRandomWorkitemId()
    }
  ];

  // Extend task list by adding 15 additional tasks with random relative due dates (from -5 to +30 days)
  for (let i = 5; i < 20; i++) {
    // Random offset between -5 and 30 days
    const offsetDays = Math.floor(Math.random() * 36) - 5;
    tasks.push(generateRandomTask(i, offsetDays));
  }

  // Process tasks: sort by dueDate ascending and assign quadrant and computed angle
  function processTasks() {
    // Sort tasks by dueDate ascending
    tasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    // Define quadrants with angle ranges in degrees
    // Open: 270°–360°, In-Progress: 0°–90°, Closed (recent ≤7 days) → Bottom-left (180°–270°), Closed (older) → Bottom-right (90°–180°)
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
        // Maintain the same property names for compatibility:
        if (key === "inProgress") {
          task.classification = "inProgress";
        } else if (key === "open") {
          task.classification = "open";
        } else if (key === "closedRecent") {
          task.classification = "closedRecent";
        } else if (key === "closedOlder") {
          task.classification = "closedOlder";
        }
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
    ctx.setTransform(1, 0, 0, 1, 0, 0);
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

    // Draw labels for tasks (positioned 12px outside the radar circle)
    offscreenCtx.font = "10px monospace";
    offscreenCtx.textAlign = "center";
    offscreenCtx.textBaseline = "middle";

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

  // Render dynamic layer: rotating sweep wedge and task dots with pulse animation and highlight effect
  function renderDynamicLayer(timestamp) {
    // Clear dynamic layer by redrawing static background
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.drawImage(offscreenCanvas, 0, 0, canvasWidth, canvasHeight);

    // Determine elapsed time for rotation
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    const rotationProgress = (elapsed % rotationDuration) / rotationDuration;
    const sweepAngle = rotationProgress * 360; // in degrees
    const sweepAngleRad = sweepAngle * Math.PI / 180;

    // Save context and move to center
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(sweepAngleRad);

    // Draw sweep wedge: 2° arc
    const wedgeAngle = 2 * Math.PI / 180;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radarRadius, 0, wedgeAngle);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, 0, radarRadius * Math.cos(wedgeAngle), radarRadius * Math.sin(wedgeAngle));
    grad.addColorStop(0, "#39FF14");
    grad.addColorStop(1, "rgba(57,255,20,0)");
    ctx.fillStyle = grad;
    ctx.shadowBlur = 8;
    ctx.shadowColor = "#39FF14";
    ctx.fill();
    ctx.restore();

    // Draw task dots and handle pulse/highlight animation
    tasks.forEach(task => {
      // Calculate dynamic radial distance based on time remaining until task due date relative to global deadline.
      const nowDate = new Date();
      const dueDate = new Date(task.dueDate);
      let diff = dueDate - nowDate;
      if (diff < 0) diff = 0; // overdue tasks get drawn at the center
      const maxTimeRange = 30 * 24 * 60 * 60 * 1000; // 30 days in ms
      const ratio = Math.min(diff / maxTimeRange, 1);
      const dotDistance = ratio * (radarRadius - 4);

      // Compute dot position using precomputed angle for quadrant placement
      const dotX = centerX + dotDistance * Math.cos(task.angle);
      const dotY = centerY + dotDistance * Math.sin(task.angle);

      // Determine base dot parameters
      let baseDotRadius = (task.classification === "closed" || task.classification === "closedRecent" || task.classification === "closedOlder") ? 3 : 4;
      let dotFill = "#888888";
      let shadowBlur = 0;
      if (task.classification === "open") {
        dotFill = "#39FF14";
        shadowBlur = 6;
      } else if (task.classification === "inProgress") {
        dotFill = "#FFD700";
        shadowBlur = 6;
      }

      // Calculate angle difference for sweep highlighting
      const taskAngleDeg = task.angle * 180 / Math.PI;
      let sweepNormalized = sweepAngle;
      if (sweepNormalized < 0) sweepNormalized += 360;
      let angleDiff = Math.abs(sweepNormalized - taskAngleDeg);
      if (angleDiff > 180) angleDiff = 360 - angleDiff;

      let pulseOffset = 0;
      let pulseOpacity = 1;
      // If the sweep is near the task dot (within ±1°), apply pulse and highlight effect
      if (angleDiff <= 1) {
        const pulseTime = elapsed % 200;
        const pulseProgress = pulseTime / 200;
        pulseOffset = 2 * Math.abs(Math.sin(pulseProgress * Math.PI));
        pulseOpacity = 0.8 + 0.2 * Math.abs(Math.sin(pulseProgress * Math.PI));
        // Override dotFill with a brighter variant for highlighting
        if (task.classification === "open") {
          dotFill = "#B0FF90";
        } else if (task.classification === "inProgress") {
          dotFill = "#FFE680";
        } else {
          dotFill = "#BBBBBB";
        }
      }

      // Draw the task dot with pulse effect
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

    const boxWidth = textWidth + tooltipPadding * 2;
    const boxHeight = textHeight + tooltipPadding * 2;

    let boxX = x + 12;
    let boxY = y + 12;
    if (boxX + boxWidth > canvasWidth) {
      boxX = x - boxWidth - 12;
    }
    if (boxY + boxHeight > canvasHeight) {
      boxY = y - boxHeight - 12;
    }

    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.75)";
    ctx.strokeStyle = "#39FF14";
    ctx.lineWidth = 1;
    ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
    ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

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
    for (let task of tasks) {
      // Compute dynamic dot position based on due date
      const nowDate = new Date();
      const dueDate = new Date(task.dueDate);
      let diff = dueDate - nowDate;
      if (diff < 0) diff = 0;
      const maxTimeRange = 30 * 24 * 60 * 60 * 1000;
      const ratio = Math.min(diff / maxTimeRange, 1);
      const dotDistance = ratio * (radarRadius - 4);
      const dotX = centerX + dotDistance * Math.cos(task.angle);
      const dotY = centerY + dotDistance * Math.sin(task.angle);
      const baseDotRadius = (task.classification === "closed" || task.classification === "closedRecent" || task.classification === "closedOlder") ? 3 : 4;
      const dx = x - dotX;
      const dy = y - dotY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance <= baseDotRadius + 2) {
        hoveredTask = task;
        return;
      }

      // Check label area
      const labelRadius = radarRadius + 12;
      const labelX = centerX + labelRadius * Math.cos(task.angle);
      const labelY = centerY + labelRadius * Math.sin(task.angle);
      ctx.font = "10px monospace";
      const textWidth = ctx.measureText(task.title).width;
      const textHeight = 10;
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

  // Mousemove event to update hover state and cursor
  canvas.addEventListener('mousemove', function (e) {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
    checkHover(mouseX, mouseY);
    canvas.style.cursor = hoveredTask ? "pointer" : "default";
  });

  // Click event to open task URL if hovered
  canvas.addEventListener('click', function () {
    if (hoveredTask) {
      window.open(hoveredTask.url, '_blank');
    }
  });

  // Listen for window resize to adjust canvas size and redraw static layer
  window.addEventListener('resize', resizeCanvas);

  // Initialize tasks, process them, setup canvas and start animation
  processTasks();
  resizeCanvas();
  window.requestAnimationFrame(renderDynamicLayer);
})();

