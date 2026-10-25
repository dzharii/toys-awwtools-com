export const MEDIA_TYPES = Object.freeze(['audio', 'image', 'file']);
export const MEDIA_LIMITS = Object.freeze({
  imageBytes: 12 * 1024 * 1024,
  imagePixels: 20_000_000,
  imageSide: 12000,
  audioBytes: 20 * 1024 * 1024,
  audioSeconds: 180,
  fileBytes: 25 * 1024 * 1024,
  sessionBytes: 96 * 1024 * 1024,
  sessionItems: 40
});
export const mediaTime = seconds => {
  const value = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
  return `${Math.floor(value / 60).toString().padStart(2,'0')}:${(value % 60).toString().padStart(2,'0')}`;
};
