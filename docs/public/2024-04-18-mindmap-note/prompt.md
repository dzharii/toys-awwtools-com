# mind-map
Date: 2024-04-18

I am determined to succeed and will not let obstacles stand in my way.



> Prompt

create a note taking mind map like application, where there is always a central node, in this case a text edit, there is "add note" buttons on top, left, and right of each node, so the user can add another note dynamically on the side.  let's say C is the central node, it can add new note in all 4 directions.  let's assume the user clicked on right "add note" and created note "D" now the ui shows connection: C -> D and since there is a connection from D's left, user cannot add note on the left, but can add note in any other direction.  Simialr to C, but in this state the "right" dirrection is occupied by connection with D, and other directions are free.  The use can add infinite number of nodes. 



> GPT

### Plan

The rendering issue where nodes appear in the DOM but display blankly is likely due to CSS positioning or visibility issues. We need to ensure that the dynamically created nodes are properly positioned and styled to be visible. Additionally, we'll verify if the contenteditable divs within nodes are properly initialized.

**Troubleshooting Steps:**
1. **CSS Positioning:** Ensure that each node is correctly positioned relative to its parent. Check the computation of left and top styles for each node.
2. **Visibility and Z-index:** Confirm that there's no overlapping issue or a problem with z-index that might be causing the nodes to render but not display properly.
3. **Initialization of Contenteditable Divs:** Check if the contenteditable divs within each node are initialized correctly and are actually editable and visible.
4. **Shadow DOM Styles:** Make sure that styles defined in the shadow DOM are correctly applied to the elements and are not overridden or ignored.

**Confidence Level**: 92%

Given the symptoms described, these steps should address common problems associated with rendering of dynamically created DOM elements in web components. Further adjustments might be needed based on specific behaviors observed upon implementing these fixes.

### Implementation

```plaintext
__FILE::mindMap20240418.js

class MindMapNode extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          margin: 10px;
          position: absolute; /* Ensure the positioning is absolute */
          border: 1px solid black; /* Visible border for debugging */
          padding: 10px;
          min-width: 100px;
          min-height: 50px;
        }
        .node {
          border: 1px solid blue; /* Different border color for visibility */
          background: white; /* Ensure background is not transparent */
          color: black; /* Ensure text color is visible */
          padding: 5px;
          width: 100px;
          height: 50px;
          display: flex;
          justify-content: center;
          align-items: center;
          overflow: hidden; /* Avoid text spilling */
        }
        .add-button {
          position: absolute;
          width: 25px;
          height: 25px;
          background-color: #f0f0f0;
          border: none;
          cursor: pointer;
        }
        .top { top: -30px; left: 50%; transform: translateX(-50%); }
        .bottom { bottom: -30px; left: 50%; transform: translateX(-50%); }
        .left { left: -30px; top: 50%; transform: translateY(-50%); }
        .right { right: -30px; top: 50%; transform: translateY(-50%); }
      </style>
      <div class="node" contenteditable="true">Editable Text</div>
      <button class="add-button top">+</button>
      <button class="add-button bottom">+</button>
      <button class="add-button left">+</button>
      <button class="add-button right">+</button>
    `;
    this.x = 0;
    this.y = 0;
  }

  connectedCallback() {
    this.updateButtonVisibility();
    this.shadowRoot.querySelectorAll('.add-button').forEach(button => {
      button.addEventListener('click', e => this.handleAdd(e));
    });
  }

  handleAdd(e) {
    const direction = e.target.className.split(' ')[1];
    this.dispatchEvent(new CustomEvent('add-node', {
      detail: { direction, x: this.x, y: this.y },
      bubbles: true,
      composed: true
    }));
  }

  updateButtonVisibility() {
    const occupied = this.getAttribute('occupied') || '';
    ['top', 'bottom', 'left', 'right'].forEach(dir => {
      const button = this.shadowRoot.querySelector(`.add-button.${dir}`);
      button.style.display = occupied.includes(dir) ? 'none' : 'block';
    });
  }

  static get observedAttributes() { return ['occupied']; }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'occupied') {
      this.updateButtonVisibility();
    }
  }
}

customElements.define('mind-map-node', MindMapNode);

class MindMap extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `<style>
      :host {
        display: block;
        position: relative;
        width: 100vw; /* Ensure full view width */
        height: 100vh; /* Ensure full view height */
        overflow: auto; /* Scrollbars as needed */
        background: lightgray; /* Background to help with visibility */
     

 }
    </style>
    <mind-map-node id="root" style="left: 50%; top: 50%; transform: translate(-50%, -50%);"></mind-map-node>`;
    this.nodes = [{ component: this.shadowRoot.querySelector('#root'), x: 0, y: 0 }];
  }

  connectedCallback() {
    this.addEventListener('add-node', e => this.addNode(e));
  }

  addNode(e) {
    const { direction, x, y } = e.detail;
    const offsetX = direction === 'left' ? -150 : direction === 'right' ? 150 : 0;
    const offsetY = direction === 'top' ? -100 : direction === 'bottom' ? 100 : 0;
    const newNode = document.createElement('mind-map-node');
    newNode.style.position = 'absolute';
    newNode.style.left = `calc(50% + ${offsetX}px)`;
    newNode.style.top = `calc(50% + ${offsetY}px)`;
    newNode.x = x + (direction === 'left' ? -1 : direction === 'right' ? 1 : 0);
    newNode.y = y + (direction === 'top' ? -1 : direction === 'bottom' ? 1 : 0);
    this.shadowRoot.appendChild(newNode);
    this.nodes.push({ component: newNode, x: newNode.x, y: newNode.y });
    this.updateOccupiedStates();
  }

  updateOccupiedStates() {
    this.nodes.forEach(node => {
      const occupiedDirections = this.nodes.filter(n =>
        (n.x === node.x && n.y === node.y - 1 && 'top') ||
        (n.x === node.x && n.y === node.y + 1 && 'bottom') ||
        (n.x === node.x - 1 && n.y === node.y && 'left') ||
        (n.x === node.x + 1 && n.y === node.y && 'right')
      ).map(n => n.direction).join('');
      node.component.setAttribute('occupied', occupiedDirections);
    });
  }
}

customElements.define('mind-map', MindMap);

__FILE::mindMapDemo.html

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mind Map Demo</title>
    <script src="mindMap20240418.js"></script>
</head>
<body>
    <mind-map></mind-map>
</body>
</html>
```
