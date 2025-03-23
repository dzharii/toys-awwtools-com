
// Task data model
const taskData = [
  { "title": "Fix login bug", "dueDate": "2025-03-28", "status": "open", "url": "https://example.com/task/1" },
  { "title": "Implement feature X", "dueDate": "2025-04-05", "status": "in-progress", "url": "https://example.com/task/2" },
  { "title": "Code review PR#42", "dueDate": "2025-03-18", "status": "closed", "url": "https://example.com/task/3" },
  { "title": "Write unit tests", "dueDate": "2025-03-01", "status": "closed", "url": "https://example.com/task/4" }
];

// Sort tasks by due date (ascending)
taskData.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

// Radar initialization
class RadarWidget {
  constructor(canvasId) {
    // Canvas setup
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    
    // Offscreen canvas for static elements
    this.staticCanvas = document.createElement('canvas');
    this.staticCtx = this.staticCanvas.getContext('2d');
    
    // Widget properties
    this.centerX = 0;
    this.centerY = 0;
    this.radius = 0;
    this.sweepAngle = 0;
    
    // Animation properties
    this.lastTimestamp = 0;
    this.rotationSpeed = 360 / 8000; // 360 degrees in 8 seconds (ms)
    
    // Interaction properties
    this.hoveredTask = null;
    this.tooltip = null;
    
    // Task visualization properties
    this.taskPositions = [];
    
    // Initialize
    this.initializeCanvas();
    this.calculateTaskPositions();
    this.setupEventListeners();
    this.createTooltip();
    this.start();
  }
  
  initializeCanvas() {
    this.resizeCanvas();
    window.addEventListener('resize', () => {
      this.resizeCanvas();
      this.calculateTaskPositions();
      this.renderStaticElements();
    });
  }
  
  resizeCanvas() {
    const container = this.canvas.parentElement;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    // Set display size
    this.canvas.style.width = `${containerWidth}px`;
    this.canvas.style.height = `${containerHeight}px`;
    
    // Set actual size with pixel ratio
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = containerWidth * dpr;
    this.canvas.height = containerHeight * dpr;
    
    // Same for static canvas
    this.staticCanvas.width = this.canvas.width;
    this.staticCanvas.height = this.canvas.height;
    
    // Scale context
    this.ctx.scale(dpr, dpr);
    this.staticCtx.scale(dpr, dpr);
    
    // Recalculate center and radius
    this.centerX = containerWidth / 2;
    this.centerY = containerHeight / 2;
    this.radius = Math.min(containerWidth, containerHeight) / 2 - 10;
    
    // Re-render static elements
    this.renderStaticElements();
  }
  
  createTooltip() {
    this.tooltip = document.createElement('div');
    this.tooltip.className = 'tooltip';
    this.tooltip.style.display = 'none';
    document.body.appendChild(this.tooltip);
  }
  
  setupEventListeners() {
    this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.canvas.addEventListener('click', this.handleClick.bind(this));
    this.canvas.addEventListener('mouseout', () => {
      this.hoveredTask = null;
      this.tooltip.style.display = 'none';
      this.canvas.style.cursor = 'default';
    });
  }
  
  handleMouseMove(event) {
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Check if mouse is over any task dot
    this.hoveredTask = null;
    for (const task of this.taskPositions) {
      const distance = Math.sqrt(Math.pow(x - task.x, 2) + Math.pow(y - task.y, 2));
      
      // Check if mouse is over dot or label
      const isOverDot = distance <= task.radius + 2;
      const labelDist = Math.sqrt(Math.pow(x - task.labelX, 2) + Math.pow(y - task.labelY, 2));
      const isOverLabel = labelDist <= task.title.length * 5; // Rough estimation of label area
      
      if (isOverDot || isOverLabel) {
        this.hoveredTask = task;
        this.canvas.style.cursor = 'pointer';
        
        // Show tooltip
        this.tooltip.style.display = 'block';
        this.tooltip.innerHTML = `<strong>${task.title}</strong><br>Due: ${task.dueDate}<br>Status: ${task.status}`;
        
        // Position tooltip near cursor
        this.tooltip.style.left = `${event.clientX + 10}px`;
        this.tooltip.style.top = `${event.clientY + 10}px`;
        
        return;
      }
    }
    
    // No task hovered
    this.canvas.style.cursor = 'default';
    this.tooltip.style.display = 'none';
  }
  
  handleClick(event) {
    if (this.hoveredTask) {
      window.open(this.hoveredTask.url, '_blank');
    }
  }
  
  calculateTaskPositions() {
    this.taskPositions = [];
    
    // Group tasks by status
    const openTasks = taskData.filter(task => task.status === 'open');
    const inProgressTasks = taskData.filter(task => task.status === 'in-progress');
    const closedRecentTasks = taskData.filter(task => {
      if (task.status !== 'closed') return false;
      const closedDate = new Date(task.dueDate);
      const now = new Date('2025-03-23'); // Using the provided current date
      const daysDiff = Math.floor((now - closedDate) / (1000 * 60 * 60 * 24));
      return daysDiff <= 7;
    });
    const closedOlderTasks = taskData.filter(task => {
      if (task.status !== 'closed') return false;
      const closedDate = new Date(task.dueDate);
      const now = new Date('2025-03-23'); // Using the provided current date
      const daysDiff = Math.floor((now - closedDate) / (1000 * 60 * 60 * 24));
      return daysDiff > 7;
    });
    
    // Define quadrants (degrees)
    // Open: 270° - 360°
    // In-Progress: 0° - 90°
    // Closed (recent): 180° - 270°
    // Closed (older): 90° - 180°
    
    // Position tasks within their quadrants
    this.positionTasksInQuadrant(openTasks, 270, 360);
    this.positionTasksInQuadrant(inProgressTasks, 0, 90);
    this.positionTasksInQuadrant(closedRecentTasks, 180, 270);
    this.positionTasksInQuadrant(closedOlderTasks, 90, 180);
  }
  
  positionTasksInQuadrant(tasks, startAngle, endAngle) {
    if (tasks.length === 0) return;
    
    const angleStep = (endAngle - startAngle) / (tasks.length + 1);
    
    tasks.forEach((task, index) => {
      // Calculate angle for this task
      const angle = (startAngle + angleStep * (index + 1)) * Math.PI / 180;
      
      // Calculate radius based on due date proximity
      // Older tasks are closer to the center
      const now = new Date('2025-03-23'); // Using the provided current date
      const dueDate = new Date(task.dueDate);
      const daysDiff = Math.abs(Math.floor((dueDate - now) / (1000 * 60 * 60 * 24)));
      
      // Map days difference to a radius between 0.3 and 0.8 of the maximum radius
      const minRadiusFactor = 0.35;
      const maxRadiusFactor = 0.85;
      let radiusFactor = maxRadiusFactor - (Math.min(daysDiff, 30) / 30) * (maxRadiusFactor - minRadiusFactor);
      
      // Closed tasks are positioned differently
      if (task.status === 'closed') {
        // For closed tasks, older ones are closer to the outer edge
        radiusFactor = minRadiusFactor + (Math.min(daysDiff, 30) / 30) * (maxRadiusFactor - minRadiusFactor);
      }
      
      const taskRadius = this.radius * radiusFactor;
      
      // Calculate position
      const x = this.centerX + Math.cos(angle) * taskRadius;
      const y = this.centerY + Math.sin(angle) * taskRadius;
      
      // Calculate label position (12px outside the circle)
      const labelDistance = this.radius + 12;
      const labelX = this.centerX + Math.cos(angle) * labelDistance;
      const labelY = this.centerY + Math.sin(angle) * labelDistance;
      
      // Store task position data
      this.taskPositions.push({
        ...task,
        x, 
        y,
        labelX,
        labelY,
        angle,
        radius: task.status === 'closed' ? 3 : 4,
        pulsing: false,
        pulseStart: 0
      });
    });
  }
  
  renderStaticElements() {
    const ctx = this.staticCtx;
    const { width, height } = this.staticCanvas;
    const dpr = window.devicePixelRatio || 1;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw radar circle background
    const radialGradient = ctx.createRadialGradient(
      this.centerX * dpr, 
      this.centerY * dpr, 
      0, 
      this.centerX * dpr, 
      this.centerY * dpr, 
      this.radius * dpr
    );
    radialGradient.addColorStop(0, '#161616');
    radialGradient.addColorStop(1, '#2B2B2B');
    
    ctx.fillStyle = radialGradient;
    ctx.beginPath();
    ctx.arc(this.centerX * dpr, this.centerY * dpr, this.radius * dpr, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw radar circle outline
    ctx.strokeStyle = '#39FF14';
    ctx.lineWidth = 2 * dpr;
    ctx.beginPath();
    ctx.arc(this.centerX * dpr, this.centerY * dpr, this.radius * dpr, 0, Math.PI * 2);
    ctx.stroke();
    
    // Draw polar grid - concentric circles
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1 * dpr;
    
    for (let i = 1; i <= 4; i++) {
      const circleRadius = this.radius * (i / 4);
      ctx.beginPath();
      ctx.arc(this.centerX * dpr, this.centerY * dpr, circleRadius * dpr, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    // Draw polar grid - radial lines
    for (let i = 0; i < 8; i++) {
      const angle = (i * 45) * Math.PI / 180;
      ctx.beginPath();
      ctx.moveTo(this.centerX * dpr, this.centerY * dpr);
      ctx.lineTo(
        this.centerX * dpr + Math.cos(angle) * this.radius * dpr,
        this.centerY * dpr + Math.sin(angle) * this.radius * dpr
      );
      ctx.stroke();
    }
    
    // Draw scanlines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    for (let y = 0; y < height; y += 4 * dpr) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    // Draw vignette
    const vignetteGradient = ctx.createRadialGradient(
      this.centerX * dpr, 
      this.centerY * dpr, 
      0, 
      this.centerX * dpr, 
      this.centerY * dpr, 
      Math.max(width, height)
    );
    vignetteGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignetteGradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.2)');
    vignetteGradient.addColorStop(1, 'rgba(0, 0, 0, 0.6)');
    
    ctx.fillStyle = vignetteGradient;
    ctx.fillRect(0, 0, width, height);
    
    // Draw task labels
    this.taskPositions.forEach(task => {
      ctx.save();
      
      // Set text alignment based on position in the circle
      const angle = task.angle * 180 / Math.PI;
      if (angle > 0 && angle < 180) {
        ctx.textAlign = 'left';
      } else {
        ctx.textAlign = 'right';
      }
      
      if (angle > 90 && angle < 270) {
        ctx.textBaseline = 'top';
      } else {
        ctx.textBaseline = 'bottom';
      }
      
      // Set text color based on status
      if (task.status === 'closed') {
        ctx.fillStyle = '#AAAAAA';
      } else {
        ctx.fillStyle = '#39FF14';
      }
      
      ctx.font = '10px monospace';
      ctx.fillText(task.title, task.labelX * dpr, task.labelY * dpr);
      
      ctx.restore();
    });
  }
  
  renderDynamicElements() {
    const ctx = this.ctx;
    const dpr = window.devicePixelRatio || 1;
    
    // Clear canvas
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw the static layer
    ctx.drawImage(this.staticCanvas, 0, 0);
    
    // Draw sweep wedge
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    
    // Create sweep gradient
    const sweepGradient = ctx.createConicalGradient(
      this.centerX, 
      this.centerY, 
      this.sweepAngle * Math.PI / 180
    );
    sweepGradient.addColorStop(0, 'rgba(57, 255, 20, 0.75)');
    sweepGradient.addColorStop(0.05, 'rgba(57, 255, 20, 0.5)');
    sweepGradient.addColorStop(0.1, 'rgba(57, 255, 20, 0.1)');
    sweepGradient.addColorStop(0.5, 'rgba(57, 255, 20, 0)');
    
    ctx.fillStyle = sweepGradient;
    ctx.beginPath();
    ctx.moveTo(this.centerX, this.centerY);
    ctx.arc(
      this.centerX, 
      this.centerY, 
      this.radius,
      (this.sweepAngle - 45) * Math.PI / 180,
      (this.sweepAngle + 2) * Math.PI / 180
    );
    ctx.closePath();
    ctx.fill();
    
    // Add glow to the leading edge
    ctx.beginPath();
    ctx.arc(
      this.centerX, 
      this.centerY, 
      this.radius,
      (this.sweepAngle - 2) * Math.PI / 180,
      (this.sweepAngle + 2) * Math.PI / 180,
      false
    );
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#39FF14';
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#39FF14';
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    ctx.restore();
    
    // Draw task dots
    this.taskPositions.forEach(task => {
      ctx.save();
      
      // Check if dot should pulse (when sweep is near)
      const taskAngle = task.angle * 180 / Math.PI;
      if (taskAngle < 0) taskAngle += 360;
      
      const angleDiff = Math.abs(((this.sweepAngle % 360) + 360) % 360 - ((taskAngle % 360) + 360) % 360);
      const isNearSweep = angleDiff <= 5 || angleDiff >= 355;
      
      if (isNearSweep && !task.pulsing) {
        task.pulsing = true;
        task.pulseStart = performance.now();
      }
      
      // Handle pulsing animation
      let dotRadius = task.radius;
      let opacity = 1;
      
      if (task.pulsing) {
        const pulseTime = performance.now() - task.pulseStart;
        
        if (pulseTime > 500) {
          task.pulsing = false;
        } else {
          const pulseProgress = pulseTime / 500; // 0 to 1 over 500ms
          const pulseFactor = Math.sin(pulseProgress * Math.PI);
          dotRadius += pulseFactor * 2;
          opacity = 0.8 + pulseFactor * 0.2;
        }
      }
      
      // Draw dot based on status
      switch(task.status) {
        case 'open':
          ctx.fillStyle = `rgba(57, 255, 20, ${opacity})`;
          ctx.shadowBlur = 6;
          ctx.shadowColor = '#39FF14';
          break;
        case 'in-progress':
          ctx.fillStyle = `rgba(255, 215, 0, ${opacity})`;
          ctx.shadowBlur = 6;
          ctx.shadowColor = '#FFD700';
          break;
        case 'closed':
          ctx.fillStyle = `rgba(136, 136, 136, ${opacity})`;
          ctx.shadowBlur = 0;
          break;
      }
      
      ctx.beginPath();
      ctx.arc(task.x, task.y, dotRadius, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    });
    
    // Highlight hovered task
    if (this.hoveredTask) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(this.hoveredTask.x, this.hoveredTask.y, this.hoveredTask.radius + 3, 0, Math.PI * 2);
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    }
  }
  
  update(timestamp) {
    if (!this.lastTimestamp) {
      this.lastTimestamp = timestamp;
    }
    
    const elapsed = timestamp - this.lastTimestamp;
    this.lastTimestamp = timestamp;
    
    // Update sweep angle (degrees per ms * elapsed ms)
    this.sweepAngle = (this.sweepAngle + this.rotationSpeed * elapsed) % 360;
    
    // Render updated frame
    this.renderDynamicElements();
    
    // Continue animation
    requestAnimationFrame(this.update.bind(this));
  }
  
  start() {
    requestAnimationFrame(this.update.bind(this));
  }
}

// Polyfill for createConicalGradient if not supported
if (!CanvasRenderingContext2D.prototype.createConicalGradient) {
  CanvasRenderingContext2D.prototype.createConicalGradient = function(centerX, centerY, startAngle) {
    const gradient = {
      centerX,
      centerY,
      startAngle,
      colorStops: [],
      addColorStop: function(offset, color) {
        this.colorStops.push({ offset, color });
      }
    };
    
    gradient.__proto__ = CanvasPattern.prototype;
    
    // Override the fillStyle setter to handle our custom gradient
    const originalFill = CanvasRenderingContext2D.prototype.fill;
    CanvasRenderingContext2D.prototype.fill = function() {
      if (this.fillStyle === gradient) {
        const ctx = this;
        const stops = gradient.colorStops;
        
        // Sort stops by offset
        stops.sort((a, b) => a.offset - b.offset);
        
        // Save context state
        ctx.save();
        
        // Create a clipping path from the current path
        ctx.clip();
        
        // Draw the conical gradient manually
        const radius = Math.max(ctx.canvas.width, ctx.canvas.height);
        
        for (let i = 0; i < stops.length - 1; i++) {
          const stop1 = stops[i];
          const stop2 = stops[i + 1];
          
          const angleStart = gradient.startAngle + stop1.offset * Math.PI * 2;
          const angleEnd = gradient.startAngle + stop2.offset * Math.PI * 2;
          
          // Draw a wedge for this segment
          ctx.beginPath();
          ctx.moveTo(gradient.centerX, gradient.centerY);
          ctx.arc(gradient.centerX, gradient.centerY, radius, angleStart, angleEnd);
          ctx.closePath();
          
          // Create a gradient for this wedge
          const gradientColor = ctx.createLinearGradient(
            gradient.centerX, 
            gradient.centerY, 
            gradient.centerX + Math.cos((angleStart + angleEnd) / 2) * radius,
            gradient.centerY + Math.sin((angleStart + angleEnd) / 2) * radius
          );
          
          gradientColor.addColorStop(0, stop1.color);
          gradientColor.addColorStop(1, stop2.color);
          
          ctx.fillStyle = gradientColor;
          ctx.fill();
        }
        
        // Restore context state
        ctx.restore();
        
        // Call original fill
        originalFill.call(this);
      } else {
        // Not our gradient, use original fill
        originalFill.apply(this, arguments);
      }
    };
    
    return gradient;
  };
}

// Initialize the radar widget when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const radar = new RadarWidget('radarCanvas');
});
