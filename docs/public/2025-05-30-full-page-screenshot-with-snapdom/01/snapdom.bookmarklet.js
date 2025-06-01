(function(global){
  
  const style = document.createElement('style');
  style.textContent = `
    /* container */
    #__SnapdomBookmarkletContainer {
      position: fixed;
      top: 20px;
      left: 20px;
      width: 600px;
      max-height: 80vh;
      background: white;
      border: 1px solid #ccc;
      box-shadow: 0 2px 10px rgba(0,0,0,0.3);
      z-index: 2147483647;
      display: flex;
      flex-direction: column;
      font-family: sans-serif;
      font-size: 14px;
      color: #333;
      overflow: hidden;
    }
    /* title bar */
    #__SnapdomBookmarkletContainer .sb-title-bar {
      cursor: move;
      background: #333;
      color: white;
      padding: 8px;
      user-select: none;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    /* content area */
    #__SnapdomBookmarkletContainer .sb-content {
      display: flex;
      flex: 1;
      overflow: auto;
    }
    /* editor pane */
    #__SnapdomBookmarkletContainer .sb-editor {
      flex: 1;
      padding: 8px;
      overflow: auto;
    }
    #__SnapdomBookmarkletContainer .sb-editor [data-snapdom-editor] {
      outline: none;
    }
    /* controls pane */
    #__SnapdomBookmarkletContainer .sb-controls {
      width: 120px;
      border-left: 1px solid #ccc;
      padding: 8px;
      display: flex;
      flex-direction: column;
    }
    #__SnapdomBookmarkletContainer .sb-controls button {
      margin-bottom: 4px;
      width: 100%;
    }
    /* crop overlay */
    #__SnapdomBookmarkletContainer .sb-crop-overlay {
      position: absolute;
      border: 2px dashed #000;
      background: rgba(255,255,255,0.3);
    }
  `;
  document.head.appendChild(style);

  function loadSnapdom(cb) {
    if (global.snapdom) {
      return cb();
    }
    const script = document.createElement('script');
    const base = global.location.origin + global.location.pathname.replace(/[^/]+$/, '');
    script.src = base + 'snapdom.js';
    script.onload = cb;
    document.head.appendChild(script);
  }

  function init() {
    loadSnapdom(() => {
      const container = openEditorWindow();
      const editorDiv = container.querySelector('[data-snapdom-editor]');
      captureAndInsert(editorDiv);
    });
  }

  function openEditorWindow() {
    if (document.getElementById('__SnapdomBookmarkletContainer')) {
      return document.getElementById('__SnapdomBookmarkletContainer');
    }
    const container = document.createElement('div');
    container.id = '__SnapdomBookmarkletContainer';

    const titleBar = document.createElement('div');
    titleBar.className = 'sb-title-bar';
    titleBar.textContent = 'Save Link Snapshot';
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    closeBtn.style.marginLeft = 'auto';
    closeBtn.onclick = () => container.remove();
    titleBar.appendChild(closeBtn);
    container.appendChild(titleBar);

    const content = document.createElement('div');
    content.className = 'sb-content';
    container.appendChild(content);

    const editorPane = document.createElement('div');
    editorPane.className = 'sb-editor';
    editorPane.setAttribute('contenteditable', 'true');
    editorPane.setAttribute('data-snapdom-editor', '');
    const today = new Date().toISOString().split('T')[0];
    const url = location.href;
    const domain = location.hostname;
    editorPane.innerHTML = '<p>' + today + '</p>' +
      '<p><a href="' + url + '">' + url + '</a> {' + domain + '}</p>' +
      '<blockquote></blockquote>';
    content.appendChild(editorPane);

    const controls = document.createElement('div');
    controls.className = 'sb-controls';

    const captureBtn = document.createElement('button');
    captureBtn.textContent = 'Capture';
    captureBtn.onclick = () => captureAndInsert(editorPane);
    controls.appendChild(captureBtn);

    const cropBtn = document.createElement('button');
    cropBtn.textContent = 'Crop';
    cropBtn.onclick = () => {
      const img = editorPane.querySelector('blockquote img');
      if (img) enableCrop(img);
    };
    controls.appendChild(cropBtn);

    const ditherBtn = document.createElement('button');
    ditherBtn.textContent = 'Dither';
    ditherBtn.onclick = () => {
      const img = editorPane.querySelector('blockquote img');
      if (img) applyFilter(img, 'dither');
    };
    controls.appendChild(ditherBtn);

    const copyBtn = document.createElement('button');
    copyBtn.textContent = 'Copy';
    copyBtn.onclick = () => copyContent(editorPane);
    controls.appendChild(copyBtn);

    const closeBtn2 = document.createElement('button');
    closeBtn2.textContent = 'Close';
    closeBtn2.onclick = () => container.remove();
    controls.appendChild(closeBtn2);

    content.appendChild(controls);

    titleBar.addEventListener('mousedown', (e) => {
      e.preventDefault();
      let startX = e.clientX;
      let startY = e.clientY;
      let origX = container.offsetLeft;
      let origY = container.offsetTop;
      function onMouseMove(ev) {
        container.style.left = origX + ev.clientX - startX + 'px';
        container.style.top = origY + ev.clientY - startY + 'px';
      }
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', () => {
        document.removeEventListener('mousemove', onMouseMove);
      }, { once: true });
    });

    document.body.appendChild(container);
    return container;
  }

  async function captureAndInsert(editorDiv) {
    const result = await snapdom.capture(document.documentElement, { scale: 1 });
    const img = result.toImg();
    img.style.width = '100%';
    const blockquote = editorDiv.querySelector('blockquote');
    blockquote.innerHTML = '';
    blockquote.appendChild(img);
  }

  function enableCrop(img) {
    let overlay, startX, startY;
    function onMouseDown(e) {
      e.preventDefault();
      startX = e.clientX;
      startY = e.clientY;
      overlay = document.createElement('div');
      overlay.className = 'sb-crop-overlay';
      overlay.style.left = startX + 'px';
      overlay.style.top = startY + 'px';
      overlay.style.width = '0px';
      overlay.style.height = '0px';
      document.body.appendChild(overlay);
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp, { once: true });
    }
    function onMouseMove(e) {
      const x = Math.min(e.clientX, startX);
      const y = Math.min(e.clientY, startY);
      const w = Math.abs(e.clientX - startX);
      const h = Math.abs(e.clientY - startY);
      overlay.style.left = x + 'px';
      overlay.style.top = y + 'px';
      overlay.style.width = w + 'px';
      overlay.style.height = h + 'px';
    }
    function onMouseUp(e) {
      document.removeEventListener('mousemove', onMouseMove);
      const rect = overlay.getBoundingClientRect();
      const imgRect = img.getBoundingClientRect();
      const scaleX = img.naturalWidth / imgRect.width;
      const scaleY = img.naturalHeight / imgRect.height;
      const sx = (rect.left - imgRect.left) * scaleX;
      const sy = (rect.top - imgRect.top) * scaleY;
      const sw = rect.width * scaleX;
      const sh = rect.height * scaleY;
      const canvas = document.createElement('canvas');
      canvas.width = sw;
      canvas.height = sh;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
      img.src = canvas.toDataURL();
      overlay.remove();
      img.removeEventListener('mousedown', onMouseDown);
    }
    img.addEventListener('mousedown', onMouseDown);
  }

  function applyFilter(img, filterName) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    canvas.width = w;
    canvas.height = h;
    ctx.drawImage(img, 0, 0, w, h);
    const imageData = ctx.getImageData(0, 0, w, h);
    const data = imageData.data;
    if (filterName === 'grayscale') {
      for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i+1] + data[i+2]) / 3;
        data[i] = data[i+1] = data[i+2] = avg;
      }
    }
    if (filterName === 'dither') {
      const palette = [
        [0,0,0],[0,0,170],[0,170,0],[0,170,170],
        [170,0,0],[170,0,170],[170,85,0],[170,170,170],
        [85,85,85],[85,85,255],[85,255,85],[85,255,255],
        [255,85,85],[255,85,255],[255,255,85],[255,255,255]
      ];
      function findNearest(r,g,b){
        let minDist=Infinity, best=[0,0,0];
        for(const c of palette){
          const dr=r-c[0], dg=g-c[1], db=b-c[2];
          const dist=dr*dr+dg*dg+db*db;
          if(dist<minDist){minDist=dist;best=c;}
        }
        return best;
      }
      function clamp(v){return Math.max(0,Math.min(255,v));}
      for(let y=0;y<h;y++){
        for(let x=0;x<w;x++){
          const idx=(y*w+x)*4;
          const oldR=data[idx], oldG=data[idx+1], oldB=data[idx+2];
          const [newR,newG,newB]=findNearest(oldR,oldG,oldB);
          data[idx]=newR; data[idx+1]=newG; data[idx+2]=newB;
          const errR=oldR-newR, errG=oldG-newG, errB=oldB-newB;
          [[1,0,7/16],[-1,1,3/16],[0,1,5/16],[1,1,1/16]].forEach(([dx,dy,f])=>{
            const xx=x+dx, yy=y+dy;
            if(xx>=0&&xx<w&&yy>=0&&yy<h){
              const i=(yy*w+xx)*4;
              data[i]=clamp(data[i]+errR*f);
              data[i+1]=clamp(data[i+1]+errG*f);
              data[i+2]=clamp(data[i+2]+errB*f);
            }
          });
        }
      }
    }
    ctx.putImageData(imageData,0,0);
    img.src = canvas.toDataURL();
  }

  async function copyContent(editorDiv) {
    const html = editorDiv.innerHTML;
    const blob = new Blob([html], { type: 'text/html' });
    await navigator.clipboard.write([new ClipboardItem({ 'text/html': blob })]);
  }

  global.__SnapdomBookmarklet__ = { init };
})(window);