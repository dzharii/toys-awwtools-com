
// Reviewed `removeCssRulesFromElements` function
function removeCssRulesFromElements(elementType) {
    if (!elementType || typeof elementType !== 'string' || !/^[a-zA-Z][a-zA-Z0-9-]*$/.test(elementType)) {
        console.error("Invalid element type provided. Please use a valid HTML tag name (e.g., 'div').");
        return;
    }

    const elements = document.querySelectorAll(elementType);
    if (elements.length === 0) {
        console.warn(`No elements of type '${elementType}' found.`);
        return;
    }

    // Remove inline styles
    elements.forEach(element => {
        element.style.cssText = '';
    });

    // Remove corresponding CSS rules
    for (const sheet of document.styleSheets) {
        try {
            if (!sheet.cssRules) continue;
            for (let i = sheet.cssRules.length - 1; i >= 0; i--) {
                const rule = sheet.cssRules[i];
                if (
                    rule.type === CSSRule.STYLE_RULE &&
                    rule.selectorText &&
                    rule.selectorText.split(',').some(selector => selector.trim() === elementType)
                ) {
                    sheet.deleteRule(i);
                }
            }
        } catch (e) {
            console.warn(`Could not access stylesheet: ${sheet.href || 'inline stylesheet'}.`, e);
        }
    }

    console.log(`All CSS rules removed for elements of type '${elementType}'.`);
}

// Countdown logic and style removal
let elements = Array.from(document.querySelectorAll('#elements-list li')).map(li => li.textContent.trim());
let currentIndex = 0;

function countdownAndRemove() {
    if (currentIndex >= elements.length) return;

    const elementName = elements[currentIndex];
    const timerDisplay = document.getElementById('timer');
    const elementNameDisplay = document.getElementById('element-name');
    elementNameDisplay.textContent = elementName;

    let timeLeft = 10;
    const interval = setInterval(() => {
        timerDisplay.textContent = timeLeft;
        if (timeLeft-- <= 0) {
            clearInterval(interval);
            removeCssRulesFromElements(elementName);
            currentIndex++;
            countdownAndRemove();
        }
    }, 1000);
}

countdownAndRemove();

