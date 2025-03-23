/* script.js */

/**
 * This IIFE (Immediately Invoked Function Expression) ensures
 * that all variables and functions are scoped locally, avoiding
 * pollution of the global namespace.
 */
(function () {
  'use strict';

  // Retrieve the main canvas element and its 2D context
  const canvas = document.getElementById('radarCanvas');
  const ctx = canvas.getContext('2d');

  // Create an offscreen canvas to render the static background
  const offscreenCanvas = document.createElement('canvas');
  const offscreenCtx = offscreenCanvas.getContext('2d');

  // Global variables to store canvas width, height, center coordinates, and radar radius
  let canvasWidth, canvasHeight, centerX, centerY, radarRadius;

  // Rotation control: one full rotation in 8 seconds
  let startTime = null;
  const rotationDuration = 8000; // 8 seconds

  // Variables for mouse interactivity
  let mouseX = 0, mouseY = 0;
  let hoveredTask = null;

  // Global deadline is set to the current date/time for sample
  const globalDeadline = new Date();

  /**
   * @function addDays
   * @description Adds a specified number of days to a given Date object.
   * @param {Date} date - The starting date
   * @param {number} days - The number of days to add
   * @returns {Date} A new Date object with the days added
   *
   * Decision: This helper is used to easily shift a date by a certain offset,
   * enabling the creation of dynamic due dates.
   */
  function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  /**
   * @function formatDate
   * @description Formats a Date object as a string in YYYY-MM-DD format.
   * @param {Date} date - The date to format
   * @returns {string} A string representation in the format "YYYY-MM-DD"
   *
   * Decision: Ensures uniform date string representation throughout the app.
   */
  function formatDate(date) {
    const year = date.getFullYear();
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const day = ("0" + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  /**
   * @function generateRandomWorkitemId
   * @description Generates a random 6-digit string to serve as a workitem ID.
   * @returns {string} A 6-digit number as a string
   *
   * Decision: Provides a quick unique identifier for tasks, simulating real-world IDs.
   */
  function generateRandomWorkitemId() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Array of possible owners for tasks
  const owners = ["Alice", "Bob", "Charlie", "Dana"];

  /**
   * @function randomChoice
   * @description Randomly picks one element from an array.
   * @param {Array} arr - The array to pick from
   * @returns {*} A random element from the array
   *
   * Decision: Simplifies picking random owners or statuses.
   */
  function randomChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  /**
   * @function generateRandomTask
   * @description Creates a task object with a dynamic due date and random properties.
   * @param {number} index - A numerical index to include in the task title
   * @param {number} offsetDays - Days offset from the current date
   * @param {string} [statusOverride] - Optional status to override random generation
   * @returns {Object} A task object with a title, due date, status, URL, owner, and ID
   *
   * Decision: This function is used to populate the tasks array with varying deadlines
   * and statuses to simulate real data.
   */
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

  // Four predefined tasks with specific relative due dates
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

  // Extend the task list by generating 15 more tasks with random offsets
  for (let i = 5; i < 20; i++) {
    const offsetDays = Math.floor(Math.random() * 36) - 5; // random offset -5 to +30
    tasks.push(generateRandomTask(i, offsetDays));
  }

  /**
   * @function processTasks
   * @description Sorts tasks by ascending due date and assigns each to a quadrant,
   * then calculates an angle for each task within its quadrant.
   *
   * Decision: Sorting ensures tasks with earlier due dates appear first.
   * Quadrants are determined by status (open, in-progress, closed with subcategories).
   * This organizes the radar distribution logically.
   */
  function processTasks() {
    // Sort by due date
    tasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    // Quadrant definitions (in degrees)
    const quadrants = {
      open: { range: [270, 360], tasks: [] },
      inProgress: { range: [0, 90], tasks: [] },
      closedRecent: { range: [180, 270], tasks: [] },
      closedOlder: { range: [90, 180], tasks: [] }
    };

    const now = new Date();

    // Classify tasks based on status and how recent the closed date is
    tasks.forEach(task => {
      if (task.status === 'open') {
        quadrants.open.tasks.push(task);
      } else if (task.status === 'in-progress') {
        quadrants.inProgress.tasks.push(task);
      } else if (task.status === 'closed') {
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

    // Distribute tasks evenly within each quadrant
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
        // classification is used later to determine color and styling
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

  /**
   * @function resizeCanvas
   * @description Adjusts the canvas size to match its parent container, accounting for device pixel ratio,
   * and then triggers the static layer rendering.
   *
   * Decision: Ensures the radar scales properly on window resize and different displays.
   */
  function resizeCanvas() {
    const container = canvas.parentElement;
    const rect = container.getBoundingClientRect();
    canvasWidth = rect.width;
    canvasHeight = rect.height;

    // Adjust for devicePixelRatio for sharp rendering
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvasWidth * dpr;
    canvas.height = canvasHeight * dpr;
    offscreenCanvas.width = canvas.width;
    offscreenCanvas.height = canvas.height;

    // Reset transforms and apply scale
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    offscreenCtx.setTransform(1, 0, 0, 1, 0, 0);
    offscreenCtx.scale(dpr, dpr);

    // Compute radar center and radius
    centerX = canvasWidth / 2;
    centerY = canvasHeight / 2;
    radarRadius = Math.min(canvasWidth, canvasHeight) / 2 - 10;

    // Render static background
    renderStaticLayer();
  }

  /**
   * @function renderStaticLayer
   * @description Draws the radar's static background onto the offscreen canvas.
   * This includes the radar circle, polar grid, scanlines, and a vignette effect.
   *
   * Decision: We use an offscreen canvas to avoid redrawing these elements each frame,
   * improving performance.
   */
  function renderStaticLayer() {
    offscreenCtx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Radar circle gradient fill
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

    // Draw concentric circles for the polar grid
    offscreenCtx.lineWidth = 1;
    offscreenCtx.strokeStyle = "rgba(255,255,255,0.05)";
    for (let i = 1; i <= 4; i++) {
      offscreenCtx.beginPath();
      offscreenCtx.arc(centerX, centerY, (radarRadius * i) / 4, 0, Math.PI * 2);
      offscreenCtx.stroke();
    }

    // Radial lines every 45 degrees
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

    // Vignette effect to darken edges
    const vignetteGradient = offscreenCtx.createRadialGradient(
      centerX, centerY, radarRadius * 0.1,
      centerX, centerY, radarRadius
    );
    vignetteGradient.addColorStop(0, "rgba(0,0,0,0)");
    vignetteGradient.addColorStop(1, "rgba(0,0,0,0.6)");
    offscreenCtx.fillStyle = vignetteGradient;
    offscreenCtx.fillRect(0, 0, canvasWidth, canvasHeight);
  }

  /**
   * @function renderDynamicLayer
   * @description This function is called on every animation frame to draw the rotating sweep wedge,
   * all task dots, labels, and handle highlighting and tooltip display.
   * @param {DOMHighResTimeStamp} timestamp - The current time in ms provided by requestAnimationFrame
   *
   * Decision: We separate static vs. dynamic layers for performance.
   * The wedge and tasks update in real-time, so we re-draw them each frame.
   */
  function renderDynamicLayer(timestamp) {
    // Clear the main canvas, then draw the pre-rendered static background
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.drawImage(offscreenCanvas, 0, 0, canvasWidth, canvasHeight);

    // Calculate the rotation angle for the sweep
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    const rotationProgress = (elapsed % rotationDuration) / rotationDuration;
    const sweepAngle = rotationProgress * 360;
    const sweepAngleRad = sweepAngle * Math.PI / 180;

    // Draw the sweep wedge (2° arc) with a neon gradient
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

    // Draw each task's dot and label
    tasks.forEach(task => {
      // Compute distance from center based on how close the task is to its due date
      const nowDate = new Date();
      const dueDate = new Date(task.dueDate);
      let diff = dueDate - nowDate;
      if (diff < 0) diff = 0; // overdue tasks appear at the center
      const maxTimeRange = 30 * 24 * 60 * 60 * 1000; // 30 days in ms
      const ratio = Math.min(diff / maxTimeRange, 1);
      const dotDistance = ratio * (radarRadius - 4);

      const dotX = centerX + dotDistance * Math.cos(task.angle);
      const dotY = centerY + dotDistance * Math.sin(task.angle);

      // Determine base styling by classification
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

      // Highlight if the sweep is within ±1° of this task's angle
      const taskAngleDeg = (task.angle * 180) / Math.PI;
      let sweepNormalized = sweepAngle;
      if (sweepNormalized < 0) sweepNormalized += 360;
      let angleDiff = Math.abs(sweepNormalized - taskAngleDeg);
      if (angleDiff > 180) angleDiff = 360 - angleDiff;

      let pulseOffset = 0;
      let pulseOpacity = 1;
      if (angleDiff <= 1) {
        // If the sweep is near, pulse the dot size and brightness
        const pulseTime = elapsed % 200;
        const pulseProgress = pulseTime / 200;
        pulseOffset = 2 * Math.abs(Math.sin(pulseProgress * Math.PI));
        pulseOpacity = 0.8 + 0.2 * Math.abs(Math.sin(pulseProgress * Math.PI));

        // Make color brighter to highlight
        if (task.classification === "open") {
          dotFill = "#B0FF90";
        } else if (task.classification === "inProgress") {
          dotFill = "#FFE680";
        } else {
          dotFill = "#BBBBBB";
        }
      }

      // Draw the dot with the computed style
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

      // Draw the label near the dot
      ctx.save();
      ctx.font = "10px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      if (task.classification === "open" || task.classification === "inProgress") {
        ctx.fillStyle = "#39FF14";
      } else {
        ctx.fillStyle = "#AAAAAA";
      }

      // Offset label slightly away from the dot
      const labelOffset = 10;
      const labelX = dotX + labelOffset * Math.cos(task.angle);
      const labelY = dotY + labelOffset * Math.sin(task.angle);
      ctx.fillText(task.title, labelX, labelY);
      ctx.restore();
    });

    // If a task is hovered, draw the tooltip
    if (hoveredTask) {
      drawTooltip(hoveredTask, mouseX, mouseY);
    }

    // Request the next animation frame
    window.requestAnimationFrame(renderDynamicLayer);
  }

  /**
   * @function drawTooltip
   * @description Renders a small tooltip near the mouse cursor, displaying task info.
   * @param {Object} task - The hovered task
   * @param {number} x - Mouse X coordinate
   * @param {number} y - Mouse Y coordinate
   *
   * Decision: Tooltips should be minimal but legible, so we use a small box with a neon border.
   */
  function drawTooltip(task, x, y) {
    const tooltipPadding = 8;
    const tooltipFont = "9px monospace";
    const tooltipText = `${task.title} (${task.dueDate})`;

    ctx.font = tooltipFont;
    const textMetrics = ctx.measureText(tooltipText);
    const textWidth = textMetrics.width;
    const textHeight = 9; // approximate height for a 9px font

    // Calculate the bounding box for the tooltip
    const boxWidth = textWidth + tooltipPadding * 2;
    const boxHeight = textHeight + tooltipPadding * 2;

    // Offset the tooltip from the mouse pointer
    let boxX = x + 12;
    let boxY = y + 12;

    // If the tooltip goes off the right/bottom edge, flip it
    if (boxX + boxWidth > canvasWidth) {
      boxX = x - boxWidth - 12;
    }
    if (boxY + boxHeight > canvasHeight) {
      boxY = y - boxHeight - 12;
    }

    // Draw background rectangle and border
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.75)";
    ctx.strokeStyle = "#39FF14";
    ctx.lineWidth = 1;
    ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
    ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

    // Draw text
    ctx.fillStyle = "#FFFFFF";
    ctx.font = tooltipFont;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(tooltipText, boxX + tooltipPadding, boxY + tooltipPadding);
    ctx.restore();
  }

  /**
   * @function checkHover
   * @description Determines whether the mouse is hovering over a task's dot or label.
   * @param {number} x - Mouse X coordinate
   * @param {number} y - Mouse Y coordinate
   *
   * Decision: This approach checks the distance to the dot, and also the label bounding box,
   * so that the user can hover either the dot or the label to see the tooltip.
   */
  function checkHover(x, y) {
    hoveredTask = null;
    for (let task of tasks) {
      // Calculate dot position
      const nowDate = new Date();
      const dueDate = new Date(task.dueDate);
      let diff = dueDate - nowDate;
      if (diff < 0) diff = 0;
      const maxTimeRange = 30 * 24 * 60 * 60 * 1000;
      const ratio = Math.min(diff / maxTimeRange, 1);
      const dotDistance = ratio * (radarRadius - 4);

      const dotX = centerX + dotDistance * Math.cos(task.angle);
      const dotY = centerY + dotDistance * Math.sin(task.angle);

      // Determine dot radius
      const baseDotRadius = (task.classification === "open" || task.classification === "inProgress") ? 4 : 3;

      // Check if mouse is within a small threshold of the dot
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

  // Mousemove event to update hover state and cursor style
  canvas.addEventListener('mousemove', function (e) {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
    checkHover(mouseX, mouseY);
    canvas.style.cursor = hoveredTask ? "pointer" : "default";
  });

  // Click event to open the hovered task's URL
  canvas.addEventListener('click', function () {
    if (hoveredTask) {
      window.open(hoveredTask.url, '_blank');
    }
  });

  // Resize the canvas whenever the window size changes
  window.addEventListener('resize', resizeCanvas);

  // Initialize the tasks, set up the canvas, and begin animation
  processTasks();
  resizeCanvas();
  window.requestAnimationFrame(renderDynamicLayer);
})();

