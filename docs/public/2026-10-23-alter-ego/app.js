'use strict';

/*
 * Alter Ego is a single-page Canvas 2D editor with no runtime libraries.
 * index.html loads wardrobe-data.js, then this file, using deferred scripts.
 *
 * Reading order:
 *   1. Display options, shared state, image loading, and storage.
 *   2. Outfit browsing and favorites.
 *   3. Portrait composition: background -> masked face -> costume -> finish.
 *   4. Filter, scene, and photo controls.
 *   5. Pointer gestures, keyboard shortcuts, PNG export, and startup.
 *
 * Controls update the state below and call requestDraw(). Rendering reads that
 * state; it does not change the selected outfit, photo fit, or preferences.
 */

// 1. Display options and shared state
// ---------------------------------------------------------------------------

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const PORTRAIT_WIDTH = 900;
const PORTRAIT_HEIGHT = 1100;
const LOOK_COUNT = 80;
const TOOL_NAMES = ['wardrobe', 'face', 'filters', 'scenes'];

const iconPaths = {
  download: 'M12 3v12m-4-4 4 4 4-4M5 15v5h14v-5',
  search: 'm15 15 5 5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0',
  heart:
    'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8',
  shuffle:
    'M3 6h3c5 0 7 12 12 12h3m-4-4 4 4-4 4M3 18h3c2 0 4-3 5-6m3-4c1-1 2-2 4-2h3m-4-4 4 4-4 4',
  face: 'M8 3H4v4m12-4h4v4M4 17v4h4m8 0h4v-4M8 10v1m8-1v1m-8 4q4 4 8 0M8 7q4-4 8 0',
  up: 'm6 14 6-6 6 6',
  down: 'm6 10 6 6 6-6',
  left: 'm14 6-6 6 6 6',
  right: 'm10 6 6 6-6 6',
  plus: 'M12 5v14M5 12h14',
  close: 'm6 6 12 12M6 18 18 6',
  lock: 'M7 10V7a5 5 0 0 1 10 0v3M5 10h14v11H5zM12 14v3',
  sparkles:
    'm12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5zM20 2v4m-2-2h4',
  scene: 'M3 4h18v16H3zM3 17l5-6 5 5 3-3 5 5M15 8h.01',
  wardrobe: 'M4 3h16v18H4zM12 3v18M8 11v3m8-3v3',
  swipe: 'M12 3v18m-3-3 3 3 3-3M9 6l3-3 3 3M5 9v6m14-6v6'
};

function createIconMarkup(name) {
  const path = iconPaths[name] || iconPaths.sparkles;
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"/></svg>`;
}

$$('[data-icon]').forEach((element) => {
  element.innerHTML = createIconMarkup(element.dataset.icon);
});

// Each finish returns a Canvas filter string. Intensity is 0..1: at zero the
// operations are neutral, and at one the named finish is fully applied.
const filters = [
  { id: 'original', name: 'Original', css: () => 'none' },
  {
    id: 'noir',
    name: 'Noir',
    css: (intensity) =>
      `grayscale(${intensity}) contrast(${1 + 0.18 * intensity})`
  },
  {
    id: 'antique',
    name: 'Antique',
    css: (intensity) =>
      `sepia(${0.85 * intensity}) saturate(${1 - 0.25 * intensity}) contrast(${1 + 0.08 * intensity})`
  },
  {
    id: 'moonlight',
    name: 'Moonlight',
    css: (intensity) =>
      `sepia(${0.35 * intensity}) hue-rotate(${205 * intensity}deg) saturate(${1 - 0.15 * intensity}) brightness(${1 + 0.08 * intensity})`
  },
  {
    id: 'faded',
    name: 'Faded',
    css: (intensity) =>
      `saturate(${1 - 0.5 * intensity}) contrast(${1 - 0.22 * intensity}) brightness(${1 + 0.13 * intensity})`
  },
  {
    id: 'electric',
    name: 'Electric',
    css: (intensity) =>
      `saturate(${1 + 1.15 * intensity}) contrast(${1 + 0.18 * intensity})`
  },
  {
    id: 'rose',
    name: 'Rose tint',
    css: (intensity) =>
      `sepia(${0.4 * intensity}) hue-rotate(${315 * intensity}deg) saturate(${1 + 0.2 * intensity})`
  },
  {
    id: 'print',
    name: 'Ink print',
    css: (intensity) =>
      `grayscale(${intensity}) contrast(${1 + 0.9 * intensity}) sepia(${0.18 * intensity})`
  },
  {
    id: 'dream',
    name: 'Daydream',
    css: (intensity) =>
      `saturate(${1 - 0.22 * intensity}) brightness(${1 + 0.16 * intensity}) contrast(${1 - 0.12 * intensity})`
  },
  {
    id: 'toxic',
    name: 'Toxic',
    css: (intensity) =>
      `sepia(${0.6 * intensity}) hue-rotate(${55 * intensity}deg) saturate(${1 + 0.45 * intensity})`
  },
  {
    id: 'twilight',
    name: 'Twilight',
    css: (intensity) =>
      `sepia(${0.25 * intensity}) hue-rotate(${240 * intensity}deg) saturate(${1 + 0.3 * intensity})`
  },
  {
    id: 'warm',
    name: 'Golden',
    css: (intensity) =>
      `sepia(${0.5 * intensity}) saturate(${1 + 0.35 * intensity}) brightness(${1 + 0.07 * intensity})`
  }
];

// An asset number selects a JPEG; entries without one are drawn procedurally.
const scenes = [
  { name: 'Moonlit arch', color: '#a499b8', asset: 0 },
  { name: 'Old paper', color: '#ded4bd', asset: 1 },
  { name: 'Stargazer', color: '#192c4c', asset: 2 },
  { name: 'Desert dusk', color: '#c58d91', asset: 3 },
  { name: 'Moss & magic', color: '#354b3e', asset: 4 },
  { name: 'Velvet stage', color: '#542b43', asset: 5 },
  { name: 'Cloud nine', color: '#c6adc9', asset: 6 },
  { name: 'Neon hour', color: '#34345d', asset: 7 },
  { name: 'Lilac studio', color: '#b7a5cc' },
  { name: 'Sage studio', color: '#b3b9a2' },
  { name: 'Rose studio', color: '#cfafb0' },
  { name: 'Transparent', color: 'transparent' }
];

const collections = [
  ['all', 'All looks'],
  ['Alternative', 'Goth & punk'],
  ['Expression', 'Expression'],
  ['Creatures', 'Creatures'],
  ['Folklore', 'Dark tales'],
  ['Future', 'Future'],
  ['Time travel', 'Time travel'],
  ['Everyday oddities', 'Odd lives'],
  ['Surreal', 'Surreal'],
  ['favorites', 'Saved']
];

// All drawing uses the same 900 x 1100 coordinate system, regardless of the
// canvas's CSS size. Two offscreen canvases keep masking and filters isolated:
// faceLayer holds the clipped photo, characterLayer adds the costume/details.
const portraitCanvas = $('#portrait');
const portraitContext = portraitCanvas.getContext('2d');
const characterLayer = document.createElement('canvas');
const faceLayer = document.createElement('canvas');
characterLayer.width = faceLayer.width = PORTRAIT_WIDTH;
characterLayer.height = faceLayer.height = PORTRAIT_HEIGHT;
const characterContext = characterLayer.getContext('2d');
const faceContext = faceLayer.getContext('2d');

// Look IDs match array positions in both data files and asset filenames.
let looks = [];
let artworkMetadata = [];
let currentLookIndex = 0;
let activeTool = 'wardrobe';
let activeCollection = 'all';
let visibleLooks = [];
let lookListKey = '';
let filterCards = [];

// Photo pan is measured in face widths/heights, not pixels. For example,
// x: 0.1 moves the photo right by 10% of the current character's face width.
// This lets one fit carry across outfits with differently sized faces.
let photoCanvas = null;
let photoObjectURL = null;
let photoZoom = 1;
let photoRotation = 0;
let photoPan = { x: 0, y: 0 };
let filterIndex = 0;
let filterStrength = 1;
let sceneIndex = 0;
let sceneStrength = 0.7;

let assetsReady = false;
let currentCostumeImage = null;
let currentFaceMask = null;
let lookLoadVersion = 0;
let photoLoadVersion = 0;
let renderPending = false;
let toastTimer;

const imagePromises = new Map();
const sceneImages = [];
let favorites = new Set();

try {
  const stored = JSON.parse(localStorage.getItem('alterego-favorites') || '[]');
  if (Array.isArray(stored)) {
    favorites = new Set(
      stored.filter((id) => Number.isInteger(id) && id >= 0 && id < LOOK_COUNT)
    );
  }
} catch (error) {
  console.warn('Saved favorites could not be restored.', error);
}

// Cache promises, not just decoded images, so simultaneous requests share the
// same load. A failed entry is removed so the Try again button can retry it.
function loadImage(source) {
  if (imagePromises.has(source)) return imagePromises.get(source);

  const promise = new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => {
      imagePromises.delete(source);
      reject(new Error('Could not load ' + source));
    };
    image.src = source;
  });
  imagePromises.set(source, promise);
  return promise;
}

function showToast(message) {
  clearTimeout(toastTimer);
  $('#toast').textContent = message;
  $('#toast').classList.add('visible');
  toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 2800);
}

// Keep the existing storage field names: people may already have saved data.
// Neither the photo nor its fit is written to storage.
function savePreferences() {
  try {
    localStorage.setItem(
      'alterego-preferences',
      JSON.stringify({
        current: currentLookIndex,
        filterIndex,
        strength: filterStrength,
        sceneIndex,
        sceneStrength
      })
    );
  } catch (error) {
    console.warn('Preferences could not be saved on this device.', error);
  }
}

// 2. Outfit browsing and favorites
// ---------------------------------------------------------------------------

function setTool(nextTool) {
  if (!TOOL_NAMES.includes(nextTool)) return;
  activeTool = nextTool;
  $('.workspace').dataset.tool = nextTool;

  $$('.dock-btn').forEach((button) => {
    const isActive = button.dataset.tool === nextTool;
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });
  for (const name of TOOL_NAMES) {
    $(`#${name}Panel`).hidden = name !== nextTool;
  }

  const titles = {
    wardrobe: 'Find your other side',
    face: photoCanvas ? 'Fit your face' : 'Make it you',
    filters: 'Choose a finish',
    scenes: 'Somewhere else'
  };
  const hints = {
    wardrobe: 'Swipe the character to change looks',
    face: photoCanvas
      ? 'Drag on the face to position it'
      : 'One photo. Every look.',
    filters: 'Applied to your face + outfit',
    scenes: 'Swipe the row to explore'
  };
  $('#editorTitle').textContent = titles[nextTool];
  $('#trayHint').textContent = hints[nextTool];
  updatePhotoUI();
  requestDraw();
  if (nextTool === 'wardrobe') revealSelectedLook();
}

$$('.dock-btn').forEach((button) => {
  button.addEventListener('click', () => setTool(button.dataset.tool));
});

function renderCollections() {
  const list = $('#collectionChips');
  const previousScroll = list.scrollLeft;
  list.replaceChildren();

  for (const [id, name] of collections) {
    const button = document.createElement('button');
    const showFavoriteCount = id === 'favorites' && favorites.size > 0;
    button.className = 'collection-chip';
    button.dataset.collection = id;
    button.setAttribute('aria-pressed', String(activeCollection === id));
    button.textContent = name + (showFavoriteCount ? ' ' + favorites.size : '');
    button.onclick = () => chooseCollection(id);
    list.append(button);
  }
  list.scrollLeft = previousScroll;
}

function chooseCollection(id) {
  const collectionExists = collections.some(
    ([collectionId]) => collectionId === id
  );
  if (!collectionExists) return;

  activeCollection = id;
  lookListKey = '';
  renderCollections();
  renderLookList();
  $('#lookList').scrollLeft = 0;
  const selected = $(`[data-collection="${id}"]`);
  selected?.scrollIntoView?.({
    block: 'nearest',
    inline: 'nearest',
    behavior: 'smooth'
  });
}

function renderLookList() {
  visibleLooks = looks.filter((look) => {
    const showAll = activeCollection === 'all';
    const isSavedLook =
      activeCollection === 'favorites' && favorites.has(look.id);
    const matchesCategory = look.category === activeCollection;
    return showAll || isSavedLook || matchesCategory;
  });

  const list = $('#lookList');
  const nextListKey =
    activeCollection + ':' + visibleLooks.map((look) => look.id).join(',');
  const collectionName =
    collections.find(([id]) => id === activeCollection)?.[1] || 'All looks';
  $('#collectionSummary').textContent =
    collectionName + ' · ' + visibleLooks.length;

  // Selection changes only update button state. Rebuild thumbnails only when
  // membership changes, preserving horizontal scroll and decoded images.
  if (nextListKey !== lookListKey) {
    lookListKey = nextListKey;
    list.replaceChildren();
    if (!visibleLooks.length) {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.textContent =
        'Your favorites will live here. Tap the heart on any look to save it.';
      list.append(empty);
    }

    for (const look of visibleLooks) {
      const button = document.createElement('button');
      button.className = 'look-item';
      button.dataset.look = String(look.id);
      button.setAttribute('aria-label', look.name);

      const thumbnail = document.createElement('span');
      thumbnail.className = 'look-thumb';
      const image = document.createElement('img');
      image.src = `assets/thumbs/${String(look.id).padStart(2, '0')}.webp`;
      image.alt = '';
      image.loading = 'lazy';
      thumbnail.append(image);

      const copy = document.createElement('span');
      copy.className = 'look-item-copy';
      const name = document.createElement('strong');
      name.textContent = look.name;
      copy.append(name);
      button.append(thumbnail, copy);
      button.addEventListener('click', () => selectLook(look.id));
      list.append(button);
    }
  }

  for (const button of list.children) {
    if (button.dataset?.look === undefined) continue;
    const isSelected = Number(button.dataset.look) === currentLookIndex;
    button.classList.toggle('selected', isSelected);
    button.setAttribute('aria-pressed', String(isSelected));
    button.setAttribute('aria-current', String(isSelected));
  }
}

function revealSelectedLook() {
  if (activeTool !== 'wardrobe') return;
  const selected = $(`[data-look="${currentLookIndex}"]`);
  selected?.scrollIntoView?.({
    block: 'nearest',
    inline: 'nearest',
    behavior: 'smooth'
  });
}

async function selectLook(id) {
  if (!looks.length || !Number.isInteger(id)) return;
  id = (id + looks.length) % looks.length;
  currentLookIndex = id;
  assetsReady = false;
  const loadVersion = ++lookLoadVersion;
  const look = looks[id];
  const isFavorite = favorites.has(id);

  $('#lookName').textContent = look.name;
  $('#lookName').title = look.name;
  $('#lookCategory').textContent = look.category.toUpperCase();
  $('#stageNumber').textContent =
    String(id + 1).padStart(2, '0') + ' / ' + LOOK_COUNT;
  $('#favoriteBtn').setAttribute('aria-pressed', String(isFavorite));
  $('#favoriteBtn').setAttribute(
    'aria-label',
    (isFavorite ? 'Unfavorite ' : 'Favorite ') + look.name
  );
  portraitCanvas.setAttribute(
    'aria-label',
    look.name + ' illustrated portrait'
  );
  renderLookList();
  savePreferences();
  $('#assetLoading').hidden = false;
  $('#retryAssets').hidden = true;
  $('#assetLoading').querySelector('span:last-of-type').textContent =
    'Opening your wardrobe...';
  revealSelectedLook();

  try {
    const assetId = String(id).padStart(2, '0');
    const [costume, mask] = await Promise.all([
      loadImage(`assets/looks/${assetId}.webp`),
      loadImage(`assets/masks/${assetId}.png`)
    ]);

    // Rapid swiping can finish loads out of order. Only the newest selection
    // may replace the portrait or its loading/error UI.
    if (loadVersion !== lookLoadVersion) return;
    currentCostumeImage = costume;
    currentFaceMask = mask;
    assetsReady = true;
    $('#assetLoading').hidden = true;
    requestDraw();

    // Warm the adjacent costumes without delaying this selection. A preload
    // failure is non-blocking; selecting that look later performs a fresh load.
    const adjacentIds = [
      (id + 1) % LOOK_COUNT,
      (id + LOOK_COUNT - 1) % LOOK_COUNT
    ];
    for (const adjacentId of adjacentIds) {
      const filename = String(adjacentId).padStart(2, '0');
      loadImage(`assets/looks/${filename}.webp`).catch((error) => {
        console.warn('An adjacent outfit could not be preloaded.', error);
      });
    }
  } catch (error) {
    if (loadVersion !== lookLoadVersion) return;
    currentCostumeImage = null;
    currentFaceMask = null;
    assetsReady = false;
    requestDraw();
    $('#assetLoading').querySelector('span:last-of-type').textContent =
      'This look could not open.';
    $('#retryAssets').hidden = false;
    console.error(error);
  }
}

// Navigate within the active collection, wrapping at either end. A collection
// change does not replace the portrait: if it excludes the current outfit,
// Next starts at its first item and Previous starts at its last.
function stepLook(direction) {
  if (!looks.length) return;
  const lookIds = visibleLooks.map((look) => look.id);
  if (!lookIds.length) {
    showToast('Save a look with the heart, or choose another collection.');
    return;
  }

  const currentPosition = lookIds.indexOf(currentLookIndex);
  let nextPosition;
  if (currentPosition < 0) {
    nextPosition = direction > 0 ? 0 : lookIds.length - 1;
  } else {
    nextPosition =
      (currentPosition + direction + lookIds.length) % lookIds.length;
  }
  selectLook(lookIds[nextPosition]);
}

function toggleFavorite() {
  if (!assetsReady) return;
  const shouldSave = !favorites.has(currentLookIndex);
  if (shouldSave) {
    favorites.add(currentLookIndex);
  } else {
    favorites.delete(currentLookIndex);
  }
  try {
    localStorage.setItem('alterego-favorites', JSON.stringify([...favorites]));
  } catch (error) {
    console.warn('Favorites could not be saved on this device.', error);
  }

  $('#favoriteBtn').setAttribute('aria-pressed', String(shouldSave));
  $('#favoriteBtn').setAttribute(
    'aria-label',
    (shouldSave ? 'Unfavorite ' : 'Favorite ') + looks[currentLookIndex].name
  );
  renderCollections();
  renderLookList();
  showToast(
    shouldSave
      ? 'Saved. Find it in Looks → Saved.'
      : 'Removed from your saved looks.'
  );
}

$('#retryAssets').onclick = () => selectLook(currentLookIndex);
$('#favoriteBtn').onclick = toggleFavorite;
$('#prevBtn').onclick = () => stepLook(-1);
$('#nextBtn').onclick = () => stepLook(1);
$('#randomBtn').onclick = () => {
  const otherLooks = visibleLooks.filter(
    (look) => look.id !== currentLookIndex
  );
  if (!otherLooks.length) {
    showToast('Choose another collection to explore more looks.');
    return;
  }
  const randomIndex = Math.floor(Math.random() * otherLooks.length);
  selectLook(otherLooks[randomIndex].id);
};

$$('[data-rail]').forEach((button) => {
  button.addEventListener('click', () => {
    const rail = $('#' + button.dataset.rail);
    const pageDistance = Math.max(140, rail.clientWidth * 0.72);
    rail.scrollBy({
      left: pageDistance * Number(button.dataset.direction),
      behavior: 'smooth'
    });
  });
});

// 3. Portrait composition
// ---------------------------------------------------------------------------

// Fit the costume inside a 760 x 960 region, then map its source-image face
// rectangle [x, y, width, height] into portrait coordinates with the same scale.
// Masks use this exact placement too, so their edges stay aligned.
function getPortraitPlacement() {
  if (!currentCostumeImage || !artworkMetadata[currentLookIndex]) return null;
  const metadata = artworkMetadata[currentLookIndex];
  const scale = Math.min(
    960 / currentCostumeImage.height,
    760 / currentCostumeImage.width
  );
  const x = (PORTRAIT_WIDTH - currentCostumeImage.width * scale) / 2;
  const y = (PORTRAIT_HEIGHT - currentCostumeImage.height * scale) / 2 - 10;
  const [faceX, faceY, faceWidth, faceHeight] = metadata.face;
  return {
    x,
    y,
    scale,
    face: {
      x: x + faceX * scale,
      y: y + faceY * scale,
      width: faceWidth * scale,
      height: faceHeight * scale
    }
  };
}

function traceBackgroundArch(context) {
  context.beginPath();
  context.moveTo(105, 1030);
  context.lineTo(105, 365);
  context.bezierCurveTo(105, -55, 795, -55, 795, 365);
  context.lineTo(795, 1030);
  context.quadraticCurveTo(450, 1090, 105, 1030);
  context.closePath();
}

// Like CSS background-size: cover: fill the rectangle without stretching the
// image, cropping equal amounts from opposite sides when aspect ratios differ.
function drawImageCover(context, image, x, y, width, height) {
  const scale = Math.max(width / image.width, height / image.height);
  context.drawImage(
    image,
    x + (width - image.width * scale) / 2,
    y + (height - image.height * scale) / 2,
    image.width * scale,
    image.height * scale
  );
}

function drawBackground(context) {
  const scene = scenes[sceneIndex];
  if (scene.color === 'transparent') return;

  context.save();
  traceBackgroundArch(context);
  context.clip();
  context.fillStyle = scene.color;
  context.fillRect(0, 0, PORTRAIT_WIDTH, PORTRAIT_HEIGHT);

  const sceneImage = sceneImages[scene.asset];
  if (sceneImage) {
    context.globalAlpha = sceneStrength;
    drawImageCover(context, sceneImage, 85, 0, 730, 1100);
    context.globalAlpha = 1;
  } else {
    // Studio colors use this gradient and rings. The same drawing is visible
    // while a scene JPEG loads, or if that optional image is unavailable.
    const gradient = context.createRadialGradient(450, 350, 10, 450, 650, 700);
    gradient.addColorStop(0, '#ffffff35');
    gradient.addColorStop(1, '#0b071b35');
    context.fillStyle = gradient;
    context.fillRect(0, 0, PORTRAIT_WIDTH, PORTRAIT_HEIGHT);
    context.strokeStyle = '#ffffff1a';
    context.lineWidth = 1.5;
    for (let ring = 0; ring < 4; ring++) {
      context.beginPath();
      context.ellipse(
        450,
        560,
        180 + ring * 55,
        230 + ring * 70,
        0,
        0,
        Math.PI * 2
      );
      context.stroke();
    }
  }
  context.restore();

  context.save();
  traceBackgroundArch(context);
  context.strokeStyle = '#e7d8f126';
  context.lineWidth = 1.5;
  context.stroke();
  context.restore();
}

function drawFittedPhoto(face) {
  const centerX = face.x + face.width / 2;
  const centerY = face.y + face.height / 2;
  faceContext.translate(
    centerX + photoPan.x * face.width,
    centerY + photoPan.y * face.height
  );
  faceContext.rotate((photoRotation * Math.PI) / 180);

  // Start with a centered cover crop. Zoom scales that crop; rotation and pan
  // happen around the face center rather than the top-left of the photograph.
  const coverScale = Math.max(
    face.width / photoCanvas.width,
    face.height / photoCanvas.height
  );
  const scale = coverScale * photoZoom;
  faceContext.drawImage(
    photoCanvas,
    (-photoCanvas.width * scale) / 2,
    (-photoCanvas.height * scale) / 2,
    photoCanvas.width * scale,
    photoCanvas.height * scale
  );
}

function drawPlaceholderFace(face) {
  const centerX = face.x + face.width / 2;
  const centerY = face.y + face.height / 2;
  faceContext.fillStyle = '#322a39';
  faceContext.beginPath();
  faceContext.ellipse(
    centerX - face.width * 0.18,
    centerY - face.height * 0.03,
    face.width * 0.052,
    face.height * 0.105,
    -0.12,
    0,
    Math.PI * 2
  );
  faceContext.ellipse(
    centerX + face.width * 0.18,
    centerY - face.height * 0.03,
    face.width * 0.052,
    face.height * 0.105,
    0.12,
    0,
    Math.PI * 2
  );
  faceContext.fill();
  faceContext.strokeStyle = '#9a7875';
  faceContext.lineWidth = face.width * 0.018;
  faceContext.beginPath();
  faceContext.arc(
    centerX,
    centerY + face.height * 0.06,
    face.width * 0.11,
    0.2,
    Math.PI - 0.2
  );
  faceContext.stroke();
}

function drawCharacter() {
  characterContext.clearRect(0, 0, PORTRAIT_WIDTH, PORTRAIT_HEIGHT);
  const placement = getPortraitPlacement();
  if (!placement) return;
  const face = placement.face;
  const costumeWidth = currentCostumeImage.width * placement.scale;
  const costumeHeight = currentCostumeImage.height * placement.scale;

  faceContext.clearRect(0, 0, PORTRAIT_WIDTH, PORTRAIT_HEIGHT);
  faceContext.save();
  faceContext.fillStyle = '#eadcc9';
  faceContext.fillRect(face.x - 3, face.y - 3, face.width + 6, face.height + 6);
  if (photoCanvas) {
    drawFittedPhoto(face);
  } else {
    drawPlaceholderFace(face);
  }
  faceContext.restore();

  // destination-in keeps existing pixels only where the mask has alpha.
  // Unlike a generic ellipse, each PNG mask follows its outfit's face opening.
  // Restore source-over before drawing again, or the next frame would mask
  // instead of paint. The costume then covers the face's perimeter.
  faceContext.globalCompositeOperation = 'destination-in';
  faceContext.drawImage(
    currentFaceMask,
    placement.x,
    placement.y,
    costumeWidth,
    costumeHeight
  );
  faceContext.globalCompositeOperation = 'source-over';
  characterContext.drawImage(faceLayer, 0, 0);
  characterContext.drawImage(
    currentCostumeImage,
    placement.x,
    placement.y,
    costumeWidth,
    costumeHeight
  );
}

function drawCostumeFaceDetails() {
  const placement = getPortraitPlacement();
  if (!placement) return;
  const face = placement.face;
  const centerX = face.x + face.width / 2;

  // These accents belong on top of the inserted photo, so they are drawn
  // after the costume. IDs correspond to the fixed wardrobe data, not filters.
  const hasLaceVeil = [1, 2, 35].includes(currentLookIndex);
  const hasCyanVisor = [3, 46, 48].includes(currentLookIndex);
  const hasSideSweptFringe = [12, 16].includes(currentLookIndex);
  const hasWhiskers = currentLookIndex === 26;

  characterContext.save();
  characterContext.beginPath();
  characterContext.ellipse(
    centerX,
    face.y + face.height / 2,
    face.width * 0.5,
    face.height * 0.5,
    0,
    0,
    Math.PI * 2
  );
  characterContext.clip();

  if (hasLaceVeil) {
    characterContext.fillStyle = '#20152522';
    characterContext.fillRect(face.x, face.y, face.width, face.height);
    characterContext.strokeStyle = '#e9d3e329';
    characterContext.lineWidth = 0.8;
    const lineSpacing = face.width / 8;
    for (
      let x = face.x - face.height;
      x < face.x + face.width + face.height;
      x += lineSpacing
    ) {
      characterContext.beginPath();
      characterContext.moveTo(x, face.y);
      characterContext.lineTo(x + face.height, face.y + face.height);
      characterContext.stroke();
      characterContext.beginPath();
      characterContext.moveTo(x, face.y);
      characterContext.lineTo(x - face.height, face.y + face.height);
      characterContext.stroke();
    }
  }
  if (hasCyanVisor) {
    const visorY = face.y + face.height * 0.23;
    const visorHeight = face.height * 0.33;
    characterContext.fillStyle = '#68dbeb2a';
    characterContext.fillRect(face.x, visorY, face.width, visorHeight);
    characterContext.strokeStyle = '#acffff80';
    characterContext.lineWidth = 1;
    characterContext.strokeRect(face.x, visorY, face.width, visorHeight);
  }
  if (hasSideSweptFringe) {
    characterContext.fillStyle = '#241e2c';
    characterContext.beginPath();
    characterContext.moveTo(face.x - 2, face.y - 2);
    characterContext.lineTo(face.x + face.width * 0.75, face.y - 2);
    characterContext.bezierCurveTo(
      face.x + face.width * 0.55,
      face.y + face.height * 0.22,
      face.x + face.width * 0.35,
      face.y + face.height * 0.55,
      face.x - 2,
      face.y + face.height * 0.64
    );
    characterContext.closePath();
    characterContext.fill();
  }
  if (hasWhiskers) {
    characterContext.strokeStyle = '#493249b0';
    characterContext.lineWidth = 1.3;
    for (const side of [-1, 1]) {
      for (let row = 0; row < 3; row++) {
        characterContext.beginPath();
        characterContext.moveTo(
          centerX + side * face.width * 0.24,
          face.y + face.height * (0.57 + row * 0.06)
        );
        characterContext.lineTo(
          centerX + side * face.width * 0.48,
          face.y + face.height * (0.52 + row * 0.1)
        );
        characterContext.stroke();
      }
    }
  }
  characterContext.restore();
}

function drawFaceEditingGuide(context) {
  const placement = getPortraitPlacement();
  if (!placement) return;
  const face = placement.face;
  const centerX = face.x + face.width / 2;
  const centerY = face.y + face.height / 2;

  context.save();
  context.strokeStyle = '#e7d5ff';
  context.lineWidth = 2;
  context.setLineDash([6, 5]);
  context.beginPath();
  context.ellipse(
    centerX,
    centerY,
    face.width / 2 + 6,
    face.height / 2 + 6,
    0,
    0,
    Math.PI * 2
  );
  context.stroke();
  context.setLineDash([]);
  context.fillStyle = '#d1b7ef';
  const guidePoints = [
    [face.x, centerY],
    [face.x + face.width, centerY],
    [centerX, face.y],
    [centerX, face.y + face.height]
  ];
  for (const [x, y] of guidePoints) {
    context.beginPath();
    context.arc(x, y, 3, 0, Math.PI * 2);
    context.fill();
  }
  context.restore();
}

// Preview and export share this compositor. Only the face + outfit layer is
// filtered, leaving the background independent. The editing guide is drawn
// last and omitted from exports.
function renderPortrait(context, { exporting = false } = {}) {
  context.clearRect(0, 0, PORTRAIT_WIDTH, PORTRAIT_HEIGHT);
  drawBackground(context);
  drawCharacter();
  drawCostumeFaceDetails();
  context.save();
  context.filter = filters[filterIndex].css(filterStrength);
  context.drawImage(characterLayer, 0, 0);
  context.restore();

  const showEditingGuide = !exporting && photoCanvas && activeTool === 'face';
  if (showEditingGuide) drawFaceEditingGuide(context);
}

// Dragging and sliders may fire many events in one frame. Queue one redraw
// using the latest state, then reuse the unfiltered character for thumbnails.
function requestDraw() {
  if (renderPending) return;
  renderPending = true;
  requestAnimationFrame(() => {
    renderPending = false;
    renderPortrait(portraitContext);
    if (activeTool === 'filters') refreshFilterPreviews();
  });
}

// 4. Filter, scene, and photo controls
// ---------------------------------------------------------------------------

function renderFilters() {
  const list = $('#filterList');
  list.replaceChildren();
  filterCards = [];

  filters.forEach((filter, index) => {
    const button = document.createElement('button');
    button.className = 'filter-item';
    button.setAttribute('aria-label', filter.name + ' filter');
    const preview = document.createElement('span');
    preview.className = 'filter-preview';
    const previewCanvas = document.createElement('canvas');
    previewCanvas.width = 112;
    previewCanvas.height = 136;
    preview.append(previewCanvas);
    const label = document.createElement('span');
    label.textContent = filter.name;
    button.append(preview, label);
    button.onclick = () => {
      filterIndex = index;
      syncFilterUI();
      requestDraw();
      savePreferences();
    };
    list.append(button);
    filterCards.push({ button, canvas: previewCanvas });
  });
  syncFilterUI();
}

function syncFilterUI() {
  filterCards.forEach(({ button }, index) => {
    const isActive = index === filterIndex;
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });
  const strengthPercent = Math.round(filterStrength * 100);
  $('#filterSummary').textContent =
    filters[filterIndex].name + ' · face + outfit';
  $('#strength').value = strengthPercent;
  $('#strengthValue').textContent = strengthPercent + '%';
}

function refreshFilterPreviews() {
  if (!currentCostumeImage) return;
  for (let index = 0; index < filterCards.length; index++) {
    const context = filterCards[index].canvas.getContext('2d');
    context.clearRect(0, 0, 112, 136);
    const gradient = context.createLinearGradient(0, 0, 112, 136);
    gradient.addColorStop(0, '#9e8ba8');
    gradient.addColorStop(1, '#45334e');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 112, 136);
    context.save();
    // Show a fixed upper-body crop at full intensity, not the current slider
    // strength. This makes the available finishes easier to compare.
    context.filter = filters[index].css(1);
    context.drawImage(characterLayer, 160, 60, 580, 705, 0, 0, 112, 136);
    context.restore();
  }
}

function renderScenes() {
  const list = $('#sceneList');
  list.replaceChildren();

  scenes.forEach((scene, index) => {
    const button = document.createElement('button');
    button.className = 'scene-item' + (index === sceneIndex ? ' active' : '');
    button.setAttribute('aria-pressed', String(index === sceneIndex));
    button.setAttribute('aria-label', scene.name + ' background');
    const preview = document.createElement('span');
    preview.className = 'scene-preview';
    preview.style.background =
      scene.color === 'transparent'
        ? 'repeating-conic-gradient(#63576c 0% 25%,#403648 0% 50%) 0/12px 12px'
        : scene.color;
    if (scene.asset !== undefined) {
      const image = document.createElement('img');
      image.src = `assets/scenes/${scene.asset}.jpg`;
      image.alt = '';
      preview.append(image);
    }
    const label = document.createElement('span');
    label.textContent = scene.name;
    button.append(preview, label);
    button.onclick = () => {
      sceneIndex = index;
      for (const [itemIndex, item] of [...list.children].entries()) {
        const isActive = itemIndex === index;
        item.classList.toggle('active', isActive);
        item.setAttribute('aria-pressed', String(isActive));
      }
      $('#sceneSummary').textContent = scene.name;
      requestDraw();
      savePreferences();
    };
    list.append(button);
  });
  $('#sceneSummary').textContent = scenes[sceneIndex].name;
}

$('#strength').oninput = (event) => {
  filterStrength = Number(event.target.value) / 100;
  $('#strengthValue').textContent = event.target.value + '%';
  requestDraw();
  savePreferences();
};
$('#sceneStrength').oninput = (event) => {
  sceneStrength = Number(event.target.value) / 100;
  $('#sceneStrengthValue').textContent = event.target.value + '%';
  requestDraw();
  savePreferences();
};

function syncFaceControls() {
  const zoomPercent = Math.round(photoZoom * 100);
  $('#zoom').value = zoomPercent;
  $('#zoomValue').textContent = zoomPercent + '%';
  $('#rotate').value = photoRotation;
  $('#rotateValue').textContent = photoRotation + '°';
}

function resetFace() {
  photoZoom = 1;
  photoRotation = 0;
  photoPan = { x: 0, y: 0 };
  syncFaceControls();
  requestDraw();
}

$('#zoom').oninput = (event) => {
  photoZoom = Number(event.target.value) / 100;
  syncFaceControls();
  requestDraw();
};
$('#rotate').oninput = (event) => {
  photoRotation = Number(event.target.value);
  syncFaceControls();
  requestDraw();
};
$('#resetFace').onclick = resetFace;
$$('[data-nudge]').forEach((button) => {
  button.onclick = () => {
    const [x, y] = button.dataset.nudge.split(',').map(Number);
    photoPan.x += x * 0.04;
    photoPan.y += y * 0.04;
    requestDraw();
  };
});

function updatePhotoUI() {
  const hasPhoto = Boolean(photoCanvas);
  const isEditingFace = hasPhoto && activeTool === 'face';
  $('#photoThumb').hidden = !hasPhoto;
  $('#photoTitle').textContent = hasPhoto
    ? 'Your photo is in place'
    : 'Make it your face';
  $('#photoCopy').textContent = hasPhoto
    ? 'Drag on the face. Pinch to zoom.'
    : 'A front-facing photo works best.';
  $('#uploadLabel').textContent = hasPhoto ? 'Change' : 'Add photo';
  $('#faceControls').classList.toggle('disabled', !hasPhoto);
  $$('#faceControls input,#faceControls button').forEach((element) => {
    element.disabled = !hasPhoto;
  });
  $('#removePhoto').hidden = !hasPhoto;
  $('#quickPhoto').hidden = hasPhoto;
  $('#stage').classList.toggle('editing', isEditingFace);
  $('#dragHint').hidden = !isEditingFace;
}

async function uploadPhoto(file) {
  if (!file) return;
  const exceedsSizeLimit = file.size > 30 * 1024 * 1024;
  if (exceedsSizeLimit) {
    showToast('Choose a photo smaller than 30 MB.');
    return;
  }
  if (!file.type.startsWith('image/')) {
    showToast('Choose a photo: JPG, PNG, WebP or AVIF.');
    return;
  }

  // Object URLs let Image decode a local file without sending it to a server.
  // A version check also prevents an older upload from replacing a newer one,
  // or restoring a photo after Remove was pressed during decoding.
  const loadVersion = ++photoLoadVersion;
  const objectURL = URL.createObjectURL(file);
  try {
    const image = await loadImage(objectURL);
    if (loadVersion !== photoLoadVersion) {
      URL.revokeObjectURL(objectURL);
      imagePromises.delete(objectURL);
      return;
    }

    // Bound working memory for large camera images; never upscale small ones.
    const normalizedPhoto = document.createElement('canvas');
    const scale = Math.min(1, 2400 / Math.max(image.width, image.height));
    normalizedPhoto.width = Math.round(image.width * scale);
    normalizedPhoto.height = Math.round(image.height * scale);
    normalizedPhoto
      .getContext('2d')
      .drawImage(image, 0, 0, normalizedPhoto.width, normalizedPhoto.height);
    photoCanvas = normalizedPhoto;
    if (photoObjectURL) {
      URL.revokeObjectURL(photoObjectURL);
      imagePromises.delete(photoObjectURL);
    }
    photoObjectURL = objectURL;
    $('#photoThumb').src = objectURL;
    resetFace();
    setTool('face');
    updatePhotoUI();
    showToast('Drag your face into place. Zoom to fill the opening.');
  } catch (error) {
    URL.revokeObjectURL(objectURL);
    imagePromises.delete(objectURL);
    console.error(error);
    showToast('This photo could not open. Try a JPG, PNG or WebP.');
  }
  $('#photoInput').value = '';
}

$('#uploadBtn').onclick = $('#quickPhoto').onclick = () =>
  $('#photoInput').click();
$('#photoInput').onchange = (event) => uploadPhoto(event.target.files[0]);
$('#removePhoto').onclick = () => {
  photoLoadVersion++;
  photoCanvas = null;
  if (photoObjectURL) {
    URL.revokeObjectURL(photoObjectURL);
    imagePromises.delete(photoObjectURL);
    photoObjectURL = null;
  }
  $('#photoThumb').removeAttribute('src');
  resetFace();
  updatePhotoUI();
  showToast('Photo removed from this session.');
};

const photoDropZone = $('#photoDrop');
['dragenter', 'dragover'].forEach((eventName) => {
  photoDropZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    photoDropZone.classList.add('dragover');
  });
});
['dragleave', 'drop'].forEach((eventName) => {
  photoDropZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    photoDropZone.classList.remove('dragover');
  });
});
photoDropZone.addEventListener('drop', (event) =>
  uploadPhoto(event.dataTransfer.files[0])
);

// 5. Gestures, keyboard shortcuts, export, and startup
// ---------------------------------------------------------------------------

const activePointers = new Map();
let gesture = null;

// CSS can letterbox the portrait inside the canvas element. Subtract those
// margins before undoing the display scale, so hit tests and drags use the
// same coordinates as the renderer on both phones and desktops.
function getCanvasPoint(event) {
  const bounds = portraitCanvas.getBoundingClientRect();
  const displayScale = Math.min(
    bounds.width / PORTRAIT_WIDTH,
    bounds.height / PORTRAIT_HEIGHT
  );
  if (!displayScale) return { x: 0, y: 0 };
  const originX =
    bounds.left + (bounds.width - PORTRAIT_WIDTH * displayScale) / 2;
  const originY =
    bounds.top + (bounds.height - PORTRAIT_HEIGHT * displayScale) / 2;
  return {
    x: (event.clientX - originX) / displayScale,
    y: (event.clientY - originY) / displayScale
  };
}

function getPointerDistance() {
  const points = [...activePointers.values()];
  if (points.length !== 2) return 0;
  return Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y);
}

portraitCanvas.addEventListener('pointerdown', (event) => {
  if (!assetsReady) return;
  portraitCanvas.setPointerCapture(event.pointerId);
  const point = getCanvasPoint(event);
  activePointers.set(event.pointerId, point);
  const face = getPortraitPlacement().face;
  const isEditingFace = Boolean(photoCanvas) && activeTool === 'face';

  // Two fingers take priority over a one-finger drag. Keep the initial zoom
  // and distance so each move uses a ratio, rather than accumulating errors.
  if (activePointers.size === 2 && isEditingFace) {
    gesture = {
      type: 'pinch',
      distance: getPointerDistance(),
      zoom: photoZoom
    };
    return;
  }

  // Expand the face hit area by half a face on each side. This is easier to
  // grab on a small screen; a gesture elsewhere remains an outfit swipe.
  const isWithinFaceWidth =
    point.x > face.x - face.width * 0.5 && point.x < face.x + face.width * 1.5;
  const isWithinFaceHeight =
    point.y > face.y - face.height * 0.5 &&
    point.y < face.y + face.height * 1.5;
  const shouldDragPhoto =
    isEditingFace && isWithinFaceWidth && isWithinFaceHeight;
  gesture = {
    type: shouldDragPhoto ? 'drag' : 'swipe',
    start: point,
    last: point,
    startTime: Date.now()
  };
});

portraitCanvas.addEventListener('pointermove', (event) => {
  if (!activePointers.has(event.pointerId) || !gesture) return;
  const point = getCanvasPoint(event);
  activePointers.set(event.pointerId, point);

  const isPinching = gesture.type === 'pinch' && activePointers.size === 2;
  if (isPinching) {
    const initialDistance = Math.max(1, gesture.distance);
    const currentDistance = getPointerDistance();
    const requestedZoom = (gesture.zoom * currentDistance) / initialDistance;
    photoZoom = Math.max(0.5, Math.min(3.5, requestedZoom));
    syncFaceControls();
    requestDraw();
    return;
  }
  if (gesture.type === 'drag') {
    const face = getPortraitPlacement().face;
    photoPan.x += (point.x - gesture.last.x) / face.width;
    photoPan.y += (point.y - gesture.last.y) / face.height;
    gesture.last = point;
    requestDraw();
  }
});

function endPointer(event) {
  if (!activePointers.has(event.pointerId)) return;
  const point = getCanvasPoint(event);
  const isQuickSwipe =
    gesture?.type === 'swipe' && Date.now() - gesture.startTime < 1000;
  if (isQuickSwipe) {
    const verticalDistance = point.y - gesture.start.y;
    const horizontalDistance = point.x - gesture.start.x;
    const isLongEnough = Math.abs(verticalDistance) > 65;
    const isMostlyVertical =
      Math.abs(verticalDistance) > Math.abs(horizontalDistance) * 1.15;
    if (isLongEnough && isMostlyVertical) {
      stepLook(verticalDistance < 0 ? 1 : -1);
    }
  }
  activePointers.delete(event.pointerId);

  // After a pinch, lifting one finger must not turn the remaining touch into
  // a swipe. Wait until all pointers are released before starting afresh.
  gesture = activePointers.size ? { type: 'none' } : null;
}

portraitCanvas.addEventListener('pointerup', endPointer);
portraitCanvas.addEventListener('pointercancel', (event) => {
  activePointers.delete(event.pointerId);
  gesture = null;
});

document.addEventListener('keydown', (event) => {
  const isEditingInput = ['INPUT', 'TEXTAREA'].includes(
    document.activeElement.tagName
  );
  if (isEditingInput) return;
  const isNavigationKey = event.key === 'ArrowUp' || event.key === 'ArrowDown';
  if (isNavigationKey) {
    event.preventDefault();
    stepLook(event.key === 'ArrowUp' ? -1 : 1);
  } else if (event.key.toLowerCase() === 'f') {
    toggleFavorite();
  } else if (event.key.toLowerCase() === 'r') {
    $('#randomBtn').click();
  }
});

async function exportPortrait() {
  if (!assetsReady || !currentCostumeImage) {
    showToast('Your look is loading. Try again in a moment.');
    return;
  }
  const button = $('#exportBtn');
  button.disabled = true;
  try {
    // Render at twice the working resolution (1800 x 2200), using the same
    // composition but no editing guide. A transparent scene stays transparent.
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = PORTRAIT_WIDTH * 2;
    exportCanvas.height = PORTRAIT_HEIGHT * 2;
    const context = exportCanvas.getContext('2d');
    context.scale(2, 2);
    renderPortrait(context, { exporting: true });
    const blob = await new Promise((resolve) =>
      exportCanvas.toBlob(resolve, 'image/png')
    );
    if (!blob) throw new Error('No PNG produced');

    const objectURL = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    const lookSlug = looks[currentLookIndex].name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-');
    downloadLink.href = objectURL;
    downloadLink.download = 'alter-ego-' + lookSlug + '.png';
    document.body.append(downloadLink);
    downloadLink.click();
    downloadLink.remove();
    // Give the browser time to start reading the download before releasing it.
    setTimeout(() => URL.revokeObjectURL(objectURL), 10000);
    showToast('Portrait saved. Meet your other self.');
  } catch (error) {
    console.error(error);
    showToast('Could not save this portrait. Please try again.');
  } finally {
    button.disabled = false;
  }
}

$('#exportBtn').onclick = exportPortrait;

function restorePreferences() {
  try {
    const preferences = JSON.parse(
      localStorage.getItem('alterego-preferences') || '{}'
    );
    const boundedIndex = (value, maximum, fallback) =>
      Number.isInteger(value)
        ? Math.max(0, Math.min(maximum, value))
        : fallback;
    const boundedFraction = (value, fallback) =>
      Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : fallback;

    // Stored data is editable and may come from an older session. Clamp valid
    // numbers to today's ranges, and use defaults for missing/invalid fields.
    currentLookIndex = boundedIndex(preferences.current, LOOK_COUNT - 1, 0);
    filterIndex = boundedIndex(preferences.filterIndex, filters.length - 1, 0);
    sceneIndex = boundedIndex(preferences.sceneIndex, scenes.length - 1, 0);
    filterStrength = boundedFraction(preferences.strength, 1);
    sceneStrength = boundedFraction(preferences.sceneStrength, 0.7);
  } catch (error) {
    console.warn('Preferences could not be restored.', error);
  }
}

async function init() {
  try {
    // The bundled data avoids fetching JSON for the normal static page.
    // Keep the JSON fallback for hosts/pages that omit wardrobe-data.js.
    if (typeof ALTER_EGO_DATA !== 'undefined') {
      looks = ALTER_EGO_DATA.looks;
      artworkMetadata = ALTER_EGO_DATA.meta;
    } else {
      [looks, artworkMetadata] = await Promise.all([
        fetch('looks.json').then((response) => {
          if (!response.ok) throw new Error('Wardrobe unavailable');
          return response.json();
        }),
        fetch('assets/manifest.json').then((response) => {
          if (!response.ok) throw new Error('Artwork unavailable');
          return response.json();
        })
      ]);
    }

    restorePreferences();
    const atmospherePercent = Math.round(sceneStrength * 100);
    $('#sceneStrength').value = atmospherePercent;
    $('#sceneStrengthValue').textContent = atmospherePercent + '%';
    renderCollections();
    renderFilters();
    renderScenes();
    setTool('wardrobe');
    await selectLook(currentLookIndex);

    // The first costume is usable before optional scene JPEGs finish loading.
    // drawBackground supplies the procedural background until each is ready.
    Promise.allSettled(
      scenes.slice(0, 8).map(async (scene, index) => {
        sceneImages[index] = await loadImage(`assets/scenes/${index}.jpg`);
        if (sceneIndex === index) requestDraw();
      })
    ).then((results) => {
      for (const result of results) {
        if (result.status === 'rejected') {
          console.warn(
            'A background image could not be loaded.',
            result.reason
          );
        }
      }
    });
  } catch (error) {
    console.error(error);
    $('#assetLoading').querySelector('span:last-of-type').textContent =
      'The wardrobe could not open. Reload to try again.';
  }
}

init();
