document.addEventListener('DOMContentLoaded', () => {
    const flashcardContainer = document.getElementById('flashcard-container');
    const nextButton = document.getElementById('next-button');
    const correctSpan = document.getElementById('correct');
    const incorrectSpan = document.getElementById('incorrect');
    
    let currentFlashcardIndex = 0;
    let correctCount = 0;
    let incorrectCount = 0;

    function displayFlashcard(index) {
        const flashcard = flashcards[index];
        flashcardContainer.innerHTML = generateFlashcardHTML(flashcard);
        const buttons = flashcardContainer.querySelectorAll('.options button');
        buttons.forEach(button => {
            button.addEventListener('click', () => checkAnswer(button, flashcard));
        });
        const gapInput = flashcardContainer.querySelector('.gap-input');
        if (gapInput) {
            const gapButton = flashcardContainer.querySelector('.gap-submit');
            gapButton.addEventListener('click', () => checkGapAnswer(gapInput, flashcard));
        }
        const pairs = flashcardContainer.querySelectorAll('.pairs div');
        if (pairs) {
            const pairButton = flashcardContainer.querySelector('.pair-submit');
            pairButton.addEventListener('click', () => checkPairAnswers(flashcard));
        }
    }

    function generateFlashcardHTML(flashcard) {
        switch (flashcard.type) {
            case 'multiple-choice':
                return `
                    <div class="flashcard">
                        <div class="question">${flashcard.question}</div>
                        <div class="options">
                            ${flashcard.options.map(option => `<button>${option}</button>`).join('')}
                        </div>
                    </div>
                `;
            case 'fill-in-the-gap':
                return `
                    <div class="flashcard">
                        <div class="question">${flashcard.question}</div>
                        <div class="code">${flashcard.code.replace(flashcard.gap, `<input type="text" class="gap-input" placeholder="Enter code here">`)}</div>
                        <button class="gap-submit">Submit</button>
                    </div>
                `;
            case 'matching-pairs':
                return `
                    <div class="flashcard">
                        <div class="question">${flashcard.question}</div>
                        <div class="pairs">
                            ${flashcard.pairs.map(pair => `
                                <div>
                                    <span>${pair.item1}</span>
                                    <select>
                                        <option value="">Select</option>
                                        ${flashcard.pairs.map(option => `<option value="${option.item2}">${option.item2}</option>`).join('')}
                                    </select>
                                </div>
                            `).join('')}
                        </div>
                        <button class="pair-submit">Submit</button>
                    </div>
                `;
            default:
                return '';
        }
    }

    function checkAnswer(button, flashcard) {
        if (button.textContent === flashcard.answer) {
            button.style.backgroundColor = '#4CAF50';
            correctCount++;
            correctSpan.textContent = `Correct: ${correctCount}`;
        } else {
            button.style.backgroundColor = '#F44336';
            incorrectCount++;
            incorrectSpan.textContent = `Incorrect: ${incorrectCount}`;
        }
        nextButton.disabled = false;
    }

    function checkGapAnswer(input, flashcard) {
        if (input.value.trim() === flashcard.answer) {
            input.style.backgroundColor = '#4CAF50';
            correctCount++;
            correctSpan.textContent = `Correct: ${correctCount}`;
        } else {
            input.style.backgroundColor = '#F44336';
            incorrectCount++;
            incorrectSpan.textContent = `Incorrect: ${incorrectCount}`;
        }
        nextButton.disabled = false;
    }

    function checkPairAnswers(flashcard) {
        const pairs = flashcardContainer.querySelectorAll('.pairs div');
        let allCorrect = true;
        pairs.forEach(pair => {
            const select = pair.querySelector('select');
            if (select.value !== pair.querySelector('span').textContent) {
                allCorrect = false;
                select.style.backgroundColor = '#F44336';
            } else {
                select.style.backgroundColor = '#4CAF50';
            }
        });
        if (allCorrect) {
            correctCount++;
            correctSpan.textContent = `Correct: ${correctCount}`;
        } else {
            incorrectCount++;
            incorrectSpan.textContent = `Incorrect: ${incorrectCount}`;
        }
        nextButton.disabled = false;
    }

    nextButton.addEventListener('click', () => {
        currentFlashcardIndex++;
        if (currentFlashcardIndex >= flashcards.length) {
            currentFlashcardIndex = 0; // Reset to the first flashcard
        }
        displayFlashcard(currentFlashcardIndex);
        nextButton.disabled = true;
    });

    // Initial flashcard display
    displayFlashcard(currentFlashcardIndex);
    nextButton.disabled = true;
});
