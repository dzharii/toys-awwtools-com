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
   * @function calculateTaskPosition
   * @description Calculates a task's position based on its due date
   * @param {Object} task - The task object with dueDate
   * @param {Date} nowDate - The current date to compare against
   * @returns {Object} Position information including distance from center and coordinates
   */
  function calculateTaskPosition(task, nowDate) {
    const dueDate = new Date(task.dueDate);
    // Calculate time difference in milliseconds
    const diff = Math.abs(dueDate - nowDate);
    // Convert to days and cap at 30 days for display purposes
    const diffDays = Math.min(diff / (1000 * 60 * 60 * 24), 30);
    
    // FIXED: Invert the logic - tasks closer to deadline (smaller diffDays) 
    // should be closer to the center (smaller distance)
    // Map diffDays to a value between 0.2 and 0.9 of the radius
    // 0.2 = close to center, 0.9 = close to edge
    const minDistanceRatio = 0.2;
    const maxDistanceRatio = 0.9;
    
    // Linear mapping: as diffDays increases, distanceRatio increases
    // This puts tasks with imminent deadlines closer to center
    const distanceRatio = minDistanceRatio + (diffDays / 30) * (maxDistanceRatio - minDistanceRatio);
    
    // Calculate the actual distance from center
    const distance = distanceRatio * radarRadius;
    
    // Calculate coordinates
    const x = centerX + distance * Math.cos(task.angle);
    const y = centerY + distance * Math.sin(task.angle);

    // Calculate label position (slightly outside the dot)
    const labelOffset = task.status === 'closed' ? 8 : 12;
    const labelX = centerX + (distance + labelOffset) * Math.cos(task.angle);
    const labelY = centerY + (distance + labelOffset) * Math.sin(task.angle);

    return {
      distance,
      x,
      y,
      labelX,
      labelY
    };
  }

  /**
   * @function processTasks
   * @description Sorts tasks by ascending due date and assigns each to a quadrant,
   * then calculates an angle for each task within its quadrant.
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
        
        // Store the classification for styling
        if (key === "inProgress") {
          task.classification = "inProgress";
        } else if (key === "open") {
          task.classification = "open";
        } else if (key === "closedRecent") {
          task.classification = "closedRecent";
        } else if (key === "closedOlder") {
          task.classification = "closedOlder";
        }

        // Pre-calculate and cache the base position
        // (this will be updated during rendering for animation)
        task.position = calculateTaskPosition(task, now);
      });
    });
  }

  /**
   * @function resizeCanvas
   * @description Adjusts the canvas size to match its parent container, accounting for device pixel ratio,
   * and then triggers the static layer rendering.
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

    // Update task positions based on new dimensions
    processTasks();

    // Render static background
    renderStaticLayer();
  }

  /**
   * @function renderStaticLayer
   * @description Draws the radar's static background onto the offscreen canvas.
   * This includes the radar circle, polar grid, scanlines, and a vignette effect.
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

    // Get the current date for position updates
    const nowDate = new Date();

    // Draw each task's dot and label
    tasks.forEach(task => {
      // Use the cached position to draw the dot
      const position = task.position;

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
      let sweepNormalized = sweepAngle % 360;
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
      ctx.arc(position.x, position.y, baseDotRadius + pulseOffset, 0, Math.PI * 2);
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
      
      // Adjust text alignment based on position in the circle
      const angleDeg = (task.angle * 180 / Math.PI) % 360;
      if (angleDeg >= 0 && angleDeg < 180) {
        ctx.textAlign = "left";
      } else {
        ctx.textAlign = "right";
      }
      
      if (angleDeg >= 90 && angleDeg < 270) {
        ctx.textBaseline = "top";
      } else {
        ctx.textBaseline = "bottom";
      }

      if (task.classification === "open" || task.classification === "inProgress") {
        ctx.fillStyle = "#39FF14";
      } else {
        ctx.fillStyle = "#AAAAAA";
      }

      ctx.fillText(task.title, position.labelX, position.labelY);
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
   */
  function drawTooltip(task, x, y) {
    const tooltipPadding = 8;
    const tooltipFont = "9px monospace";
    
    // Enhanced tooltip content with status information
    const status = task.status.charAt(0).toUpperCase() + task.status.slice(1);
    const tooltipText = [
      `Title: ${task.title}`,
      `Due: ${task.dueDate}`,
      `Status: ${status}`,
      `Owner: ${task.owner}`
    ];

    ctx.font = tooltipFont;
    
    // Calculate the maximum text width
    let maxTextWidth = 0;
    for (const line of tooltipText) {
      const width = ctx.measureText(line).width;
      maxTextWidth = Math.max(maxTextWidth, width);
    }

    const lineHeight = 12;
    const textHeight = tooltipText.length * lineHeight;

    // Calculate the bounding box for the tooltip
    const boxWidth = maxTextWidth + tooltipPadding * 2;
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

    // Draw text lines
    ctx.fillStyle = "#FFFFFF";
    ctx.font = tooltipFont;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    
    tooltipText.forEach((line, index) => {
      ctx.fillText(line, boxX + tooltipPadding, boxY + tooltipPadding + (index * lineHeight));
    });
    
    ctx.restore();
  }

  /**
   * @function checkHover
   * @description Determines whether the mouse is hovering over a task's dot or label.
   * @param {number} x - Mouse X coordinate
   * @param {number} y - Mouse Y coordinate
   */
  function checkHover(x, y) {
    hoveredTask = null;
    
    for (let task of tasks) {
      // Use the cached position
      const position = task.position;
      
      // Determine dot radius
      const baseDotRadius = (task.classification === "open" || task.classification === "inProgress") ? 4 : 3;

      // Check if mouse is within a small threshold of the dot
      const dx = x - position.x;
      const dy = y - position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance <= baseDotRadius + 2) {
        hoveredTask = task;
        return;
      }

      // Check label area near the dot
      const angleDeg = (task.angle * 180 / Math.PI) % 360;
      ctx.font = "10px monospace";

      // Calculate label bounds based on text alignment
      let labelWidth = ctx.measureText(task.title).width;
      let labelHeight = 10;
      let labelX = position.labelX;
      let labelY = position.labelY;
      
      let rectX, rectY;
      
      // Adjust bounds based on text alignment
      if (angleDeg >= 0 && angleDeg < 180) {
        rectX = labelX;
      } else {
        rectX = labelX - labelWidth;
      }
      
      if (angleDeg >= 90 && angleDeg < 270) {
        rectY = labelY;
      } else {
        rectY = labelY - labelHeight;
      }
      
      // Check if mouse is over label
      if (x >= rectX && x <= rectX + labelWidth && 
          y >= rectY && y <= rectY + labelHeight) {
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
