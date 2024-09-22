// script.js

document.addEventListener('DOMContentLoaded', () => {
    const svg = document.getElementById('linked-list-svg');
    const instructionText = document.getElementById('instruction-text');
    const resetButton = document.getElementById('reset-button');
    const hintButton = document.getElementById('hint-button');

    const NODE_WIDTH = 100;
    const NODE_HEIGHT = 50;
    const NODE_MARGIN = 150;
    const SVG_PADDING = 50;

    let linkedList = [];
    let hoses = [];
    let previous = null;
    let current = null;
    let next = null;
    let step = 0;
    let isDragging = false;
    let selectedHose = null;
    let offset = { x: 0, y: 0 };

    // Initialize the simulation
    function init() {
        generateLinkedList();
        renderLinkedList();
        initializePointers();
    }

    // Generate a random linked list with 6 to 10 nodes
    function generateLinkedList() {
        const nodeCount = Math.floor(Math.random() * 5) + 6; // 6 to 10
        linkedList = [];
        for (let i = 0; i < nodeCount; i++) {
            linkedList.push({
                value: Math.floor(Math.random() * 100),
                x: SVG_PADDING + i * NODE_MARGIN,
                y: 100,
                next: i < nodeCount - 1 ? i + 1 : null,
                svgGroup: null
            });
        }
    }

    // Render the linked list nodes and hoses
    function renderLinkedList() {
        svg.innerHTML = '';

        // Render hoses first to be below nodes
        hoses = [];
        linkedList.forEach((node, index) => {
            if (node.next !== null) {
                const hose = createHose(index, node.next);
                hoses.push(hose);
                svg.appendChild(hose.path);
            }
        });

        // Render nodes
        linkedList.forEach((node, index) => {
            const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            group.setAttribute('class', 'node');
            group.setAttribute('transform', `translate(${node.x}, ${node.y})`);
            group.dataset.index = index;

            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('width', NODE_WIDTH);
            rect.setAttribute('height', NODE_HEIGHT);
            rect.setAttribute('rx', 10);
            rect.setAttribute('ry', 10);

            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', NODE_WIDTH / 2);
            text.setAttribute('y', NODE_HEIGHT / 2 + 5);
            text.setAttribute('text-anchor', 'middle');
            text.textContent = node.value;

            group.appendChild(rect);
            group.appendChild(text);
            svg.appendChild(group);

            node.svgGroup = group;
        });
    }

    // Create a hose (SVG path) between two nodes
    function createHose(fromIndex, toIndex) {
        const fromNode = linkedList[fromIndex];
        const toNode = linkedList[toIndex];

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('class', 'hose');
        path.setAttribute('data-from', fromIndex);
        path.setAttribute('data-to', toIndex);
        updateHosePath(path, fromNode, toNode);

        // Add event listeners for interaction
        path.addEventListener('mousedown', (e) => {
            if (step === 1 && parseInt(path.dataset.from) === linkedList.indexOf(current)) {
                isDragging = true;
                selectedHose = path;
                path.classList.add('highlight');
                instructionText.textContent = `Hose detached from node ${current.value}. Drag to reattach.`;
                e.preventDefault();
            }
        });

        return { from: fromIndex, to: toIndex, path: path };
    }

    // Update the SVG path for a hose based on node positions
    function updateHosePath(path, fromNode, toNode) {
        const startX = fromNode.x + NODE_WIDTH;
        const startY = fromNode.y + NODE_HEIGHT / 2;
        const endX = toNode.x;
        const endY = toNode.y + NODE_HEIGHT / 2;
        const controlOffset = NODE_MARGIN / 2;

        const d = `M${startX},${startY} C${startX + controlOffset},${startY} ${endX - controlOffset},${endY} ${endX},${endY}`;
        path.setAttribute('d', d);
    }

    // Initialize pointers for the reversal process
    function initializePointers() {
        previous = null;
        current = linkedList[0];
        next = current.next !== null ? linkedList[current.next] : null;
        step = 1;
        highlightCurrentNode();
        updateInstruction();
        highlightCurrentHose();
    }

    // Highlight the current node
    function highlightCurrentNode() {
        linkedList.forEach(node => {
            node.svgGroup.classList.remove('highlight');
        });
        if (current) {
            current.svgGroup.classList.add('highlight');
        }
    }

    // Update the instruction text based on the current step
    function updateInstruction() {
        if (step === 1 && current) {
            instructionText.textContent = `Step 1: Set the next pointer of ${current.value} to ${previous ? previous.value : 'null'}. Click on the hose connected to ${current.value} to detach it.`;
        } else if (step === 2 && current) {
            instructionText.textContent = `Step 2: Drag the detached hose and drop it onto node ${previous ? previous.value : 'null'} to reattach.`;
        } else if (step === 3 && current) {
            instructionText.textContent = `Step 3: Move to the next node.`;
        } else if (step === 'complete') {
            instructionText.textContent = 'Congratulations! You have successfully reversed the linked list.';
        }
    }

    // Highlight the current hose that needs to be detached
    function highlightCurrentHose() {
        hoses.forEach(hose => {
            hose.path.classList.remove('highlight');
            if (parseInt(hose.path.dataset.from) === linkedList.indexOf(current)) {
                hose.path.classList.add('highlight');
            }
        });
    }

    // Handle hose dragging
    function handleHoseDragging(e) {
        if (!isDragging || !selectedHose) return;

        const svgRect = svg.getBoundingClientRect();
        const mouseX = e.clientX - svgRect.left;
        const mouseY = e.clientY - svgRect.top;

        // Update the end point of the hose to follow the mouse
        const fromIndex = parseInt(selectedHose.dataset.from);
        const fromNode = linkedList[fromIndex];
        const startX = fromNode.x + NODE_WIDTH;
        const startY = fromNode.y + NODE_HEIGHT / 2;
        const controlOffset = NODE_MARGIN / 2;
        const d = `M${startX},${startY} C${startX + controlOffset},${startY} ${mouseX - controlOffset},${mouseY} ${mouseX},${mouseY}`;
        selectedHose.setAttribute('d', d);
    }

    // Handle hose drop
    function handleHoseDrop(e) {
        if (!isDragging || !selectedHose) return;

        isDragging = false;

        const svgRect = svg.getBoundingClientRect();
        const mouseX = e.clientX - svgRect.left;
        const mouseY = e.clientY - svgRect.top;

        // Find the node closest to the drop position
        let closestNode = null;
        let minDistance = Infinity;
        linkedList.forEach(node => {
            const nodeCenterX = node.x + NODE_WIDTH / 2;
            const nodeCenterY = node.y + NODE_HEIGHT / 2;
            const distance = Math.hypot(nodeCenterX - mouseX, nodeCenterY - mouseY);
            if (distance < minDistance && distance < NODE_WIDTH) { // Threshold distance
                closestNode = node;
                minDistance = distance;
            }
        });

        if (closestNode && closestNode !== current) {
            // Reattach the hose to the closest node
            const fromIndex = parseInt(selectedHose.dataset.from);
            const newToIndex = linkedList.indexOf(closestNode);

            // Update the linked list data structure
            linkedList[fromIndex].next = newToIndex;

            // Re-render hoses
            renderLinkedList();
            drawHoses();

            // Move pointers
            previous = current;
            current = next;
            next = current && current.next !== null ? linkedList[current.next] : null;

            step = current ? 1 : 'complete';
            highlightCurrentNode();
            updateInstruction();
            highlightCurrentHose();
        } else {
            // If not dropped on a valid node, revert the hose
            const fromIndex = parseInt(selectedHose.dataset.from);
            const toIndex = parseInt(selectedHose.dataset.to);
            const fromNode = linkedList[fromIndex];
            const toNode = linkedList[toIndex];
            updateHosePath(selectedHose, fromNode, toNode);
            selectedHose.classList.remove('highlight');
            selectedHose = null;
            updateInstruction();
        }
    }

    // Add global event listeners for dragging
    svg.addEventListener('mousemove', handleHoseDragging);
    svg.addEventListener('mouseup', handleHoseDrop);
    svg.addEventListener('mouseleave', () => {
        if (isDragging) {
            handleHoseDrop();
        }
    });

    // Reset the simulation
    function resetSimulation() {
        generateLinkedList();
        renderLinkedList();
        hoses = Array.from(svg.querySelectorAll('path.hose')).map(path => ({
            from: parseInt(path.dataset.from),
            to: parseInt(path.dataset.to),
            path: path
        }));
        initializePointers();
    }

    // Provide hints to the user
    function provideHint() {
        if (step === 1 && current) {
            alert(`Please click on the hose connected to node ${current.value} to detach it.`);
        } else if (step === 2 && previous !== null) {
            alert(`Please drag the detached hose and drop it onto node ${previous.value} to reattach.`);
        } else if (step === 'complete') {
            alert('The linked list has been successfully reversed.');
        } else {
            alert('No hints available at this step.');
        }
    }

    // Event listeners for buttons
    resetButton.addEventListener('click', resetSimulation);
    hintButton.addEventListener('click', provideHint);

    // Initialize the simulation on page load
    init();
});

