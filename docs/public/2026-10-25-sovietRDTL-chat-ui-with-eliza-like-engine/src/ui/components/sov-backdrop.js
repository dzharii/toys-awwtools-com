import {BACKGROUNDS} from '../../config/backgrounds.js';
import {el} from '../dom.js';

// At most three decoded pictures. Repeated renders do not restart image loading.
export class SovBackdrop extends HTMLElement {
  connectedCallback() {
    this.setAttribute('aria-hidden', 'true');
    this.cache = new Map();
    this.failed = new Set();
  }
  show(id) {
    if (this.currentId === id) return;
    this.currentId = id;
    this.dataset.backgroundId = id || '';
    const source = BACKGROUNDS.find(item => item.id === id);
    if (!source || this.failed.has(id)) { this.activate(null); return; }
    if (this.cache.has(id)) {
      const entry = this.cache.get(id);
      this.cache.delete(id); this.cache.set(id, entry);
      if (entry.ready) this.activate(entry);
      return;
    }
    const image = el('img', {alt: '', decoding: 'async', fetchpriority: 'low', draggable: false});
    const picture = el('picture', {}, el('source', {media: '(max-width: 767px)', srcset: source.mobile}), image);
    const entry = {picture, image, ready: false};
    image.onload = () => {
      entry.ready = true;
      if (this.currentId === id && this.cache.get(id) === entry) this.activate(entry);
    };
    image.onerror = () => {
      this.failed.add(id); this.cache.delete(id); picture.remove();
      if (this.currentId === id) this.activate(null);
    };
    this.cache.set(id, entry);
    this.append(picture);
    image.src = source.desktop;
    while (this.cache.size > 3) {
      const [key, oldest] = this.cache.entries().next().value;
      this.cache.delete(key); oldest.picture.remove();
    }
  }
  activate(entry) {
    for (const item of this.cache.values()) item.picture.classList.toggle('active', item === entry);
    this.dataset.loaded = entry ? 'true' : 'false';
  }
}
customElements.define('sov-backdrop', SovBackdrop);
