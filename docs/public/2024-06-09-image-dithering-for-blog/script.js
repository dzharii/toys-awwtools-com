
document.getElementById('clearSourceButton').addEventListener('click', clearSourceImage);

/**
 * Handle the paste event to load an image from the clipboard.
 * @param {ClipboardEvent} event - The paste event.
 */
function handlePaste(event) {
    const items = (event.clipboardData || window.clipboardData).items;
    for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') === 0) {
            const blob = items[i].getAsFile();
            const reader = new FileReader();
            reader.onload = function(event) {
                loadSourceImage(event.target.result);
            };
            reader.readAsDataURL(blob);
        }
    }
    event.preventDefault();
}

/**
 * Load the source image and display it in the source panel.
 * @param {string} imageSrc - The data URL of the image.
 */
function loadSourceImage(imageSrc) {
    const sourceImageContainer = document.getElementById('sourceImage');
    sourceImageContainer.innerHTML = '';
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
        sourceImageContainer.appendChild(img);
        convertToDithered(img);
    };
    img.onerror = () => {
        alert('Failed to load image. Please try a different image.');
    };
}

/**
 * Clear the source image and the result image.
 */
function clearSourceImage() {
    document.getElementById('sourceImage').innerHTML = '<p>Paste your image here</p>';
    clearResultImage();
}

/**
 * Clear the result image canvas.
 */
function clearResultImage() {
    const canvas = document.getElementById('resultImage');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

/**
 * Convert the source image to a 16-color dithered image.
 * @param {HTMLImageElement} img - The source image.
 */
function convertToDithered(img) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0, img.width, img.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    const palette = create16ColorPalette();
    ditherImage(data, palette);
    ctx.putImageData(imageData, 0, 0);

    const resultCanvas = document.getElementById('resultImage');
    resultCanvas.width = canvas.width;
    resultCanvas.height = canvas.height;
    const resultCtx = resultCanvas.getContext('2d');
    resultCtx.drawImage(canvas, 0, 0);
}

/**
 * Create a 16-color palette.
 * @returns {Array<Array<number>>} The 16-color palette.
 */
function create16ColorPalette() {
    return [        [0, 0, 0], [255, 255, 255], [255, 0, 0], [0, 255, 0],
        [0, 0, 255], [255, 255, 0], [0, 255, 255], [255, 0, 255],
        [128, 0, 0], [0, 128, 0], [0, 0, 128], [128, 128, 0],
        [0, 128, 128], [128, 0, 128], [192, 192, 192], [128, 128, 128]
    ];
}

/**
 * Apply dithering to the image data using the given palette.
 * @param {Uint8ClampedArray} data - The image data.
 * @param {Array<Array<number>>} palette - The color palette.
 */
function ditherImage(data, palette) {
    for (let i = 0; i < data.length; i += 4) {
        const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
        const [nr, ng, nb] = findNearestColor(r, g, b, palette);
        data[i] = nr;
        data[i + 1] = ng;
        data[i + 2] = nb;
    }
}

/**
 * Find the nearest color in the palette to the given color.
 * @param {number} r - The red component.
 * @param {number} g - The green component.
 * @param {number} b - The blue component.
 * @param {Array<Array<number>>} palette - The color palette.
 * @returns {Array<number>} The nearest color in the palette.
 */
function findNearestColor(r, g, b, palette) {
    let minDist = Infinity;
    let nearestColor = [0, 0, 0];
    palette.forEach(color => {
        const dist = colorDistance(r, g, b, ...color);
        if (dist < minDist) {
            minDist = dist;
            nearestColor = color;
        }
    });
    return nearestColor;
}

/**
 * Calculate the distance between two colors.
 * @param {number} r1 - The red component of the first color.
 * @param {number} g1 - The green component of the first color.
 * @param {number} b1 - The blue component of the first color.
 * @param {number} r2 - The red component of the second color.
 * @param {number} g2 - The green component of the second color.
 * @param {number} b2 - The blue component of the second color.
 * @returns {number} The distance between the two colors.
 */
function colorDistance(r1, g1, b1, r2, g2, b2) {
    return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}

