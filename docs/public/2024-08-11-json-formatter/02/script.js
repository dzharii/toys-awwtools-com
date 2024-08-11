
document.addEventListener('DOMContentLoaded', function () {
    const jsonInput = document.getElementById('json-input');
    const jsonOutput = document.getElementById('json-output');
    const errorMessage = document.getElementById('error-message');

    jsonInput.addEventListener('input', function () {
        const inputText = jsonInput.value.trim();
        
        if (inputText === '') {
            jsonOutput.value = '';
            errorMessage.textContent = '';
            return;
        }

        try {
            const parsedJson = JSON.parse(inputText);
            const formattedJson = JSON.stringify(parsedJson, null, 2);
            jsonOutput.value = formattedJson;
            errorMessage.textContent = 'Valid JSON';
            errorMessage.style.color = 'green';
        } catch (error) {
            jsonOutput.value = '';
            errorMessage.textContent = `Invalid JSON: ${error.message}`;
            errorMessage.style.color = 'red';
        }
    });
});


