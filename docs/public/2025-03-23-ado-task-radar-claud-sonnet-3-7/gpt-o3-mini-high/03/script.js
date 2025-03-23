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
    const offsetDays = Math.floor(Math.random() * 36) - 5; // random offset between -5 and +30
    tasks.push(generateRandomTask(i, offsetDays));
  }

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

    // Distribute tasks evenly across each quadrant's angle range
    Object.keys(quadrants).forEach(key => {
      const quadrant = quadrants[key];
      const { range, tasks: quadrantTasks } = quadrant;
      const count = quadrantTasks.length;
      if (count === 0) return;

      const startAngle = range[0];
      const endAngle = range[1];
      const step = (endAngle - startAngle) / (count + 1);

      quadrantTasks.forEach((task, index) => {
        const angleDeg = startAngle + step * (index + 1);
        task.angle = angleDeg * Math.PI / 180;
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
    const rect = container.getBoundingClientRect();
    canvasWidth = rect.width;
    canvasHeight = rect.height;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvasWidth * dpr;
    canvas.height = canvasHeight * dpr;

    offscreenCanvas.width = canvas.width;
    offscreenCanvas.height = canvas.height;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    offscreenCtx.setTransform(1, 0, 0, 1, 0, 0);
    offscreenCtx.scale(dpr, dpr);

    centerX = canvasWidth / 2;
    centerY = canvasHeight / 2;
    radarRadius = Math.min(canvasWidth, canvasHeight) / 2 - 10;

    renderStaticLayer();
  }

  // Render static background to offscreen canvas (radar circle, grid, scanlines, vignette)
  function renderStaticLayer() {
    offscreenCtx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Radar circle gradient
    const gradient = offscreenCtx.createRadialGradient(
      centerX, centerY, radarRadius * 0.1,
      centerX, centerY, radarRadius
    );
    gradient.addColorStop(0, "#161616");
    gradient.addColorStop(1, "#2B2B2B");

    offscreenCtx.beginPath();
    offscreenCtx.arc(centerX, centerY, radarRadius, 0, Math.PI * 2);
    offscreenCtx.fillStyle = gradient;
    offscreenCtx.fill();
    offscreenCtx.lineWidth = 2;
    offscreenCtx.strokeStyle = "#39FF14";
    offscreenCtx.stroke();

    // Polar grid: concentric circles
    offscreenCtx.lineWidth = 1;
    offscreenCtx.strokeStyle = "rgba(255,255,255,0.05)";
    for (let i = 1; i <= 4; i++) {
      offscreenCtx.beginPath();
      offscreenCtx.arc(centerX, centerY, (radarRadius * i) / 4, 0, Math.PI * 2);
      offscreenCtx.stroke();
    }

    // Radial lines every 45°
    for (let angle = 0; angle < 360; angle += 45) {
      const rad = angle * Math.PI / 180;
      offscreenCtx.beginPath();
      offscreenCtx.moveTo(centerX, centerY);
      offscreenCtx.lineTo(centerX + radarRadius * Math.cos(rad), centerY + radarRadius * Math.sin(rad));
      offscreenCtx.stroke();
    }

    // Scanlines: horizontal lines every 4px
    offscreenCtx.strokeStyle = "rgba(255,255,255,0.03)";
    for (let y = 0; y < canvasHeight; y += 4) {
      offscreenCtx.beginPath();
      offscreenCtx.moveTo(0, y);
      offscreenCtx.lineTo(canvasWidth, y);
      offscreenCtx.stroke();
    }

    // Vignette
    const vignetteGradient = offscreenCtx.createRadialGradient(
      centerX, centerY, radarRadius * 0.1,
      centerX, centerY, radarRadius
    );
    vignetteGradient.addColorStop(0, "rgba(0,0,0,0)");
    vignetteGradient.addColorStop(1, "rgba(0,0,0,0.6)");
    offscreenCtx.fillStyle = vignetteGradient;
    offscreenCtx.fillRect(0, 0, canvasWidth, canvasHeight);
  }

  // Render dynamic layer: rotating sweep wedge, task dots, labels, highlights
  function renderDynamicLayer(timestamp) {
    // Clear main canvas, then draw static background
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.drawImage(offscreenCanvas, 0, 0, canvasWidth, canvasHeight);

    // Rotation logic
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    const rotationProgress = (elapsed % rotationDuration) / rotationDuration;
    const sweepAngle = rotationProgress * 360;
    const sweepAngleRad = sweepAngle * Math.PI / 180;

    // Draw sweep wedge
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(sweepAngleRad);
    const wedgeAngle = 2 * Math.PI / 180;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radarRadius, 0, wedgeAngle);
    ctx.closePath();
    const grad = ctx.createLinearGradient(
      0, 0,
      radarRadius * Math.cos(wedgeAngle), radarRadius * Math.sin(wedgeAngle)
    );
    grad.addColorStop(0, "#39FF14");
    grad.addColorStop(1, "rgba(57,255,20,0)");
    ctx.fillStyle = grad;
    ctx.shadowBlur = 8;
    ctx.shadowColor = "#39FF14";
    ctx.fill();
    ctx.restore();

    // Draw task dots and labels
    tasks.forEach(task => {
      // Distance from center depends on time to due date
      const nowDate = new Date();
      const dueDate = new Date(task.dueDate);
      let diff = dueDate - nowDate;
      if (diff < 0) diff = 0; // overdue tasks appear near center
      const maxTimeRange = 30 * 24 * 60 * 60 * 1000; // 30 days in ms
      const ratio = Math.min(diff / maxTimeRange, 1);
      const dotDistance = ratio * (radarRadius - 4);

      const dotX = centerX + dotDistance * Math.cos(task.angle);
      const dotY = centerY + dotDistance * Math.sin(task.angle);

      // Base dot styling
      let baseDotRadius = 3;
      let dotFill = "#888888";
      let shadowBlur = 0;

      if (task.classification === "open") {
        baseDotRadius = 4;
        dotFill = "#39FF14";
        shadowBlur = 6;
      } else if (task.classification === "inProgress") {
        baseDotRadius = 4;
        dotFill = "#FFD700";
        shadowBlur = 6;
      }

      // Determine if sweep is near this task
      const taskAngleDeg = (task.angle * 180) / Math.PI;
      let sweepNormalized = sweepAngle;
      if (sweepNormalized < 0) sweepNormalized += 360;
      let angleDiff = Math.abs(sweepNormalized - taskAngleDeg);
      if (angleDiff > 180) angleDiff = 360 - angleDiff;

      let pulseOffset = 0;
      let pulseOpacity = 1;
      // Highlight if within ±1°
      if (angleDiff <= 1) {
        const pulseTime = elapsed % 200;
        const pulseProgress = pulseTime / 200;
        pulseOffset = 2 * Math.abs(Math.sin(pulseProgress * Math.PI));
        pulseOpacity = 0.8 + 0.2 * Math.abs(Math.sin(pulseProgress * Math.PI));
        // Make color brighter
        if (task.classification === "open") {
          dotFill = "#B0FF90";
        } else if (task.classification === "inProgress") {
          dotFill = "#FFE680";
        } else {
          dotFill = "#BBBBBB";
        }
      }

      // Draw dot
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

      // Draw label near the dot
      ctx.save();
      ctx.font = "10px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      if (task.classification === "open" || task.classification === "inProgress") {
        ctx.fillStyle = "#39FF14";
      } else {
        ctx.fillStyle = "#AAAAAA";
      }
      const labelOffset = 10;
      const labelX = dotX + labelOffset * Math.cos(task.angle);
      const labelY = dotY + labelOffset * Math.sin(task.angle);
      ctx.fillText(task.title, labelX, labelY);
      ctx.restore();
    });

    // Draw tooltip if hovering
    if (hoveredTask) {
      drawTooltip(hoveredTask, mouseX, mouseY);
    }

    window.requestAnimationFrame(renderDynamicLayer);
  }

  // Draw tooltip near mouse cursor
  function drawTooltip(task, x, y) {
    const tooltipPadding = 8;
    const tooltipFont = "9px monospace";
    const tooltipText = `${task.title} (${task.dueDate})`;

    ctx.font = tooltipFont;
    const textMetrics = ctx.measureText(tooltipText);
    const textWidth = textMetrics.width;
    const textHeight = 9;

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

  // Hover detection
  function checkHover(x, y) {
    hoveredTask = null;
    for (let task of tasks) {
      const nowDate = new Date();
      const dueDate = new Date(task.dueDate);
      let diff = dueDate - nowDate;
      if (diff < 0) diff = 0;
      const maxTimeRange = 30 * 24 * 60 * 60 * 1000;
      const ratio = Math.min(diff / maxTimeRange, 1);
      const dotDistance = ratio * (radarRadius - 4);

      const dotX = centerX + dotDistance * Math.cos(task.angle);
      const dotY = centerY + dotDistance * Math.sin(task.angle);
      const baseDotRadius = (task.classification === "open" || task.classification === "inProgress") ? 4 : 3;

      const dx = x - dotX;
      const dy = y - dotY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance <= baseDotRadius + 2) {
        hoveredTask = task;
        return;
      }

      // Check label area near the dot
      const labelOffset = 10;
      const labelX = dotX + labelOffset * Math.cos(task.angle);
      const labelY = dotY + labelOffset * Math.sin(task.angle);
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

  canvas.addEventListener('mousemove', function (e) {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
    checkHover(mouseX, mouseY);
    canvas.style.cursor = hoveredTask ? "pointer" : "default";
  });

  canvas.addEventListener('click', function () {
    if (hoveredTask) {
      window.open(hoveredTask.url, '_blank');
    }
  });

  window.addEventListener('resize', resizeCanvas);

  // Initialize
  processTasks();
  resizeCanvas();
  window.requestAnimationFrame(renderDynamicLayer);
})();

