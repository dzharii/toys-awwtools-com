import{chromium}from'@playwright/test';
import{readFile}from'node:fs/promises';
import{fileURLToPath}from'node:url';
import path from'node:path';
const directory=path.dirname(fileURLToPath(import.meta.url));
const source=(await readFile(path.join(directory,'wood.svg'))).toString('base64');
const browser=await chromium.launch();
try{
 const page=await browser.newPage({viewport:{width:700,height:900},deviceScaleFactor:1});
 await page.setContent(`<html><body style="margin:0"><img width="700" height="900" src="data:image/svg+xml;base64,${source}"></body></html>`);
 await page.locator('img').evaluate(image=>image.decode());
 await page.screenshot({path:path.join(directory,'wood.jpg'),type:'jpeg',quality:94});
}finally{await browser.close();}
console.log('Rasterized the original wood engraving for inexpensive browser repainting.');
