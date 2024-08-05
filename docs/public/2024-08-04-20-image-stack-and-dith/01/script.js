
document.addEventListener('DOMContentLoaded', () => { // Waits for the DOM content to be fully loaded before executing the function
    const imageStack = document.getElementById('image-stack'); // Selects the image stack container
    const emptyMessage = document.getElementById('empty-message'); // Selects the empty message element
    const MAX_IMAGES = 20; // Maximum number of images to store

    function loadImagesFromLocalStorage() { // Function to load images from local storage
        const images = JSON.parse(localStorage.getItem('imageStack')) || []; // Retrieves images from local storage, or initializes an empty array if none exist
        images.forEach(imageData => addImageToStack(imageData, false)); // Adds each image to the stack
        toggleEmptyMessage(); // Toggles the empty message based on the image stack
    }

    function saveImagesToLocalStorage() { // Function to save images to local storage
        const images = []; // Initializes an empty array to store image data
        document.querySelectorAll('.image-container img').forEach(img => { // Selects all images in the image container
            images.push(img.src); // Adds the image source to the images array
        });
        localStorage.setItem('imageStack', JSON.stringify(images)); // Saves the images array to local storage as a JSON string
    }

    function toggleEmptyMessage() { // Function to toggle the empty message
        if (imageStack.childElementCount === 1) { // Checks if the image stack only contains the empty message
            emptyMessage.style.display = 'block'; // Displays the empty message
        } else {
            emptyMessage.style.display = 'none'; // Hides the empty message
        }
    }

    function addImageToStack(imageData, save = true) { // Function to add an image to the stack
        if (imageStack.childElementCount > MAX_IMAGES) { // Checks if the image stack exceeds the maximum number of images
            imageStack.removeChild(imageStack.lastChild); // Removes the oldest image from the stack
        }

        const imageRow = document.createElement('div'); // Creates a new div element for the image row
        imageRow.className = 'image-row'; // Sets the class name for the image row

        const imageContainer = document.createElement('div'); // Creates a new div element for the image container
        imageContainer.className = 'image-container'; // Sets the class name for the image container
        const img = document.createElement('img'); // Creates a new img element
        img.src = imageData; // Sets the source of the image
        imageContainer.appendChild(img); // Appends the image to the image container

        const controlPanel = document.createElement('div'); // Creates a new div element for the control panel
        controlPanel.className = 'control-panel'; // Sets the class name for the control panel

        const addBorderButton = document.createElement('button'); // Creates a new button element for adding a border
        addBorderButton.className = 'add-border'; // Sets the class name for the button
        addBorderButton.innerText = 'Add Border'; // Sets the button text
        addBorderButton.addEventListener('click', () => { // Adds a click event listener to the button
            img.style.border = '5px solid #007bff'; // Adds a 5-pixel solid border to the image
            addImageToStack(img.src, true); // Adds the manipulated image to the top of the stack
        });

        const removeButton = document.createElement('button'); // Creates a new button element for removing an image
        removeButton.className = 'remove'; // Sets the class name for the button
        removeButton.innerText = 'Remove'; // Sets the button text
        removeButton.addEventListener('click', () => { // Adds a click event listener to the button
            imageStack.removeChild(imageRow); // Removes the image row from the stack
            saveImagesToLocalStorage(); // Saves the updated image stack to local storage
            toggleEmptyMessage(); // Toggles the empty message based on the image stack
        });

        controlPanel.appendChild(addBorderButton); // Appends the add border button to the control panel
        controlPanel.appendChild(removeButton); // Appends the remove button to the control panel

        imageRow.appendChild(imageContainer); // Appends the image container to the image row
        imageRow.appendChild(controlPanel); // Appends the control panel to the image row

        imageStack.insertBefore(imageRow, imageStack.firstChild); // Inserts the new image row at the top of the image stack

        if (save) saveImagesToLocalStorage(); // Saves the image stack to local storage if the save flag is true
        toggleEmptyMessage(); // Toggles the empty message based on the image stack
    }

    document.addEventListener('paste', (event) => { // Adds a paste event listener to the document
        const items = (event.clipboardData || event.originalEvent.clipboardData).items; // Retrieves the clipboard items
        for (const item of items) { // Iterates through the clipboard items
            if (item.type.indexOf('image') === -1) continue; // Skips non-image items
            const blob = item.getAsFile(); // Converts the item to a file blob
            const reader = new FileReader(); // Creates a new FileReader instance
            reader.onload = (e) => { // Defines the onload event handler for the FileReader
                addImageToStack(e.target.result); // Adds the image to the stack using the file data
            };
            reader.readAsDataURL(blob); // Reads the file as a data URL
        }
    });

    loadImagesFromLocalStorage(); // Loads images from local storage on page load
    toggleEmptyMessage(); // Toggles the empty message based on the initial image stack state
});


