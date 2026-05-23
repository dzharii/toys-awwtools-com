#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const frameSize = 256;
const columns = 8;
const rows = 4;
const frameCount = 32;

const sheets = [
  { key: 'female-minimal-soft', label: 'Female Minimal Soft', gender: 'female', file: 'ChatGPT Image May 22, 2026, 07_41_38 PM (1).png', grid: 'standard', outfit: 'purple' },
  { key: 'female-storyboard-warmth', label: 'Female Storyboard Warmth', gender: 'female', file: 'ChatGPT Image May 22, 2026, 07_41_38 PM (2).png', grid: 'storyboard', outfit: 'orange' },
  { key: 'female-dark-precision', label: 'Female Dark Precision', gender: 'female', file: 'ChatGPT Image May 22, 2026, 07_41_38 PM (3).png', grid: 'standard', outfit: 'navy' },
  { key: 'female-enterprise-friendly', label: 'Female Enterprise Friendly', gender: 'female', file: 'ChatGPT Image May 22, 2026, 07_41_38 PM (4).png', grid: 'standard', outfit: 'blue' },
  { key: 'female-glass-focus', label: 'Female Glass Focus', gender: 'female', file: 'ChatGPT Image May 22, 2026, 07_41_38 PM (5).png', grid: 'standard', outfit: 'white' },
  { key: 'male-minimal-soft', label: 'Male Minimal Soft', gender: 'male', file: 'ChatGPT Image May 22, 2026, 07_41_38 PM (6).png', grid: 'standard', outfit: 'casual' },
  { key: 'male-storyboard-warmth', label: 'Male Storyboard Warmth', gender: 'male', file: 'ChatGPT Image May 22, 2026, 07_41_38 PM (7).png', grid: 'storyboard', outfit: 'green' },
  { key: 'male-dark-precision', label: 'Male Dark Precision', gender: 'male', file: 'ChatGPT Image May 22, 2026, 07_41_39 PM (8).png', grid: 'standard', outfit: 'navy' },
  { key: 'male-calendar-companion', label: 'Male Calendar Companion', gender: 'male', file: 'ChatGPT Image May 22, 2026, 07_41_39 PM (9).png', grid: 'standard', outfit: 'orange' },
  { key: 'male-premium-command', label: 'Male Premium Command', gender: 'male', file: 'ChatGPT Image May 22, 2026, 07_41_40 PM (10).png', grid: 'standard', outfit: 'suit' }
];

const grids = {
  standard: { x: 10, y: 53, cellW: 269, cellH: 165, cropX: 15, cropY: 8, cropW: 244, cropH: 152 },
  storyboard: { x: 70, y: 82, cellW: 257, cellH: 156, cropX: 22, cropY: 2, cropW: 224, cropH: 152 }
};

const spritesDir = join(root, 'assets/sprites');
const framesDir = join(spritesDir, 'frames');
const atlasesDir = join(spritesDir, 'atlases');
rmSync(framesDir, { recursive: true, force: true });
mkdirSync(framesDir, { recursive: true });
mkdirSync(atlasesDir, { recursive: true });

const metadata = { version: 1, frameSize, columns, rows, frameCount, sprites: {} };

for (const sheet of sheets) {
  const grid = grids[sheet.grid];
  const source = join(root, 'img-source', sheet.file);
  const sheetFrameDir = join(framesDir, sheet.key);
  mkdirSync(sheetFrameDir, { recursive: true });
  const frames = [];

  for (let index = 0; index < frameCount; index += 1) {
    const col = index % columns;
    const row = Math.floor(index / columns);
    const rowCropY = row === 3 && sheet.gender === 'male' ? Math.max(grid.cropY, 34) : grid.cropY;
    const rowCropH = grid.cropH - (rowCropY - grid.cropY);
    const x = grid.x + col * grid.cellW + grid.cropX;
    const y = grid.y + row * grid.cellH + rowCropY;
    const out = join(sheetFrameDir, `${String(index + 1).padStart(2, '0')}.png`);
    execFileSync('magick', [
      source,
      '-crop', `${grid.cropW}x${rowCropH}+${Math.round(x)}+${Math.round(y)}`,
      '+repage',
      '-fill', 'white',
      '-draw', 'rectangle 0,0 70,45',
      '-draw', `rectangle 0,${rowCropH - 6} ${grid.cropW},${rowCropH}`,
      '-alpha', 'set',
      '-fuzz', '7%',
      '-fill', 'none',
      '-draw', `color 0,0 floodfill color ${grid.cropW - 1},0 floodfill color 0,${rowCropH - 1} floodfill color ${grid.cropW - 1},${rowCropH - 1} floodfill`,
      '-trim', '+repage',
      '-resize', 'x236',
      '-background', 'none',
      '-gravity', 'south',
      '-extent', `${frameSize}x${frameSize}`,
      out
    ]);
    frames.push(out);
  }

  const atlas = join(atlasesDir, `${sheet.key}.png`);
  execFileSync('montage', [...frames, '-background', 'none', '-tile', `${columns}x${rows}`, '-geometry', `${frameSize}x${frameSize}+0+0`, atlas]);
  metadata.sprites[sheet.key] = {
    key: sheet.key,
    label: sheet.label,
    gender: sheet.gender,
    outfit: sheet.outfit,
    atlas: `assets/sprites/atlases/${sheet.key}.png`,
    columns,
    rows,
    frames: frameCount,
    frameWidth: frameSize,
    frameHeight: frameSize,
    source: `img-source/${sheet.file}`,
    facing: 'right'
  };
}

writeFileSync(join(spritesDir, 'sprites.json'), JSON.stringify(metadata, null, 2) + '\n');
if (process.env.KEEP_SPRITE_FRAMES !== '1') {
  rmSync(framesDir, { recursive: true, force: true });
}
console.log(`Generated ${sheets.length} atlases and ${sheets.length * frameCount} frames.`);
