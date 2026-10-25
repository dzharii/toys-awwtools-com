import './sov-audio.js';
import {el, button, emit} from '../dom.js';

export class SovMessage extends HTMLElement {
  set data(message) {
    this.message = message;
    const parent = message.role === 'assistant';
    const speaker = parent ? 'Родитель' : 'Ребёнок';
    this.className = `message ${message.role}`;
    this.dataset.kind = message.kind;
    if (parent) this.dataset.tone = message.kind === 'silence' ? 'neutral' : message.tone;
    // Length affects only the opening's scale, never its function or emotional classification.
    if (parent && message.kind === 'opening' && message.text.length > 100) this.classList.add('opening-long');
    this.setAttribute('role', 'article');
    this.setAttribute('aria-label', speaker);
    this.replaceChildren(el('div', {class: 'message-speaker', 'aria-hidden': 'true'}, speaker),
      el('div', {class: 'message-body'}, message.text));
    if (!parent && message.attachment) {
      const media=message.attachment;
      if(media.type==='image')this.append(el('a',{href:media.url,target:'_blank',rel:'noopener noreferrer',class:'image-link','aria-label':'Открыть изображение'},el('img',{src:media.url,alt:'Прикреплённое изображение',class:'message-image',width:media.width,height:media.height,decoding:'async'})));
      else if(media.type==='audio'){const player=document.createElement('sov-audio');player.data=media;this.append(player);}
      else this.append(el('div',{class:'message-file'},'Файл'));
      if(!message.text)this.querySelector('.message-body').remove();
    }
    if (parent && message.kind !== 'silence') {
      this.info = button('О выражении', 'info', () => emit(this, 'show-origin', {message: this.message, target: this.info}), 'origin-trigger icon-button');
      this.append(this.info);
    }
  }
}
customElements.define('sov-message', SovMessage);
