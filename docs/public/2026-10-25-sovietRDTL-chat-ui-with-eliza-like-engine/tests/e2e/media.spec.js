import {test,expect} from '@playwright/test';
import fs from 'node:fs';
const photo=new URL('../fixtures/media/photo.png',import.meta.url).pathname;
const wav=new URL('../fixtures/media/tone.wav',import.meta.url).pathname;
const wavBase64=fs.readFileSync(wav).toString('base64');
const photoBase64=fs.readFileSync(photo).toString('base64');
const input=p=>p.getByRole('textbox',{name:'Сообщение',exact:true});
async function ready(page){await expect(page.locator('html')).toHaveAttribute('data-ready','true');}
async function open(page){await page.goto('/');await ready(page);await page.evaluate(()=>localStorage.clear());await page.reload();await ready(page);}
async function send(page){await page.getByRole('button',{name:'Отправить сообщение',exact:true}).click();await expect(page.locator('.thinking')).toBeHidden();}
async function shot(page,testInfo,name){await testInfo.attach(name,{body:await page.screenshot({fullPage:true,animations:'disabled'}),contentType:'image/png'});}
async function fakeMicrophone(page,error){
 await page.addInitScript(({wavBase64,error})=>{
  const track={stop(){window.__stoppedTracks=(window.__stoppedTracks||0)+1;}};
  Object.defineProperty(navigator,'mediaDevices',{configurable:true,value:{getUserMedia:async()=>{if(error)throw new DOMException('fake device',error);return {getTracks:()=>[track]};}}});
  window.AudioContext=undefined;window.webkitAudioContext=undefined;
  window.MediaRecorder=class{
   static isTypeSupported(){return false;}
   constructor(){this.state='inactive';this.mimeType='audio/wav';}
   start(){this.state='recording';}
   stop(){this.state='inactive';queueMicrotask(()=>{const bytes=Uint8Array.from(atob(wavBase64),c=>c.charCodeAt(0));this.ondataavailable?.({data:new Blob([bytes],{type:'audio/wav'})});this.onstop?.();});}
  };
 },{wavBase64,error});
}
for(const width of [360,390,768,1280,1440])test(`media end-to-end layout ${width}`,async({page},testInfo)=>{
 await page.setViewportSize({width,height:900});await fakeMicrophone(page);await open(page);
 const requests=[];page.on('request',request=>requests.push({url:request.url(),method:request.method()}));
 await shot(page,testInfo,'text.png');
 await page.getByRole('button',{name:'Записать голосовое сообщение'}).click();await expect(page.locator('sov-composer')).toHaveAttribute('data-mode','recording');await page.waitForTimeout(350);await shot(page,testInfo,'recording.png');
 await page.getByRole('button',{name:'Остановить запись'}).click();await expect(page.locator('sov-composer')).toHaveAttribute('data-mode','preview');await expect(page.locator('.attachment-preview sov-audio')).toHaveCount(1);await shot(page,testInfo,'stopped.png');
 await page.locator('.attachment-preview').getByRole('button',{name:'Воспроизвести запись'}).click();await expect(page.locator('.attachment-preview').getByRole('button',{name:'Пауза'})).toBeVisible();await page.locator('.attachment-preview').getByRole('button',{name:'Пауза'}).click();
 await send(page);await expect(page.locator('.user sov-audio')).toHaveCount(1);await expect(page.locator('.assistant[data-kind="audio"]')).toHaveCount(1);await shot(page,testInfo,'audio-sent.png');
 const player=page.locator('.user sov-audio');await player.getByRole('slider').evaluate(element=>{element.value='2';element.dispatchEvent(new Event('input',{bubbles:true}));});expect(await player.locator('audio').evaluate(e=>e.currentTime)).toBeGreaterThan(1.5);
 const download=page.waitForEvent('download');await player.getByRole('link',{name:'Скачать аудиозапись'}).click();expect((await download).suggestedFilename()).toMatch(/^voice-.*\.wav$/);
 await page.locator('input[type=file]').setInputFiles(photo);await expect(page.locator('.attachment-image')).toBeVisible();await shot(page,testInfo,'image-preview.png');await input(page).fill('Посмотри');await send(page);await expect(page.locator('.message-image')).toBeVisible();await expect(page.locator('.assistant[data-kind="image"]')).toHaveCount(1);await shot(page,testInfo,'image-sent.png');
 await page.locator('input[type=file]').setInputFiles({name:'homework.pdf',mimeType:'application/pdf',buffer:Buffer.from('not parsed')});await expect(page.locator('.attachment-name')).toHaveText('homework.pdf');await send(page);await expect(page.locator('.assistant[data-kind="file"]')).toHaveCount(1);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await expect(input(page)).toBeInViewport();expect(requests.every(r=>r.method==='GET')).toBe(true);
 await page.locator('.assistant[data-kind="file"]').getByRole('button',{name:'О выражении'}).click();await expect(page.locator('.origin-article')).toHaveCount(1);await page.getByRole('button',{name:'Закрыть',exact:true}).click();
 await input(page).fill('Текст без вложения');await send(page);await page.reload();await ready(page);await expect(page.locator('.user')).toHaveCount(1);await expect(page.locator('.user .message-body')).toHaveText('Текст без вложения');await expect(page.locator('.message-image,.user sov-audio,.assistant[data-kind="file"],.assistant[data-kind="image"],.assistant[data-kind="audio"]')).toHaveCount(0);
});
test('image paste prepares one preview, ordinary text paste is not intercepted, cancel and corrupt images create no reaction',async({page})=>{
 await open(page);
 const defaultAllowed=await input(page).evaluate(element=>{const dt=new DataTransfer();dt.setData('text/plain','Обычный текст');const e=new ClipboardEvent('paste',{bubbles:true,cancelable:true,clipboardData:dt});element.dispatchEvent(e);return !e.defaultPrevented;});expect(defaultAllowed).toBe(true);
 await input(page).evaluate((element,base64)=>{const dt=new DataTransfer();dt.items.add(new File([Uint8Array.from(atob(base64),c=>c.charCodeAt(0))],'screenshot.png',{type:'image/png'}));element.dispatchEvent(new ClipboardEvent('paste',{bubbles:true,cancelable:true,clipboardData:dt}));},photoBase64);
 await expect(page.locator('.attachment-image')).toBeVisible();await page.getByRole('button',{name:'Удалить вложение'}).click();await expect(page.locator('.assistant')).toHaveCount(1);
 await page.locator('input[type=file]').setInputFiles({name:'broken.png',mimeType:'image/png',buffer:Buffer.from('not image')});await expect(page.locator('.composer-error')).toBeVisible();await expect(page.locator('.assistant')).toHaveCount(1);await expect(page.locator('.message-image')).toHaveCount(0);
});
test('recording can be cancelled and directly sent once without an extra text message',async({page})=>{
 await fakeMicrophone(page);await open(page);await page.getByRole('button',{name:'Записать голосовое сообщение'}).click();await expect(page.locator('sov-composer')).toHaveAttribute('data-mode','recording');await page.getByRole('button',{name:'Отменить запись'}).click();await expect(page.locator('.assistant')).toHaveCount(1);
 await page.getByRole('button',{name:'Записать голосовое сообщение'}).click();await page.waitForTimeout(350);await page.getByRole('button',{name:'Отправить запись',exact:true}).click();await expect(page.locator('.thinking')).toBeHidden();await expect(page.locator('.user sov-audio')).toHaveCount(1);await expect(page.locator('.assistant[data-kind="audio"]')).toHaveCount(1);expect(await page.evaluate(()=>window.__stoppedTracks)).toBe(2);
});
for(const error of ['NotAllowedError','NotFoundError','NotReadableError'])test(`microphone technical error ${error} has no parent reaction`,async({page})=>{
 await fakeMicrophone(page,error);await open(page);await page.getByRole('button',{name:'Записать голосовое сообщение'}).click();await expect(page.locator('.composer-error')).toBeVisible();await expect(page.locator('sov-composer')).toHaveAttribute('data-mode','text');await expect(page.locator('.assistant')).toHaveCount(1);await expect(input(page)).toBeVisible();
});
test('imported audio survives chat switching, unsupported audio becomes a file and safety overrides the category',async({page})=>{
 await open(page);await page.locator('input[type=file]').setInputFiles(wav);await expect(page.locator('.attachment-preview sov-audio')).toHaveCount(1);await send(page);
 await page.getByRole('button',{name:'Новый чат',exact:true}).click();await page.getByRole('button',{name:'Новый чат 1',exact:true}).click();await expect(page.locator('.user sov-audio')).toHaveCount(1);await page.locator('.user sov-audio').getByRole('button',{name:'Воспроизвести запись'}).click();await expect(page.locator('.user sov-audio').getByRole('button',{name:'Пауза'})).toBeVisible();
 await page.locator('input[type=file]').setInputFiles({name:'unplayable.mp3',mimeType:'audio/mpeg',buffer:Buffer.from('corrupt')});await expect(page.locator('.attachment-name')).toBeVisible();await send(page);await expect(page.locator('.assistant[data-kind="file"]')).toHaveCount(1);
 await page.locator('input[type=file]').setInputFiles(photo);await expect(page.locator('.attachment-image')).toBeVisible();await input(page).fill('Я сейчас прыгну с крыши');await send(page);await expect(page.locator('.assistant[data-kind="silence"]')).toHaveCount(1);
});
test('compact visual viewport keeps attachment composer controls reachable',async({page},testInfo)=>{
 await page.setViewportSize({width:360,height:850});await open(page);await page.locator('input[type=file]').setInputFiles(photo);await expect(page.locator('.attachment-image')).toBeVisible();
 await page.evaluate(()=>{document.documentElement.style.setProperty('--app-height','320px');window.dispatchEvent(new Event('resize'));document.documentElement.style.setProperty('--app-height','320px');});
 await expect(input(page)).toBeVisible();const box=await input(page).boundingBox();expect(box.y+box.height).toBeLessThanOrEqual(321);await shot(page,testInfo,'compact-composer.png');
});
