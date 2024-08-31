
// Utility function to generate column names (A-Z, AA-ZZ, etc.)
function generateColumnName(index) {
    let name = '';
    while (index >= 0) {
        name = String.fromCharCode(index % 26 + 65) + name;
        index = Math.floor(index / 26) - 1;
    }
    return name;
}

// Utility function to handle LocalStorage data
function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        displayError('Failed to save data.');
        console.error(error);
    }
}

function loadFromLocalStorage(key) {
    try {
        return JSON.parse(localStorage.getItem(key)) || {};
    } catch (error) {
        displayError('Failed to load data.');
        console.error(error);
        return {};
    }
}

// Error display handling
function displayError(message) {
    const errorLabel = document.getElementById('error-label');
    errorLabel.textContent = message;
    errorLabel.classList.remove('hidden');
}

function hideError() {
    document.getElementById('error-label').classList.add('hidden');
}

// Initialize spreadsheet
function initSpreadsheet(rows = 1000, cols = 26) {
    const spreadsheet = document.getElementById('spreadsheet');
    const savedData = loadFromLocalStorage('spreadsheetData');

    for (let r = 0; r <= rows; r++) {
        for (let c = 0; c <= cols; c++) {
            const cell = document.createElement('div');
            const isHeader = r === 0 || c === 0;
            cell.className = 'cell';
            cell.setAttribute('contenteditable', !isHeader);
            cell.dataset.row = r;
            cell.dataset.col = c;

            if (isHeader) {
                cell.dataset.header = 'true';
                if (r === 0 && c > 0) {
                    cell.textContent = generateColumnName(c - 1);
                } else if (c === 0 && r > 0) {
                    cell.textContent = r;
                }
            } else {
                const cellId = `${generateColumnName(c - 1)}${r}`;
                if (savedData[cellId]) {
                    cell.textContent = savedData[cellId];
                }
                cell.addEventListener('input', () => {
                    saveCellData(cellId, cell.textContent);
                });
            }
            spreadsheet.appendChild(cell);
        }
    }

    enableColumnAndRowResizing();
}

// Save cell data to LocalStorage
function saveCellData(cellId, content) {
    const savedData = loadFromLocalStorage('spreadsheetData');
    savedData[cellId] = content;
    saveToLocalStorage('spreadsheetData', savedData);
}

// Column and row resizing
function enableColumnAndRowResizing() {
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        if (cell.dataset.header === 'true') {
            cell.style.resize = 'horizontal';
            cell.style.overflow = 'auto';
            cell.addEventListener('mousedown', startResizing);
        }
    });
}

function startResizing(e) {
    const cell = e.target;
    const startX = e.clientX;
    const startWidth = parseInt(document.defaultView.getComputedStyle(cell).width, 10);

    function doDrag(e) {
        cell.style.width = (startWidth + e.clientX - startX) + 'px';
    }

    function stopDrag() {
        document.documentElement.removeEventListener('mousemove', doDrag, false);
        document.documentElement.removeEventListener('mouseup', stopDrag, false);
    }

    document.documentElement.addEventListener('mousemove', doDrag, false);
    document.documentElement.addEventListener('mouseup', stopDrag, false);
}

// API Functions
function setValue(cell, value) {
    const cellElement = document.querySelector(`.cell[data-row="${cell.row}"][data-col="${cell.col}"]`);
    if (cellElement && !cellElement.dataset.header) {
        cellElement.textContent = value;
        saveCellData(`${generateColumnName(cell.col - 1)}${cell.row}`, value);
    } else {
        displayError('Cannot set value on header cells.');
    }
}

function getValue(cell) {
    const cellElement = document.querySelector(`.cell[data-row="${cell.row}"][data-col="${cell.col}"]`);
    if (cellElement && !cellElement.dataset.header) {
        return cellElement.textContent;
    }
    displayError('Cell not found or is a header.');
    return null;
}

function loadData(data) {
    Object.keys(data).forEach(cellId => {
        const [col, row] = cellId.match(/([A-Z]+)(\d+)/).slice(1, 3);
        const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col.charCodeAt(0) - 64}"]`);
        if (cell && !cell.dataset.header) {
            cell.textContent = data[cellId];
        }
    });
    saveToLocalStorage('spreadsheetData', data);
}

function getData() {
    return loadFromLocalStorage('spreadsheetData');
}

// Initialize the spreadsheet on load
document.addEventListener('DOMContentLoaded', () => {
    initSpreadsheet();
});

