import {el,button,icon} from '../dom.js';
import {mediaTime} from '../../config/media.js';
export class SovAudio extends HTMLElement {
  set data(media){
    if(this.audio){this.audio.pause();this.audio.removeAttribute('src');this.audio.load();}
    this.media=media;this.duration=media.duration;
    this.audio=el('audio',{preload:'metadata',src:media.url});
    this.playButton=button('Воспроизвести запись','play',()=>this.toggle(),'icon-button audio-play');
    this.seek=el('input',{type:'range',min:0,max:media.duration,step:.1,value:0,'aria-label':'Позиция аудиозаписи',disabled:true});
    this.time=el('span',{class:'audio-time','aria-hidden':'true'},`00:00 / ${mediaTime(media.duration)}`);
    this.error=el('span',{class:'audio-error',role:'alert',hidden:true});
    const name=(media.name||'Голосовое сообщение').split(/[\\/]/u).at(-1);
    const download=el('a',{class:'icon-button audio-download',href:media.url,download:name,'aria-label':'Скачать аудиозапись',title:'Скачать аудиозапись'},icon('download'));
    this.replaceChildren(this.audio,this.playButton,el('div',{class:'audio-track'},this.seek,this.time),download,this.error);
    this.seek.addEventListener('input',()=>{try{this.audio.currentTime=Number(this.seek.value);this.update();}catch{this.fail();}});
    this.audio.addEventListener('timeupdate',()=>this.update());this.audio.addEventListener('ended',()=>this.update());
    this.audio.addEventListener('play',()=>{document.dispatchEvent(new CustomEvent('sov-audio-play',{detail:this}));this.update();});
    this.audio.addEventListener('pause',()=>this.update());this.audio.addEventListener('error',()=>this.fail());
    this.audio.addEventListener('loadedmetadata',()=>{this.seek.disabled=false;if(Number.isFinite(this.audio.duration)&&this.audio.duration>0){this.duration=this.audio.duration;this.seek.max=this.duration;}this.update();});
  }
  connectedCallback(){
    this.pauseOther=event=>{if(event.detail!==this)this.audio?.pause();};document.addEventListener('sov-audio-play',this.pauseOther);
    if(this.audio && !this.audio.getAttribute('src'))this.audio.src=this.media.url;
  }
  disconnectedCallback(){document.removeEventListener('sov-audio-play',this.pauseOther);this.audio?.pause();if(this.audio){this.audio.removeAttribute('src');this.audio.load();}}
  async toggle(){
    if(!this.audio.paused){this.audio.pause();return;}
    try{if(this.audio.ended)this.audio.currentTime=0;await this.audio.play();this.error.hidden=true;}
    catch{this.error.textContent='Не удалось воспроизвести запись. Попробуй ещё раз или скачай её.';this.error.hidden=false;}
    this.update();
  }
  fail(){this.error.textContent='Не удалось воспроизвести аудиозапись.';this.error.hidden=false;this.playButton.disabled=true;this.seek.disabled=true;}
  update(){
    const position=Math.min(this.duration,this.audio.currentTime||0),playing=!this.audio.paused&&!this.audio.ended;
    this.seek.value=String(position);this.seek.setAttribute('aria-valuetext',`${mediaTime(position)} из ${mediaTime(this.duration)}`);
    this.time.textContent=`${mediaTime(position)} / ${mediaTime(this.duration)}`;
    this.playButton.setAttribute('aria-label',playing?'Пауза':'Воспроизвести запись');this.playButton.replaceChildren(icon(playing?'pause':'play'));
  }
}
customElements.define('sov-audio',SovAudio);
