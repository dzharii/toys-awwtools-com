
document.addEventListener('DOMContentLoaded', () => {
    const sourceText = document.getElementById('sourceText');
    const regexInput = document.getElementById('regexInput');
    const applyRegex = document.getElementById('applyRegex');
    const applyButton = document.getElementById('applyButton');
    const errorLabel = document.getElementById('errorLabel');

    function applyRegexFilter() {
        const text = sourceText.value;
        const regexValue = regexInput.value;

        if (regexValue === '') {
            errorLabel.textContent = '';
            return;
        }

        try {
            const regex = new RegExp(regexValue, 'gm');
            const filteredText = text.split('\n').filter(line => regex.test(line)).join('\n');
            sourceText.value = filteredText;
            errorLabel.textContent = '';
        } catch (e) {
            errorLabel.textContent = 'Invalid regular expression';
        }
    }

    regexInput.addEventListener('input', () => {
        if (applyRegex.checked) {
            applyRegexFilter();
        }
    });

    applyButton.addEventListener('click', applyRegexFilter);
});

