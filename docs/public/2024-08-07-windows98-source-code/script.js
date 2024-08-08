
document.addEventListener('DOMContentLoaded', () => {
    const draggableWindow = document.getElementById('draggable-window');
    const maximizeButton = document.getElementById('maximize-button');
    const closeButton = document.getElementById('close-button');
    const srcBox = document.getElementById('src-box');
    const windowBody = document.getElementById('window-body');
    let isMaximized = false;

    // Drag functionality
    const dragElement = (element) => {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        const titleBar = element.querySelector('.title-bar');
        titleBar.onmousedown = dragMouseDown;

        function dragMouseDown(e) {
            e.preventDefault();
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
            e.preventDefault();
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            element.style.top = (element.offsetTop - pos2) + "px";
            element.style.left = (element.offsetLeft - pos1) + "px";
        }

        function closeDragElement() {
            document.onmouseup = null;
            document.onmousemove = null;
        }
    };

    // Maximize/Restore functionality
    maximizeButton.addEventListener('click', () => {
        if (isMaximized) {
            draggableWindow.classList.remove('maximized');
            draggableWindow.style.width = '640px';
            draggableWindow.style.height = '480px';
            draggableWindow.style.top = '50px';
            draggableWindow.style.left = '50px';
            maximizeButton.ariaLabel = 'Maximize';
            windowBody.style.height = 'calc(100% - 40px)';
        } else {
            draggableWindow.classList.add('maximized');
            draggableWindow.style.width = 'calc(100% - 20px)';
            draggableWindow.style.height = 'calc(100% - 20px)';
            draggableWindow.style.top = '10px';
            draggableWindow.style.left = '10px';
            maximizeButton.ariaLabel = 'Restore';
            windowBody.style.height = 'calc(100% - 40px)';
        }
        isMaximized = !isMaximized;
        adjustSrcBoxHeight();
    });

    // Adjust src box height
    function adjustSrcBoxHeight() {
        if (isMaximized) {
            srcBox.style.height = `${windowBody.clientHeight}px`;
        } else {
            srcBox.style.height = 'calc(100% - 40px)';
        }
    }

    // Close button functionality
    closeButton.addEventListener('click', () => {
        draggableWindow.style.transition = 'opacity 3s';
        draggableWindow.style.opacity = '0';
        setTimeout(() => {
            draggableWindow.style.transition = 'opacity 1s';
            draggableWindow.style.opacity = '1';
        }, 3000);
    });

    // Initialize draggable
    dragElement(draggableWindow);
});

