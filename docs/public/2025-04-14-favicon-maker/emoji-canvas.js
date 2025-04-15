class CanvasEmoji {
  constructor(ctx) {
    this.ctx = ctx;
    this.emojis = [
      "😀",
      "😁",
      "😂",
      "🤣",
      "😃",
      "😄",
      "😅",
      "😆",
      "😉",
      "😊",
      "😋",
      "😎",
      "😍",
      "😘",
      "🥰",
      "😗",
      "😙",
      "😚",
      "🙂",
      "🤗",
      "🤩",
      "🤔",
      "🤨",
      "😐",
      "😑",
      "😶",
      "🙄",
      "😏",
      "😣",
      "😥",
      "😮",
      "🤐",
      "😯",
      "😪",
      "😫",
      "🥱",
      "😴",
      "😌",
      "😛",
      "😜",
      "😝",
      "🤤",
      "😒",
      "😓",
      "😔",
      "😕",
      "🙃",
      "🤑",
      "😲",
      "🥴",
      "🥺",
      "😢",
      "😭",
      "😱",
      "😖",
      "😞",
      "😟",
      "😤",
      "😬",
      "🤯",
      "😰",
      "😨",
      "😧",
      "😦",
      "😈",
      "👿",
      "👻",
      "💀",
      "👽",
      "🤖",
      "🎃",
      "👹",
      "👺",
      "😺",
      "😸",
      "😹",
      "😻",
      "😼",
      "😽",
      "🙀",
    ];
    this.currentEmoji = null;
    this.backgroundColor = null;
    this.currentBackgroundGenerator = null;
  }

  drawRandomEmoji() {
    const canvas = this.ctx.canvas;
    const width = canvas.width;
    const height = canvas.height;

    // Clear the canvas
    this.ctx.clearRect(0, 0, width, height);

    // Select a random background generator
    const generatorIndex = Math.floor(
      Math.random() * window.backgroundGenerators.length
    );
    this.currentBackgroundGenerator =
      window.backgroundGenerators[generatorIndex];

    // Apply background pattern
    this.currentBackgroundGenerator.impl(this.ctx);

    // Select and draw a random emoji
    const emojiIndex = Math.floor(Math.random() * this.emojis.length);
    this.currentEmoji = this.emojis[emojiIndex];

    // Center the emoji
    this.ctx.font = "40px sans-serif";
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";

    // Draw the emoji
    this.ctx.fillText(this.currentEmoji, width / 2, height / 2);
  }

  getCurrentEmoji() {
    return this.currentEmoji;
  }

  getBackgroundInfo() {
    return this.currentBackgroundGenerator
      ? {
          name: this.currentBackgroundGenerator.name,
          description: this.currentBackgroundGenerator.description,
        }
      : null;
  }

  getImageDataAsUint8Array() {
    return new Promise((resolve) => {
      const canvas = this.ctx.canvas;
      canvas.toBlob((blob) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve(new Uint8Array(reader.result));
        };
        reader.readAsArrayBuffer(blob);
      }, "image/png");
    });
  }
}
