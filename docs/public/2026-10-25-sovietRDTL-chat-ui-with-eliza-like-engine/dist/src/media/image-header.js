// Bounded header inspection before asking the browser to allocate decoded pixels.
export function imageHeader(bytes) {
  const b = new Uint8Array(bytes), view = new DataView(b.buffer,b.byteOffset,b.byteLength);
  const ascii = (start,length) => String.fromCharCode(...b.subarray(start,start+length));
  if (b.length >= 24 && [137,80,78,71,13,10,26,10].every((n,i)=>b[i]===n) && ascii(12,4)==='IHDR')
    return {mime:'image/png',width:view.getUint32(16),height:view.getUint32(20)};
  if (b.length >= 10 && ['GIF87a','GIF89a'].includes(ascii(0,6)))
    return {mime:'image/gif',width:view.getUint16(6,true),height:view.getUint16(8,true)};
  if (b.length >= 20 && ascii(0,4)==='RIFF' && ascii(8,4)==='WEBP') {
    for(let i=12;i+8<=b.length;){
      const kind=ascii(i,4),size=view.getUint32(i+4,true),p=i+8;
      if(kind==='VP8X' && p+10<=b.length) return {mime:'image/webp',width:1+b[p+4]+(b[p+5]<<8)+(b[p+6]<<16),height:1+b[p+7]+(b[p+8]<<8)+(b[p+9]<<16)};
      if(kind==='VP8L' && p+5<=b.length && b[p]===47) return {mime:'image/webp',width:1+b[p+1]+((b[p+2]&63)<<8),height:1+(b[p+2]>>6)+(b[p+3]<<2)+((b[p+4]&15)<<10)};
      if(kind==='VP8 ' && p+10<=b.length && b[p+3]===157 && b[p+4]===1 && b[p+5]===42) return {mime:'image/webp',width:view.getUint16(p+6,true)&16383,height:view.getUint16(p+8,true)&16383};
      i=p+size+(size%2);
    }
  }
  if (b.length >= 4 && b[0]===255 && b[1]===216) {
    let i=2;
    while(i+3<b.length){
      if(b[i++]!==255) return null;
      while(b[i]===255)i++;
      const marker=b[i++];
      if(marker===217 || marker===218) break;
      if(marker===1 || (marker>=208&&marker<=215)) continue;
      if(i+2>b.length) break;
      const size=view.getUint16(i);
      if(size<2 || i+size>b.length) break;
      if([192,193,194,195,197,198,199,201,202,203,205,206,207].includes(marker) && size>=8)
        return {mime:'image/jpeg',height:view.getUint16(i+3),width:view.getUint16(i+5)};
      i+=size;
    }
  }
  return null;
}
