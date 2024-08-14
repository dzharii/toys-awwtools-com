
document.addEventListener("DOMContentLoaded", () => {
    const csvInput = document.getElementById("csv-input");
    const headerCheckbox = document.getElementById("header-checkbox");
    const tableOutput = document.getElementById("table-output");

    csvInput.addEventListener("input", () => {
        convertCSVToTable(csvInput.value);
    });

    csvInput.addEventListener("paste", () => {
        setTimeout(() => {
            convertCSVToTable(csvInput.value);
        }, 100);  // Small delay to ensure pasted content is fully available
    });

    headerCheckbox.addEventListener("change", () => {
        convertCSVToTable(csvInput.value);
    });

    function convertCSVToTable(csv) {
        // Clear previous table output
        tableOutput.innerHTML = "";

        if (!csv.trim()) {
            return;  // Exit if no content
        }

        const rows = parseCSV(csv);
        if (rows.length === 0) return;

        const table = document.createElement("table");

        rows.forEach((row, rowIndex) => {
            const tr = document.createElement("tr");
            row.forEach(cell => {
                const cellElement = document.createElement(rowIndex === 0 && headerCheckbox.checked ? "th" : "td");
                cellElement.textContent = cell.trim();
                tr.appendChild(cellElement);
            });
            table.appendChild(tr);
        });

        tableOutput.appendChild(table);
    }

    function parseCSV(csv) {
        const rows = [];
        let currentRow = [];
        let currentCell = '';
        let insideQuotes = false;

        for (let i = 0; i < csv.length; i++) {
            const char = csv[i];

            if (char === '"' && (i === 0 || csv[i - 1] !== '\\')) {
                insideQuotes = !insideQuotes;
                continue;
            }

            if (char === ',' && !insideQuotes) {
                currentRow.push(currentCell);
                currentCell = '';
            } else if (char === '\n' && !insideQuotes) {
                currentRow.push(currentCell);
                rows.push(currentRow);
                currentRow = [];
                currentCell = '';
            } else {
                currentCell += char;
            }
        }

        currentRow.push(currentCell);
        rows.push(currentRow);

        return rows;
    }
});

