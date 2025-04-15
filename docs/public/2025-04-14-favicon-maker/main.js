window.addEventListener("DOMContentLoaded", function () {
  const canvas = document.getElementById("emojiCanvas");
  const ctx = canvas.getContext("2d");
  const emojiDrawer = new CanvasEmoji(ctx);

  document.getElementById("downloadBtn").addEventListener("click", () => {
    emojiDrawer.drawRandomEmoji();
    const pngData = emojiDrawer.getImageDataAsUint8Array();
    const tar = new TarArchive();
    tar.addFile("emoji.png", pngData);
    const blob = tar.getBlob();
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "emoji_archive.tar";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  });

  emojiDrawer.drawRandomEmoji();
});
