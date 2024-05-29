
document.addEventListener('DOMContentLoaded', () => {
    const inputArea = document.getElementById('inputArea');
    const tableContainer = document.getElementById('tableContainer');

    inputArea.addEventListener('input', () => {
        const inputText = inputArea.value;
        const htmlTable = parseSparkTable(inputText);
        tableContainer.innerHTML = htmlTable;
    });

    function parseSparkTable(sparkTable) {
        const lines = sparkTable.split('\n').filter(line => line.trim().length > 0);
        if (lines.length < 3) {
            return '<p>Invalid input format.</p>';
        }

        const headers = lines[1].split('|').map(header => header.trim()).filter(header => header.length > 0);
        let html = '<table><thead><tr>';
        headers.forEach(header => html += `<th>${header}</th>`);
        html += '</tr></thead><tbody>';

        for (let i = 3; i < lines.length - 1; i++) {
            const row = lines[i].split('|').map(cell => cell.trim());
            if (row.length === headers.length) {
                html += '<tr>';
                row.forEach(cell => html += `<td>${cell}</td>`);
                html += '</tr>';
            }
        }

        html += '</tbody></table>';
        return html;
    }
});


