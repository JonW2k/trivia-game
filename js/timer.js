const DEFAULT_TIME = 20;

const timerElement = document.getElementById('timer');
let timerInterval;
let timeLeft = DEFAULT_TIME;

// Timer functions
const startTimer = (callback = () => { alert('Time is up!'); }) => {
    timerInterval = setInterval(() => {
        timeLeft--;
        if (timeLeft >= 0) {
            timerElement.innerHTML = timeLeft;
        }

        // if time is up, post render the alert
        if (timeLeft < 0) {
            clearInterval(timerInterval);
            callback();
        }

    }, 1000);
};

const stopTimer = () => {
    clearInterval(timerInterval);
};

const pauseTimer = () => {
    clearInterval(timerInterval);
};

const resetTimer = (callback) => {
    stopTimer();
    timeLeft = DEFAULT_TIME;
    timerElement.innerHTML = timeLeft;
    startTimer(callback);
};