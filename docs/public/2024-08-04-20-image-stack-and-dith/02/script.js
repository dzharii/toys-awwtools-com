
document.addEventListener('DOMContentLoaded', () => {
    const imageStack = document.getElementById('image-stack');
    const emptyMessage = document.getElementById('empty-message');
    const MAX_IMAGES = 20;

    function loadImagesFromLocalStorage() {
        const images = JSON.parse(localStorage.getItem('imageStack')) || [];
        images.forEach(imageData => addImageToStack(imageData, false));
        toggleEmptyMessage();
    }

    function saveImagesToLocalStorage() {
        const images = [];
        document.querySelectorAll('.image-container img').forEach(img => {
            images.push(img.src);
        });
        localStorage.setItem('imageStack', JSON.stringify(images));
    }

    function toggleEmptyMessage() {
        if (imageStack.childElementCount === 1) {
            emptyMessage.style.display = 'block';
        } else {
            emptyMessage.style.display = 'none';
        }
    }

    function addImageToStack(imageData, save = true) {
        if (imageStack.childElementCount > MAX_IMAGES) {
            imageStack.removeChild(imageStack.lastChild);
        }

        const imageRow = document.createElement('div');
        imageRow.className = 'image-row';

        const imageContainer = document.createElement('div');
        imageContainer.className = 'image-container';
        const link = document.createElement('a');
        link.href = imageData;
        link.target = '_blank';
        const img = document.createElement('img');
        img.src = imageData;
        link.appendChild(img);
        imageContainer.appendChild(link);

        const controlPanel = document.createElement('div');
        controlPanel.className = 'control-panel';

        const addBorderButton = document.createElement('button');
        addBorderButton.className = 'add-border';
        addBorderButton.innerText = 'Add Border';
        addBorderButton.addEventListener('click', () => {
            modifyImageWithBorder(img.src).then(newImageData => {
                addImageToStack(newImageData);
            });
        });

        const removeButton = document.createElement('button');
        removeButton.className = 'remove';
        removeButton.innerText = 'Remove';
        removeButton.addEventListener('click', () => {
            imageStack.removeChild(imageRow);
            saveImagesToLocalStorage();
            toggleEmptyMessage();
        });

        controlPanel.appendChild(addBorderButton);
        controlPanel.appendChild(removeButton);

        imageRow.appendChild(imageContainer);
        imageRow.appendChild(controlPanel);

        imageStack.insertBefore(imageRow, imageStack.firstChild);

        if (save) saveImagesToLocalStorage();
        toggleEmptyMessage();
    }

    function modifyImageWithBorder(imageSrc) {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = imageSrc;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const borderWidth = 10;

                canvas.width = img.width + borderWidth * 2;
                canvas.height = img.height + borderWidth * 2;

                ctx.fillStyle = '#007bff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, borderWidth, borderWidth);

                resolve(canvas.toDataURL());
            };
        });
    }

    document.addEventListener('paste', (event) => {
        const items = (event.clipboardData || event.originalEvent.clipboardData).items;
        for (const item of items) {
            if (item.type.indexOf('image') === -1) continue;
            const blob = item.getAsFile();
            const reader = new FileReader();
            reader.onload = (e) => {
                addImageToStack(e.target.result);
            };
            reader.readAsDataURL(blob);
        }
    });

    loadImagesFromLocalStorage();
    toggleEmptyMessage();
});

