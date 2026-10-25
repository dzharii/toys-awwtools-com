// Reject playlist/text inputs before handing a local URL to a native demuxer.
export function supportedAudioHeader(bytes) {
  const b=new Uint8Array(bytes),ascii=(p,n)=>String.fromCharCode(...b.subarray(p,p+n));
  return (b.length>=12&&ascii(0,4)==='RIFF'&&ascii(8,4)==='WAVE')
    || (b.length>=4&&['OggS','fLaC','.snd'].includes(ascii(0,4)))
    || (b.length>=4&&[26,69,223,163].every((v,i)=>b[i]===v))
    || (b.length>=8&&ascii(4,4)==='ftyp')
    || (b.length>=3&&ascii(0,3)==='ID3')
    || (b.length>=2&&b[0]===255&&(b[1]&224)===224)
    || (b.length>=6&&ascii(0,6)==='#!AMR\n')
    || (b.length>=12&&ascii(0,4)==='FORM'&&['AIFF','AIFC'].includes(ascii(8,4)));
}
