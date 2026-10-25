import {test,expect} from '@playwright/test';
import {load} from '../../scripts/catalog.mjs';
import {BACKGROUNDS} from '../../src/config/backgrounds.js';
const catalog=load(), now='2026-10-24T20:00:00Z', key='sovet-rdtl.state.v2';
const input=page=>page.getByRole('textbox',{name:'Сообщение',exact:true});
async function ready(page){await expect(page.locator('html')).toHaveAttribute('data-ready','true');}
function record(expression,kind,tone,id,text=expression.canonical){return {id,role:'assistant',kind,tone,text,expressionIds:[expression.id],familyIds:[expression.familyId],sourceLibrary:expression.library,tier:expression.tier,createdAt:now};}
function fixture(tone,long=false){
 const candidates=catalog.expressions.filter(e=>e.scenarios?.includes('opening')&&e.tones.includes(tone));
 const expression=candidates.sort((a,b)=>long?b.canonical.length-a.canonical.length:a.canonical.length-b.canonical.length)[0];
 // Synthetic long opening stresses wrapping; the ordinary fixture uses the catalog verbatim.
 const text=long?Array(3).fill(expression.canonical).join(' '):expression.canonical;
 const reply=catalog.expressions.find(e=>!e.isTemplate&&!e.scenarios&&e.tones.includes(tone)&&e.topics.includes('duties'));
 const closing=catalog.expressions.find(e=>e.scenarios?.includes('closing')&&e.tones.includes(tone));
 const messages=[record(expression,'opening',tone,'opening',text),{id:'user',role:'user',kind:'input',text:'Я уже сделал уроки. Можно гулять?',createdAt:now},record(reply,'reply',tone,'reply'),record(closing,'closing',tone,'closing'),{id:'silence',role:'assistant',kind:'silence',text:'(молчит)',expressionIds:[],familyIds:[],createdAt:now}];
 return {schemaVersion:2,nextChatNumber:2,selectedChatId:'fixture',chats:[{id:'fixture',number:1,title:'Новый чат 1',createdAt:now,updatedAt:now,backgroundId:BACKGROUNDS[0].id,messages}]};
}
async function restore(page,value){await page.goto('/');await page.evaluate(({key,value})=>localStorage.setItem(key,JSON.stringify(value)),{key,value});await page.reload();await ready(page);}
async function screenshot(page,testInfo,name){const bytes=await page.screenshot({fullPage:true,animations:'disabled'});await testInfo.attach(name,{body:bytes,contentType:'image/png'});}
for(const width of [360,390,768,1280,1440])for(const tone of ['ironic','strict','sarcastic'])for(const long of [false,true]){
 test(`${width} ${tone} ${long?'long':'short'} opening, roles, history, drawer and background`,async({page},testInfo)=>{
  await page.setViewportSize({width,height:900});const saved=fixture(tone,long);await restore(page,saved);
  await expect(page.locator('.message-speaker')).toHaveText(['Родитель','Ребёнок','Родитель','Родитель','Родитель']);
  const opening=page.locator('[data-kind="opening"]');const size=await opening.locator('.message-body').evaluate(e=>parseFloat(getComputedStyle(e).fontSize));
  expect(size).toBeGreaterThanOrEqual(width<768?25:32);expect(await page.locator('[data-kind="reply"] .message-body').evaluate(e=>parseFloat(getComputedStyle(e).fontSize))).toBeGreaterThanOrEqual(19);
  await expect(opening).toHaveAttribute('data-tone',tone);await expect(page.locator('[data-kind="silence"]')).toHaveAttribute('data-tone','neutral');await expect(page.locator('[data-kind="silence"] button')).toHaveCount(0);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await expect(input(page)).toBeInViewport();
  await expect(page.locator('sov-backdrop')).toHaveAttribute('data-loaded','true');const src=await page.locator('sov-backdrop picture.active img').evaluate(e=>e.currentSrc);expect(src).toContain(width<768?'-mobile.':'-desktop.');
  await page.locator('.conversation-scroll').evaluate(e=>e.scrollTop=0);await screenshot(page,testInfo,'opening.png');
  const trigger=opening.getByRole('button',{name:'О выражении'});await trigger.click();await expect(page.locator('.origin-article')).toHaveCount(1);await expect(page.locator('.origin-article h3')).toHaveText(saved.chats[0].messages[0].text);
  const drawer=page.getByRole('dialog');expect(await drawer.evaluate(e=>e.scrollWidth<=e.clientWidth)).toBe(true);expect(await page.locator('.origin-article p').evaluate(e=>parseFloat(getComputedStyle(e).fontSize))).toBeGreaterThanOrEqual(16);
  await screenshot(page,testInfo,'drawer.png');await page.getByRole('button',{name:'Закрыть',exact:true}).click();await expect(trigger).toBeFocused();
  await input(page).fill('Спасибо, пока');await input(page).press('Enter');await expect(page.locator('.thinking')).toBeHidden();expect(await opening.locator('.message-body').evaluate(e=>parseFloat(getComputedStyle(e).fontSize))).toBe(size);
  await screenshot(page,testInfo,'closing.png');await page.reload();await ready(page);expect(await opening.locator('.message-body').evaluate(e=>parseFloat(getComputedStyle(e).fontSize))).toBe(size);await expect(page.locator('sov-backdrop')).toHaveAttribute('data-background-id',BACKGROUNDS[0].id);
 });
}
test('corrupt records are skipped individually and valid neighbors remain usable',async({page})=>{
 const s=fixture('strict');s.chats[0].messages.splice(1,0,null,{id:'bad',role:'assistant',text:17});s.chats.push({id:'invalid'});await restore(page,s);await expect(page.locator('.message')).toHaveCount(5);await expect(page.locator('.chat-row')).toHaveCount(1);await expect(input(page)).toBeEnabled();
});
test('failed artwork leaves a usable dark chat and does not hide the opening',async({page})=>{
 await page.route('**/assets/backgrounds/**',route=>route.abort());await restore(page,fixture('ironic'));await expect(page.locator('sov-backdrop')).toHaveAttribute('data-loaded','false');await expect(page.locator('[data-kind="opening"]')).toBeVisible();await expect(input(page)).toBeEnabled();await page.getByRole('button',{name:'О выражении'}).first().click();await expect(page.getByRole('dialog')).toBeVisible();
});
test('switching chats preserves opening size and reuses decoded artwork',async({page})=>{
 const requests=[];page.on('request',request=>{if(request.url().includes('/assets/backgrounds/'))requests.push(request.url());});await restore(page,fixture('strict'));await expect(page.locator('sov-backdrop')).toHaveAttribute('data-loaded','true');
 const body=page.locator('[data-kind="opening"] .message-body'),text=await body.innerText(),size=await body.evaluate(e=>getComputedStyle(e).fontSize);
 await page.getByRole('button',{name:'Новый чат',exact:true}).click();await expect(page.locator('sov-backdrop')).toHaveAttribute('data-loaded','true');const count=requests.length;await page.getByRole('button',{name:'Новый чат 1',exact:true}).click();await expect(body).toHaveText(text);expect(await body.evaluate(e=>getComputedStyle(e).fontSize)).toBe(size);expect(requests.length).toBe(count);
});
