# Alter Ego

Alter Ego is a browser app for placing your face in 80 illustrated outfits and saving portraits as PNG images. Its controls are designed for phones and also work on desktop.

## Using it

- Choose a photo, then drag, zoom, or rotate it to fit the character's face.
- Swipe vertically to change outfits, or browse the collection thumbnails.
- Apply a filter to the face and outfit together. Choose a background separately.
- Save favorite outfits in the Saved collection and export a portrait.

Photos are processed locally in the browser and kept only for the current session. Favorites and outfit, filter, and background preferences are stored in localStorage; the photo and its positioning are not.

## How it was built

The app was built with **OpenAI Codex, using a GPT-6-based coding agent**, working from the project concept, reference images, and feedback. The illustrations were generated with OpenAI's built-in image generator. The exact image-generation model version was not exposed in the session.

The website uses HTML, CSS, and vanilla JavaScript. The browser's Canvas 2D API combines the photograph, face mask, costume, face details, and background. It also handles photo positioning, rotation, filters, and PNG export. There is no backend or runtime library.

The artwork started as sprite atlases containing multiple characters. Python scripts using Pillow, NumPy, and SciPy separated the characters, removed face registration markers, and produced transparent masks and thumbnails. These were asset-preparation tools, not requirements for running the app; the scripts and original atlas sheets are not included here.

The distributed images retain their original pixel dimensions. Backgrounds use progressive JPEG at quality 85. Costumes and thumbnails use WebP at quality 85 with lossless alpha. Face masks remain lossless PNG so the face openings keep their transparency.

## Reading the source

- `index.html` defines the portrait canvas and controls; `style.css` handles the layout.
- `app.js` manages selections, photo input, gestures, rendering, and export. Its section comments explain the rendering layers and the connections between controls and state.
- `looks.json` describes the outfits; `assets/manifest.json` records image dimensions and face rectangles.
- `wardrobe-data.js` contains a browser-ready copy of those two data files, loaded before `app.js`. Keep it in sync if you edit the JSON data.
- `assets/` contains the 80 costumes, masks, thumbnails, eight scene images, and app icon.
- `guide.html` and `guide.css` provide the illustrated user guide.

## Running locally

Serve this folder with any static web server. There is no build step or dependency installation:

```sh
python -m http.server 8000
```

Then open <http://localhost:8000>. The same files can be deployed directly to static hosting.
