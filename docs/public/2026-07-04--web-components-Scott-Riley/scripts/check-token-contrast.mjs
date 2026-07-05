import { readFile } from "node:fs/promises";

const tokens = JSON.parse(await readFile("packages/tokens/dist/tokens.json", "utf8"));

function parseHexColor(value) {
  const match = /^#([0-9a-f]{6})$/i.exec(value);

  if (!match) {
    return null;
  }

  const hex = match[1];
  return {
    red: Number.parseInt(hex.slice(0, 2), 16) / 255,
    green: Number.parseInt(hex.slice(2, 4), 16) / 255,
    blue: Number.parseInt(hex.slice(4, 6), 16) / 255,
  };
}

function toLinearChannel(channel) {
  return channel <= 0.03928
    ? channel / 12.92
    : ((channel + 0.055) / 1.055) ** 2.4;
}

function getRelativeLuminance(color) {
  return (
    0.2126 * toLinearChannel(color.red) +
    0.7152 * toLinearChannel(color.green) +
    0.0722 * toLinearChannel(color.blue)
  );
}

function getContrastRatio(foreground, background) {
  const foregroundLuminance = getRelativeLuminance(foreground);
  const backgroundLuminance = getRelativeLuminance(background);
  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);

  return (lighter + 0.05) / (darker + 0.05);
}

function getTokenValue(themeTokens, path) {
  return themeTokens.find((token) => token.path.endsWith(path))?.value;
}

const checkedPairs = [
  ["color.textLoud", "color.surfaceDefault"],
  ["color.textDefault", "color.surfaceDefault"],
  ["color.actionPrimaryText", "color.actionPrimaryBg"],
  ["color.actionDangerText", "color.actionDangerBg"],
  ["color.actionSuccessText", "color.actionSuccessBg"],
  ["color.statusWarningText", "color.statusWarningBg"],
];

const failures = [];

for (const [themeName, themeTokens] of Object.entries(tokens.themes)) {
  for (const [foregroundPath, backgroundPath] of checkedPairs) {
    const foreground = parseHexColor(getTokenValue(themeTokens, foregroundPath));
    const background = parseHexColor(getTokenValue(themeTokens, backgroundPath));

    if (!foreground || !background) {
      continue;
    }

    const contrastRatio = getContrastRatio(foreground, background);

    if (contrastRatio < 4.5) {
      failures.push(`${themeName}: ${foregroundPath} on ${backgroundPath} is ${contrastRatio.toFixed(2)}:1`);
    }
  }
}

if (failures.length > 0) {
  console.error("Contrast checks failed:");
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Token contrast checks passed.");
