const canonical=document.querySelector('link[rel="canonical"]').href;
const status=document.querySelector('.share-feedback');
function message(text){status.hidden=false;status.textContent=text;}
async function copy(){try{await navigator.clipboard.writeText(canonical);message('Share link copied.');}catch{const field=document.querySelector('.manual-copy');field.hidden=false;field.querySelector('input').select();message('Select and copy the link below.');}}
document.querySelector('[data-copy]').addEventListener('click',copy);
document.querySelector('[data-share]').addEventListener('click',async()=>{
 if(!navigator.share){await copy();return;}
 try{await navigator.share({title:document.title,url:canonical});message('Share sheet opened.');}catch(error){if(error.name==='AbortError')message('Sharing cancelled.');else await copy();}
});
if(location.protocol==='file:')document.querySelector('[data-home]').href='../../../offline.html';
