// User-supplied CR-001 artwork, converted to WebP without artistic changes.
export const BACKGROUNDS = Object.freeze([
  {
    "id": "room-01-lamp",
    "desktop": "./assets/backgrounds/room-01-lamp-desktop.6a073b5d18a7.webp",
    "mobile": "./assets/backgrounds/room-01-lamp-mobile.f545957e1205.webp"
  },
  {
    "id": "room-02-kitchen",
    "desktop": "./assets/backgrounds/room-02-kitchen-desktop.2666ea71d7f2.webp",
    "mobile": "./assets/backgrounds/room-02-kitchen-mobile.497bb2fae0b1.webp"
  },
  {
    "id": "room-03-radio",
    "desktop": "./assets/backgrounds/room-03-radio-desktop.ed02dd109fb1.webp",
    "mobile": "./assets/backgrounds/room-03-radio-mobile.b0818a5dfb67.webp"
  },
  {
    "id": "room-04-desk",
    "desktop": "./assets/backgrounds/room-04-desk-desktop.8182b4e6ff2c.webp",
    "mobile": "./assets/backgrounds/room-04-desk-mobile.da99c0390e16.webp"
  },
  {
    "id": "room-05-sideboard",
    "desktop": "./assets/backgrounds/room-05-sideboard-desktop.8f286b7d3460.webp",
    "mobile": "./assets/backgrounds/room-05-sideboard-mobile.a7a7b7863188.webp"
  },
  {
    "id": "room-06-armchair",
    "desktop": "./assets/backgrounds/room-06-armchair-desktop.2c6f59ae9d3f.webp",
    "mobile": "./assets/backgrounds/room-06-armchair-mobile.84b23615cc05.webp"
  },
  {
    "id": "room-07-study",
    "desktop": "./assets/backgrounds/room-07-study-desktop.49279d1e317d.webp",
    "mobile": "./assets/backgrounds/room-07-study-mobile.3e1d9196b939.webp"
  },
  {
    "id": "room-08-television",
    "desktop": "./assets/backgrounds/room-08-television-desktop.62fc938e6ca4.webp",
    "mobile": "./assets/backgrounds/room-08-television-mobile.9f64a2938022.webp"
  },
  {
    "id": "room-09-telephone",
    "desktop": "./assets/backgrounds/room-09-telephone-desktop.ef4750801c78.webp",
    "mobile": "./assets/backgrounds/room-09-telephone-mobile.0030e54f4b8c.webp"
  },
  {
    "id": "room-10-balcony-room",
    "desktop": "./assets/backgrounds/room-10-balcony-room-desktop.444013ad1cbe.webp",
    "mobile": "./assets/backgrounds/room-10-balcony-room-mobile.ab83d0d7f762.webp"
  },
  {
    "id": "room-11-staircase",
    "desktop": "./assets/backgrounds/room-11-staircase-desktop.8f0693e311d3.webp",
    "mobile": "./assets/backgrounds/room-11-staircase-mobile.09906f402010.webp"
  },
  {
    "id": "room-12-bathroom",
    "desktop": "./assets/backgrounds/room-12-bathroom-desktop.397393438fe2.webp",
    "mobile": "./assets/backgrounds/room-12-bathroom-mobile.9f8601af73b1.webp"
  },
  {
    "id": "room-13-pantry",
    "desktop": "./assets/backgrounds/room-13-pantry-desktop.a2656fbb5735.webp",
    "mobile": "./assets/backgrounds/room-13-pantry-mobile.c3efd2410365.webp"
  },
  {
    "id": "room-14-sewing",
    "desktop": "./assets/backgrounds/room-14-sewing-desktop.f44634f5aff0.webp",
    "mobile": "./assets/backgrounds/room-14-sewing-mobile.259eb7ffab19.webp"
  },
  {
    "id": "room-15-nursery",
    "desktop": "./assets/backgrounds/room-15-nursery-desktop.794ce58b4a00.webp",
    "mobile": "./assets/backgrounds/room-15-nursery-mobile.967bacb08f9d.webp"
  },
  {
    "id": "room-16-records",
    "desktop": "./assets/backgrounds/room-16-records-desktop.fdf9580640a9.webp",
    "mobile": "./assets/backgrounds/room-16-records-mobile.34a56e9c8e4e.webp"
  },
  {
    "id": "room-17-balcony",
    "desktop": "./assets/backgrounds/room-17-balcony-desktop.aa08bde72b10.webp",
    "mobile": "./assets/backgrounds/room-17-balcony-mobile.65c64a87132b.webp"
  },
  {
    "id": "room-18-chess",
    "desktop": "./assets/backgrounds/room-18-chess-desktop.c7615528d0ce.webp",
    "mobile": "./assets/backgrounds/room-18-chess-mobile.eec9cb983036.webp"
  },
  {
    "id": "room-19-veranda",
    "desktop": "./assets/backgrounds/room-19-veranda-desktop.f9f85b7344c3.webp",
    "mobile": "./assets/backgrounds/room-19-veranda-mobile.c5cf1b83f0c5.webp"
  },
  {
    "id": "room-20-workshop",
    "desktop": "./assets/backgrounds/room-20-workshop-desktop.b74d859d8491.webp",
    "mobile": "./assets/backgrounds/room-20-workshop-mobile.e6fd7b2e636b.webp"
  }
].map(Object.freeze));
export const BACKGROUND_IDS = Object.freeze(BACKGROUNDS.map(item => item.id));
export const isBackgroundId = id => BACKGROUND_IDS.includes(id);
export function chooseBackground(random = Math.random, recent = []) {
  const fresh = BACKGROUND_IDS.filter(id => !recent.includes(id));
  const pool = fresh.length ? fresh : BACKGROUND_IDS;
  return pool[Math.min(pool.length - 1, Math.floor(random() * pool.length))];
}
