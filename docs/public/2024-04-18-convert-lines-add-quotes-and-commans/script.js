
document.getElementById('inputArea').addEventListener('input', function() {
    const inputText = this.value;
    const formattedText = inputText.split('\n').map(line => `"${line}",`).join('\n');
    document.getElementById('outputArea').value = formattedText;
});

