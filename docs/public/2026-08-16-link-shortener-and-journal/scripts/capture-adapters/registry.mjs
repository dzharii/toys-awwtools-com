import { youtubeCaptureAdapter } from "./youtube.mjs";

const adaptersByHostname = new Map([
  ["youtube.com", youtubeCaptureAdapter],
  ["www.youtube.com", youtubeCaptureAdapter],
  ["m.youtube.com", youtubeCaptureAdapter],
  ["youtu.be", youtubeCaptureAdapter]
]);

export function findCaptureAdapter(targetUrl) {
  const hostname = new URL(targetUrl).hostname.toLowerCase();
  return { hostname, adapter: adaptersByHostname.get(hostname) || null };
}

export function registeredCaptureHostnames() {
  return [...adaptersByHostname.keys()];
}
