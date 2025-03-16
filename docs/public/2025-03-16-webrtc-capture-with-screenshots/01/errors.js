
/**
 * @module errors
 */

/**
 * Displays an error message in the error bar.
 * For non-critical errors, the error bar can be dismissed on click.
 *
 * @param {string} message - The error message to display.
 * @param {boolean} [critical=false] - If true, the error is marked as critical and is not dismissible.
 */
export function displayError(message, critical = false) {
    const errorBar = document.getElementById('error-bar');
    if (!errorBar) {
        console.error('Error bar element not found.');
        return;
    }
    errorBar.textContent = message;
    errorBar.classList.remove('hidden');
    if (!critical) {
        errorBar.addEventListener('click', () => {
            errorBar.classList.add('hidden');
        }, { once: true });
    }
}

window.onerror = (msg, url, lineNo, columnNo, error) => {
    displayError(`Unhandled Error: ${msg} at ${lineNo}:${columnNo}`, true);
};

window.addEventListener('unhandledrejection', (event) => {
    displayError(`Unhandled Promise Rejection: ${event.reason}`, true);
});

