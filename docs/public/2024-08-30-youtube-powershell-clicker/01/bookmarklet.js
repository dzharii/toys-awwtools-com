javascript:(function() {
    var intervalId = setInterval(function() {
        var btn = document.querySelector('button.ytp-skip-ad-button');
        if (btn) {
            console.log('Button found, adding accessibility label');
            btn.setAttribute('aria-label', 'CustomSkipAdButton');
            clearInterval(intervalId);
        } else {
            console.log('Button not found yet, continuing search...');
        }
    }, 500); // Adjust the interval as necessary (500ms in this case)
})();
