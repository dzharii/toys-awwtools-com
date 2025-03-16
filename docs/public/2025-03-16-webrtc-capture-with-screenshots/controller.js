
/**
 * @module controller
 */

import { mediaStream } from './capture.js';

let captureIntervalId = null;

/**
 * Schedules automatic keyframe capture at a specified interval.
 * Clears any existing capture interval before setting a new one.
 *
 * @param {number} interval - The capture interval in seconds.
 */
export function scheduleKeyframeCapture(interval) {
    clearInterval(captureIntervalId);
    captureIntervalId = setInterval(captureScreenshot, interval * 1000);
}

/**
 * Captures a screenshot from the current video stream.
 * Draws the current video frame onto a canvas, converts it to an image,
 * and appends the image to the keyframe log.
 */
export function captureScreenshot() {
    if (!mediaStream) return;
    
    const video = document.getElementById('screen-video');
    if (!video) {
        console.error('Video element not found.');
        return;
    }
    // Ensure the video has valid dimensions before capturing.
    if (video.videoWidth === 0 || video.videoHeight === 0) {
        console.warn('Video not ready for screenshot capture.');
        return;
    }
    
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    
    const img = document.createElement('img');
    img.src = canvas.toDataURL('image/png');
    const keyframeLog = document.getElementById('keyframe-log');
    if (keyframeLog) {
        keyframeLog.appendChild(img);
    } else {
        console.error('Keyframe log element not found.');
    }
}

