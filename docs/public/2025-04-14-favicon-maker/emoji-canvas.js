class CanvasEmoji {
  constructor(ctx) {
    this.ctx = ctx;
    this.canvas = ctx.canvas;
    this.emojis = ["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇"];
  }

  drawRandomEmoji() {
    const emoji = this.emojis[Math.floor(Math.random() * this.emojis.length)];
    this.ctx.fillStyle = "silver";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.font = "48px sans-serif";
    this.ctx.fillText(emoji, this.canvas.width / 2, this.canvas.height / 2);
  }

  getImageDataAsUint8Array() {
    const dataURL = this.canvas.toDataURL("image/png");
    const base64 = dataURL.split(",")[1];
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }
}
