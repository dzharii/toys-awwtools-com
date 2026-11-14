import {readFileSync,writeFileSync} from 'node:fs';
const origin='https://clearpick-practice.mach1ne.chatgpt.site';
const source=readFileSync('bookmarklet.js','utf8');
const code=`(${source})(${JSON.stringify(origin)})`;
const bookmarklet='javascript:'+encodeURIComponent('void '+code);
writeFileSync('dist/bookmarklet.txt',bookmarklet);
writeFileSync('dist/bookmarklet-link.js','export default '+JSON.stringify(bookmarklet)+';\n');
