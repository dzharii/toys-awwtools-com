
document.addEventListener('DOMContentLoaded', () => {
    const linkedListContainer = document.getElementById('linked-list-container');
    const instructionPanel = document.getElementById('instruction-panel');
    const svgCanvas = document.getElementById('svg-canvas');
    const resetButton = document.getElementById('reset-button');
    const caretContainer = document.getElementById('caret-container');
    const previousCaret = document.getElementById('previous-caret');
    const currentCaret = document.getElementById('current-caret');
    const savedNextCaret = document.getElementById('savednext-caret');

    let nodes = [];
    let hoses = [];
    let currentStep = 0;

    let previous = null;
    let current = null;
    let savedNext = null;

    function init() {
        linkedListContainer.innerHTML = '';
        svgCanvas.innerHTML = '';
        nodes = [];
        hoses = [];
        currentStep = 0;
        createLinkedList();
        initializePointers();
        updateInstruction("Let's begin the reversal process. Detach the hose from the current node.");
        updateCaretPositions();
        highlightCurrentHose();
    }

    function createLinkedList() {
        const nodeCount = Math.floor(Math.random() * 5) + 6; // Generates 6 to 10 nodes
        for (let i = 0; i < nodeCount; i++) {
            const nodeValue = Math.floor(Math.random() * 100);
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
        for (let i = 0; i < nodes.length - 1; i++) {
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
        const toRect = toNode ? toNode.getBoundingClientRect() : { left: fromRect.left - 100, top: fromRect.top, width: 0, height: fromRect.height };
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
        if (hoseIndex !== currentStep) {
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
            if (targetNodeIndex >= -1) {
                updateHosePath(draggingHose, nodes[hoseIndex], nodes[targetNodeIndex] || null);
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
        updateCaretPositions();
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
        previous = null;
        current = nodes[0];
        savedNext = nodes[1];
    }

    function updatePointers() {
        previous = current;
        current = savedNext;
        savedNext = nodes[currentStep + 2] || null;
    }

    function updateCaretPositions() {
        const containerRect = linkedListContainer.getBoundingClientRect();

        if (previousCaret) {
            if (previous) {
                const prevRect = previous.getBoundingClientRect();
                previousCaret.style.left = prevRect.left + prevRect.width / 2 - containerRect.left - 30 + 'px';
                previousCaret.style.visibility = 'visible';
            } else {
                previousCaret.style.left = '-30px';
                previousCaret.style.visibility = 'visible';
            }
        }

        if (currentCaret && current) {
            const currRect = current.getBoundingClientRect();
            currentCaret.style.left = currRect.left + currRect.width / 2 - containerRect.left - 30 + 'px';
            currentCaret.style.visibility = 'visible';
        } else {
            currentCaret.style.visibility = 'hidden';
        }

        if (savedNextCaret && savedNext) {
            const nextRect = savedNext.getBoundingClientRect();
            savedNextCaret.style.left = nextRect.left + nextRect.width / 2 - containerRect.left - 30 + 'px';
            savedNextCaret.style.visibility = 'visible';
        } else {
            savedNextCaret.style.visibility = 'hidden';
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

