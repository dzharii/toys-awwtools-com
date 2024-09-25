document.addEventListener('DOMContentLoaded', () => {
    const linkedListContainer = document.getElementById('linked-list-container');
    const instructionPanel = document.getElementById('instruction-panel');
    const svgCanvas = document.getElementById('svg-canvas');
    const resetButton = document.getElementById('reset-button');
    const caretContainer = document.getElementById('caret-container');

    let nodes = [];
    let hoses = [];
    let currentStep = 0;

    let previous = null;
    let current = null;
    let nextNode = null;

    function init() {
        linkedListContainer.innerHTML = '';
        svgCanvas.innerHTML = '';
        nodes = [];
        hoses = [];
        currentStep = 0;
        createLinkedList();
        initializePointers();
        updateInstruction("Let's begin the reversal process. Detach the hose from the current node.");
        updatePointersVisual();
        highlightCurrentHose();
    }

    function createLinkedList() {
        // Create null node (N0)
        const nullNode = document.createElement('div');
        nullNode.classList.add('node');
        nullNode.setAttribute('data-index', 0);
        nullNode.textContent = 'N0';
        linkedListContainer.appendChild(nullNode);
        nodes.push(nullNode);

        const nodeCount = 4; // For simplicity, use 4 nodes (N1 to N4)
        for (let i = 1; i <= nodeCount; i++) {
            const nodeValue = 'N' + i;
            const nodeElement = document.createElement('div');
            nodeElement.classList.add('node');
            nodeElement.setAttribute('data-index', i);
            nodeElement.textContent = nodeValue;
            linkedListContainer.appendChild(nodeElement);
            nodes.push(nodeElement);
        }
        drawHoses();
    }

    function drawHoses() {
        for (let i = 1; i < nodes.length - 1; i++) {
            const hose = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            hose.setAttribute('class', 'hose');
            hose.setAttribute('data-index', i);
            updateHosePath(hose, nodes[i], nodes[i + 1]);
            svgCanvas.appendChild(hose);
            hoses.push(hose);

            hose.addEventListener('mousedown', onHoseMouseDown);
        }
    }

    function updateHosePath(hose, fromNode, toNode) {
        const fromRect = fromNode.getBoundingClientRect();
        const toRect = toNode.getBoundingClientRect();
        const svgRect = svgCanvas.getBoundingClientRect();

        const startX = fromRect.right - svgRect.left;
        const startY = fromRect.top + fromRect.height / 2 - svgRect.top;
        const endX = toRect.left - svgRect.left;
        const endY = toRect.top + toRect.height / 2 - svgRect.top;

        const pathData = `M${startX},${startY} C${startX + 50},${startY} ${endX - 50},${endY} ${endX},${endY}`;
        hose.setAttribute('d', pathData);
    }

    let draggingHose = null;

    function onHoseMouseDown(event) {
        const hoseIndex = parseInt(event.target.getAttribute('data-index'));
        if (hoseIndex !== currentStep + 1) {
            return;
        }
        event.preventDefault();
        draggingHose = event.target;
        draggingHose.classList.add('highlight');
        svgCanvas.addEventListener('mousemove', onHoseMouseMove);
        svgCanvas.addEventListener('mouseup', onHoseMouseUp);
    }

    function onHoseMouseMove(event) {
        if (draggingHose) {
            const svgRect = svgCanvas.getBoundingClientRect();
            const x = event.clientX - svgRect.left;
            const y = event.clientY - svgRect.top;
            const pathData = `M${x},${y} L${x},${y}`;
            draggingHose.setAttribute('d', pathData);
        }
    }

    function onHoseMouseUp(event) {
        if (draggingHose) {
            const hoseIndex = parseInt(draggingHose.getAttribute('data-index'));
            const targetNodeIndex = hoseIndex - 1;
            if (targetNodeIndex >= 0) {
                updateHosePath(draggingHose, nodes[hoseIndex], nodes[targetNodeIndex]);
                draggingHose.classList.remove('highlight');
                proceedToNextStep();
            } else {
                resetHosePosition(draggingHose, nodes[hoseIndex], nodes[hoseIndex + 1]);
                draggingHose.classList.remove('highlight');
            }
            draggingHose = null;
            svgCanvas.removeEventListener('mousemove', onHoseMouseMove);
            svgCanvas.removeEventListener('mouseup', onHoseMouseUp);
        }
    }

    function resetHosePosition(hose, fromNode, toNode) {
        updateHosePath(hose, fromNode, toNode);
    }

    function proceedToNextStep() {
        updatePointers();
        updatePointersVisual();
        currentStep++;
        if (currentStep < hoses.length) {
            updateInstruction("Detach the hose from the current node.");
            highlightCurrentHose();
        } else {
            updateInstruction("Congratulations! You've successfully reversed the linked list.");
            clearHighlights();
        }
    }

    function initializePointers() {
        previous = nodes[0]; // N0 (null node)
        current = nodes[1];  // N1
        nextNode = nodes[2]; // N2
    }

    function updatePointers() {
        previous = current;
        current = nextNode;
        nextNode = nodes[currentStep + 2] || null;
    }

    function updatePointersVisual() {
        // Update caret positions
        const caretBoxes = caretContainer.querySelectorAll('.caret-box');
        caretBoxes.forEach((box) => {
            box.style.visibility = 'hidden';
        });

        if (previous) {
            const prevRect = previous.getBoundingClientRect();
            const containerRect = linkedListContainer.getBoundingClientRect();
            const p1 = document.getElementById('p1');
            p1.style.visibility = 'visible';
            p1.style.left = prevRect.left + prevRect.width / 2 - containerRect.left - 30 + 'px';
        }

        if (current) {
            const currRect = current.getBoundingClientRect();
            const containerRect = linkedListContainer.getBoundingClientRect();
            const p2 = document.getElementById('p2');
            p2.style.visibility = 'visible';
            p2.style.left = currRect.left + currRect.width / 2 - containerRect.left - 30 + 'px';
        }

        if (nextNode) {
            const nextRect = nextNode.getBoundingClientRect();
            const containerRect = linkedListContainer.getBoundingClientRect();
            const p3 = document.getElementById('p3');
            p3.style.visibility = 'visible';
            p3.style.left = nextRect.left + nextRect.width / 2 - containerRect.left - 30 + 'px';
        }
    }

    function updateInstruction(message) {
        instructionPanel.textContent = message;
    }

    function highlightCurrentHose() {
        hoses.forEach((hose, index) => {
            if (index === currentStep) {
                hose.classList.add('highlight');
            } else {
                hose.classList.remove('highlight');
            }
        });
    }

    function clearHighlights() {
        hoses.forEach((hose) => hose.classList.remove('highlight'));
    }

    resetButton.addEventListener('click', init);

    init();
});
