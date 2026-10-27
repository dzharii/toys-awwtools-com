import type { Download } from "@playwright/test";

export async function downloadedText(download: Download): Promise<string> {
  const failure = await download.failure();
  if (failure) throw new Error(`Download failed: ${failure}`);
  const stream = await download.createReadStream();
  if (!stream) throw new Error(`No bytes were returned for ${download.suggestedFilename()}.`);
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks).toString("utf8");
}
