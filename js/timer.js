const DEFAULT_TIME = 15;

const timerElement = document.getElementById('timer');
let timerInterval;
let timeLeft = DEFAULT_TIME;

// Timer functions
const startTimer = (callback = () => {alert('Time is up!');}) => {
    timerInterval = setInterval(() => {
        timeLeft--;
        timerElement.innerHTML = timeLeft;

        // if time is up, post render the alert
        if (timeLeft <= 0) {
            setTimeout(() => {
                clearInterval(timerInterval);
                callback();
            }, 0);
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
}
// Start the timer when the page loads
// startTimer();