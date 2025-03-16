
/**
 * @module ui
 */

import { startCapture, stopCapture } from './capture.js';
import { scheduleKeyframeCapture, captureScreenshot } from './controller.js';

/**
 * Handles the start capture button click event.
 * Initiates screen capture and, if successful, schedules automatic keyframe capture.
 */
document.getElementById('start-btn').addEventListener('click', async () => {
    await startCapture();
    const videoElement = document.getElementById('screen-video');
    if (videoElement && videoElement.srcObject) {
        const intervalInput = document.getElementById('capture-interval');
        const interval = parseInt(intervalInput.value, 10);
        if (!isNaN(interval) && interval > 0) {
            scheduleKeyframeCapture(interval);
        } else {
            import('./errors.js').then(module => {
                module.displayError('Invalid capture interval value.', false);
            });
        }
    }
});

/**
 * Handles the stop capture button click event.
 * Stops the screen capture.
 */
document.getElementById('stop-btn').addEventListener('click', stopCapture);

/**
 * Handles the manual capture button click event.
 * Captures a screenshot immediately.
 */
document.getElementById('manual-capture-btn').addEventListener('click', captureScreenshot);

/**
 * Toggles the visibility of the sidebar for responsive design.
 */
document.getElementById('toggle-sidebar-btn').addEventListener('click', () => {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('collapsed');
});

