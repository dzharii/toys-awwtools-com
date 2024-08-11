
document.addEventListener("DOMContentLoaded", function() {
    const jsonInput = document.getElementById("jsonInput");
    const jsonOutput = document.getElementById("jsonOutput");
    const statusLabel = document.getElementById("statusLabel");

    function validateAndFormatJSON() {
        const input = jsonInput.value.trim();
        if (!input) {
            jsonOutput.textContent = "";
            statusLabel.textContent = "Please enter JSON.";
            statusLabel.style.backgroundColor = "#f39c12";
            return;
        }

        try {
            const jsonObject = JSON.parse(input);
            const formattedJSON = JSON.stringify(jsonObject, null, 4);
            jsonOutput.textContent = formattedJSON;
            statusLabel.textContent = "Valid JSON";
            statusLabel.style.backgroundColor = "#2ecc71";
        } catch (error) {
            jsonOutput.textContent = "";
            statusLabel.textContent = "Invalid JSON: " + error.message;
            statusLabel.style.backgroundColor = "#e74c3c";
        }
    }

    jsonInput.addEventListener("input", validateAndFormatJSON);
    jsonInput.addEventListener("paste", validateAndFormatJSON);
});

