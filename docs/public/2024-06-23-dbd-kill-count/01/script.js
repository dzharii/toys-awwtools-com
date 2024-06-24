
const counts = [0, 0, 0, 0];
let timers = [null, null, null, null];

function incrementCount(row) {
    const countElement = document.getElementById(`count${row}`);
    const buttonElement = document.getElementById(`button${row}`);
    const numElement = document.getElementById(`num${row}`);
    
    // Increment count
    counts[row - 1]++;
    countElement.innerText = counts[row - 1];

    // Change background and text color if count is 2
    if (counts[row - 1] == 2) {
        countElement.classList.add('count-two');
    } else {
        countElement.classList.remove('count-two');
    }

    // Disable button and change color for 5 seconds
    buttonElement.disabled = true;
    buttonElement.style.backgroundColor = '#555555';

    // Start counting from 0 to 60 in "Num" column
    let counter = 0;
    numElement.innerText = counter;
    if (timers[row - 1]) {
        clearInterval(timers[row - 1]);
    }
    timers[row - 1] = setInterval(() => {
        counter++;
        numElement.innerText = counter;
        if (counter >= 60) {
            numElement.innerText = row;
            clearInterval(timers[row - 1]);
            buttonElement.disabled = false;
            buttonElement.style.backgroundColor = '#4CAF50';
        }
    }, 1000);

    // Re-enable button after 5 seconds
    setTimeout(() => {
        if (counter < 60) {
            numElement.innerText = row;
        }
        buttonElement.disabled = false;
        buttonElement.style.backgroundColor = '#4CAF50';
    }, 5000);
}

document.getElementById('reset-button').addEventListener('click', () => {
    counts.fill(0);
    for (let i = 1; i <= 4; i++) {
        document.getElementById(`count${i}`).innerText = 0;
        document.getElementById(`count${i}`).classList.remove('count-two');
        document.getElementById(`num${i}`).innerText = i;
        document.getElementById(`button${i}`).disabled = false;
        document.getElementById(`button${i}`).style.backgroundColor = '#4CAF50';
        if (timers[i - 1]) {
            clearInterval(timers[i - 1]);
            timers[i - 1] = null;
        }
    }
});

