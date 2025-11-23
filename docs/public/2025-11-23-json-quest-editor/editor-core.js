// Main editor core implementing diagram logic.
(function () {
  var NS = "http://www.w3.org/2000/svg";

  function cloneState(state) {
    return JSON.parse(JSON.stringify({
      nodes: state.nodes,
      connections: state.connections,
      texts: state.texts,
      settings: state.settings,
      viewport: state.viewport
    }));
  }

  function assertNumber(value, module, field) {
    if (typeof value !== "number" || !isFinite(value)) {
      SubwayLogger.logError("EDITOR", module, "Expected numeric value", { field: field, value: value });
      throw new Error("Invalid numeric value for " + field);
    }
  }

  function createSvgElement(name, attrs) {
    var el = document.createElementNS(NS, name);
    Object.keys(attrs || {}).forEach(function (k) {
      el.setAttribute(k, attrs[k]);
    });
    return el;
  }

  function downloadFile(filename, content, mime) {
    var blob = new Blob([content], { type: mime });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function buildId(prefix) {
    return prefix + "-" + Math.random().toString(36).slice(2, 9);
  }

  function getExportStyle() {
    return [
      ".node{stroke:#111827;stroke-width:2;}",
      ".connection{stroke:#111827;stroke-width:2;fill:none;}",
      ".text-item{font-family:'Segoe UI',Arial,sans-serif;font-size:14px;fill:#111827;font-weight:600;}",
      ".grid{stroke:#e5e7eb;stroke-width:0.5;}",
      ".selected{filter:drop-shadow(0 0 4px rgba(59,130,246,0.6));}"
    ].join("\n");
  }

  var SubwayEditor = {
    createEditor: function (options) {
      if (!options || !options.canvasEl) {
        SubwayLogger.logError("EDITOR", "Bootstrap", "Missing canvas element in options", { options: options });
        throw new Error("Canvas element required");
      }
      if (!options.toolbarEl || !options.sidebarEl || !options.statusEl || !options.statusZoomEl) {
        SubwayLogger.logError("EDITOR", "Bootstrap", "Missing required container elements", { options: options });
        throw new Error("Toolbar, sidebar, status, and status zoom elements required");
      }
      var config = window.SubwayConfig || {};
      var palette = (config.defaultPalette || []).slice();
      var toolbarEl = options.toolbarEl;
      var sidebarEl = options.sidebarEl;
      var canvasEl = options.canvasEl;
      var statusEl = options.statusEl;
      var statusZoomEl = options.statusZoomEl;

      var svg = createSvgElement("svg", { id: "editor-svg" });
      canvasEl.appendChild(svg);

      var defs = createSvgElement("defs");
      var pattern = createSvgElement("pattern", {
        id: "grid-pattern",
        width: config.gridSize || 20,
        height: config.gridSize || 20,
        patternUnits: "userSpaceOnUse"
      });
      pattern.appendChild(createSvgElement("path", {
        d: "M " + (config.gridSize || 20) + " 0 L 0 0 0 " + (config.gridSize || 20),
        class: "grid",
        stroke: "#e5e7eb",
        "stroke-width": "0.5"
      }));
      defs.appendChild(pattern);
      svg.appendChild(defs);

      var gridRect = createSvgElement("rect", { width: "100%", height: "100%", fill: "url(#grid-pattern)", "pointer-events": "none" });
      var viewportGroup = createSvgElement("g", { id: "viewport-group" });
      var connectionsGroup = createSvgElement("g", { id: "connections-group" });
      var nodesGroup = createSvgElement("g", { id: "nodes-group" });
      var textsGroup = createSvgElement("g", { id: "texts-group" });
      var selectionRect = createSvgElement("rect", { class: "selection-rect hidden", "pointer-events": "none" });
      svg.appendChild(gridRect);
      svg.appendChild(viewportGroup);
      viewportGroup.appendChild(connectionsGroup);
      viewportGroup.appendChild(nodesGroup);
      viewportGroup.appendChild(textsGroup);
      svg.appendChild(selectionRect);

      var state = {
        nodes: [],
        connections: [],
        texts: [],
        settings: {
          gridVisible: config.gridVisible !== false,
          snapEnabled: config.snapEnabled !== false,
          snapSize: config.gridSize || 20,
          theme: "light"
        },
        viewport: { offsetX: 0, offsetY: 0, scale: 1 },
        selection: [],
        activeColor: palette[0] || "#2563eb",
        activeConnectionColor: config.defaultConnectionColor || "#111827",
        activeLabelPlacement: "inside",
        currentTool: "select",
        isSpacePanning: false,
        undoStack: [],
        redoStack: []
      };

      function updateStatus(text) {
        if (statusEl) statusEl.textContent = text;
      }

      function updateZoomStatus() {
        var pct = Math.round(state.viewport.scale * 100);
        if (statusZoomEl) statusZoomEl.textContent = pct + "%";
        if (zoomControl) zoomControl.setZoomText(pct + "%");
      }

      function screenToWorld(clientX, clientY) {
        var rect = svg.getBoundingClientRect();
        var x = (clientX - rect.left - state.viewport.offsetX) / state.viewport.scale;
        var y = (clientY - rect.top - state.viewport.offsetY) / state.viewport.scale;
        return { x: x, y: y };
      }

      function snapValue(v, override) {
        if (!state.settings.snapEnabled || override) return v;
        var size = state.settings.snapSize || 1;
        return Math.round(v / size) * size;
      }

      function applyTransform() {
        viewportGroup.setAttribute("transform", "translate(" + state.viewport.offsetX + "," + state.viewport.offsetY + ") scale(" + state.viewport.scale + ")");
      }

      function clearSelection() {
        state.selection = [];
        updateSelectionVisuals();
      }

      function updateSelectionVisuals() {
        var all = svg.querySelectorAll(".selected");
        for (var i = 0; i < all.length; i++) {
          all[i].classList.remove("selected");
        }
        state.selection.forEach(function (sel) {
          var el = svg.querySelector("[data-type='" + sel.type + "'][data-id='" + sel.id + "']");
          if (el) el.classList.add("selected");
        });
      }

      function findNode(id) {
        return state.nodes.find(function (n) { return n.id === id; });
      }

      function findConnection(id) {
        return state.connections.find(function (c) { return c.id === id; });
      }

      function findText(id) {
        return state.texts.find(function (t) { return t.id === id; });
      }

      function renderGrid() {
        gridRect.style.display = state.settings.gridVisible ? "block" : "none";
      }

      function render() {
        renderGrid();
        renderConnections();
        renderNodes();
        renderTexts();
        updateSelectionVisuals();
        updateZoomStatus();
      }

      function renderNodes() {
        nodesGroup.innerHTML = "";
        state.nodes.forEach(function (n) {
          var circle = createSvgElement("circle", {
            cx: n.x,
            cy: n.y,
            r: n.radius,
            fill: n.color,
            stroke: n.stroke || config.defaultStroke || "#111827",
            "data-id": n.id,
            "data-type": "node",
            class: "node"
          });
          circle.addEventListener("mousedown", handleNodeMouseDown);
          circle.addEventListener("click", handleNodeClick);
          nodesGroup.appendChild(circle);

          var labelPos = computeLabelPosition(n);
          var text = createSvgElement("text", {
            x: labelPos.x,
            y: labelPos.y,
            "data-id": n.id,
            "data-type": "node-label",
            class: "text-item",
            "font-family": "'Segoe UI', Arial, sans-serif"
          });
          text.textContent = n.label || "Node";
          text.addEventListener("mousedown", handleNodeMouseDown);
          text.addEventListener("click", handleNodeClick);
          nodesGroup.appendChild(text);
        });
      }

      function renderConnections() {
        connectionsGroup.innerHTML = "";
        state.connections.forEach(function (c) {
          var from = findNode(c.from);
          var to = findNode(c.to);
          if (!from || !to) return;
          var points = computeConnectionEndpoints(from, to);
          var line = createSvgElement("line", {
            x1: points.start.x,
            y1: points.start.y,
            x2: points.end.x,
            y2: points.end.y,
            "data-id": c.id,
            "data-type": "connection",
            class: "connection",
            stroke: c.color || state.activeConnectionColor,
            "stroke-dasharray": c.style === "dashed" ? "8 4" : ""
          });
          line.addEventListener("mousedown", handleConnectionMouseDown);
          line.addEventListener("click", handleConnectionClick);
          connectionsGroup.appendChild(line);
        });
      }

      function renderTexts() {
        textsGroup.innerHTML = "";
        state.texts.forEach(function (t) {
          var text = createSvgElement("text", {
            x: t.x,
            y: t.y,
            "data-id": t.id,
            "data-type": "text",
            class: "text-item",
            fill: t.color,
            "font-size": t.fontSize,
            "font-family": "'Segoe UI', Arial, sans-serif"
          });
          text.textContent = t.text || "Text";
          text.addEventListener("mousedown", handleTextMouseDown);
          text.addEventListener("click", handleTextClick);
          textsGroup.appendChild(text);
        });
      }

      function computeLabelPosition(node) {
        var dx = 0, dy = 0;
        var offset = node.radius + 14;
        switch (node.labelPlacement) {
          case "above": dy = -offset; break;
          case "below": dy = offset; break;
          case "left": dx = -offset; break;
          case "right": dx = offset; break;
          default: dy = 4; break; // inside center
        }
        return { x: node.x + dx, y: node.y + dy };
      }

      function computeConnectionEndpoints(a, b) {
        var dx = b.x - a.x;
        var dy = b.y - a.y;
        var dist = Math.sqrt(dx * dx + dy * dy) || 1;
        var nx = dx / dist;
        var ny = dy / dist;
        return {
          start: { x: a.x + nx * a.radius, y: a.y + ny * a.radius },
          end: { x: b.x - nx * b.radius, y: b.y - ny * b.radius }
        };
      }

      function pushUndo() {
        state.undoStack.push(cloneState(state));
        if (state.undoStack.length > (config.undoLimit || 200)) {
          state.undoStack.shift();
        }
        state.redoStack = [];
      }

      function restoreState(snapshot) {
        if (!snapshot) return;
        state.nodes = snapshot.nodes;
        state.connections = snapshot.connections;
        state.texts = snapshot.texts;
        state.settings = snapshot.settings;
        state.viewport = snapshot.viewport;
        render();
      }

      function addNodeAt(x, y) {
        assertNumber(x, "NodeController", "x");
        assertNumber(y, "NodeController", "y");
        pushUndo();
        var node = {
          id: buildId("node"),
          x: snapValue(x),
          y: snapValue(y),
          radius: config.defaultNodeRadius || 28,
          color: state.activeColor,
          stroke: config.defaultStroke || "#111827",
          label: "Node",
          labelPlacement: state.activeLabelPlacement
        };
        state.nodes.push(node);
        SubwayLogger.logInfo("EDITOR", "NodeController", "Created node", node);
        render();
        selectSingle({ type: "node", id: node.id });
      }

      function addConnection(fromId, toId) {
        if (fromId === toId) {
          SubwayLogger.logWarn("EDITOR", "ConnectionController", "Prevented self connection", { from: fromId, to: toId });
          updateStatus("Cannot connect node to itself");
          return;
        }
        var from = findNode(fromId);
        var to = findNode(toId);
        if (!from || !to) {
          SubwayLogger.logError("EDITOR", "ConnectionController", "Connection endpoints missing", { from: fromId, to: toId });
          updateStatus("Connection failed: missing endpoint");
          return;
        }
        pushUndo();
        var connection = {
          id: buildId("conn"),
          from: fromId,
          to: toId,
          color: state.activeConnectionColor,
          style: "solid"
        };
        state.connections.push(connection);
        SubwayLogger.logInfo("EDITOR", "ConnectionController", "Created connection", connection);
        render();
        selectSingle({ type: "connection", id: connection.id });
      }

      function addTextAt(x, y) {
        pushUndo();
        var text = {
          id: buildId("text"),
          x: snapValue(x),
          y: snapValue(y),
          text: "Text",
          fontSize: config.defaultFontSize || 14,
          color: state.activeColor
        };
        state.texts.push(text);
        SubwayLogger.logInfo("EDITOR", "TextController", "Created text", text);
        render();
        selectSingle({ type: "text", id: text.id });
      }

      function selectSingle(item) {
        state.selection = [item];
        updateSelectionVisuals();
        populateProperties();
      }

      function deleteSelection() {
        if (state.selection.length === 0) return;
        pushUndo();
        var removed = [];
        state.selection.forEach(function (sel) {
          if (sel.type === "node") {
            state.connections = state.connections.filter(function (c) {
              var keep = c.from !== sel.id && c.to !== sel.id;
              if (!keep) removed.push({ type: "connection", id: c.id });
              return keep;
            });
            state.nodes = state.nodes.filter(function (n) {
              var keep = n.id !== sel.id;
              if (!keep) removed.push(sel);
              return keep;
            });
          } else if (sel.type === "connection") {
            state.connections = state.connections.filter(function (c) {
              var keep = c.id !== sel.id;
              if (!keep) removed.push(sel);
              return keep;
            });
          } else if (sel.type === "text") {
            state.texts = state.texts.filter(function (t) {
              var keep = t.id !== sel.id;
              if (!keep) removed.push(sel);
              return keep;
            });
          }
        });
        SubwayLogger.logInfo("EDITOR", "Selection", "Deleted selection", { removed: removed });
        state.selection = [];
        render();
      }

      function moveSelection(dx, dy) {
        if (state.selection.length === 0) return;
        pushUndo();
        state.selection.forEach(function (sel) {
          if (sel.type === "node") {
            var n = findNode(sel.id);
            if (!n) return;
            n.x = snapValue(n.x + dx);
            n.y = snapValue(n.y + dy);
          } else if (sel.type === "text") {
            var t = findText(sel.id);
            if (!t) return;
            t.x = snapValue(t.x + dx);
            t.y = snapValue(t.y + dy);
          }
        });
        SubwayLogger.logVerbose("EDITOR", "Move", "Moved selection", { dx: dx, dy: dy, selection: state.selection });
        render();
      }

      var dragState = null;
      var connectionDraft = null;
      var selectionBox = null;

      function handleCanvasMouseDown(e) {
        if (e.button !== 0) return;
        var world = screenToWorld(e.clientX, e.clientY);
        if (state.currentTool === "pan" || state.isSpacePanning) {
          dragState = { mode: "pan", startX: e.clientX, startY: e.clientY, originX: state.viewport.offsetX, originY: state.viewport.offsetY };
          return;
        }
        if (state.currentTool === "node") {
          addNodeAt(world.x, world.y);
          return;
        }
        if (state.currentTool === "text") {
          addTextAt(world.x, world.y);
          return;
        }
        if (state.currentTool === "select") {
          selectionBox = { startX: e.clientX, startY: e.clientY, x: e.clientX, y: e.clientY };
          updateSelectionBox();
        }
      }

      function handleCanvasMouseMove(e) {
        var world = screenToWorld(e.clientX, e.clientY);
        if (dragState && dragState.mode === "pan") {
          var dx = e.clientX - dragState.startX;
          var dy = e.clientY - dragState.startY;
          state.viewport.offsetX = dragState.originX + dx;
          state.viewport.offsetY = dragState.originY + dy;
          applyTransform();
          return;
        }
        if (dragState && dragState.mode === "drag-node") {
          dragState.targets.forEach(function (t) {
            t.node.x = snapValue(world.x - t.offsetX, e.altKey);
            t.node.y = snapValue(world.y - t.offsetY, e.altKey);
          });
          render();
          return;
        }
        if (dragState && dragState.mode === "drag-text") {
          var t = dragState.target;
          t.x = snapValue(world.x - dragState.offsetX, e.altKey);
          t.y = snapValue(world.y - dragState.offsetY, e.altKey);
          render();
          return;
        }
        if (selectionBox) {
          selectionBox.x = e.clientX;
          selectionBox.y = e.clientY;
          updateSelectionBox();
        }
      }

      function handleCanvasMouseUp(e) {
        if (dragState && dragState.mode === "pan") {
          dragState = null;
          return;
        }
        if (dragState && (dragState.mode === "drag-node" || dragState.mode === "drag-text")) {
          dragState = null;
          SubwayLogger.logInfo("EDITOR", "Move", "Completed drag");
          return;
        }
        if (selectionBox) {
          finalizeSelectionBox();
          return;
        }
      }

      function updateSelectionBox() {
        if (!selectionBox) return;
        var x1 = selectionBox.startX;
        var y1 = selectionBox.startY;
        var x2 = selectionBox.x;
        var y2 = selectionBox.y;
        var left = Math.min(x1, x2);
        var top = Math.min(y1, y2);
        var width = Math.abs(x1 - x2);
        var height = Math.abs(y1 - y2);
        selectionRect.classList.remove("hidden");
        selectionRect.setAttribute("x", left - svg.getBoundingClientRect().left);
        selectionRect.setAttribute("y", top - svg.getBoundingClientRect().top);
        selectionRect.setAttribute("width", width);
        selectionRect.setAttribute("height", height);
      }

      function finalizeSelectionBox() {
        var rect = svg.getBoundingClientRect();
        var x1 = (Math.min(selectionBox.startX, selectionBox.x) - rect.left - state.viewport.offsetX) / state.viewport.scale;
        var y1 = (Math.min(selectionBox.startY, selectionBox.y) - rect.top - state.viewport.offsetY) / state.viewport.scale;
        var x2 = (Math.max(selectionBox.startX, selectionBox.x) - rect.left - state.viewport.offsetX) / state.viewport.scale;
        var y2 = (Math.max(selectionBox.startY, selectionBox.y) - rect.top - state.viewport.offsetY) / state.viewport.scale;
        selectionRect.classList.add("hidden");
        selectionRect.removeAttribute("width");
        selectionRect.removeAttribute("height");
        selectionBox = null;

        var selected = [];
        state.nodes.forEach(function (n) {
          if (n.x >= x1 && n.x <= x2 && n.y >= y1 && n.y <= y2) {
            selected.push({ type: "node", id: n.id });
          }
        });
        state.texts.forEach(function (t) {
          if (t.x >= x1 && t.x <= x2 && t.y >= y1 && t.y <= y2) {
            selected.push({ type: "text", id: t.id });
          }
        });
        state.selection = selected;
        SubwayLogger.logInfo("EDITOR", "Selection", "Box selection", { count: selected.length });
        updateSelectionVisuals();
        populateProperties();
      }

      function handleWheel(e) {
        e.preventDefault();
        var delta = e.deltaY < 0 ? 1.1 : 0.9;
        var rect = svg.getBoundingClientRect();
        var cx = e.clientX - rect.left;
        var cy = e.clientY - rect.top;
        var before = screenToWorld(e.clientX, e.clientY);
        state.viewport.scale = Math.max(config.minZoom || 0.25, Math.min(config.maxZoom || 4, state.viewport.scale * delta));
        var after = screenToWorld(e.clientX, e.clientY);
        state.viewport.offsetX += (cx - (before.x * state.viewport.scale + state.viewport.offsetX));
        state.viewport.offsetY += (cy - (before.y * state.viewport.scale + state.viewport.offsetY));
        applyTransform();
        updateZoomStatus();
        SubwayLogger.logVerbose("EDITOR", "Viewport", "Zoom wheel", { scale: state.viewport.scale });
      }

      function setTool(tool) {
        var validTools = ["select", "pan", "node", "connection", "text"];
        if (validTools.indexOf(tool) === -1) {
          SubwayLogger.logWarn("EDITOR", "Tool", "Unknown tool requested", { tool: tool });
          return;
        }
        if (tool !== "connection") {
          connectionDraft = null;
        }
        state.currentTool = tool;
        updateStatus("Tool: " + tool);
        highlightToolButton(tool);
      }

      function handleNodeMouseDown(e) {
        e.stopPropagation();
        var id = e.target.getAttribute("data-id");
        var node = findNode(id);
        if (!node) return;
        if (state.currentTool === "connection") {
          if (!connectionDraft) {
            connectionDraft = { from: id };
            updateStatus("Select target node");
          } else {
            addConnection(connectionDraft.from, id);
            connectionDraft = null;
            setTool("select");
          }
          return;
        }
        if (state.currentTool === "select") {
          var world = screenToWorld(e.clientX, e.clientY);
          pushUndo();
          var targets = [];
          var selectedNodes = state.selection.filter(function (s) { return s.type === "node"; });
          if (selectedNodes.length > 0 && selectedNodes.some(function (s) { return s.id === node.id; })) {
            selectedNodes.forEach(function (sel) {
              var n = findNode(sel.id);
              if (n) targets.push({ node: n, offsetX: world.x - n.x, offsetY: world.y - n.y });
            });
          } else {
            targets.push({ node: node, offsetX: world.x - node.x, offsetY: world.y - node.y });
            selectSingle({ type: "node", id: node.id });
          }
          dragState = { mode: "drag-node", targets: targets };
        }
      }

      function handleNodeClick(e) {
        e.stopPropagation();
        var id = e.target.getAttribute("data-id");
        selectSingle({ type: "node", id: id });
      }

      function handleConnectionMouseDown(e) {
        e.stopPropagation();
      }

      function handleConnectionClick(e) {
        e.stopPropagation();
        var id = e.target.getAttribute("data-id");
        selectSingle({ type: "connection", id: id });
      }

      function handleTextMouseDown(e) {
        e.stopPropagation();
        var id = e.target.getAttribute("data-id");
        var t = findText(id);
        if (!t) return;
        var world = screenToWorld(e.clientX, e.clientY);
        if (!state.selection.some(function (s) { return s.type === "text" && s.id === id; })) {
          selectSingle({ type: "text", id: id });
        }
        pushUndo();
        dragState = { mode: "drag-text", target: t, offsetX: world.x - t.x, offsetY: world.y - t.y };
      }

      function handleTextClick(e) {
        e.stopPropagation();
        var id = e.target.getAttribute("data-id");
        selectSingle({ type: "text", id: id });
      }

      function highlightToolButton(tool) {
        if (!toolbarButtons) return;
        Object.keys(toolbarButtons).forEach(function (key) {
          if (key === tool) {
            toolbarButtons[key].classList.add("active");
          } else {
            toolbarButtons[key].classList.remove("active");
          }
        });
      }

      function zoomIn() {
        state.viewport.scale = Math.min((config.maxZoom || 4), state.viewport.scale * 1.1);
        applyTransform();
        updateZoomStatus();
      }

      function zoomOut() {
        state.viewport.scale = Math.max((config.minZoom || 0.25), state.viewport.scale / 1.1);
        applyTransform();
        updateZoomStatus();
      }

      function fitToContent() {
        if (state.nodes.length === 0 && state.texts.length === 0) {
          state.viewport.scale = 1;
          state.viewport.offsetX = 0;
          state.viewport.offsetY = 0;
          applyTransform();
          updateZoomStatus();
          return;
        }
        var allX = [];
        var allY = [];
        state.nodes.forEach(function (n) { allX.push(n.x); allY.push(n.y); });
        state.texts.forEach(function (t) { allX.push(t.x); allY.push(t.y); });
        var minX = Math.min.apply(null, allX) - 60;
        var maxX = Math.max.apply(null, allX) + 60;
        var minY = Math.min.apply(null, allY) - 60;
        var maxY = Math.max.apply(null, allY) + 60;
        var rect = svg.getBoundingClientRect();
        var scaleX = rect.width / (maxX - minX);
        var scaleY = rect.height / (maxY - minY);
        var scale = Math.min(scaleX, scaleY);
        state.viewport.scale = Math.max(config.minZoom || 0.25, Math.min(config.maxZoom || 4, scale));
        state.viewport.offsetX = -minX * state.viewport.scale;
        state.viewport.offsetY = -minY * state.viewport.scale;
        applyTransform();
        updateZoomStatus();
        SubwayLogger.logInfo("EDITOR", "Viewport", "Fit to content", { bounds: { minX: minX, maxX: maxX, minY: minY, maxY: maxY } });
      }

      function updateNodeProperties(props) {
        var sel = state.selection.find(function (s) { return s.type === "node"; });
        if (!sel) return;
        var node = findNode(sel.id);
        if (!node) return;
        pushUndo();
        Object.keys(props).forEach(function (k) {
          node[k] = props[k];
        });
        render();
      }

      function updateConnectionProperties(props) {
        var sel = state.selection.find(function (s) { return s.type === "connection"; });
        if (!sel) return;
        var conn = findConnection(sel.id);
        if (!conn) return;
        pushUndo();
        Object.keys(props).forEach(function (k) { conn[k] = props[k]; });
        render();
      }

      function updateTextProperties(props) {
        var sel = state.selection.find(function (s) { return s.type === "text"; });
        if (!sel) return;
        var t = findText(sel.id);
        if (!t) return;
        pushUndo();
        Object.keys(props).forEach(function (k) { t[k] = props[k]; });
        render();
      }

      function alignNodes(direction) {
        var selectedNodes = state.selection.filter(function (s) { return s.type === "node"; }).map(function (s) { return findNode(s.id); }).filter(Boolean);
        if (selectedNodes.length < 2) return;
        pushUndo();
        if (direction === "horizontal") {
          var y = selectedNodes[0].y;
          selectedNodes.forEach(function (n) { n.y = snapValue(y); });
        } else if (direction === "vertical") {
          var x = selectedNodes[0].x;
          selectedNodes.forEach(function (n) { n.x = snapValue(x); });
        }
        render();
      }

      function distributeNodes(direction) {
        var nodes = state.selection.filter(function (s) { return s.type === "node"; }).map(function (s) { return findNode(s.id); }).filter(Boolean);
        if (nodes.length < 3) return;
        pushUndo();
        if (direction === "horizontal") {
          nodes.sort(function (a, b) { return a.x - b.x; });
          var min = nodes[0].x;
          var max = nodes[nodes.length - 1].x;
          var step = (max - min) / (nodes.length - 1);
          nodes.forEach(function (n, idx) { n.x = snapValue(min + step * idx); });
        } else if (direction === "vertical") {
          nodes.sort(function (a, b) { return a.y - b.y; });
          var minY = nodes[0].y;
          var maxY = nodes[nodes.length - 1].y;
          var stepY = (maxY - minY) / (nodes.length - 1);
          nodes.forEach(function (n, idx) { n.y = snapValue(minY + stepY * idx); });
        }
        render();
      }

      function toggleGrid(visible) {
        state.settings.gridVisible = visible;
        renderGrid();
        SubwayLogger.logInfo("UI", "Grid", "Grid visibility changed", { visible: visible });
      }

      function toggleSnap(enabled) {
        state.settings.snapEnabled = enabled;
        SubwayLogger.logInfo("UI", "Snap", "Snap toggled", { enabled: enabled });
      }

      function saveJSON() {
        var payload = {
          meta: { title: config.appName, version: config.version, savedAt: new Date().toISOString() },
          nodes: state.nodes,
          connections: state.connections,
          texts: state.texts,
          settings: state.settings,
          viewport: state.viewport
        };
        try {
          var json = JSON.stringify(payload, null, 2);
          downloadFile("diagram.json", json, "application/json");
          SubwayLogger.logInfo("STORAGE", "Save", "Saved diagram", { counts: { nodes: state.nodes.length, connections: state.connections.length, texts: state.texts.length } });
        } catch (e) {
          SubwayLogger.logError("STORAGE", "Save", "Failed to serialize diagram", { error: e.message });
          SubwayUI.showMessage("Failed to save diagram. See console for details.");
        }
      }

      function loadJSON() {
        var input = document.createElement("input");
        input.type = "file";
        input.accept = ".json,application/json";
        input.addEventListener("change", function () {
          if (!input.files || input.files.length === 0) {
            SubwayLogger.logWarn("STORAGE", "Load", "File picker closed without file");
            return;
          }
          var file = input.files[0];
          var reader = new FileReader();
          reader.onload = function (evt) {
            try {
              var obj = JSON.parse(evt.target.result);
              var valid = validateDiagram(obj);
              if (!valid.ok) {
                SubwayLogger.logError("STORAGE", "Load", "Diagram validation failed", valid);
                SubwayUI.showMessage("Invalid diagram file. " + valid.message);
                return;
              }
              pushUndo();
              state.nodes = obj.nodes || [];
              state.connections = obj.connections || [];
              state.texts = obj.texts || [];
              state.settings = obj.settings || state.settings;
              state.viewport = obj.viewport || state.viewport;
              render();
              SubwayLogger.logInfo("STORAGE", "Load", "Loaded diagram", { file: file.name });
            } catch (err) {
              SubwayLogger.logError("STORAGE", "Load", "Failed to parse JSON", { error: err.message });
              SubwayUI.showMessage("Failed to read file. See console for details.");
            }
          };
          reader.onerror = function (err) {
            SubwayLogger.logError("STORAGE", "Load", "File read error", { error: err });
          };
          reader.readAsText(file);
        });
        input.click();
      }

      function validateDiagram(obj) {
        if (!obj || typeof obj !== "object") {
          return { ok: false, message: "Root not object" };
        }
        var idSet = {};
        var nodes = obj.nodes || [];
        for (var i = 0; i < nodes.length; i++) {
          var n = nodes[i];
          if (!n.id) return { ok: false, message: "Node missing id", node: n };
          if (idSet[n.id]) return { ok: false, message: "Duplicate node id", id: n.id };
          idSet[n.id] = true;
        }
        var conns = obj.connections || [];
        var connIds = {};
        for (var j = 0; j < conns.length; j++) {
          var c = conns[j];
          if (!c.id) return { ok: false, message: "Connection missing id", connection: c };
          if (connIds[c.id]) return { ok: false, message: "Duplicate connection id", id: c.id };
          connIds[c.id] = true;
          if (!idSet[c.from] || !idSet[c.to]) return { ok: false, message: "Connection references missing node", connection: c };
        }
        return { ok: true };
      }

      function exportSVG() {
        try {
          var clone = svg.cloneNode(true);
          clone.removeAttribute("id");
          var style = document.createElementNS(NS, "style");
          style.textContent = getExportStyle();
          clone.insertBefore(style, clone.firstChild);
          var serializer = new XMLSerializer();
          var source = serializer.serializeToString(clone);
          downloadFile("diagram.svg", source, "image/svg+xml");
          SubwayLogger.logInfo("EXPORT", "SVG", "Exported SVG");
        } catch (e) {
          SubwayLogger.logError("EXPORT", "SVG", "Failed to export SVG", { error: e.message });
          SubwayUI.showMessage("Failed to export SVG. See console for details.");
        }
      }

      function exportPNG() {
        try {
          var serializer = new XMLSerializer();
          var source = serializer.serializeToString(svg);
          var svgBlob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
          var url = URL.createObjectURL(svgBlob);
          var image = new Image();
          image.onload = function () {
            var rect = svg.getBoundingClientRect();
            var canvas = document.createElement("canvas");
            canvas.width = rect.width;
            canvas.height = rect.height;
            var ctx = canvas.getContext("2d");
            ctx.drawImage(image, 0, 0);
            URL.revokeObjectURL(url);
            canvas.toBlob(function (blob) {
              var a = document.createElement("a");
              a.href = URL.createObjectURL(blob);
              a.download = "diagram.png";
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
            });
            SubwayLogger.logInfo("EXPORT", "PNG", "Exported PNG");
          };
          image.onerror = function (err) {
            SubwayLogger.logError("EXPORT", "PNG", "Failed to render PNG", { error: err });
            SubwayUI.showMessage("Failed to export PNG. See console for details.");
          };
          image.src = url;
        } catch (e) {
          SubwayLogger.logError("EXPORT", "PNG", "Exception during PNG export", { error: e.message });
          SubwayUI.showMessage("Failed to export PNG. See console for details.");
        }
      }

      function undo() {
        if (state.undoStack.length === 0) return;
        var snapshot = state.undoStack.pop();
        state.redoStack.push(cloneState(state));
        restoreState(snapshot);
        SubwayLogger.logInfo("EDITOR", "History", "Undo");
      }

      function redo() {
        if (state.redoStack.length === 0) return;
        var snapshot = state.redoStack.pop();
        state.undoStack.push(cloneState(state));
        restoreState(snapshot);
        SubwayLogger.logInfo("EDITOR", "History", "Redo");
      }

      function handleKeydown(e) {
        if (["INPUT", "TEXTAREA"].indexOf(e.target.tagName) !== -1) return;
        if (e.key === "Delete" || e.key === "Backspace") {
          deleteSelection();
        } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z" && !e.shiftKey) {
          undo();
        } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z" && e.shiftKey) {
          redo();
        } else if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].indexOf(e.key) >= 0) {
          var delta = 4;
          if (e.key === "ArrowUp") moveSelection(0, -delta);
          if (e.key === "ArrowDown") moveSelection(0, delta);
          if (e.key === "ArrowLeft") moveSelection(-delta, 0);
          if (e.key === "ArrowRight") moveSelection(delta, 0);
        } else if (e.key === "1") { setTool("select"); }
        else if (e.key === "2") { setTool("pan"); }
        else if (e.key === "3") { setTool("node"); }
        else if (e.key === "4") { setTool("connection"); }
        else if (e.key === "5") { setTool("text"); }
        else if (e.key === " ") { state.isSpacePanning = true; }
      }

      function handleKeyup(e) {
        if (e.key === " ") {
          state.isSpacePanning = false;
        }
      }

      function populateProperties() {
        if (!propertyBodies) return;
        var nodeSel = state.selection.find(function (s) { return s.type === "node"; });
        var connSel = state.selection.find(function (s) { return s.type === "connection"; });
        var textSel = state.selection.find(function (s) { return s.type === "text"; });
        propertyBodies.node.body.parentElement.classList.toggle("hidden", !nodeSel);
        propertyBodies.connection.body.parentElement.classList.toggle("hidden", !connSel);
        propertyBodies.text.body.parentElement.classList.toggle("hidden", !textSel);
        if (nodeSel) {
          var n = findNode(nodeSel.id);
          if (n) {
            if (nodeInputs.label) nodeInputs.label.value = n.label;
            if (nodeInputs.size) nodeInputs.size.value = n.radius;
            if (nodeInputs.placement) nodeInputs.placement.value = n.labelPlacement;
          }
        }
        if (connSel) {
          var c = findConnection(connSel.id);
          if (c && connectionInputs.style) connectionInputs.style.value = c.style || "solid";
        }
        if (textSel) {
          var t = findText(textSel.id);
          if (t) {
            if (textInputs.content) textInputs.content.value = t.text;
            if (textInputs.fontSize) textInputs.fontSize.value = t.fontSize;
          }
        }
      }

      function setTheme(theme) {
        state.settings.theme = theme;
        document.body.style.background = theme === "dark" ? "#0f172a" : "#f7f9fb";
        SubwayLogger.logInfo("UI", "Theme", "Theme changed", { theme: theme });
      }

      // UI setup
      var toolbarButtons = {};
      var zoomControl = null;
      var propertyBodies = null;
      var nodeInputs = {};
      var connectionInputs = {};
      var textInputs = {};

      function buildToolbar() {
        toolbarEl.innerHTML = "";
        var group1 = document.createElement("div");
        group1.className = "toolbar-group";
        toolbarButtons.select = SubwayUI.createButton(group1, "Select", "Select tool (1)", function () { setTool("select"); });
        toolbarButtons.pan = SubwayUI.createButton(group1, "Pan", "Pan tool (2)", function () { setTool("pan"); });
        toolbarButtons.node = SubwayUI.createButton(group1, "Node", "Create node (3)", function () { setTool("node"); });
        toolbarButtons.connection = SubwayUI.createButton(group1, "Connect", "Connection tool (4)", function () { setTool("connection"); });
        toolbarButtons.text = SubwayUI.createButton(group1, "Text", "Text tool (5)", function () { setTool("text"); });
        toolbarEl.appendChild(group1);

        var group2 = document.createElement("div");
        group2.className = "toolbar-group";
        SubwayUI.createButton(group2, "Delete", "Delete selection", deleteSelection);
        SubwayUI.createButton(group2, "Align H", "Align horizontally", function () { alignNodes("horizontal"); });
        SubwayUI.createButton(group2, "Align V", "Align vertically", function () { alignNodes("vertical"); });
        SubwayUI.createButton(group2, "Dist H", "Distribute horizontally", function () { distributeNodes("horizontal"); });
        SubwayUI.createButton(group2, "Dist V", "Distribute vertically", function () { distributeNodes("vertical"); });
        toolbarEl.appendChild(group2);

        var group3 = document.createElement("div");
        group3.className = "toolbar-group";
        var gridToggle = SubwayUI.createToggleButton(group3, "Grid", "Toggle grid", state.settings.gridVisible, toggleGrid);
        var snapToggle = SubwayUI.createToggleButton(group3, "Snap", "Toggle snap", state.settings.snapEnabled, toggleSnap);
        toolbarEl.appendChild(group3);

        var group4 = document.createElement("div");
        group4.className = "toolbar-group";
        zoomControl = SubwayUI.createZoomControl(group4, zoomOut, fitToContent, zoomIn);
        toolbarEl.appendChild(group4);

        var group5 = document.createElement("div");
        group5.className = "toolbar-group";
        SubwayUI.createButton(group5, "New", "New diagram", function () {
          pushUndo();
          state.nodes = [];
          state.connections = [];
          state.texts = [];
          state.selection = [];
          connectionDraft = null;
          state.viewport = { offsetX: 0, offsetY: 0, scale: 1 };
          applyTransform();
          updateZoomStatus();
          render();
        });
        SubwayUI.createButton(group5, "Save", "Save JSON", saveJSON);
        SubwayUI.createButton(group5, "Load", "Load JSON", loadJSON);
        SubwayUI.createButton(group5, "SVG", "Export SVG", exportSVG);
        SubwayUI.createButton(group5, "PNG", "Export PNG", exportPNG);
        toolbarEl.appendChild(group5);

        highlightToolButton(state.currentTool);
      }

      function buildSidebar() {
        sidebarEl.innerHTML = "";
        propertyBodies = {};
        var palettePanel = SubwayUI.createPanel(sidebarEl, "Palette");
        SubwayUI.createColorPalette(palettePanel.body, palette, function (color) {
          state.activeColor = color;
          if (state.selection.some(function (s) { return s.type === "node"; })) {
            updateNodeProperties({ color: color });
          } else if (state.selection.some(function (s) { return s.type === "text"; })) {
            updateTextProperties({ color: color });
          } else if (state.selection.some(function (s) { return s.type === "connection"; })) {
            updateConnectionProperties({ color: color });
          }
        });

        var themePanel = SubwayUI.createPanel(sidebarEl, "Theme");
        SubwayUI.createSelect(themePanel.body, "Theme", [
          { value: "light", label: "Light" },
          { value: "dark", label: "Dark" }
        ], setTheme);

        var nodePanel = SubwayUI.createPanel(sidebarEl, "Node");
        propertyBodies.node = nodePanel;
        nodeInputs.label = SubwayUI.createLabeledInput(nodePanel.body, "Label", "text", function (v) {
          updateNodeProperties({ label: v });
        });
        nodeInputs.size = SubwayUI.createLabeledInput(nodePanel.body, "Radius", "number", function (v) {
          var num = parseFloat(v);
          if (!isNaN(num)) updateNodeProperties({ radius: num });
        });
        nodeInputs.size.value = config.defaultNodeRadius;
        nodeInputs.placement = SubwayUI.createSelect(nodePanel.body, "Label pos", [
          { value: "inside", label: "Inside" },
          { value: "above", label: "Above" },
          { value: "below", label: "Below" },
          { value: "left", label: "Left" },
          { value: "right", label: "Right" }
        ], function (v) { updateNodeProperties({ labelPlacement: v }); });
        nodePanel.panel.classList.add("hidden");

        var connPanel = SubwayUI.createPanel(sidebarEl, "Connection");
        propertyBodies.connection = connPanel;
        connectionInputs.style = SubwayUI.createSelect(connPanel.body, "Style", [
          { value: "solid", label: "Solid" },
          { value: "dashed", label: "Dashed" }
        ], function (v) { updateConnectionProperties({ style: v }); });
        connPanel.panel.classList.add("hidden");

        var textPanel = SubwayUI.createPanel(sidebarEl, "Text");
        propertyBodies.text = textPanel;
        textInputs.content = SubwayUI.createLabeledInput(textPanel.body, "Content", "text", function (v) { updateTextProperties({ text: v }); });
        textInputs.fontSize = SubwayUI.createLabeledInput(textPanel.body, "Font size", "number", function (v) {
          var num = parseFloat(v);
          if (!isNaN(num)) updateTextProperties({ fontSize: num });
        });
        textInputs.fontSize.value = config.defaultFontSize;
        textPanel.panel.classList.add("hidden");
      }

      buildToolbar();
      buildSidebar();
      render();

      svg.addEventListener("mousedown", handleCanvasMouseDown);
      svg.addEventListener("mousemove", handleCanvasMouseMove);
      svg.addEventListener("mouseup", handleCanvasMouseUp);
      svg.addEventListener("mouseleave", handleCanvasMouseUp);
      svg.addEventListener("wheel", handleWheel, { passive: false });
      window.addEventListener("keydown", handleKeydown);
      window.addEventListener("keyup", handleKeyup);

      updateStatus("Ready");
      updateZoomStatus();
      render();

      function runSelfTests() {
        var results = [];
        try {
          SubwayLogger.logVerbose("TEST", "Logger", "Running logger test");
          SubwayLogger.setLevel("verbose");
          SubwayLogger.logInfo("TEST", "Logger", "Info level works");
          results.push("Logger level change ok");
        } catch (e) {
          results.push("Logger test failed: " + e.message);
        }
        try {
          var sample = { nodes: [{ id: "a" }], connections: [{ id: "c1", from: "a", to: "missing" }] };
          var valid = validateDiagram(sample);
          if (valid.ok) {
            results.push("Validation missing reference not caught");
          } else {
            results.push("Validation caught missing reference");
          }
        } catch (e2) {
          results.push("Validation threw exception");
        }
        return results;
      }

      return {
        getStateSnapshot: function () {
          return cloneState(state);
        },
        loadFromJSON: function (obj) {
          var valid = validateDiagram(obj);
          if (!valid.ok) {
            SubwayLogger.logError("STORAGE", "Load", "Validation failed in public load", valid);
            throw new Error("Invalid diagram JSON");
          }
          state.nodes = obj.nodes || [];
          state.connections = obj.connections || [];
          state.texts = obj.texts || [];
          state.settings = obj.settings || state.settings;
          state.viewport = obj.viewport || state.viewport;
          render();
        },
        exportAsSVG: exportSVG,
        exportAsPNG: exportPNG,
        saveJSON: saveJSON,
        loadJSON: loadJSON,
        undo: undo,
        redo: redo,
        setTool: setTool,
        runSelfTests: runSelfTests
      };
    }
  };

  window.SubwayEditor = SubwayEditor;
})();
