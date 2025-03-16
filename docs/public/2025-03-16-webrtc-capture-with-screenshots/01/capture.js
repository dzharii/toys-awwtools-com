
/**
 * @module capture
 */

/** @type {MediaStream|null} */
export let mediaStream = null;

/**
 * Initiates screen capture using the Screen Capture API.
 * Assigns the obtained MediaStream to the video element and enables controls.
 * If the API is not supported or an error occurs, displays an error message.
 *
 * @returns {Promise<void>}
 */
export async function startCapture() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        import('./errors.js').then(module => {
            module.displayError('Screen Capture API is not supported in this browser.', true);
        });
        return;
    }
    
    try {
        mediaStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const videoElement = document.getElementById('screen-video');
        if (!videoElement) {
            console.error('Video element not found.');
            return;
        }
        videoElement.srcObject = mediaStream;
        document.getElementById('stop-btn').disabled = false;
        document.getElementById('manual-capture-btn').disabled = false;
        // Show recording indicator
        document.getElementById('recording-indicator').classList.remove('hidden');
    } catch (error) {
        import('./errors.js').then(module => {
            module.displayError(`Error starting capture: ${error.message}`, true);
        });
    }
}

/**
 * Stops the current screen capture.
 * Stops all media tracks, clears the video element source,
 * disables related controls, and hides the recording indicator.
 */
export function stopCapture() {
    if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
        const videoElement = document.getElementById('screen-video');
        if (videoElement) {
            videoElement.srcObject = null;
        }
        document.getElementById('stop-btn').disabled = true;
        document.getElementById('manual-capture-btn').disabled = true;
        // Hide recording indicator
        document.getElementById('recording-indicator').classList.add('hidden');
    }
}

