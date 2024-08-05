
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

        const ditherButton = document.createElement('button');
        ditherButton.className = 'dither';
        ditherButton.innerText = 'Dither';
        ditherButton.addEventListener('click', () => {
            applyRiemersmaDither(img.src).then(newImageData => {
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
        controlPanel.appendChild(ditherButton);
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

    function applyRiemersmaDither(imageSrc) {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = imageSrc;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);

                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const ditheredData = riemersmaDither(imageData);

                ctx.putImageData(ditheredData, 0, 0);
                resolve(canvas.toDataURL());
            };
        });
    }

    function riemersmaDither(imageData) {
        const { data, width, height } = imageData;
        const errorBuffer = new Float32Array(data.length).fill(0);
        const scale = 255;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const index = (y * width + x) * 4;
                for (let i = 0; i < 3; i++) {
                    const oldValue = data[index + i] + errorBuffer[index + i];
                    const newValue = Math.round(oldValue / scale) * scale;
                    data[index + i] = newValue;

                    const error = oldValue - newValue;
                    if (x + 1 < width) errorBuffer[index + 4 + i] += error * 7 / 16;
                    if (y + 1 < height) {
                        if (x > 0) errorBuffer[index - 4 + width * 4 + i] += error * 3 / 16;
                        errorBuffer[index + width * 4 + i] += error * 5 / 16;
                        if (x + 1 < width) errorBuffer[index + 4 + width * 4 + i] += error * 1 / 16;
                    }
                }
            }
        }

        return new ImageData(data, width, height);
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

