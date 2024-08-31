// ==UserScript==
// @name         Y-Ads
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://www.youtube.com/*
// @match        https://m.youtube.com/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==

(function() {

    const fn = () => {
        var btn = document.querySelector('button.ytp-skip-ad-button');
        if (btn) {
            btn.setAttribute('aria-label', 'CustomSkipAdButton');
            btn.style.border = '3px solid white';
        }
    };
    setInterval(fn, 100)

    // Your code here...
})();