
const counts = [0, 0, 0, 0];

function incrementCount(row) {
    counts[row - 1]++;
    document.getElementById(`count${row}`).innerText = counts[row - 1];
}

document.getElementById('reset-button').addEventListener('click', () => {
    counts.fill(0);
    for (let i = 1; i <= 4; i++) {
        document.getElementById(`count${i}`).innerText = 0;
    }
});

