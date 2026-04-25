var x="0.1.0",a={desktopRoot:"awwbookmarklet-desktop-root",window:"awwbookmarklet-window",menubar:"awwbookmarklet-menubar",menu:"awwbookmarklet-menu",button:"awwbookmarklet-button",iconButton:"awwbookmarklet-icon-button",input:"awwbookmarklet-input",textarea:"awwbookmarklet-textarea",checkbox:"awwbookmarklet-checkbox",radio:"awwbookmarklet-radio",select:"awwbookmarklet-select",range:"awwbookmarklet-range",progress:"awwbookmarklet-progress",tabs:"awwbookmarklet-tabs",tabPanel:"awwbookmarklet-tab-panel",listbox:"awwbookmarklet-listbox",group:"awwbookmarklet-group",panel:"awwbookmarklet-panel",statusbar:"awwbookmarklet-statusbar",appShell:"awwbookmarklet-app-shell",toolbar:"awwbookmarklet-toolbar",field:"awwbookmarklet-field",statusLine:"awwbookmarklet-status-line",alert:"awwbookmarklet-alert",dialog:"awwbookmarklet-dialog",toast:"awwbookmarklet-toast",emptyState:"awwbookmarklet-empty-state",stateOverlay:"awwbookmarklet-state-overlay",list:"awwbookmarklet-list",listItem:"awwbookmarklet-list-item",card:"awwbookmarklet-card",richPreview:"awwbookmarklet-rich-preview",browserPanel:"awwbookmarklet-browser-panel",manualCopy:"awwbookmarklet-manual-copy",commandPalette:"awwbookmarklet-command-palette",shortcutHelp:"awwbookmarklet-shortcut-help",urlPicker:"awwbookmarklet-url-picker",metricCard:"awwbookmarklet-metric-card"},k={rootsByVersion:Symbol.for("awwtools.bookmarkletUi.overlayRootsByVersion"),lastAcquiredRoot:Symbol.for("awwtools.bookmarkletUi.lastAcquiredRoot"),version:Symbol.for("awwtools.bookmarkletUi.frameworkVersion")},B=2147481000,c={workspaceBg:"--awwbookmarklet-workspace-bg",windowBg:"--awwbookmarklet-window-bg",panelBg:"--awwbookmarklet-panel-bg",titlebarActiveBg:"--awwbookmarklet-titlebar-active-bg",titlebarInactiveBg:"--awwbookmarklet-titlebar-inactive-bg",titlebarFg:"--awwbookmarklet-titlebar-fg",borderStrong:"--awwbookmarklet-border-strong",borderSubtle:"--awwbookmarklet-border-subtle",focusRing:"--awwbookmarklet-focus-ring",buttonBg:"--awwbookmarklet-button-bg",buttonFg:"--awwbookmarklet-button-fg",buttonActiveBg:"--awwbookmarklet-button-active-bg",inputBg:"--awwbookmarklet-input-bg",inputFg:"--awwbookmarklet-input-fg",menuBg:"--awwbookmarklet-menu-bg",menuFg:"--awwbookmarklet-menu-fg",selectionBg:"--awwbookmarklet-selection-bg",selectionFg:"--awwbookmarklet-selection-fg",statusbarBg:"--awwbookmarklet-statusbar-bg",appShellBg:"--awwbookmarklet-app-shell-bg",surfaceRaisedBg:"--awwbookmarklet-surface-raised-bg",surfaceInsetBg:"--awwbookmarklet-surface-inset-bg",textMuted:"--awwbookmarklet-text-muted",textHelp:"--awwbookmarklet-text-help",dividerColor:"--awwbookmarklet-divider-color",infoBg:"--awwbookmarklet-info-bg",infoFg:"--awwbookmarklet-info-fg",infoBorder:"--awwbookmarklet-info-border",successBg:"--awwbookmarklet-success-bg",successFg:"--awwbookmarklet-success-fg",successBorder:"--awwbookmarklet-success-border",warningBg:"--awwbookmarklet-warning-bg",warningFg:"--awwbookmarklet-warning-fg",warningBorder:"--awwbookmarklet-warning-border",dangerBg:"--awwbookmarklet-danger-bg",dangerFg:"--awwbookmarklet-danger-fg",dangerBorder:"--awwbookmarklet-danger-border",overlayBackdrop:"--awwbookmarklet-overlay-backdrop",overlayShadow:"--awwbookmarklet-overlay-shadow",cardBg:"--awwbookmarklet-card-bg",cardSelectedBg:"--awwbookmarklet-card-selected-bg",metricBg:"--awwbookmarklet-metric-bg",codeBg:"--awwbookmarklet-code-bg",codeFg:"--awwbookmarklet-code-fg",shadowDepth:"--awwbookmarklet-shadow-depth",frostOpacity:"--awwbookmarklet-frost-opacity",space1:"--awwbookmarklet-space-1",space2:"--awwbookmarklet-space-2",space3:"--awwbookmarklet-space-3",controlHeight:"--awwbookmarklet-size-control-h",titleHeight:"--awwbookmarklet-size-title-h"},v={minWidth:320,minHeight:200,minVisibleTitlebar:36,spawnWidth:520,spawnHeight:420,spawnX:60,spawnY:60,cascadeStep:28};function Ct(t,e){if(!customElements.get(t))customElements.define(t,e)}function Dt(t){for(let[e,o]of t)Ct(e,o)}var le=typeof ShadowRoot<"u"&&"adoptedStyleSheets"in ShadowRoot.prototype&&typeof CSSStyleSheet<"u"&&"replaceSync"in CSSStyleSheet.prototype,zt=new Map,_t=new Map;function de(t){let e=0;for(let o=0;o<t.length;o+=1)e=e*31+t.charCodeAt(o)|0;return`s${Math.abs(e)}`}function ce(t){let e=zt.get(t);if(!e)e=new CSSStyleSheet,e.replaceSync(t),zt.set(t,e);return e}function he(t,e){let o=de(e);if(t.querySelector(`style[data-aww-style='${o}']`))return;let r=document.createElement("style");r.dataset.awwStyle=o,r.textContent=e,t.append(r)}function l(t,e){if(le){let r=[...t.adoptedStyleSheets];for(let i of e){let n=ce(i);if(!r.includes(n))r.push(n)}t.adoptedStyleSheets=r;return}for(let o of e)he(t,o)}function s(t,...e){let o="";for(let r=0;r<t.length;r+=1)if(o+=t[r],r<e.length)o+=String(e[r]??"");if(!_t.has(o))_t.set(o,o);return _t.get(o)}var d=s`
  @layer reset, tokens, base, components, states, utilities;

  @layer reset {
    :host {
      box-sizing: border-box;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      font-size: 13px;
      color: var(--awwbookmarklet-input-fg, #111720);
      text-rendering: optimizeLegibility;
    }

    *,
    *::before,
    *::after {
      box-sizing: inherit;
    }
  }

  @layer base {
    :host([hidden]) {
      display: none !important;
    }

    :host {
      --_ring: 0 0 0 2px var(--awwbookmarklet-focus-ring, #154fbc);
    }

    ::selection {
      background: var(--awwbookmarklet-selection-bg, #1f5eae);
      color: var(--awwbookmarklet-selection-fg, #f2f8ff);
    }
  }
`;var be=s`
  :host {
    position: fixed;
    inset: 0;
    z-index: ${B};
    pointer-events: none;
    display: block;
    contain: layout style;
    background: var(--awwbookmarklet-workspace-bg, transparent);
  }

  #layer {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  ::slotted(awwbookmarklet-window),
  ::slotted(awwbookmarklet-menubar),
  ::slotted(awwbookmarklet-menu) {
    pointer-events: auto;
  }
`;class O extends HTMLElement{constructor(){super();let t=this.attachShadow({mode:"open"});l(t,[d,be]),t.innerHTML=`
      <div id="layer" part="layer">
        <slot></slot>
      </div>
    `}}function L(){if(window.visualViewport)return{x:window.visualViewport.offsetLeft,y:window.visualViewport.offsetTop,width:window.visualViewport.width,height:window.visualViewport.height};return{x:0,y:0,width:window.innerWidth,height:window.innerHeight}}function A(t,e=L(),o=v){let r=o.minWidth??v.minWidth,i=o.minHeight??v.minHeight,n=o.minVisibleTitlebar??v.minVisibleTitlebar,h=Math.min(r,e.width),u=Math.min(i,e.height),p=Math.max(h,Math.min(t.width,e.width)),m=Math.max(u,Math.min(t.height,e.height)),M=e.x+e.width-n,S=e.x-p+n,y=e.y+e.height-n,b=Math.min(Math.max(t.x,S),M),f=Math.min(Math.max(t.y,e.y),y);return{x:b,y:f,width:p,height:m}}function q(t,e,o){return Math.max(Math.min(e,o),Math.min(t,o))}function Nt(t,e,o,r,i=L(),n=v){let h=n.minWidth??v.minWidth,u=n.minHeight??v.minHeight,p=Math.min(h,i.width),m=Math.min(u,i.height),M=t.x+t.width,S=t.y+t.height,y=t.x,b=t.y,f=t.width,T=t.height;if(e.includes("e"))f=q(t.width+o,p,i.width);if(e.includes("s"))T=q(t.height+r,m,i.height);if(e.includes("w"))f=q(t.width-o,p,i.width),y=M-f;if(e.includes("n"))T=q(t.height-r,m,i.height),b=S-T;return A({x:y,y:b,width:f,height:T},i,n)}function Bt(t=0,e=L(),o=v){let r=Math.min(o.spawnWidth,e.width-12),i=Math.min(o.spawnHeight,e.height-12),n={x:e.x+o.spawnX+t*o.cascadeStep,y:e.y+o.spawnY+t*o.cascadeStep,width:r,height:i};return A(n,e,o)}function H(t){return{left:`${Math.round(t.x)}px`,top:`${Math.round(t.y)}px`,width:`${Math.round(t.width)}px`,height:`${Math.round(t.height)}px`}}var ue=s`
  :host {
    position: fixed;
    display: block;
    pointer-events: auto;
    contain: layout style;
    border: 1px solid var(--awwbookmarklet-border-strong, #232a33);
    background: var(--awwbookmarklet-window-bg, #eef1f5);
    box-shadow: var(--awwbookmarklet-shadow-depth, 0 12px 32px rgba(0, 0, 0, 0.18));
    border-radius: 0;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
    color: var(--awwbookmarklet-input-fg, #111720);
    will-change: transform;
  }

  :host([data-active="false"]) {
    filter: saturate(0.88);
  }

  .shell {
    position: absolute;
    inset: 0;
    display: grid;
    grid-template-rows: auto auto auto 1fr auto;
  }

  .titlebar {
    min-height: var(--awwbookmarklet-size-title-h, 32px);
    display: grid;
    grid-template-columns: 28px 1fr auto;
    align-items: center;
    gap: 6px;
    padding: 0 6px;
    background: linear-gradient(180deg, #f7f9fb, var(--awwbookmarklet-titlebar-active-bg, #dce2e9));
    color: var(--awwbookmarklet-titlebar-fg, #121820);
    border-bottom: 1px solid var(--awwbookmarklet-border-strong, #232a33);
    cursor: grab;
    user-select: none;
  }

  :host([data-active="false"]) .titlebar {
    background: linear-gradient(180deg, #eef2f6, var(--awwbookmarklet-titlebar-inactive-bg, #cfd5dd));
  }

  .system-menu-button,
  .window-command-button {
    border: 1px solid var(--awwbookmarklet-border-subtle, #9ba5b3);
    border-radius: 0;
    background: #edf1f5;
    box-shadow: inset 1px 1px 0 #ffffff, inset -1px -1px 0 #a8b0ba;
    color: inherit;
    height: 22px;
    min-width: 22px;
    padding: 0 4px;
    font: inherit;
    line-height: 1;
  }

  .system-menu-button:focus-visible,
  .window-command-button:focus-visible {
    outline: none;
    box-shadow: var(--_ring);
  }

  .system-menu-button:active,
  .window-command-button:active {
    background: var(--awwbookmarklet-button-active-bg, #d8dee6);
    box-shadow: inset 1px 1px 0 #8e98a4, inset -1px -1px 0 #ffffff;
  }

  .title {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    font-weight: 600;
  }

  .title-commands {
    display: flex;
    gap: 4px;
  }

  .region {
    display: block;
    border-bottom: 1px solid var(--awwbookmarklet-border-subtle, #9ba5b3);
  }

  .region[hidden] {
    display: none;
  }

  .body {
    overflow: auto;
    padding: var(--awwbookmarklet-space-3, 12px);
    background: var(--awwbookmarklet-window-bg, #eef1f5);
    min-height: 0;
  }

  .status {
    border-top: 1px solid var(--awwbookmarklet-border-subtle, #9ba5b3);
    border-bottom: 0;
  }

  .resize-handle {
    position: absolute;
    pointer-events: auto;
  }

  .resize-handle[data-edge="n"] { inset: -4px 8px auto; height: 8px; cursor: ns-resize; }
  .resize-handle[data-edge="s"] { inset: auto 8px -4px; height: 8px; cursor: ns-resize; }
  .resize-handle[data-edge="e"] { inset: 8px -4px 8px auto; width: 8px; cursor: ew-resize; }
  .resize-handle[data-edge="w"] { inset: 8px auto 8px -4px; width: 8px; cursor: ew-resize; }
  .resize-handle[data-edge="ne"] { inset: -4px -4px auto auto; width: 10px; height: 10px; cursor: nesw-resize; }
  .resize-handle[data-edge="nw"] { inset: -4px auto auto -4px; width: 10px; height: 10px; cursor: nwse-resize; }
  .resize-handle[data-edge="se"] { inset: auto -4px -4px auto; width: 10px; height: 10px; cursor: nwse-resize; }
  .resize-handle[data-edge="sw"] { inset: auto auto -4px -4px; width: 10px; height: 10px; cursor: nesw-resize; }
`;function pe(t){return t?.dataset?.edge||""}function Vt(t){return t.button===0}class $ extends HTMLElement{static observedAttributes=["title","closable"];#t=null;#e=null;#o=null;#r=null;#a=0;constructor(){super();let t=this.attachShadow({mode:"open"});l(t,[d,ue]),t.innerHTML=`
      <div class="shell" part="shell" role="dialog" aria-label="Bookmarklet window">
        <div class="titlebar" part="titlebar">
          <button class="system-menu-button" part="system-menu-button" type="button" aria-label="System menu">◫</button>
          <div class="title" part="title"></div>
          <div class="title-commands" part="title-commands">
            <button class="window-command-button close" part="close-button" type="button" aria-label="Close">×</button>
          </div>
        </div>
        <div class="region menubar" part="menubar-region" hidden><slot name="menubar"></slot></div>
        <div class="region toolbar" part="toolbar-region" hidden><slot name="toolbar"></slot></div>
        <div class="body" part="body"><slot></slot></div>
        <div class="region status" part="statusbar-region" hidden><slot name="statusbar"></slot></div>

        <div class="resize-handle" data-edge="n"></div>
        <div class="resize-handle" data-edge="s"></div>
        <div class="resize-handle" data-edge="e"></div>
        <div class="resize-handle" data-edge="w"></div>
        <div class="resize-handle" data-edge="ne"></div>
        <div class="resize-handle" data-edge="nw"></div>
        <div class="resize-handle" data-edge="se"></div>
        <div class="resize-handle" data-edge="sw"></div>
      </div>
    `,this.#i()}connectedCallback(){if(!this.#t)this.#t={x:72,y:72,width:520,height:420},this.#d(this.#t);this.setAttribute("data-active",this.getAttribute("data-active")??"true"),this.#l(),this.#s(),this.#n();let t=this.closest("awwbookmarklet-desktop-root");this.#e=t?.__awwManager??null,this.#e?.register(this),this.addEventListener("pointerdown",this.#c)}disconnectedCallback(){this.#e?.unregister(this),this.#e=null,this.removeEventListener("pointerdown",this.#c),this.#f(),this.dispatchEvent(new CustomEvent("awwbookmarklet-window-disconnected"))}attributeChangedCallback(t){if(t==="title")this.#l();if(t==="closable")this.#s()}getRect(){return this.#t?{...this.#t}:null}setRect(t){this.#t=A(t),this.#d(this.#t)}setActive(t){this.setAttribute("data-active",String(Boolean(t)))}setZIndex(t){this.style.zIndex=String(t)}requestClose(){if(!this.isClosable())return;if(!this.dispatchEvent(new CustomEvent("awwbookmarklet-window-close-request",{bubbles:!0,composed:!0,cancelable:!0})))return;this.remove(),this.dispatchEvent(new CustomEvent("awwbookmarklet-window-closed",{bubbles:!0,composed:!0}))}isClosable(){let t=this.getAttribute("closable");return t===null?!0:t!=="false"}#i(){let t=this.shadowRoot,e=t.querySelector(".titlebar"),o=t.querySelector(".system-menu-button"),r=t.querySelector(".close");e.addEventListener("pointerdown",this.#g),o.addEventListener("click",this.#h),o.addEventListener("dblclick",this.#b),o.addEventListener("keydown",this.#u),r.addEventListener("click",()=>this.requestClose());for(let i of t.querySelectorAll(".resize-handle"))i.addEventListener("pointerdown",this.#p);for(let i of["menubar","toolbar","statusbar"])t.querySelector(`slot[name='${i}']`).addEventListener("slotchange",()=>this.#n())}#l(){let t=this.getAttribute("title")||"AWW Tool";this.shadowRoot.querySelector(".title").textContent=t,this.shadowRoot.querySelector(".shell").setAttribute("aria-label",t)}#s(){this.shadowRoot.querySelector(".close").disabled=!this.isClosable()}#n(){let t=this.shadowRoot,e=(o)=>t.querySelector(`slot[name='${o}']`).assignedElements({flatten:!0}).length>0;t.querySelector(".menubar").hidden=!e("menubar"),t.querySelector(".toolbar").hidden=!e("toolbar"),t.querySelector(".status").hidden=!e("statusbar")}#d(t){Object.assign(this.style,H(t))}#c=()=>{this.#e?.focus(this)};#h=(t)=>{t.stopPropagation(),this.dispatchEvent(new CustomEvent("awwbookmarklet-window-system-menu",{bubbles:!0,composed:!0,detail:{anchor:this.shadowRoot.querySelector(".system-menu-button")}}))};#b=(t)=>{t.stopPropagation(),this.requestClose()};#u=(t)=>{if(t.key==="Enter"||t.key===" ")t.preventDefault(),this.#h(t)};#g=(t)=>{if(!Vt(t))return;if(t.target.closest("button"))return;t.preventDefault(),this.#e?.focus(this),this.#o={startX:t.clientX,startY:t.clientY,currentX:t.clientX,currentY:t.clientY,startRect:this.getRect(),pointerId:t.pointerId,target:t.currentTarget},this.shadowRoot.querySelector(".titlebar").style.cursor="grabbing",this.#w(t.currentTarget,t.pointerId)};#p=(t)=>{if(!Vt(t))return;t.preventDefault();let e=pe(t.currentTarget);if(!e)return;this.#e?.focus(this),this.#r={edge:e,startX:t.clientX,startY:t.clientY,currentX:t.clientX,currentY:t.clientY,startRect:this.getRect(),previewRect:this.getRect(),pointerId:t.pointerId,target:t.currentTarget},this.#w(t.currentTarget,t.pointerId)};#w(t,e){try{t.setPointerCapture?.(e)}catch{}window.addEventListener("pointermove",this.#k,{passive:!0}),window.addEventListener("pointerup",this.#m),window.addEventListener("pointercancel",this.#m)}#f(){let t=this.#o||this.#r;if(window.removeEventListener("pointermove",this.#k),window.removeEventListener("pointerup",this.#m),window.removeEventListener("pointercancel",this.#m),t?.target?.hasPointerCapture?.(t.pointerId))try{t.target.releasePointerCapture(t.pointerId)}catch{}if(this.#a)cancelAnimationFrame(this.#a),this.#a=0;this.style.transform="",this.shadowRoot.querySelector(".titlebar").style.cursor="grab"}#k=(t)=>{if(this.#o){if(t.pointerId!==this.#o.pointerId)return;this.#o.currentX=t.clientX,this.#o.currentY=t.clientY,this.#v();return}if(this.#r){if(t.pointerId!==this.#r.pointerId)return;this.#r.currentX=t.clientX,this.#r.currentY=t.clientY,this.#v()}};#m=(t)=>{let e=this.#o||this.#r;if(e&&t.pointerId!==e.pointerId)return;if(e?.target?.hasPointerCapture?.(e.pointerId))try{e.target.releasePointerCapture(e.pointerId)}catch{}if(this.#o){let o=this.#o.currentX-this.#o.startX,r=this.#o.currentY-this.#o.startY;this.style.transform="",this.setRect({...this.#o.startRect,x:this.#o.startRect.x+o,y:this.#o.startRect.y+r}),this.#o=null}if(this.#r)this.style.transform="",this.setRect(this.#r.previewRect),this.#r=null;this.#f()};#v(){if(this.#a)return;this.#a=requestAnimationFrame(()=>{if(this.#a=0,this.#o)this.#x();if(this.#r)this.#y()})}#x(){let t=this.#o.currentX-this.#o.startX,e=this.#o.currentY-this.#o.startY;this.style.transform=`translate3d(${t}px, ${e}px, 0)`}#y(){let{edge:t,startRect:e,startX:o,startY:r,currentX:i,currentY:n}=this.#r,h=i-o,u=n-r,p=Nt(e,t,h,u);this.#r.previewRect=p,Object.assign(this.style,H(p))}}class _{#t=new Map;register(t){if(!t?.id||typeof t.run!=="function")throw TypeError("Command must include stable id and run(context)");return this.#t.set(t.id,t),()=>this.#t.delete(t.id)}has(t){return this.#t.has(t)}resolve(t){return this.#t.get(t)??null}isEnabled(t,e={}){let o=this.resolve(t);if(!o)return!1;return typeof o.isEnabled==="function"?o.isEnabled(e):!0}isChecked(t,e={}){let o=this.resolve(t);if(!o)return!1;return typeof o.isChecked==="function"?o.isChecked(e):!1}run(t,e={}){let o=this.resolve(t);if(!o||!this.isEnabled(t,e))return!1;return o.run(e),!0}toJSON(t={}){return[...this.#t.values()].map((e)=>({id:e.id,label:e.label??e.id,shortcut:e.shortcut??"",enabled:typeof e.isEnabled==="function"?e.isEnabled(t):!0,checked:typeof e.isChecked==="function"?e.isChecked(t):!1}))}}var we=s`
  :host {
    display: block;
    pointer-events: auto;
    background: color-mix(in srgb, var(--awwbookmarklet-panel-bg, #f8fafc) 85%, #d8dee7 15%);
    padding: 2px;
  }

  #bar {
    display: flex;
    gap: 2px;
    align-items: center;
    min-height: 28px;
  }

  ::slotted([data-menu]) {
    height: 24px;
    border: 1px solid transparent;
    background: transparent;
    font: inherit;
    padding: 0 8px;
    border-radius: 0;
    color: inherit;
  }

  ::slotted([data-menu]:focus-visible),
  ::slotted([data-menu][data-open="true"]),
  ::slotted([data-menu]:hover) {
    outline: none;
    border-color: var(--awwbookmarklet-border-strong, #232a33);
    background: var(--awwbookmarklet-button-bg, #f1f4f8);
  }
`;class R extends HTMLElement{#t=[];#e=new Map;#o=new WeakSet;#r=-1;#a="";#i=null;constructor(){super();this.commandRegistry=new _;let t=this.attachShadow({mode:"open"});l(t,[d,we]),t.innerHTML='<div id="bar" role="menubar" part="bar"><slot></slot></div>',t.querySelector("slot").addEventListener("slotchange",()=>this.#l()),this.addEventListener("keydown",this.#h),this.addEventListener("click",this.#c)}connectedCallback(){this.#l(),document.addEventListener("pointerdown",this.#u,!0),this.#i=this.closest("awwbookmarklet-window"),this.#i?.addEventListener("awwbookmarklet-window-system-menu",this.#p)}disconnectedCallback(){document.removeEventListener("pointerdown",this.#u,!0),this.#i?.removeEventListener("awwbookmarklet-window-system-menu",this.#p),this.#i=null,this.closeAllMenus()}openFirstMenu(){if(!this.#t.length)return;this.#n(0),this.#s(this.#t[0],!0)}closeAllMenus(){for(let t of this.#e.values())t.close();for(let t of this.#t)delete t.dataset.open;this.#a=""}#l(){let t=[...this.children],e=[...this.#e.entries()].filter(([,o])=>o.isConnected&&o.parentNode!==this);this.#t=t.filter((o)=>o.hasAttribute("data-menu")),this.#e=new Map(e);for(let o of t.filter((r)=>r.tagName.toLowerCase()==="awwbookmarklet-menu")){let r=o.getAttribute("name")||"";if(r)this.#e.set(r,o),this.#w(o)}if(this.#t.forEach((o,r)=>{o.setAttribute("role","menuitem"),o.tabIndex=r===this.#r?0:-1}),this.#t.length&&this.#r===-1)this.#n(0)}#s(t,e=!1){let o=t.getAttribute("data-menu"),r=this.#e.get(o);if(!r)return;this.closeAllMenus(),t.dataset.open="true";let i=this.closest("awwbookmarklet-window")?.closest("awwbookmarklet-desktop-root");if(r.portalTo(i),r.openAtViewportRect(t.getBoundingClientRect()),this.#a=o,e)r.focusFirst()}#n(t){if(!this.#t.length)return;this.#r=(t+this.#t.length)%this.#t.length,this.#t.forEach((e,o)=>{e.tabIndex=o===this.#r?0:-1}),this.#t[this.#r].focus()}#d(t){if(this.#n(this.#r+t),this.#a){let e=this.#t[this.#r];this.#s(e,!0)}}#c=(t)=>{let e=t.target.closest("[data-menu]");if(!e||!this.contains(e))return;if(e.dataset.open==="true"){this.closeAllMenus();return}this.#n(this.#t.indexOf(e)),this.#s(e,!0)};#h=(t)=>{if(!this.#t.length)return;if(["ArrowRight","ArrowLeft"].includes(t.key)){t.preventDefault(),this.#d(t.key==="ArrowRight"?1:-1);return}if(["Enter"," ","ArrowDown"].includes(t.key)){t.preventDefault(),this.#s(this.#t[this.#r],!0);return}if(t.key==="Escape")t.preventDefault(),this.closeAllMenus()};#b=()=>{if(this.closeAllMenus(),this.#r>=0)this.#t[this.#r]?.focus()};#u=(t)=>{let e=t.target,o=[...this.#e.values()].some((r)=>r.contains(e));if(!this.contains(e)&&!o)this.closeAllMenus()};#g=(t)=>{let e=t.detail?.commandId;if(!e)return;this.commandRegistry.run(e,{menubar:this,trigger:t.detail.source})};#p=()=>{this.openFirstMenu()};#w(t){if(this.#o.has(t))return;this.#o.add(t),t.addEventListener("awwbookmarklet-menu-dismiss",this.#b),t.addEventListener("awwbookmarklet-menu-select",this.#b),t.addEventListener("awwbookmarklet-command",this.#g)}}var me=s`
  :host {
    position: fixed;
    display: none;
    min-width: 200px;
    pointer-events: auto;
    background: var(--awwbookmarklet-menu-bg, #f8fbff);
    border: 1px solid var(--awwbookmarklet-border-strong, #232a33);
    box-shadow: var(--awwbookmarklet-shadow-depth, 0 10px 20px rgba(0, 0, 0, 0.18));
    padding: 4px;
    z-index: 999999;
  }

  :host([open]) { display: block; }

  #panel {
    display: grid;
    gap: 2px;
    max-height: min(60vh, 420px);
    overflow: auto;
  }

  ::slotted([data-separator]),
  ::slotted([role="separator"]) {
    display: block;
    border-top: 1px solid var(--awwbookmarklet-border-subtle, #9ba5b3);
    margin: 4px 2px;
    padding: 0;
    min-height: 0;
    height: 0;
  }

  ::slotted(button),
  ::slotted([role="menuitem"]) {
    height: 29px;
    border: 1px solid transparent;
    background: transparent;
    color: var(--awwbookmarklet-menu-fg, #0e1621);
    text-align: left;
    padding: 0 8px;
    font: inherit;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    border-radius: 0;
  }

  ::slotted(button:hover),
  ::slotted([role="menuitem"]:hover),
  ::slotted(button[data-highlighted="true"]),
  ::slotted([role="menuitem"][data-highlighted="true"]) {
    border-color: var(--awwbookmarklet-border-strong, #232a33);
    background: var(--awwbookmarklet-selection-bg, #1f5eae);
    color: var(--awwbookmarklet-selection-fg, #f2f8ff);
  }

  ::slotted([disabled]),
  ::slotted([aria-disabled="true"]) {
    opacity: 0.5;
    pointer-events: none;
  }
`;function Ut(t){return t.hasAttribute("data-separator")||t.getAttribute("role")==="separator"}function Ft(t){return!Ut(t)&&!t.hasAttribute("disabled")&&t.getAttribute("aria-disabled")!=="true"}class I extends HTMLElement{#t=-1;#e="";#o=0;#r=null;#a=null;constructor(){super();let t=this.attachShadow({mode:"open"});l(t,[d,me]),t.innerHTML='<div id="panel" part="panel" role="menu"><slot></slot></div>',this.addEventListener("keydown",this.#s),this.addEventListener("click",this.#l),t.querySelector("slot").addEventListener("slotchange",()=>this.#i())}connectedCallback(){this.hidden=!1,this.setAttribute("aria-hidden",this.hasAttribute("open")?"false":"true"),this.#i()}disconnectedCallback(){clearTimeout(this.#o)}getItems(){return[...this.children].filter(Ft)}portalTo(t){if(!t||this.parentNode===t)return;if(!this.#r)this.#r=this.parentNode,this.#a=this.nextSibling;t.append(this)}restorePortal(){if(!this.#r)return;let t=this.#r,e=this.#a?.parentNode===t?this.#a:null;if(this.#r=null,this.#a=null,t.isConnected)t.insertBefore(this,e)}openAtViewportRect(t){this.style.left="-9999px",this.style.top="-9999px",this.setAttribute("open","");let e=Math.max(200,this.offsetWidth||220),o=window.visualViewport,r=o?.offsetLeft??0,i=o?.offsetTop??0,n=o?.width??window.innerWidth,h=o?.height??window.innerHeight,u=this.offsetHeight||Math.min(h*0.5,240),p=t.left,m=t.bottom+2;if(p+e>r+n-6)p=r+n-e-6;if(m+u>i+h-6)m=Math.max(i+6,t.top-u-2);this.style.left=`${Math.max(r+6,p)}px`,this.style.top=`${Math.max(i+6,m)}px`,this.setAttribute("aria-hidden","false"),this.#t=-1}close(){this.removeAttribute("open"),this.setAttribute("aria-hidden","true"),this.#n(-1),this.restorePortal()}focusFirst(){let t=this.getItems();if(t.length===0)return;this.#n(0),t[0].focus()}#i(){for(let t of this.children){if(Ut(t))continue;if(!t.hasAttribute("role"))t.setAttribute("role","menuitem");t.tabIndex=-1}}#l=(t)=>{let e=t.target.closest("[role='menuitem']");if(!e||!Ft(e))return;let o=e.getAttribute("data-command")||"";if(o)this.dispatchEvent(new CustomEvent("awwbookmarklet-command",{bubbles:!0,composed:!0,detail:{commandId:o,source:e}}));this.dispatchEvent(new CustomEvent("awwbookmarklet-menu-select",{bubbles:!0,composed:!0}))};#s=(t)=>{let e=this.getItems();if(!e.length)return;if(t.key==="ArrowDown"){t.preventDefault();let o=(this.#t+1+e.length)%e.length;this.#n(o),e[o].focus();return}if(t.key==="ArrowUp"){t.preventDefault();let o=(this.#t-1+e.length)%e.length;this.#n(o),e[o].focus();return}if(t.key==="Home"){t.preventDefault(),this.#n(0),e[0].focus();return}if(t.key==="End"){t.preventDefault();let o=e.length-1;this.#n(o),e[o].focus();return}if(t.key==="Escape"){t.preventDefault(),this.dispatchEvent(new CustomEvent("awwbookmarklet-menu-dismiss",{bubbles:!0,composed:!0}));return}if(t.key.length===1&&/\S/.test(t.key)){this.#e+=t.key.toLowerCase(),clearTimeout(this.#o),this.#o=setTimeout(()=>{this.#e=""},450);let o=e.findIndex((r)=>r.textContent.trim().toLowerCase().startsWith(this.#e));if(o!==-1)this.#n(o),e[o].focus()}if(t.key==="Enter"||t.key===" "){let o=e[this.#t];if(!o)return;t.preventDefault(),o.click()}};#n(t){let e=this.getItems();this.#t=t,e.forEach((o,r)=>{if(r===t)o.dataset.highlighted="true";else delete o.dataset.highlighted})}}var ge=s`
  :host { display: inline-block; }

  button {
    min-height: var(--awwbookmarklet-size-control-h, 30px);
    min-width: 72px;
    border: 1px solid var(--awwbookmarklet-border-strong, #232a33);
    border-radius: 0;
    background: linear-gradient(180deg, color-mix(in srgb, var(--awwbookmarklet-button-bg, #f1f4f8) 92%, #ffffff 8%), var(--awwbookmarklet-button-bg, #f1f4f8));
    color: var(--awwbookmarklet-button-fg, #111720);
    box-shadow: inset 1px 1px 0 #ffffff, inset -1px -1px 0 var(--awwbookmarklet-border-subtle, #9ba5b3);
    padding: 0 12px;
    font: inherit;
    line-height: 1;
  }

  button:hover { background: color-mix(in srgb, var(--awwbookmarklet-button-bg, #f1f4f8) 86%, #ffffff 14%); }
  button:active { background: var(--awwbookmarklet-button-active-bg, #dbe3ee); }
  button:focus-visible { outline: none; box-shadow: var(--_ring); }
  button:disabled { opacity: 0.55; cursor: not-allowed; }

  :host([variant="primary"]) button {
    background: var(--awwbookmarklet-selection-bg, #1f5eae);
    color: var(--awwbookmarklet-selection-fg, #f2f8ff);
    box-shadow: inset 1px 1px 0 color-mix(in srgb, var(--awwbookmarklet-selection-bg, #1f5eae) 68%, #ffffff 32%), inset -1px -1px 0 color-mix(in srgb, var(--awwbookmarklet-selection-bg, #1f5eae) 72%, #000000 28%);
  }

  :host([variant="ghost"]) button {
    background: transparent;
  }

  :host([variant="link"]) button {
    min-width: 0;
    border-color: transparent;
    background: transparent;
    color: var(--awwbookmarklet-info-fg, #123d7a);
    text-decoration: underline;
    padding-inline: 4px;
  }

  :host([tone="danger"]) button {
    border-color: var(--awwbookmarklet-danger-border, #d46a60);
    color: var(--awwbookmarklet-danger-fg, #8a1f17);
  }

  :host([tone="warning"]) button {
    border-color: var(--awwbookmarklet-warning-border, #d9ad3b);
    color: var(--awwbookmarklet-warning-fg, #6d4b00);
  }

  :host([tone="success"]) button {
    border-color: var(--awwbookmarklet-success-border, #72b98b);
    color: var(--awwbookmarklet-success-fg, #195b34);
  }

  :host([busy]) button {
    cursor: progress;
  }

  :host([pressed]) button {
    background: var(--awwbookmarklet-button-active-bg, #dbe3ee);
    box-shadow: inset 1px 1px 0 rgba(0, 0, 0, 0.18);
  }
`;class P extends HTMLElement{static observedAttributes=["disabled","busy","pressed"];constructor(){super();let t=this.attachShadow({mode:"open"});l(t,[d,ge]),t.innerHTML='<button part="control" type="button"><slot></slot></button>',this.control=t.querySelector("button"),this.control.addEventListener("click",(e)=>{if(e.stopPropagation(),this.disabled||this.busy){e.preventDefault();return}let o=this.getAttribute("command");if(o)this.dispatchEvent(new CustomEvent("awwbookmarklet-command-request",{bubbles:!0,composed:!0,detail:{commandId:o,source:this}}));this.dispatchEvent(new MouseEvent("click",{bubbles:!0,composed:!0,cancelable:!0}))})}get disabled(){return this.hasAttribute("disabled")}set disabled(t){this.toggleAttribute("disabled",Boolean(t))}get busy(){return this.hasAttribute("busy")}set busy(t){this.toggleAttribute("busy",Boolean(t))}attributeChangedCallback(){this.control.disabled=this.disabled||this.busy,this.control.setAttribute("aria-pressed",this.hasAttribute("pressed")?"true":"false"),this.control.setAttribute("aria-busy",this.busy?"true":"false")}}var fe=s`
  :host { display: inline-block; }

  button {
    width: var(--awwbookmarklet-size-control-h, 30px);
    height: var(--awwbookmarklet-size-control-h, 30px);
    border: 1px solid var(--awwbookmarklet-border-strong, #232a33);
    border-radius: 0;
    background: var(--awwbookmarklet-button-bg, #f1f4f8);
    color: var(--awwbookmarklet-button-fg, #111720);
    display: grid;
    place-items: center;
    padding: 0;
  }

  button:focus-visible { outline: none; box-shadow: var(--_ring); }
  button:active { background: var(--awwbookmarklet-button-active-bg, #dbe3ee); }
  button:disabled { opacity: 0.55; cursor: not-allowed; }

  :host([tone="danger"]) button { border-color: var(--awwbookmarklet-danger-border, #d46a60); color: var(--awwbookmarklet-danger-fg, #8a1f17); }
  :host([tone="warning"]) button { border-color: var(--awwbookmarklet-warning-border, #d9ad3b); color: var(--awwbookmarklet-warning-fg, #6d4b00); }
  :host([tone="success"]) button { border-color: var(--awwbookmarklet-success-border, #72b98b); color: var(--awwbookmarklet-success-fg, #195b34); }
  :host([pressed]) button {
    background: var(--awwbookmarklet-button-active-bg, #dbe3ee);
    box-shadow: inset 1px 1px 0 rgba(0, 0, 0, 0.18);
  }

  ::slotted(svg) {
    width: 16px;
    height: 16px;
    stroke-width: 1.5;
    stroke: currentColor;
    fill: none;
  }
`;class Y extends HTMLElement{static observedAttributes=["disabled","busy","pressed","label","aria-label"];constructor(){super();let t=this.attachShadow({mode:"open"});l(t,[d,fe]),t.innerHTML='<button part="control" type="button"><slot></slot></button>',this.control=t.querySelector("button"),this.control.addEventListener("click",(e)=>{if(e.stopPropagation(),this.disabled||this.busy){e.preventDefault();return}let o=this.getAttribute("command");if(o)this.dispatchEvent(new CustomEvent("awwbookmarklet-command-request",{bubbles:!0,composed:!0,detail:{commandId:o,source:this}}));this.dispatchEvent(new MouseEvent("click",{bubbles:!0,composed:!0,cancelable:!0}))})}get disabled(){return this.hasAttribute("disabled")}set disabled(t){this.toggleAttribute("disabled",Boolean(t))}get busy(){return this.hasAttribute("busy")}set busy(t){this.toggleAttribute("busy",Boolean(t))}attributeChangedCallback(){this.control.disabled=this.disabled||this.busy;let t=this.getAttribute("label")||this.getAttribute("aria-label")||"";if(t)this.control.setAttribute("aria-label",t);this.control.setAttribute("aria-pressed",this.hasAttribute("pressed")?"true":"false"),this.control.setAttribute("aria-busy",this.busy?"true":"false")}}var ke=s`
  :host { display: inline-block; min-width: 140px; }

  input {
    width: 100%;
    min-height: var(--awwbookmarklet-size-control-h, 30px);
    border: 1px solid var(--awwbookmarklet-border-strong, #232a33);
    border-radius: 0;
    background: var(--awwbookmarklet-input-bg, #ffffff);
    color: var(--awwbookmarklet-input-fg, #111720);
    padding: 0 8px;
    font: inherit;
  }

  input:focus-visible { outline: none; box-shadow: var(--_ring); }
  input:disabled { opacity: 0.65; }
`,ve=["value","placeholder","disabled","type","name","required","min","max","step","autocomplete","spellcheck"];class D extends HTMLElement{static observedAttributes=ve;constructor(){super();let t=this.attachShadow({mode:"open"});l(t,[d,ke]),t.innerHTML='<input part="control" />',this.control=t.querySelector("input"),this.control.addEventListener("input",(e)=>{e.stopPropagation(),this.setAttribute("value",this.control.value),this.dispatchEvent(new Event("input",{bubbles:!0,composed:!0}))}),this.control.addEventListener("change",(e)=>{e.stopPropagation(),this.setAttribute("value",this.control.value),this.dispatchEvent(new Event("change",{bubbles:!0,composed:!0}))})}get value(){return this.control.value}set value(t){this.setAttribute("value",String(t??""))}get disabled(){return this.hasAttribute("disabled")}set disabled(t){this.toggleAttribute("disabled",Boolean(t))}attributeChangedCallback(t,e,o){if(t==="disabled"){this.control.disabled=this.hasAttribute("disabled");return}if(t==="required"){this.control.required=this.hasAttribute("required");return}if(t==="value"){this.control.value=o??"";return}if(o===null){this.control.removeAttribute(t);return}this.control.setAttribute(t,o)}}var xe=s`
  :host { display: inline-block; min-width: 220px; }

  textarea {
    width: 100%;
    min-height: 96px;
    border: 1px solid var(--awwbookmarklet-border-strong, #232a33);
    border-radius: 0;
    background: var(--awwbookmarklet-input-bg, #ffffff);
    color: var(--awwbookmarklet-input-fg, #111720);
    padding: 8px;
    font: inherit;
    resize: vertical;
  }

  textarea:focus-visible { outline: none; box-shadow: var(--_ring); }
  textarea:disabled { opacity: 0.65; }
`,ye=["value","placeholder","disabled","rows","name","required","autocomplete","spellcheck"];class z extends HTMLElement{static observedAttributes=ye;constructor(){super();let t=this.attachShadow({mode:"open"});l(t,[d,xe]),t.innerHTML='<textarea part="control"></textarea>',this.control=t.querySelector("textarea"),this.control.addEventListener("input",(e)=>{e.stopPropagation(),this.setAttribute("value",this.control.value),this.dispatchEvent(new Event("input",{bubbles:!0,composed:!0}))}),this.control.addEventListener("change",(e)=>{e.stopPropagation(),this.setAttribute("value",this.control.value),this.dispatchEvent(new Event("change",{bubbles:!0,composed:!0}))})}get value(){return this.control.value}set value(t){this.setAttribute("value",String(t??""))}get disabled(){return this.hasAttribute("disabled")}set disabled(t){this.toggleAttribute("disabled",Boolean(t))}attributeChangedCallback(t,e,o){if(t==="disabled"){this.control.disabled=this.hasAttribute("disabled");return}if(t==="required"){this.control.required=this.hasAttribute("required");return}if(t==="value"){this.control.value=o??"";return}if(o===null){this.control.removeAttribute(t);return}this.control.setAttribute(t,o)}}var Ae=s`
  :host { display: inline-block; }

  label {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
  }

  input {
    appearance: none;
    width: 14px;
    height: 14px;
    margin: 0;
    border: 1px solid var(--awwbookmarklet-border-strong, #232a33);
    background: var(--awwbookmarklet-input-bg, #fff);
    border-radius: 0;
    position: relative;
  }

  input:checked::after {
    content: "";
    position: absolute;
    inset: 2px;
    background: var(--awwbookmarklet-selection-bg, #1f5eae);
  }

  input:focus-visible { outline: none; box-shadow: var(--_ring); }
  input:disabled + span { opacity: 0.6; }
`,Se=["checked","disabled","name","value"];class V extends HTMLElement{static observedAttributes=Se;constructor(){super();let t=this.attachShadow({mode:"open"});l(t,[d,Ae]),t.innerHTML='<label><input type="checkbox" part="control" /><span part="label"><slot></slot></span></label>',this.control=t.querySelector("input"),this.control.addEventListener("change",(e)=>{e.stopPropagation(),this.toggleAttribute("checked",this.control.checked),this.dispatchEvent(new Event("change",{bubbles:!0,composed:!0}))})}get checked(){return this.hasAttribute("checked")}set checked(t){this.toggleAttribute("checked",Boolean(t))}get disabled(){return this.hasAttribute("disabled")}set disabled(t){this.toggleAttribute("disabled",Boolean(t))}get value(){return this.getAttribute("value")??"on"}set value(t){this.setAttribute("value",String(t??""))}attributeChangedCallback(t,e,o){if(t==="checked"){this.control.checked=this.hasAttribute("checked");return}if(t==="disabled"){this.control.disabled=this.hasAttribute("disabled");return}if(o===null){this.control.removeAttribute(t);return}this.control.setAttribute(t,o)}}var Ee=s`
  :host { display: inline-block; }

  label {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
  }

  input {
    appearance: none;
    width: 14px;
    height: 14px;
    margin: 0;
    border: 1px solid var(--awwbookmarklet-border-strong, #232a33);
    background: var(--awwbookmarklet-input-bg, #fff);
    border-radius: 999px;
    position: relative;
  }

  input:checked::after {
    content: "";
    position: absolute;
    inset: 3px;
    background: var(--awwbookmarklet-selection-bg, #1f5eae);
    border-radius: 999px;
  }

  input:focus-visible { outline: none; box-shadow: var(--_ring); }
  input:disabled + span { opacity: 0.6; }
`,Me=["checked","disabled","name","value"];class F extends HTMLElement{static observedAttributes=Me;constructor(){super();let t=this.attachShadow({mode:"open"});l(t,[d,Ee]),t.innerHTML='<label><input type="radio" part="control" /><span part="label"><slot></slot></span></label>',this.control=t.querySelector("input"),this.control.addEventListener("change",(e)=>{if(e.stopPropagation(),this.toggleAttribute("checked",this.control.checked),this.control.checked)this.#t();this.dispatchEvent(new Event("change",{bubbles:!0,composed:!0}))})}get checked(){return this.hasAttribute("checked")}set checked(t){this.toggleAttribute("checked",Boolean(t))}get disabled(){return this.hasAttribute("disabled")}set disabled(t){this.toggleAttribute("disabled",Boolean(t))}get value(){return this.getAttribute("value")??"on"}set value(t){this.setAttribute("value",String(t??""))}attributeChangedCallback(t,e,o){if(t==="checked"){if(this.control.checked=this.hasAttribute("checked"),this.control.checked)this.#t();return}if(t==="disabled"){this.control.disabled=this.hasAttribute("disabled");return}if(o===null){this.control.removeAttribute(t);return}this.control.setAttribute(t,o)}#t(){let t=this.getAttribute("name");if(!t)return;let o=this.getRootNode().querySelectorAll?.("awwbookmarklet-radio")??[];for(let r of o)if(r!==this&&r.getAttribute("name")===t)r.removeAttribute("checked")}}var Te=s`
  :host { display: inline-block; min-width: 160px; }

  .wrap { position: relative; }

  select {
    width: 100%;
    min-height: var(--awwbookmarklet-size-control-h, 30px);
    border: 1px solid var(--awwbookmarklet-border-strong, #232a33);
    border-radius: 0;
    background: var(--awwbookmarklet-input-bg, #fff);
    color: var(--awwbookmarklet-input-fg, #111720);
    padding: 0 28px 0 8px;
    font: inherit;
    appearance: none;
  }

  .arrow {
    pointer-events: none;
    position: absolute;
    right: 8px;
    top: 50%;
    translate: 0 -50%;
    width: 0;
    height: 0;
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-top: 6px solid currentColor;
    opacity: 0.8;
  }

  select:focus-visible { outline: none; box-shadow: var(--_ring); }
  select:disabled { opacity: 0.65; }
`,Le=["disabled","name","value","required"];class U extends HTMLElement{static observedAttributes=Le;#t=null;constructor(){super();let t=this.attachShadow({mode:"open"});l(t,[d,Te]),t.innerHTML='<div class="wrap"><select part="control"></select><span class="arrow" aria-hidden="true"></span></div>',this.control=t.querySelector("select"),this.control.addEventListener("change",(e)=>{e.stopPropagation(),this.setAttribute("value",this.control.value),this.dispatchEvent(new Event("change",{bubbles:!0,composed:!0}))})}connectedCallback(){this.#e(),this.#t=new MutationObserver(()=>this.#e()),this.#t.observe(this,{childList:!0,subtree:!0,attributes:!0,attributeFilter:["selected","disabled","value"]})}disconnectedCallback(){this.#t?.disconnect(),this.#t=null}get value(){return this.control.value}set value(t){this.setAttribute("value",String(t??""))}get disabled(){return this.hasAttribute("disabled")}set disabled(t){this.toggleAttribute("disabled",Boolean(t))}attributeChangedCallback(t,e,o){if(t==="disabled"){this.control.disabled=this.hasAttribute("disabled");return}if(t==="required"){this.control.required=this.hasAttribute("required");return}if(t==="value"){this.control.value=o??"";return}if(o===null){this.control.removeAttribute(t);return}this.control.setAttribute(t,o)}#e(){let t=[...this.querySelectorAll("option")];this.control.textContent="";for(let o of t){let r=document.createElement("option");r.value=o.value,r.textContent=o.textContent,r.disabled=o.disabled,r.selected=o.selected,this.control.append(r)}let e=this.getAttribute("value");if(e!==null)this.control.value=e;else if(this.control.selectedIndex>=0)this.setAttribute("value",this.control.value)}}var Ce=s`
  :host { display: inline-block; min-width: 160px; }

  input[type="range"] {
    width: 100%;
    margin: 0;
    accent-color: var(--awwbookmarklet-selection-bg, #1f5eae);
  }

  input[type="range"]:focus-visible { outline: none; box-shadow: var(--_ring); }
`,_e=["min","max","step","value","disabled","name"];class W extends HTMLElement{static observedAttributes=_e;constructor(){super();let t=this.attachShadow({mode:"open"});l(t,[d,Ce]),t.innerHTML='<input type="range" part="control" />',this.control=t.querySelector("input"),this.control.addEventListener("input",(e)=>{e.stopPropagation(),this.setAttribute("value",this.control.value),this.dispatchEvent(new Event("input",{bubbles:!0,composed:!0}))}),this.control.addEventListener("change",(e)=>{e.stopPropagation(),this.setAttribute("value",this.control.value),this.dispatchEvent(new Event("change",{bubbles:!0,composed:!0}))})}get value(){return this.control.value}set value(t){this.setAttribute("value",String(t??""))}get disabled(){return this.hasAttribute("disabled")}set disabled(t){this.toggleAttribute("disabled",Boolean(t))}attributeChangedCallback(t,e,o){if(t==="disabled"){this.control.disabled=this.hasAttribute("disabled");return}if(t==="value"){this.control.value=o??"";return}if(o===null){this.control.removeAttribute(t);return}this.control.setAttribute(t,o)}}var Ne=s`
  :host { display: inline-block; min-width: 160px; }

  progress {
    width: 100%;
    height: 14px;
    border: 1px solid var(--awwbookmarklet-border-strong, #232a33);
    border-radius: 0;
    background: var(--awwbookmarklet-panel-bg, #f8fafc);
    accent-color: var(--awwbookmarklet-selection-bg, #1f5eae);
  }
`,Be=["value","max"];class j extends HTMLElement{static observedAttributes=Be;constructor(){super();let t=this.attachShadow({mode:"open"});l(t,[d,Ne]),t.innerHTML='<progress part="control"></progress>',this.control=t.querySelector("progress")}get value(){return this.control.value}set value(t){this.setAttribute("value",String(t??""))}get max(){return this.control.max}set max(t){this.setAttribute("max",String(t??""))}attributeChangedCallback(t,e,o){if(t==="value"){if(o===null)this.control.removeAttribute("value");else this.control.value=Number(o);return}if(t==="max"){if(o===null)this.control.removeAttribute("max");else this.control.max=Number(o);return}if(o===null){this.control.removeAttribute(t);return}this.control.setAttribute(t,o)}}var Oe=s`
  :host { display: block; border: 1px solid var(--awwbookmarklet-border-subtle, #9ba5b3); background: var(--awwbookmarklet-panel-bg, #f8fafc); }

  #tablist {
    display: flex;
    gap: 2px;
    padding: 4px 4px 0;
    border-bottom: 1px solid var(--awwbookmarklet-border-subtle, #9ba5b3);
  }

  #tablist button {
    min-height: 28px;
    border: 1px solid var(--awwbookmarklet-border-strong, #232a33);
    border-bottom: 0;
    background: color-mix(in srgb, var(--awwbookmarklet-panel-bg, #f8fafc) 88%, #ced5df 12%);
    padding: 0 10px;
    font: inherit;
    border-radius: 0;
  }

  #tablist button[aria-selected="true"] {
    background: var(--awwbookmarklet-window-bg, #eef1f5);
    position: relative;
    top: 1px;
  }

  #tablist button:focus-visible { outline: none; box-shadow: var(--_ring); }
  #panels { padding: var(--awwbookmarklet-space-2, 8px); }
`,qe=s`
  :host { display: block; }
`,Wt=0;class G extends HTMLElement{constructor(){super();let t=this.attachShadow({mode:"open"});l(t,[d,qe]),t.innerHTML="<slot></slot>"}}class K extends HTMLElement{#t=[];#e=[];#o=0;#r=null;#a=!1;#i;constructor(){super();Wt+=1,this.#i=`awwbookmarklet-tabs-${Wt}`;let t=this.attachShadow({mode:"open"});l(t,[d,Oe]),t.innerHTML='<div id="tablist" role="tablist" part="tablist"></div><div id="panels" part="panels"><slot></slot></div>',t.querySelector("#tablist").addEventListener("keydown",this.#d),t.querySelector("#tablist").addEventListener("click",this.#n)}connectedCallback(){this.#l(),this.#r=new MutationObserver(()=>{if(!this.#a)this.#l()}),this.#r.observe(this,{childList:!0,attributes:!0,subtree:!0,attributeFilter:["label","selected"]})}disconnectedCallback(){this.#r?.disconnect(),this.#r=null}#l(){if(this.#e=[...this.children].filter((o)=>o.tagName.toLowerCase()===a.tabPanel),!this.#e.length){this.#t=[],this.shadowRoot.querySelector("#tablist").textContent="";return}let t=this.#e.findIndex((o)=>o.hasAttribute("selected"));this.#o=t>=0?t:0;let e=this.shadowRoot.querySelector("#tablist");e.textContent="",this.#t=this.#e.map((o,r)=>{let i=document.createElement("button");return i.type="button",i.id=`${this.id||this.#i}-tab-${r}`,i.setAttribute("role","tab"),i.setAttribute("aria-controls",`${this.id||this.#i}-panel-${r}`),i.textContent=o.getAttribute("label")||`Tab ${r+1}`,i.dataset.index=String(r),i.tabIndex=r===this.#o?0:-1,i.setAttribute("aria-selected",r===this.#o?"true":"false"),e.append(i),i}),this.#s(this.#o,!1)}#s(t,e=!0){if(!this.#t.length)return;this.#o=(t+this.#t.length)%this.#t.length,this.#t.forEach((o,r)=>{let i=r===this.#o;if(o.tabIndex=i?0:-1,o.setAttribute("aria-selected",i?"true":"false"),e&&i)o.focus()}),this.#a=!0;try{this.#e.forEach((o,r)=>{o.toggleAttribute("selected",r===this.#o),o.hidden=r!==this.#o,o.id=`${this.id||this.#i}-panel-${r}`,o.setAttribute("role","tabpanel"),o.setAttribute("aria-labelledby",`${this.id||this.#i}-tab-${r}`)})}finally{queueMicrotask(()=>{this.#a=!1})}}#n=(t)=>{let e=t.target.closest("button[role='tab']");if(!e)return;this.#s(Number(e.dataset.index),!0)};#d=(t)=>{if(!this.#t.length)return;if(t.key==="ArrowRight"){t.preventDefault(),this.#s(this.#o+1,!0);return}if(t.key==="ArrowLeft"){t.preventDefault(),this.#s(this.#o-1,!0);return}if(t.key==="Home"){t.preventDefault(),this.#s(0,!0);return}if(t.key==="End")t.preventDefault(),this.#s(this.#t.length-1,!0)}}var He=s`
  :host { display: block; }

  #list {
    border: 1px solid var(--awwbookmarklet-border-strong, #232a33);
    background: var(--awwbookmarklet-input-bg, #fff);
    min-height: 120px;
    max-height: 260px;
    overflow: auto;
    padding: 2px;
  }

  ::slotted([role="option"]) {
    display: block;
    padding: 6px 8px;
    border: 1px solid transparent;
    user-select: none;
  }

  ::slotted([role="option"][data-selected="true"]) {
    background: var(--awwbookmarklet-selection-bg, #1f5eae);
    color: var(--awwbookmarklet-selection-fg, #f2f8ff);
    border-color: var(--awwbookmarklet-border-strong, #232a33);
  }

  ::slotted([role="option"][aria-disabled="true"]) {
    opacity: 0.55;
  }
`,jt=0;function $e(t){return t.getAttribute("role")==="option"&&t.getAttribute("aria-disabled")!=="true"}class X extends HTMLElement{#t=[];#e=-1;#o="";#r=0;#a;constructor(){super();jt+=1,this.#a=`awwbookmarklet-listbox-${jt}`;let t=this.attachShadow({mode:"open"});l(t,[d,He]),t.innerHTML='<div id="list" role="listbox" part="list" tabindex="0"><slot></slot></div>',t.querySelector("#list").addEventListener("keydown",this.#n),t.querySelector("#list").addEventListener("click",this.#s),t.querySelector("slot").addEventListener("slotchange",()=>this.#i())}connectedCallback(){this.#i()}#i(){if(this.#t=[...this.children].filter($e),!this.#t.length){this.#e=-1,this.shadowRoot.querySelector("#list").removeAttribute("aria-activedescendant");return}if(this.#t.forEach((t,e)=>{if(!t.id)t.id=`${this.#a}-option-${e}`}),this.#e=this.#t.findIndex((t)=>t.getAttribute("aria-selected")==="true"),this.#e<0)this.#e=0;this.#l(this.#e,!1)}#l(t,e=!0){if(!this.#t.length)return;if(this.#e=(t+this.#t.length)%this.#t.length,this.#t.forEach((o,r)=>{let i=r===this.#e;o.setAttribute("aria-selected",i?"true":"false"),o.dataset.selected=i?"true":"false"}),this.shadowRoot.querySelector("#list").setAttribute("aria-activedescendant",this.#t[this.#e].id),e){let o=this.#t[this.#e];this.dispatchEvent(new CustomEvent("change",{bubbles:!0,composed:!0,detail:{index:this.#e,value:o.getAttribute("data-value")??o.textContent?.trim()??""}}))}}#s=(t)=>{let e=t.target.closest("[role='option']");if(!e||e.getAttribute("aria-disabled")==="true")return;let o=this.#t.indexOf(e);if(o!==-1)this.#l(o,!0)};#n=(t)=>{if(!this.#t.length)return;if(t.key==="ArrowDown"){t.preventDefault(),this.#l(this.#e+1,!0);return}if(t.key==="ArrowUp"){t.preventDefault(),this.#l(this.#e-1,!0);return}if(t.key==="Home"){t.preventDefault(),this.#l(0,!0);return}if(t.key==="End"){t.preventDefault(),this.#l(this.#t.length-1,!0);return}if(t.key.length===1&&/\S/.test(t.key)){this.#o+=t.key.toLowerCase(),clearTimeout(this.#r),this.#r=setTimeout(()=>{this.#o=""},450);let e=this.#t.findIndex((o)=>o.textContent?.trim().toLowerCase().startsWith(this.#o));if(e!==-1)this.#l(e,!0)}}}var Re=s`
  :host { display: block; }

  .group {
    border: 1px solid var(--awwbookmarklet-border-subtle, #9ba5b3);
    background: color-mix(in srgb, var(--awwbookmarklet-panel-bg, #f8fafc) 86%, #ffffff 14%);
    padding: 10px;
  }

  .caption {
    font-weight: 600;
    margin-bottom: 8px;
    color: color-mix(in srgb, var(--awwbookmarklet-input-fg, #111720) 90%, #ffffff 10%);
  }

  .content {
    display: grid;
    gap: var(--awwbookmarklet-space-2, 8px);
  }
`;class Z extends HTMLElement{static observedAttributes=["caption"];constructor(){super();let t=this.attachShadow({mode:"open"});l(t,[d,Re]),t.innerHTML='<section class="group" part="group"><div class="caption" part="caption"></div><div class="content" part="content"><slot></slot></div></section>'}connectedCallback(){this.#t()}attributeChangedCallback(){this.#t()}#t(){let t=this.getAttribute("caption")||"",e=this.shadowRoot.querySelector(".caption");e.textContent=t,e.hidden=!t}}var Ie=s`
  :host {
    display: block;
    border: 1px solid var(--awwbookmarklet-border-subtle, #9ba5b3);
    background: var(--awwbookmarklet-panel-bg, #f8fafc);
    padding: var(--awwbookmarklet-space-2, 8px);
  }

  section {
    display: grid;
    gap: var(--awwbookmarklet-space-2, 8px);
    min-width: 0;
  }

  .header {
    display: none;
    align-items: start;
    justify-content: space-between;
    gap: var(--awwbookmarklet-space-2, 8px);
    border-bottom: 1px solid var(--awwbookmarklet-divider-color, #c3cad4);
    padding-bottom: 6px;
  }

  :host([data-has-header="true"]) .header {
    display: flex;
  }

  .heading {
    display: grid;
    gap: 2px;
    min-width: 0;
  }

  .title {
    font-weight: 700;
    overflow-wrap: anywhere;
  }

  .subtitle {
    color: var(--awwbookmarklet-text-muted, #586272);
    overflow-wrap: anywhere;
  }

  .body {
    min-width: 0;
  }

  .footer {
    display: none;
    border-top: 1px solid var(--awwbookmarklet-divider-color, #c3cad4);
    padding-top: 6px;
  }

  :host([data-has-footer="true"]) .footer {
    display: block;
  }
`;class J extends HTMLElement{constructor(){super();let t=this.attachShadow({mode:"open"});l(t,[d,Ie]),t.innerHTML=`
      <section part="panel">
        <header class="header" part="header">
          <div class="heading" part="heading">
            <div class="title" part="title"><slot name="title"></slot></div>
            <div class="subtitle" part="subtitle"><slot name="subtitle"></slot></div>
          </div>
          <div part="actions"><slot name="actions"></slot></div>
        </header>
        <div class="body" part="body"><slot></slot></div>
        <footer class="footer" part="footer"><slot name="footer"></slot></footer>
      </section>
    `,this.titleSlot=t.querySelector("slot[name='title']"),this.subtitleSlot=t.querySelector("slot[name='subtitle']"),this.actionsSlot=t.querySelector("slot[name='actions']"),this.footerSlot=t.querySelector("slot[name='footer']"),[this.titleSlot,this.subtitleSlot,this.actionsSlot,this.footerSlot].forEach((e)=>{e.addEventListener("slotchange",()=>this.#t())})}connectedCallback(){this.#t()}#t(){let t=[this.titleSlot,this.subtitleSlot,this.actionsSlot].some((o)=>o.assignedNodes({flatten:!0}).length>0),e=this.footerSlot.assignedNodes({flatten:!0}).length>0;this.dataset.hasHeader=t?"true":"false",this.dataset.hasFooter=e?"true":"false"}}var Pe=s`
  :host {
    display: block;
    background: var(--awwbookmarklet-statusbar-bg, #e5e8ee);
    border-top: 1px solid var(--awwbookmarklet-border-subtle, #9ba5b3);
    min-height: 24px;
  }

  #bar {
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: 1fr;
  }

  ::slotted(*) {
    min-height: 24px;
    padding: 4px 8px;
    border-right: 1px solid var(--awwbookmarklet-border-subtle, #9ba5b3);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  ::slotted(*:last-child) { border-right: 0; }
`;class Q extends HTMLElement{constructor(){super();let t=this.attachShadow({mode:"open"});l(t,[d,Pe]),t.innerHTML='<div id="bar" role="status" part="bar"><slot></slot></div>'}}var Ye=s`
  :host {
    display: block;
    min-height: 0;
    background: var(--awwbookmarklet-app-shell-bg, #eef1f5);
    color: var(--awwbookmarklet-input-fg, #111720);
  }

  .shell {
    display: grid;
    grid-template-rows: auto auto minmax(0, 1fr) auto;
    min-height: 0;
    gap: var(--awwbookmarklet-space-2, 8px);
    padding: var(--awwbookmarklet-space-3, 12px);
  }

  .header {
    display: flex;
    align-items: start;
    justify-content: space-between;
    gap: var(--awwbookmarklet-space-3, 12px);
    min-width: 0;
    border-bottom: 1px solid var(--awwbookmarklet-divider-color, #c3cad4);
    padding-bottom: var(--awwbookmarklet-space-2, 8px);
  }

  .heading {
    display: grid;
    gap: 2px;
    min-width: 0;
  }

  .title {
    font-weight: 700;
    font-size: 16px;
    line-height: 1.2;
    overflow-wrap: anywhere;
  }

  .subtitle {
    color: var(--awwbookmarklet-text-muted, #586272);
    line-height: 1.35;
    overflow-wrap: anywhere;
  }

  .actions {
    display: flex;
    justify-content: end;
    min-width: min(100%, 180px);
  }

  .status ::slotted(*) { width: 100%; }

  .body {
    min-height: 0;
    overflow: auto;
  }

  .footer {
    border-top: 1px solid var(--awwbookmarklet-divider-color, #c3cad4);
    padding-top: var(--awwbookmarklet-space-2, 8px);
  }

  @media (max-width: 520px) {
    .header {
      display: grid;
    }

    .actions {
      justify-content: start;
    }
  }
`;class tt extends HTMLElement{constructor(){super();let t=this.attachShadow({mode:"open"});l(t,[d,Ye]),t.innerHTML=`
      <section class="shell" part="shell">
        <header class="header" part="header">
          <div class="heading" part="heading">
            <div class="title" part="title"><slot name="title"></slot></div>
            <div class="subtitle" part="subtitle"><slot name="subtitle"></slot></div>
          </div>
          <div class="actions" part="actions"><slot name="actions"></slot></div>
        </header>
        <div class="status" part="status"><slot name="status"></slot></div>
        <main class="body" part="body"><slot name="body"></slot><slot></slot></main>
        <footer class="footer" part="footer"><slot name="footer"></slot></footer>
      </section>
    `}}var De=new Set(["neutral","info","success","warning","danger"]),ze=new Set(["compact","normal","spacious"]),Ve=new Set(["start","center","end","between"]),Fe=new Set(["horizontal","vertical","inline"]),Gt=0;function et(t="aww"){return Gt+=1,`${t}-${Gt}`}function g(t,e="neutral"){return De.has(t)?t:e}function Kt(t,e="normal"){return ze.has(t)?t:e}function Xt(t,e="start"){return Ve.has(t)?t:e}function ot(t,e="horizontal"){return Fe.has(t)?t:e}function Ue(t){if(!t||t.disabled||t.getAttribute?.("aria-disabled")==="true")return!1;if(t.tabIndex>=0)return!0;return/^(A|BUTTON|INPUT|SELECT|TEXTAREA)$/.test(t.tagName)&&!t.hasAttribute("disabled")}function Ot(t){if(!t?.querySelectorAll)return[];return[...t.querySelectorAll("a[href],button,input,select,textarea,[tabindex]")].filter(Ue)}function w(t,e,o={},r={}){return t.dispatchEvent(new CustomEvent(e,{bubbles:!0,composed:!0,cancelable:Boolean(r.cancelable),detail:o}))}var We=s`
  :host {
    display: flex;
    max-width: 100%;
    opacity: 1;
  }

  :host([hidden]) { display: none !important; }

  .toolbar {
    display: flex;
    align-items: center;
    gap: var(--_gap, var(--awwbookmarklet-space-2, 8px));
    width: 100%;
    min-width: 0;
  }

  :host([orientation="vertical"]) .toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  :host([wrap]) .toolbar {
    flex-wrap: wrap;
  }

  :host([data-align="center"]) .toolbar { justify-content: center; }
  :host([data-align="end"]) .toolbar { justify-content: flex-end; }
  :host([data-align="between"]) .toolbar { justify-content: space-between; }

  :host([data-density="compact"]) { --_gap: 4px; }
  :host([data-density="spacious"]) { --_gap: 12px; }

  :host([busy]) .toolbar {
    cursor: progress;
  }

  :host([disabled]),
  :host([busy]) {
    opacity: 0.72;
  }
`;class rt extends HTMLElement{static observedAttributes=["density","align","orientation","disabled","busy"];constructor(){super();let t=this.attachShadow({mode:"open"});l(t,[d,We]),t.innerHTML='<div class="toolbar" part="toolbar"><slot></slot></div>'}connectedCallback(){this.#t()}attributeChangedCallback(){this.#t()}#t(){this.dataset.density=Kt(this.getAttribute("density")),this.dataset.align=Xt(this.getAttribute("align"));let t=ot(this.getAttribute("orientation"),"horizontal");if(this.getAttribute("orientation")!==t)this.setAttribute("orientation",t);this.setAttribute("aria-disabled",this.hasAttribute("disabled")||this.hasAttribute("busy")?"true":"false")}}var je=s`
  :host {
    display: grid;
    gap: 4px;
    min-width: 0;
  }

  :host([wide]) {
    width: 100%;
  }

  .field {
    display: grid;
    gap: 4px;
    min-width: 0;
  }

  :host([orientation="horizontal"]) .field {
    grid-template-columns: minmax(120px, 0.38fr) minmax(0, 1fr);
    gap: 8px 12px;
    align-items: start;
  }

  :host([orientation="inline"]) .field {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .label {
    font-weight: 650;
    line-height: 1.25;
  }

  .required {
    color: var(--awwbookmarklet-danger-fg, #8a1f17);
  }

  .control-row {
    display: flex;
    align-items: stretch;
    gap: 4px;
    min-width: 0;
  }

  .control-row ::slotted(*) {
    min-width: 0;
  }

  .main {
    display: grid;
    gap: 4px;
    min-width: 0;
  }

  .message {
    min-height: 16px;
    color: var(--awwbookmarklet-text-help, #657184);
    font-size: 12px;
    line-height: 1.3;
  }

  :host([data-tone="danger"]) .message,
  :host([data-invalid="true"]) .message {
    color: var(--awwbookmarklet-danger-fg, #8a1f17);
  }

  :host([disabled]) {
    opacity: 0.7;
  }
`;class at extends HTMLElement{static observedAttributes=["label","help","error","required","tone","orientation","disabled"];#t={label:et("aww-field-label"),help:et("aww-field-help"),error:et("aww-field-error")};constructor(){super();let t=this.attachShadow({mode:"open"});l(t,[d,je]),t.innerHTML=`
      <label class="field" part="field">
        <span class="label" part="label" id="${this.#t.label}"><slot name="label"></slot><span data-label-text></span><span class="required" aria-hidden="true"></span></span>
        <span class="main" part="main">
          <span class="control-row" part="control-row">
            <slot name="prefix"></slot>
            <slot></slot>
            <slot name="suffix"></slot>
            <slot name="actions"></slot>
          </span>
          <span class="message" part="message">
            <span id="${this.#t.error}" data-error-text></span>
            <span id="${this.#t.help}" data-help-text></span>
            <slot name="error"></slot>
            <slot name="help"></slot>
          </span>
        </span>
      </label>
    `,this.controlSlot=t.querySelector("slot:not([name])"),this.labelText=t.querySelector("[data-label-text]"),this.helpText=t.querySelector("[data-help-text]"),this.errorText=t.querySelector("[data-error-text]"),this.requiredMark=t.querySelector(".required"),this.controlSlot.addEventListener("slotchange",()=>this.#o())}connectedCallback(){this.#e()}attributeChangedCallback(){this.#e()}#e(){let t=ot(this.getAttribute("orientation"),"vertical");if(this.getAttribute("orientation")!==t)this.setAttribute("orientation",t);let e=this.getAttribute("error")||"";this.dataset.invalid=e?"true":"false",this.dataset.tone=e?"danger":g(this.getAttribute("tone")),this.labelText.textContent=this.getAttribute("label")||"",this.helpText.textContent=e?"":this.getAttribute("help")||"",this.errorText.textContent=e,this.requiredMark.textContent=this.hasAttribute("required")?" *":"",this.#o()}#o(){let t=this.controlSlot.assignedElements({flatten:!0})[0];if(!t)return;if(!t.hasAttribute("aria-labelledby"))t.setAttribute("aria-labelledby",this.#t.label);let e=[];if(this.getAttribute("help"))e.push(this.#t.help);if(this.getAttribute("error"))e.push(this.#t.error);if(e.length)t.setAttribute("aria-describedby",e.join(" "));else t.removeAttribute("aria-describedby");t.toggleAttribute("required",this.hasAttribute("required")),t.toggleAttribute("disabled",this.hasAttribute("disabled")),t.setAttribute("aria-invalid",this.getAttribute("error")?"true":"false")}}var Ge=s`
  :host {
    display: flex;
    align-items: center;
    min-height: 22px;
    gap: 6px;
    color: var(--awwbookmarklet-text-muted, #586272);
    line-height: 1.35;
  }

  :host([compact]) {
    min-height: 18px;
    font-size: 12px;
  }

  .dot {
    width: 7px;
    height: 7px;
    border: 1px solid currentColor;
    background: currentColor;
    flex: 0 0 auto;
  }

  :host([busy]) .dot {
    animation: pulse 0.9s steps(2, end) infinite;
  }

  :host([data-tone="info"]) { color: var(--awwbookmarklet-info-fg, #123d7a); }
  :host([data-tone="success"]) { color: var(--awwbookmarklet-success-fg, #195b34); }
  :host([data-tone="warning"]) { color: var(--awwbookmarklet-warning-fg, #6d4b00); }
  :host([data-tone="danger"]) { color: var(--awwbookmarklet-danger-fg, #8a1f17); }

  @keyframes pulse {
    50% { opacity: 0.28; }
  }
`;class it extends HTMLElement{static observedAttributes=["tone","live","busy"];constructor(){super();let t=this.attachShadow({mode:"open"});l(t,[d,Ge]),t.innerHTML='<span class="dot" part="indicator" aria-hidden="true"></span><span part="text"><slot></slot></span>'}connectedCallback(){this.#t()}attributeChangedCallback(){this.#t()}update(t,e={}){if(e.tone)this.setAttribute("tone",e.tone);if(e.live)this.setAttribute("live",e.live);this.textContent=String(t??"")}#t(){this.dataset.tone=g(this.getAttribute("tone"));let t=this.getAttribute("live")||"polite";this.setAttribute("aria-live",["off","polite","assertive"].includes(t)?t:"polite"),this.setAttribute("aria-busy",this.hasAttribute("busy")?"true":"false")}}var Ke=s`
  :host {
    display: block;
  }

  :host(:not([open])) {
    display: none;
  }

  .alert {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    gap: var(--awwbookmarklet-space-2, 8px);
    align-items: start;
    border: 1px solid var(--_border, var(--awwbookmarklet-border-subtle, #9ba5b3));
    background: var(--_bg, var(--awwbookmarklet-surface-raised-bg, #fff));
    color: var(--_fg, var(--awwbookmarklet-input-fg, #111720));
    padding: var(--awwbookmarklet-space-2, 8px);
  }

  :host([compact]) .alert {
    padding: 6px;
  }

  .icon {
    width: 14px;
    height: 14px;
    border: 1px solid currentColor;
    background: currentColor;
    margin-top: 2px;
  }

  .content {
    display: grid;
    gap: 4px;
    min-width: 0;
  }

  .title {
    font-weight: 700;
  }

  .message {
    line-height: 1.4;
  }

  .actions {
    margin-top: 4px;
  }

  button {
    border: 1px solid var(--awwbookmarklet-border-strong, #232a33);
    background: transparent;
    color: inherit;
    font: inherit;
    min-width: 24px;
    height: 24px;
  }

  :host([data-tone="info"]) { --_bg: var(--awwbookmarklet-info-bg, #e7f0ff); --_fg: var(--awwbookmarklet-info-fg, #123d7a); --_border: var(--awwbookmarklet-info-border, #7aa6e8); }
  :host([data-tone="success"]) { --_bg: var(--awwbookmarklet-success-bg, #e5f5eb); --_fg: var(--awwbookmarklet-success-fg, #195b34); --_border: var(--awwbookmarklet-success-border, #72b98b); }
  :host([data-tone="warning"]) { --_bg: var(--awwbookmarklet-warning-bg, #fff4d6); --_fg: var(--awwbookmarklet-warning-fg, #6d4b00); --_border: var(--awwbookmarklet-warning-border, #d9ad3b); }
  :host([data-tone="danger"]) { --_bg: var(--awwbookmarklet-danger-bg, #ffe8e6); --_fg: var(--awwbookmarklet-danger-fg, #8a1f17); --_border: var(--awwbookmarklet-danger-border, #d46a60); }
`;class st extends HTMLElement{static observedAttributes=["tone","title","dismissible","open"];constructor(){super();let t=this.attachShadow({mode:"open"});l(t,[d,Ke]),t.innerHTML=`
      <section class="alert" part="alert">
        <div class="icon" part="icon"><slot name="icon"></slot></div>
        <div class="content" part="content">
          <div class="title" part="title"><slot name="title"></slot><span data-title-text></span></div>
          <div class="message" part="message"><slot></slot></div>
          <div class="actions" part="actions"><slot name="actions"></slot></div>
        </div>
        <button type="button" part="close-button" aria-label="Dismiss" hidden>x</button>
      </section>
    `,this.closeButton=t.querySelector("button"),this.titleText=t.querySelector("[data-title-text]"),this.closeButton.addEventListener("click",()=>this.dismiss())}connectedCallback(){if(!this.hasAttribute("open"))this.setAttribute("open","");this.#t()}attributeChangedCallback(){this.#t()}dismiss(){if(w(this,"awwbookmarklet-alert-dismiss",{source:this},{cancelable:!0}))this.removeAttribute("open")}#t(){this.dataset.tone=g(this.getAttribute("tone"),"info"),this.closeButton.hidden=!this.hasAttribute("dismissible"),this.titleText.textContent=this.getAttribute("title")||"",this.setAttribute("role",this.dataset.tone==="danger"?"alert":"status")}}var Zt="awwbookmarklet-overlay-layer";function qt(){if(typeof document>"u")return null;let t=globalThis[k.lastAcquiredRoot]||document.body||document.documentElement,e=t.querySelector?.(`:scope > .${Zt}`);if(!e)e=document.createElement("div"),e.className=Zt,Object.assign(e.style,{position:"fixed",inset:"0",pointerEvents:"none",zIndex:String(B+5000)}),t.append(e);return e}function Jt(t){let e=qt();if(!e||t.parentNode===e)return null;let o={parent:t.parentNode,nextSibling:t.nextSibling};return e.append(t),o}function Ht(t,e){if(!e?.parent?.isConnected)return;let o=e.nextSibling?.parentNode===e.parent?e.nextSibling:null;e.parent.insertBefore(t,o)}var Xe=s`
  :host {
    position: fixed;
    inset: 0;
    display: none;
    pointer-events: none;
    z-index: 1;
  }

  :host([open]) {
    display: grid;
    place-items: center;
  }

  .backdrop {
    position: absolute;
    inset: 0;
    background: var(--awwbookmarklet-overlay-backdrop, rgba(12, 18, 28, 0.38));
    pointer-events: auto;
  }

  .panel {
    position: relative;
    display: grid;
    grid-template-rows: auto minmax(0, 1fr) auto;
    width: min(680px, calc(100vw - 32px));
    max-height: min(620px, calc(100vh - 32px));
    border: 1px solid var(--awwbookmarklet-border-strong, #232a33);
    background: var(--awwbookmarklet-panel-bg, #f8fafc);
    box-shadow: var(--awwbookmarklet-overlay-shadow, 0 18px 44px rgba(0,0,0,0.24));
    pointer-events: auto;
  }

  .header,
  .footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--awwbookmarklet-space-2, 8px);
    padding: var(--awwbookmarklet-space-2, 8px);
    background: var(--awwbookmarklet-surface-raised-bg, #fff);
  }

  .header {
    border-bottom: 1px solid var(--awwbookmarklet-divider-color, #c3cad4);
  }

  .footer {
    border-top: 1px solid var(--awwbookmarklet-divider-color, #c3cad4);
  }

  .title {
    font-weight: 700;
  }

  .body {
    min-height: 0;
    overflow: auto;
    padding: var(--awwbookmarklet-space-3, 12px);
  }

  button {
    min-width: 28px;
    min-height: 26px;
    border: 1px solid var(--awwbookmarklet-border-strong, #232a33);
    background: var(--awwbookmarklet-button-bg, #f1f4f8);
    color: var(--awwbookmarklet-button-fg, #111720);
    font: inherit;
  }
`;class nt extends HTMLElement{static observedAttributes=["open","label","modal"];#t=null;#e=null;constructor(){super();let t=this.attachShadow({mode:"open"});l(t,[d,Xe]),t.innerHTML=`
      <div class="backdrop" part="backdrop"></div>
      <section class="panel" part="panel" role="dialog" aria-modal="true" tabindex="-1">
        <header class="header" part="header">
          <div class="title" part="title"><slot name="title"></slot></div>
          <button type="button" part="close-button" aria-label="Close">x</button>
        </header>
        <div class="body" part="body"><slot></slot></div>
        <footer class="footer" part="footer"><slot name="footer"></slot></footer>
      </section>
    `,this.panel=t.querySelector(".panel"),this.backdrop=t.querySelector(".backdrop"),this.closeButton=t.querySelector("button"),this.closeButton.addEventListener("click",()=>this.close("button")),this.backdrop.addEventListener("click",()=>{if(this.hasAttribute("close-on-backdrop"))this.close("backdrop")}),this.addEventListener("keydown",(e)=>this.#a(e))}connectedCallback(){this.#o()}disconnectedCallback(){Ht(this,this.#t)}attributeChangedCallback(){this.#o()}show(){this.setAttribute("open","")}close(t="api"){if(!w(this,"awwbookmarklet-dialog-cancel",{reason:t},{cancelable:!0}))return!1;return this.removeAttribute("open"),w(this,"awwbookmarklet-dialog-close",{reason:t}),!0}#o(){if(this.panel.setAttribute("aria-label",this.getAttribute("label")||"Dialog"),this.hasAttribute("open")){if(!this.#t)this.#t=Jt(this);this.#e||=document.activeElement,queueMicrotask(()=>this.#r()),w(this,"awwbookmarklet-dialog-open",{source:this});return}if(this.#t){let t=this.#e;if(Ht(this,this.#t),this.#t=null,this.#e=null,t?.focus)t.focus()}}#r(){(Ot(this)[0]||this.closeButton||this.panel).focus()}#a(t){if(!this.hasAttribute("open"))return;if(t.key==="Escape"&&this.getAttribute("close-on-escape")!=="false"){t.preventDefault(),this.close("escape");return}if(t.key!=="Tab"||!this.hasAttribute("modal"))return;let e=Ot(this);if(!e.length){t.preventDefault(),this.panel.focus();return}let o=e[0],r=e[e.length-1];if(t.shiftKey&&document.activeElement===o)t.preventDefault(),r.focus();else if(!t.shiftKey&&document.activeElement===r)t.preventDefault(),o.focus()}}var Ze=s`
  :host {
    display: block;
    pointer-events: auto;
    min-width: 220px;
    max-width: min(420px, calc(100vw - 24px));
    border: 1px solid var(--_border, var(--awwbookmarklet-border-strong, #232a33));
    background: var(--_bg, var(--awwbookmarklet-surface-raised-bg, #fff));
    color: var(--_fg, var(--awwbookmarklet-input-fg, #111720));
    box-shadow: var(--awwbookmarklet-overlay-shadow, 0 18px 44px rgba(0,0,0,0.24));
    padding: var(--awwbookmarklet-space-2, 8px);
  }

  :host([data-tone="info"]) { --_bg: var(--awwbookmarklet-info-bg, #e7f0ff); --_fg: var(--awwbookmarklet-info-fg, #123d7a); --_border: var(--awwbookmarklet-info-border, #7aa6e8); }
  :host([data-tone="success"]) { --_bg: var(--awwbookmarklet-success-bg, #e5f5eb); --_fg: var(--awwbookmarklet-success-fg, #195b34); --_border: var(--awwbookmarklet-success-border, #72b98b); }
  :host([data-tone="warning"]) { --_bg: var(--awwbookmarklet-warning-bg, #fff4d6); --_fg: var(--awwbookmarklet-warning-fg, #6d4b00); --_border: var(--awwbookmarklet-warning-border, #d9ad3b); }
  :host([data-tone="danger"]) { --_bg: var(--awwbookmarklet-danger-bg, #ffe8e6); --_fg: var(--awwbookmarklet-danger-fg, #8a1f17); --_border: var(--awwbookmarklet-danger-border, #d46a60); }

  .toast {
    display: flex;
    align-items: center;
    gap: 8px;
  }
`,Qt=new Map;function Je(){let t=qt();if(!t)return null;let e=t.querySelector(":scope > [data-aww-toast-stack]");if(!e)e=document.createElement("div"),e.dataset.awwToastStack="true",Object.assign(e.style,{position:"fixed",right:"12px",bottom:"12px",display:"grid",gap:"8px",justifyItems:"end",pointerEvents:"none"}),t.append(e);return e}class lt extends HTMLElement{static observedAttributes=["tone","timeout"];#t=0;constructor(){super();let t=this.attachShadow({mode:"open"});l(t,[d,Ze]),t.innerHTML='<section class="toast" part="toast" role="status" aria-live="polite"><slot></slot></section>',this.addEventListener("mouseenter",()=>clearTimeout(this.#t)),this.addEventListener("mouseleave",()=>this.startTimer())}connectedCallback(){this.#e(),this.startTimer()}disconnectedCallback(){clearTimeout(this.#t)}attributeChangedCallback(){this.#e()}startTimer(){clearTimeout(this.#t);let t=Number(this.getAttribute("timeout")||"2800");if(t<=0)return;this.#t=setTimeout(()=>this.remove(),t)}#e(){this.dataset.tone=g(this.getAttribute("tone"),"info")}}function te({message:t="",tone:e="info",timeout:o=2800,key:r=""}={}){let i=Je();if(!i)return null;let n=r?Qt.get(r):null;if(!n?.isConnected){if(n=document.createElement("awwbookmarklet-toast"),r)Qt.set(r,n);i.append(n)}return n.setAttribute("tone",e),n.setAttribute("timeout",String(o)),n.textContent=String(t??""),n.startTimer?.(),n}var Qe=s`
  :host {
    display: block;
    min-height: 96px;
    border: 1px dashed var(--awwbookmarklet-border-subtle, #9ba5b3);
    background: var(--awwbookmarklet-surface-inset-bg, #e7ebf1);
    color: var(--awwbookmarklet-text-muted, #586272);
    padding: var(--awwbookmarklet-space-3, 12px);
  }

  .empty {
    display: grid;
    place-items: center;
    gap: 6px;
    min-height: inherit;
    text-align: center;
  }

  .title {
    color: var(--awwbookmarklet-input-fg, #111720);
    font-weight: 700;
  }

  .description {
    line-height: 1.4;
  }

  .actions {
    margin-top: 4px;
  }
`;class dt extends HTMLElement{static observedAttributes=["title","description"];constructor(){super();let t=this.attachShadow({mode:"open"});l(t,[d,Qe]),t.innerHTML=`
      <section class="empty" part="empty">
        <div class="title" part="title"></div>
        <div class="description" part="description"></div>
        <div class="content" part="content"><slot></slot></div>
        <div class="actions" part="actions"><slot name="actions"></slot></div>
      </section>
    `,this.titleNode=t.querySelector(".title"),this.descriptionNode=t.querySelector(".description")}connectedCallback(){this.#t()}attributeChangedCallback(){this.#t()}#t(){this.titleNode.textContent=this.getAttribute("title")||"Nothing to show",this.descriptionNode.textContent=this.getAttribute("description")||""}}var to=s`
  :host {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    min-height: 96px;
    background: color-mix(in srgb, var(--awwbookmarklet-surface-raised-bg, #fff) 86%, transparent);
    border: 1px solid var(--awwbookmarklet-border-subtle, #9ba5b3);
    z-index: 2;
  }

  :host([hidden]) { display: none !important; }

  .surface {
    display: grid;
    gap: 8px;
    justify-items: center;
    max-width: min(420px, calc(100% - 24px));
    padding: var(--awwbookmarklet-space-3, 12px);
    text-align: center;
    color: var(--_fg, var(--awwbookmarklet-input-fg, #111720));
  }

  .indicator {
    width: 18px;
    height: 18px;
    border: 2px solid currentColor;
    background: transparent;
  }

  :host([state="loading"]) .indicator {
    border-style: dashed;
    animation: spin 0.9s steps(8, end) infinite;
  }

  :host([data-tone="info"]) { --_fg: var(--awwbookmarklet-info-fg, #123d7a); }
  :host([data-tone="success"]) { --_fg: var(--awwbookmarklet-success-fg, #195b34); }
  :host([data-tone="warning"]) { --_fg: var(--awwbookmarklet-warning-fg, #6d4b00); }
  :host([data-tone="danger"]) { --_fg: var(--awwbookmarklet-danger-fg, #8a1f17); }

  @keyframes spin {
    to { rotate: 360deg; }
  }
`,eo={loading:"info",empty:"neutral",error:"danger",blocked:"warning",success:"success",custom:"neutral"};class ct extends HTMLElement{static observedAttributes=["state","label","tone"];constructor(){super();let t=this.attachShadow({mode:"open"});l(t,[d,to]),t.innerHTML=`
      <section class="surface" part="surface">
        <div class="indicator" part="indicator" aria-hidden="true"></div>
        <div class="label" part="label"></div>
        <div part="actions"><slot name="actions"></slot></div>
      </section>
    `,this.labelNode=t.querySelector(".label")}connectedCallback(){this.#t()}attributeChangedCallback(){this.#t()}#t(){let t=this.getAttribute("state")||"loading",e=eo[t]||"neutral";this.dataset.tone=g(this.getAttribute("tone"),e),this.labelNode.textContent=this.getAttribute("label")||t,this.setAttribute("role",t==="error"||t==="blocked"?"alert":"status"),this.setAttribute("aria-live",t==="error"||t==="blocked"?"assertive":"polite")}}var oo=s`
  :host {
    display: block;
  }

  .list {
    display: grid;
    gap: var(--awwbookmarklet-space-2, 8px);
  }

  .empty[hidden] {
    display: none;
  }
`;class ht extends HTMLElement{static observedAttributes=["empty-text"];constructor(){super();let t=this.attachShadow({mode:"open"});l(t,[d,oo]),t.innerHTML=`
      <div class="list" part="list" role="list"><slot></slot></div>
      <div class="empty" part="empty" hidden>
        <slot name="empty"></slot>
        <awwbookmarklet-empty-state></awwbookmarklet-empty-state>
      </div>
    `,this.slot=t.querySelector("slot:not([name])"),this.empty=t.querySelector(".empty"),this.emptyState=t.querySelector("awwbookmarklet-empty-state"),this.slot.addEventListener("slotchange",()=>this.#t())}connectedCallback(){this.#t()}attributeChangedCallback(){this.#t()}#t(){let t=this.slot.assignedElements({flatten:!0}).filter((e)=>e.slot!=="empty");this.empty.hidden=t.length>0,this.emptyState.setAttribute("title",this.getAttribute("empty-text")||"No items")}}var ro=s`
  :host {
    display: block;
  }

  .item {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    gap: var(--awwbookmarklet-space-2, 8px);
    align-items: start;
    border: 1px solid var(--_border, var(--awwbookmarklet-border-subtle, #9ba5b3));
    background: var(--_bg, var(--awwbookmarklet-card-bg, #fbfcfe));
    padding: var(--awwbookmarklet-space-2, 8px);
    color: var(--_fg, var(--awwbookmarklet-input-fg, #111720));
  }

  :host([compact]) .item { padding: 6px; }
  :host([interactive]) .item,
  :host([selectable]) .item { cursor: pointer; }
  :host([selected]) .item { --_bg: var(--awwbookmarklet-card-selected-bg, #e8f1ff); --_border: var(--awwbookmarklet-selection-bg, #1f5eae); }
  :host([disabled]) .item { opacity: 0.58; cursor: not-allowed; }

  .main {
    display: grid;
    gap: 3px;
    min-width: 0;
  }

  .title {
    font-weight: 700;
    overflow-wrap: anywhere;
  }

  .meta,
  .description,
  .status {
    color: var(--awwbookmarklet-text-muted, #586272);
    line-height: 1.35;
    overflow-wrap: anywhere;
  }

  .actions {
    display: flex;
    justify-content: end;
    min-width: 0;
  }

  :host([data-tone="info"]) { --_border: var(--awwbookmarklet-info-border, #7aa6e8); }
  :host([data-tone="success"]) { --_border: var(--awwbookmarklet-success-border, #72b98b); }
  :host([data-tone="warning"]) { --_border: var(--awwbookmarklet-warning-border, #d9ad3b); }
  :host([data-tone="danger"]) { --_border: var(--awwbookmarklet-danger-border, #d46a60); }

  @media (max-width: 520px) {
    .item {
      grid-template-columns: auto minmax(0, 1fr);
    }

    .actions,
    .trailing {
      grid-column: 1 / -1;
      justify-content: start;
    }
  }
`;function ao(t){return(t.composedPath?.()||[]).some((o)=>{if(!o?.slot)return!1;return o.slot==="actions"||o.slot==="trailing"})}class bt extends HTMLElement{static observedAttributes=["tone","selected","disabled","interactive","selectable"];constructor(){super();let t=this.attachShadow({mode:"open"});l(t,[d,ro]),t.innerHTML=`
      <article class="item" part="item" role="listitem" tabindex="-1">
        <div part="leading"><slot name="leading"></slot></div>
        <div class="main" part="main">
          <div class="title" part="title"><slot name="title"></slot></div>
          <div class="meta" part="meta"><slot name="meta"></slot></div>
          <div part="thumbnail"><slot name="thumbnail"></slot></div>
          <div class="description" part="description"><slot name="description"></slot><slot></slot></div>
          <div class="status" part="status"><slot name="status"></slot></div>
          <div part="footer"><slot name="footer"></slot></div>
        </div>
        <div class="trailing" part="trailing"><slot name="trailing"></slot></div>
        <div class="actions" part="actions"><slot name="actions"></slot></div>
      </article>
    `,this.surface=t.querySelector(".item"),this.surface.addEventListener("click",(e)=>this.#e(e)),this.surface.addEventListener("keydown",(e)=>this.#o(e))}connectedCallback(){this.#t()}attributeChangedCallback(){this.#t()}#t(){this.dataset.tone=g(this.getAttribute("tone")),this.surface.tabIndex=this.hasAttribute("interactive")||this.hasAttribute("selectable")?0:-1,this.surface.setAttribute("aria-selected",this.hasAttribute("selected")?"true":"false"),this.surface.setAttribute("aria-disabled",this.hasAttribute("disabled")?"true":"false")}#e(t){if(this.hasAttribute("disabled")||ao(t))return;if(!this.hasAttribute("interactive")&&!this.hasAttribute("selectable"))return;if(this.hasAttribute("selectable"))this.toggleAttribute("selected",!this.hasAttribute("selected"));w(this,"awwbookmarklet-list-item-activate",{selected:this.hasAttribute("selected"),source:this})}#o(t){if(t.key!=="Enter"&&t.key!==" ")return;t.preventDefault(),this.surface.click()}}var io=s`
  :host {
    display: block;
  }

  .card {
    display: grid;
    gap: var(--awwbookmarklet-space-2, 8px);
    border: 1px solid var(--_border, var(--awwbookmarklet-border-subtle, #9ba5b3));
    background: var(--_bg, var(--awwbookmarklet-card-bg, #fbfcfe));
    padding: var(--awwbookmarklet-space-2, 8px);
  }

  .header {
    display: flex;
    align-items: start;
    justify-content: space-between;
    gap: var(--awwbookmarklet-space-2, 8px);
    min-width: 0;
  }

  .heading {
    display: grid;
    gap: 2px;
    min-width: 0;
  }

  .title { font-weight: 700; overflow-wrap: anywhere; }
  .meta { color: var(--awwbookmarklet-text-muted, #586272); overflow-wrap: anywhere; }
  .body { min-width: 0; line-height: 1.4; }
  .footer { border-top: 1px solid var(--awwbookmarklet-divider-color, #c3cad4); padding-top: 6px; }

  :host([selected]) .card { --_bg: var(--awwbookmarklet-card-selected-bg, #e8f1ff); --_border: var(--awwbookmarklet-selection-bg, #1f5eae); }
  :host([data-tone="info"]) { --_border: var(--awwbookmarklet-info-border, #7aa6e8); }
  :host([data-tone="success"]) { --_border: var(--awwbookmarklet-success-border, #72b98b); }
  :host([data-tone="warning"]) { --_border: var(--awwbookmarklet-warning-border, #d9ad3b); }
  :host([data-tone="danger"]) { --_border: var(--awwbookmarklet-danger-border, #d46a60); }
`;class ut extends HTMLElement{static observedAttributes=["tone"];constructor(){super();let t=this.attachShadow({mode:"open"});l(t,[d,io]),t.innerHTML=`
      <article class="card" part="card">
        <div class="header" part="header">
          <div class="heading" part="heading">
            <div class="title" part="title"><slot name="title"></slot></div>
            <div class="meta" part="meta"><slot name="meta"></slot></div>
          </div>
          <div part="actions"><slot name="actions"></slot></div>
        </div>
        <div part="media"><slot name="media"></slot></div>
        <div class="body" part="body"><slot></slot></div>
        <div class="footer" part="footer"><slot name="footer"></slot></div>
      </article>
    `}connectedCallback(){this.#t()}attributeChangedCallback(){this.#t()}#t(){this.dataset.tone=g(this.getAttribute("tone"))}}var so=new Set(["A","ABBR","B","BLOCKQUOTE","BR","CODE","DD","DIV","DL","DT","EM","H1","H2","H3","H4","H5","H6","HR","I","IMG","LI","OL","P","PRE","S","SPAN","STRONG","SUB","SUP","TABLE","TBODY","TD","TFOOT","TH","THEAD","TR","U","UL"]),no=new Set(["title","aria-label","aria-hidden","role"]),lo=new Set(["colspan","rowspan"]);function co(t){let e=String(t??"").trim().replace(/[\u0000-\u001f\s]+/g,"");if(!e)return!0;if(e.startsWith("#")||e.startsWith("/")||e.startsWith("./")||e.startsWith("../"))return!0;try{let o=new URL(e,"https://example.invalid/");return["http:","https:","mailto:"].includes(o.protocol)}catch{return!1}}function ee(t,e){for(let o of[...t.children])ee(o,e);if(!so.has(t.tagName)){t.replaceWith(...t.childNodes);return}if(t.tagName==="IMG"&&e.images==="hidden"){t.remove();return}for(let o of[...t.attributes]){let r=o.name.toLowerCase(),i=o.value,n=lo.has(r)&&["TD","TH"].includes(t.tagName);if(!(no.has(r)||n||t.tagName==="A"&&["href","target","rel"].includes(r)||t.tagName==="IMG"&&["src","alt","width","height"].includes(r))||r.startsWith("on")||r==="style"){t.removeAttribute(o.name);continue}if((r==="href"||r==="src")&&!co(i))t.removeAttribute(o.name)}if(t.tagName==="A"){if(t.hasAttribute("href")&&e.links!=="plain")t.setAttribute("rel","noopener noreferrer"),t.setAttribute("target","_blank");else if(e.links==="plain")t.removeAttribute("href")}}function ho(t,e){let i=new DOMParser().parseFromString(`<div>${String(t??"")}</div>`,"text/html").body.firstElementChild;return ee(i,e),i.innerHTML}function bo(t){return String(t??"").replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi,"").replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi,"").replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi,"").replace(/\s(href|src)\s*=\s*("|')?\s*javascript:[^"'\s>]*/gi,"").replace(/<\/?(iframe|object|embed|form|input|button|meta|link)[^>]*>/gi,"")}function N(t,e={}){let o={links:e.links||"safe",images:e.images||"constrained"};if(typeof DOMParser<"u")return ho(t,o);return bo(t)}var uo=s`
  :host {
    display: block;
    min-width: 0;
    border: 1px solid var(--awwbookmarklet-border-subtle, #9ba5b3);
    background: var(--awwbookmarklet-surface-raised-bg, #fff);
  }

  .wrap {
    min-height: 96px;
    max-width: 100%;
    overflow: auto;
    padding: var(--awwbookmarklet-space-3, 12px);
  }

  .empty {
    color: var(--awwbookmarklet-text-muted, #586272);
    display: none;
  }

  :host([data-empty="true"]) .empty {
    display: block;
  }

  :host([data-empty="true"]) .content {
    display: none;
  }

  .content {
    color: var(--awwbookmarklet-input-fg, #111720);
    line-height: 1.5;
    overflow-wrap: anywhere;
  }

  .content h1,
  .content h2,
  .content h3,
  .content h4 {
    margin: 0.7em 0 0.35em;
    line-height: 1.2;
  }

  .content p,
  .content ul,
  .content ol,
  .content blockquote,
  .content pre,
  .content table {
    margin: 0 0 0.85em;
  }

  .content img {
    max-width: 100%;
    height: auto;
  }

  .content table {
    display: block;
    max-width: 100%;
    overflow-x: auto;
    border-collapse: collapse;
  }

  .content th,
  .content td {
    border: 1px solid var(--awwbookmarklet-divider-color, #c3cad4);
    padding: 4px 6px;
    vertical-align: top;
  }

  .content blockquote {
    border-left: 3px solid var(--awwbookmarklet-border-subtle, #9ba5b3);
    padding-left: 10px;
    color: var(--awwbookmarklet-text-muted, #586272);
  }

  .content pre {
    overflow: auto;
    max-width: 100%;
    padding: 8px;
    background: var(--awwbookmarklet-code-bg, #e8edf4);
    color: var(--awwbookmarklet-code-fg, #172131);
  }

  .content code {
    background: var(--awwbookmarklet-code-bg, #e8edf4);
    color: var(--awwbookmarklet-code-fg, #172131);
    padding: 0 3px;
  }

  .content pre code {
    padding: 0;
    background: transparent;
  }
`;class pt extends HTMLElement{static observedAttributes=["empty-text","links","images"];#t="";constructor(){super();let t=this.attachShadow({mode:"open"});l(t,[d,uo]),t.innerHTML=`
      <section class="wrap" part="wrap">
        <div class="empty" part="empty"></div>
        <div class="content" part="content"></div>
      </section>
    `,this.emptyNode=t.querySelector(".empty"),this.contentNode=t.querySelector(".content")}connectedCallback(){this.#e()}attributeChangedCallback(){this.#e()}get html(){return this.#t}set html(t){this.#t=N(t,{links:this.getAttribute("links")||"safe",images:this.getAttribute("images")||"constrained"}),this.#e()}setUnsafeHTML(t){this.#t=String(t??""),this.#e()}#e(){if(!this.contentNode)return;this.emptyNode.textContent=this.getAttribute("empty-text")||"Nothing to preview.",this.contentNode.innerHTML=this.#t,this.dataset.empty=this.#t.trim()?"false":"true"}}var po=s`
  :host {
    display: grid;
    min-height: 220px;
    min-width: 0;
    border: 1px solid var(--awwbookmarklet-border-strong, #232a33);
    background: var(--awwbookmarklet-surface-inset-bg, #e7ebf1);
  }

  .panel {
    position: relative;
    display: grid;
    grid-template-rows: auto minmax(0, 1fr);
    min-height: inherit;
    min-width: 0;
  }

  .chrome {
    display: flex;
    align-items: center;
    gap: var(--awwbookmarklet-space-2, 8px);
    padding: 6px;
    border-bottom: 1px solid var(--awwbookmarklet-divider-color, #c3cad4);
    background: var(--awwbookmarklet-surface-raised-bg, #fff);
  }

  .address {
    flex: 1 1 auto;
    min-width: 0;
    color: var(--awwbookmarklet-text-muted, #586272);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  iframe {
    width: 100%;
    height: 100%;
    min-height: 180px;
    border: 0;
    background: #fff;
  }

  .overlay {
    position: absolute;
    inset: 31px 0 0;
    display: none;
  }

  :host([loading]) .overlay,
  :host([error]) .overlay {
    display: block;
  }

  button {
    min-height: 26px;
    border: 1px solid var(--awwbookmarklet-border-strong, #232a33);
    background: var(--awwbookmarklet-button-bg, #f1f4f8);
    color: var(--awwbookmarklet-button-fg, #111720);
    font: inherit;
  }
`;class wt extends HTMLElement{static observedAttributes=["src","sandbox","referrerpolicy","loading","error","title","loading-label","error-label"];constructor(){super();let t=this.attachShadow({mode:"open"});l(t,[d,po]),t.innerHTML=`
      <section class="panel" part="panel">
        <div class="chrome" part="chrome">
          <div class="address" part="address"><slot name="address"></slot><span data-address></span></div>
          <div part="actions"><slot name="actions"></slot></div>
        </div>
        <iframe part="frame"></iframe>
        <div class="overlay" part="overlay">
          <awwbookmarklet-state-overlay></awwbookmarklet-state-overlay>
          <slot name="overlay"></slot>
        </div>
      </section>
    `,this.frame=t.querySelector("iframe"),this.addressFallback=t.querySelector("[data-address]"),this.overlay=t.querySelector("awwbookmarklet-state-overlay"),this.frame.addEventListener("load",()=>{this.removeAttribute("loading"),w(this,"awwbookmarklet-frame-load",{src:this.src})}),this.frame.addEventListener("error",()=>{this.setAttribute("error",""),w(this,"awwbookmarklet-frame-error",{src:this.src})})}connectedCallback(){this.#t()}attributeChangedCallback(){this.#t()}get src(){return this.getAttribute("src")||""}set src(t){this.setAttribute("src",String(t??""))}retry(){if(w(this,"awwbookmarklet-frame-retry",{src:this.src}),this.src)this.setAttribute("loading",""),this.removeAttribute("error"),this.frame.src=this.src}openExternally(){w(this,"awwbookmarklet-frame-fallback-open",{src:this.src})}#t(){if(!this.frame)return;let t=this.getAttribute("src")||"about:blank";if(this.frame.getAttribute("src")!==t)this.frame.setAttribute("src",t);this.frame.setAttribute("title",this.getAttribute("title")||"Browser panel"),this.frame.setAttribute("sandbox",this.getAttribute("sandbox")||"allow-scripts allow-forms allow-same-origin"),this.frame.setAttribute("referrerpolicy",this.getAttribute("referrerpolicy")||"no-referrer"),this.addressFallback.textContent=this.getAttribute("src")||"No page loaded";let e=this.hasAttribute("error");this.overlay.setAttribute("state",e?"blocked":"loading"),this.overlay.setAttribute("label",e?this.getAttribute("error-label")||"This page could not be loaded here.":this.getAttribute("loading-label")||"Loading page")}}var wo=s`
  :host {
    display: block;
    border: 1px solid var(--awwbookmarklet-warning-border, #d9ad3b);
    background: var(--awwbookmarklet-warning-bg, #fff4d6);
    color: var(--awwbookmarklet-warning-fg, #6d4b00);
    padding: var(--awwbookmarklet-space-2, 8px);
  }

  .wrap {
    display: grid;
    gap: 6px;
  }

  .label {
    font-weight: 700;
  }

  textarea {
    min-height: 92px;
    width: 100%;
    border: 1px solid var(--awwbookmarklet-border-strong, #232a33);
    background: var(--awwbookmarklet-input-bg, #fff);
    color: var(--awwbookmarklet-input-fg, #111720);
    font: inherit;
    padding: 8px;
  }
`;class mt extends HTMLElement{static observedAttributes=["label","value"];constructor(){super();let t=this.attachShadow({mode:"open"});l(t,[d,wo]),t.innerHTML=`
      <section class="wrap" part="wrap">
        <div class="label" part="label"></div>
        <div part="description"><slot>Automatic copy is unavailable. Select the text below and copy it manually.</slot></div>
        <textarea part="control" readonly></textarea>
      </section>
    `,this.labelNode=t.querySelector(".label"),this.control=t.querySelector("textarea")}connectedCallback(){this.#t()}attributeChangedCallback(){this.#t()}get value(){return this.control.value}set value(t){this.setAttribute("value",String(t??""))}selectText(){this.control.focus(),this.control.select()}#t(){this.labelNode.textContent=this.getAttribute("label")||"Manual copy required",this.control.value=this.getAttribute("value")||""}}var mo=s`
  :host {
    display: block;
    min-width: min(100%, 320px);
  }

  .palette {
    display: grid;
    gap: var(--awwbookmarklet-space-2, 8px);
    min-width: 0;
  }

  input {
    width: 100%;
    min-height: var(--awwbookmarklet-size-control-h, 30px);
    border: 1px solid var(--awwbookmarklet-border-strong, #232a33);
    background: var(--awwbookmarklet-input-bg, #fff);
    color: var(--awwbookmarklet-input-fg, #111720);
    padding: 0 8px;
    font: inherit;
  }

  input:focus-visible {
    outline: none;
    box-shadow: var(--_ring);
  }

  .list {
    display: grid;
    gap: 4px;
    max-height: 280px;
    overflow: auto;
  }

  .command {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 8px;
    align-items: start;
    border: 1px solid var(--awwbookmarklet-border-subtle, #9ba5b3);
    background: var(--awwbookmarklet-card-bg, #fbfcfe);
    padding: 7px 8px;
    text-align: left;
    color: var(--awwbookmarklet-input-fg, #111720);
    font: inherit;
  }

  .command[aria-selected="true"] {
    border-color: var(--awwbookmarklet-selection-bg, #1f5eae);
    background: var(--awwbookmarklet-card-selected-bg, #e8f1ff);
  }

  .command:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  .label {
    font-weight: 700;
    overflow-wrap: anywhere;
  }

  .meta,
  .shortcut {
    color: var(--awwbookmarklet-text-muted, #586272);
    font-size: 12px;
    line-height: 1.35;
  }

  .shortcut {
    font-family: ui-monospace, SFMono-Regular, Consolas, "Liberation Mono", monospace;
    white-space: nowrap;
  }

  .empty {
    border: 1px dashed var(--awwbookmarklet-border-subtle, #9ba5b3);
    color: var(--awwbookmarklet-text-muted, #586272);
    padding: var(--awwbookmarklet-space-3, 12px);
    text-align: center;
  }
`;class gt extends HTMLElement{static observedAttributes=["placeholder","empty-text"];#t=[];#e=[];#o=0;constructor(){super();let t=this.attachShadow({mode:"open"});l(t,[d,mo]),t.innerHTML=`
      <section class="palette" part="palette">
        <input part="input" type="search" autocomplete="off" spellcheck="false" aria-label="Filter commands" />
        <div class="list" part="list" role="listbox" aria-label="Commands"></div>
      </section>
    `,this.input=t.querySelector("input"),this.list=t.querySelector(".list"),this.input.addEventListener("input",()=>this.#r()),this.input.addEventListener("keydown",(e)=>this.#l(e))}connectedCallback(){this.#a()}attributeChangedCallback(){this.#a()}get commands(){return this.#t}set commands(t){this.#t=Array.isArray(t)?t:[],this.#r()}focusInput(){this.input?.focus()}#r(){let t=this.input?.value.trim().toLowerCase()||"";this.#e=this.#t.filter((e)=>{if(!t)return!0;return[e.label,e.group,e.shortcut,...e.keywords||[]].join(" ").toLowerCase().includes(t)}),this.#o=Math.min(this.#o,Math.max(0,this.#e.length-1)),this.#i(),w(this,"awwbookmarklet-command-palette-filter",{query:t,count:this.#e.length})}#a(){if(!this.input)return;this.input.placeholder=this.getAttribute("placeholder")||"Type a command",this.#r()}#i(){if(this.list.textContent="",!this.#e.length){let t=document.createElement("div");t.className="empty",t.setAttribute("part","empty"),t.textContent=this.getAttribute("empty-text")||"No matching commands.",this.list.append(t);return}this.#e.forEach((t,e)=>{let o=document.createElement("button");o.type="button",o.className="command",o.setAttribute("part","command"),o.disabled=Boolean(t.disabled),o.setAttribute("role","option"),o.setAttribute("aria-selected",e===this.#o?"true":"false"),o.innerHTML=`
        <span>
          <span class="label" part="label"></span>
          <span class="meta" part="meta"></span>
        </span>
        <span class="shortcut" part="shortcut"></span>
      `,o.querySelector(".label").textContent=String(t.label||t.id||"Untitled command"),o.querySelector(".meta").textContent=[t.group,t.description].filter(Boolean).join(" - "),o.querySelector(".shortcut").textContent=String(t.shortcut||""),o.addEventListener("click",()=>this.#s(t)),this.list.append(o)})}#l(t){if(t.key==="ArrowDown"||t.key==="ArrowUp"){t.preventDefault();let e=t.key==="ArrowDown"?1:-1,o=this.#e.length;if(!o)return;this.#o=(this.#o+e+o)%o,this.#i();return}if(t.key==="Enter"){t.preventDefault();let e=this.#e[this.#o];if(e)this.#s(e)}}#s(t){if(t.disabled)return;if(w(this,"awwbookmarklet-command-palette-execute",{commandId:t.id||"",command:t,source:this}),typeof t.run==="function")t.run(t)}}var go=s`
  :host {
    display: block;
    min-width: 0;
  }

  .help {
    display: grid;
    gap: var(--awwbookmarklet-space-2, 8px);
  }

  .group {
    display: grid;
    gap: 4px;
    min-width: 0;
  }

  .group-title {
    color: var(--awwbookmarklet-text-muted, #586272);
    font-weight: 700;
    text-transform: uppercase;
    font-size: 12px;
  }

  .row {
    display: grid;
    grid-template-columns: minmax(88px, max-content) minmax(0, 1fr);
    gap: 10px;
    align-items: start;
    min-width: 0;
    border-top: 1px solid var(--awwbookmarklet-divider-color, #c3cad4);
    padding-top: 5px;
  }

  kbd {
    border: 1px solid var(--awwbookmarklet-border-strong, #232a33);
    background: var(--awwbookmarklet-surface-inset-bg, #e7ebf1);
    padding: 2px 5px;
    font: inherit;
    font-family: ui-monospace, SFMono-Regular, Consolas, "Liberation Mono", monospace;
    white-space: nowrap;
  }

  .description {
    min-width: 0;
    line-height: 1.35;
    overflow-wrap: anywhere;
  }
`;class ft extends HTMLElement{static observedAttributes=["empty-text"];#t=[];constructor(){super();let t=this.attachShadow({mode:"open"});l(t,[d,go]),t.innerHTML='<section class="help" part="help"></section>',this.helpNode=t.querySelector(".help")}connectedCallback(){this.#e()}attributeChangedCallback(){this.#e()}get shortcuts(){return this.#t}set shortcuts(t){this.#t=Array.isArray(t)?t:[],this.#e()}#e(){if(!this.helpNode)return;if(this.helpNode.textContent="",!this.#t.length){let e=document.createElement("div");e.setAttribute("part","empty"),e.textContent=this.getAttribute("empty-text")||"No shortcuts available.",this.helpNode.append(e);return}let t=new Map;for(let e of this.#t){let o=String(e.group||"General");if(!t.has(o))t.set(o,[]);t.get(o).push(e)}for(let[e,o]of t){let r=document.createElement("section");r.className="group",r.setAttribute("part","group");let i=document.createElement("div");i.className="group-title",i.setAttribute("part","group-title"),i.textContent=e,r.append(i);for(let n of o){let h=document.createElement("div");h.className="row",h.setAttribute("part","row");let u=document.createElement("kbd");u.setAttribute("part","shortcut"),u.textContent=String(n.shortcut||"");let p=document.createElement("div");p.className="description",p.setAttribute("part","description"),p.textContent=String(n.description||n.label||""),h.append(u,p),r.append(h)}this.helpNode.append(r)}}}var fo=new Set(["javascript:","data:","file:","chrome:","about:"]);function oe(t){try{let e=new URL(String(t??"").trim());return e.protocol==="http:"||e.protocol==="https:"}catch{return!1}}function $t(t,e="https://www.google.com/search?q={query}"){let o=String(t||"").trim();if(!o||!o.includes("{query}"))return e;try{let r=o.replace("{query}","test"),i=new URL(r);if(i.protocol!=="http:"&&i.protocol!=="https:")return e;return o}catch{return e}}function kt(t,e="https://www.google.com/search?q={query}"){return $t(e).replace("{query}",encodeURIComponent(String(t??"").trim()))}function vt(t,e="https://www.google.com/search?q={query}"){let o=String(t??"").trim();if(!o)return{kind:"ignore",input:o};try{let r=new URL(o);if(r.protocol==="http:"||r.protocol==="https:")return{kind:"navigate_url",input:o,targetUrl:r.href};if(fo.has(r.protocol))return{kind:"blocked_protocol",input:o,protocol:r.protocol}}catch{}if(/^[\w.-]+\.[a-z]{2,}([/:?#].*)?$/i.test(o))try{return{kind:"navigate_url",input:o,targetUrl:new URL(`https://${o}`).href}}catch{return{kind:"search",input:o,query:o,targetUrl:kt(o,e)}}return{kind:"search",input:o,query:o,targetUrl:kt(o,e)}}function xt(t){try{return new URL(String(t??"").trim()).hostname}catch{return""}}var ko=s`
  :host {
    display: block;
    min-width: min(100%, 260px);
  }

  .picker {
    display: grid;
    gap: 4px;
    min-width: 0;
  }

  input {
    width: 100%;
    min-height: var(--awwbookmarklet-size-control-h, 30px);
    border: 1px solid var(--awwbookmarklet-border-strong, #232a33);
    background: var(--awwbookmarklet-input-bg, #fff);
    color: var(--awwbookmarklet-input-fg, #111720);
    padding: 0 8px;
    font: inherit;
  }

  input:focus-visible {
    outline: none;
    box-shadow: var(--_ring);
  }

  .list {
    display: none;
    max-height: 240px;
    overflow: auto;
    border: 1px solid var(--awwbookmarklet-border-strong, #232a33);
    background: var(--awwbookmarklet-menu-bg, #f8fbff);
  }

  :host([open]) .list {
    display: grid;
  }

  .option {
    display: grid;
    gap: 2px;
    min-width: 0;
    border: 0;
    border-bottom: 1px solid var(--awwbookmarklet-divider-color, #c3cad4);
    background: transparent;
    color: var(--awwbookmarklet-menu-fg, #0e1621);
    padding: 7px 8px;
    text-align: left;
    font: inherit;
  }

  .option[aria-selected="true"] {
    background: var(--awwbookmarklet-card-selected-bg, #e8f1ff);
  }

  .title {
    font-weight: 700;
    overflow-wrap: anywhere;
  }

  .meta {
    color: var(--awwbookmarklet-text-muted, #586272);
    font-size: 12px;
    line-height: 1.35;
    overflow-wrap: anywhere;
  }
`;class yt extends HTMLElement{static observedAttributes=["value","placeholder","search-template","open"];#t=[];#e=0;constructor(){super();let t=this.attachShadow({mode:"open"});l(t,[d,ko]),t.innerHTML=`
      <section class="picker" part="picker">
        <input part="input" type="text" autocomplete="off" spellcheck="false" aria-label="URL or search query" />
        <div class="list" part="list" role="listbox"></div>
      </section>
    `,this.input=t.querySelector("input"),this.list=t.querySelector(".list"),this.input.addEventListener("input",()=>this.#r()),this.input.addEventListener("focus",()=>this.#a()),this.input.addEventListener("keydown",(e)=>this.#l(e))}connectedCallback(){this.#o()}attributeChangedCallback(){this.#o()}get value(){return this.input?.value||""}set value(t){this.setAttribute("value",String(t??""))}get suggestions(){return this.#t}set suggestions(t){this.#t=Array.isArray(t)?t:[],this.#n()}close(){this.removeAttribute("open")}#o(){if(!this.input)return;let t=this.getAttribute("value")||"";if(this.input.value!==t)this.input.value=t;this.input.placeholder=this.getAttribute("placeholder")||"Type URL or search query",this.#n()}#r(){this.setAttribute("value",this.input.value),this.#e=0,this.#a(),w(this,"awwbookmarklet-url-picker-query",{query:this.input.value,decision:this.#i()})}#a(){if(this.#t.length||this.input.value.trim())this.setAttribute("open","")}#i(){return vt(this.input.value,this.getAttribute("search-template")||void 0)}#l(t){if(t.key==="Escape"){this.close();return}if(t.key==="ArrowDown"||t.key==="ArrowUp"){t.preventDefault();let e=this.#s().length;if(!e)return;let o=t.key==="ArrowDown"?1:-1;this.#e=(this.#e+o+e)%e,this.setAttribute("open",""),this.#n();return}if(t.key==="Enter"){t.preventDefault();let e=this.#s()[this.#e];if(e)this.#d(e);else this.#d({type:"direct",decision:this.#i()})}}#s(){let t=this.#i();return[...t.kind==="ignore"||t.kind==="blocked_protocol"?[]:[{type:"direct",decision:t}],...this.#t]}#n(){if(!this.list)return;this.list.textContent="",this.#s().forEach((e,o)=>{let r=document.createElement("button");r.type="button",r.className="option",r.setAttribute("part","option"),r.setAttribute("role","option"),r.setAttribute("aria-selected",o===this.#e?"true":"false");let i=document.createElement("span");i.className="title",i.setAttribute("part","title");let n=document.createElement("span");if(n.className="meta",n.setAttribute("part","meta"),e.type==="direct")i.textContent=e.decision.kind==="navigate_url"?`Open ${e.decision.targetUrl}`:`Search for "${e.decision.query}"`,n.textContent=e.decision.kind==="navigate_url"?xt(e.decision.targetUrl):e.decision.targetUrl;else i.textContent=String(e.title||e.label||e.url||"Untitled"),n.textContent=String(e.description||e.url||"");r.append(i,n),r.addEventListener("click",()=>this.#d(e)),this.list.append(r)})}#d(t){let e=t.type==="direct"?t.decision:{kind:"navigate_url",input:t.url||"",targetUrl:t.url||""};if(e.kind==="blocked_protocol"||e.kind==="ignore")return;this.value=e.targetUrl||"",this.close(),w(this,"awwbookmarklet-url-picker-apply",{item:t,decision:e,source:this})}}var vo=s`
  :host {
    display: block;
    min-width: 0;
  }

  .metric {
    display: grid;
    gap: 4px;
    min-width: 0;
    border: 1px solid var(--_border, var(--awwbookmarklet-border-subtle, #9ba5b3));
    background: var(--awwbookmarklet-metric-bg, var(--awwbookmarklet-surface-raised-bg, #fff));
    padding: var(--awwbookmarklet-space-2, 8px);
  }

  .label,
  .description {
    color: var(--awwbookmarklet-text-muted, #586272);
    line-height: 1.35;
    overflow-wrap: anywhere;
  }

  .value {
    font-size: 22px;
    font-weight: 750;
    line-height: 1.1;
    overflow-wrap: anywhere;
  }

  .delta {
    color: var(--_fg, var(--awwbookmarklet-text-muted, #586272));
    font-size: 12px;
    line-height: 1.3;
    overflow-wrap: anywhere;
  }

  :host([compact]) .value {
    font-size: 18px;
  }

  :host([data-tone="info"]) { --_fg: var(--awwbookmarklet-info-fg, #123d7a); --_border: var(--awwbookmarklet-info-border, #7aa6e8); }
  :host([data-tone="success"]) { --_fg: var(--awwbookmarklet-success-fg, #195b34); --_border: var(--awwbookmarklet-success-border, #72b98b); }
  :host([data-tone="warning"]) { --_fg: var(--awwbookmarklet-warning-fg, #6d4b00); --_border: var(--awwbookmarklet-warning-border, #d9ad3b); }
  :host([data-tone="danger"]) { --_fg: var(--awwbookmarklet-danger-fg, #8a1f17); --_border: var(--awwbookmarklet-danger-border, #d46a60); }
`;class At extends HTMLElement{static observedAttributes=["label","value","description","delta","tone"];constructor(){super();let t=this.attachShadow({mode:"open"});l(t,[d,vo]),t.innerHTML=`
      <section class="metric" part="metric">
        <div class="label" part="label"><slot name="label"></slot><span data-label></span></div>
        <div class="value" part="value"><slot name="value"></slot><span data-value></span></div>
        <div class="delta" part="delta"><slot name="delta"></slot><span data-delta></span></div>
        <div class="description" part="description"><slot name="description"></slot><span data-description></span><slot></slot></div>
      </section>
    `,this.labelNode=t.querySelector("[data-label]"),this.valueNode=t.querySelector("[data-value]"),this.deltaNode=t.querySelector("[data-delta]"),this.descriptionNode=t.querySelector("[data-description]")}connectedCallback(){this.#t()}attributeChangedCallback(){this.#t()}#t(){this.dataset.tone=g(this.getAttribute("tone")),this.labelNode.textContent=this.getAttribute("label")||"",this.valueNode.textContent=this.getAttribute("value")||"",this.deltaNode.textContent=this.getAttribute("delta")||"",this.descriptionNode.textContent=this.getAttribute("description")||""}}function E(){Dt([[a.desktopRoot,O],[a.window,$],[a.menubar,R],[a.menu,I],[a.button,P],[a.iconButton,Y],[a.input,D],[a.textarea,z],[a.checkbox,V],[a.radio,F],[a.select,U],[a.range,W],[a.progress,j],[a.tabs,K],[a.tabPanel,G],[a.listbox,X],[a.group,Z],[a.panel,J],[a.statusbar,Q],[a.appShell,tt],[a.toolbar,rt],[a.field,at],[a.statusLine,it],[a.alert,st],[a.dialog,nt],[a.toast,lt],[a.emptyState,dt],[a.stateOverlay,ct],[a.list,ht],[a.listItem,bt],[a.card,ut],[a.richPreview,pt],[a.browserPanel,wt],[a.manualCopy,mt],[a.commandPalette,gt],[a.shortcutHelp,ft],[a.urlPicker,yt],[a.metricCard,At]])}function xo(){return'<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="square"/></svg>'}function Rt({title:t="Page Extraction Tool"}={}){let e=document.createElement(a.window);e.setAttribute("title",t);let o=document.createElement(a.menubar);o.slot="menubar",o.innerHTML=`
    <button type="button" data-menu="file">File</button>
    <button type="button" data-menu="view">View</button>
    <button type="button" data-menu="help">Help</button>

    <${a.menu} name="file">
      <button type="button" data-command="tool.run">Run</button>
      <button type="button" data-command="tool.reset">Reset</button>
      <div data-separator role="separator"></div>
      <button type="button" data-command="tool.close">Close</button>
    </${a.menu}>

    <${a.menu} name="view">
      <button type="button" data-command="view.compact">Compact Mode</button>
      <button type="button" data-command="view.normal">Normal Mode</button>
    </${a.menu}>

    <${a.menu} name="help">
      <button type="button" data-command="help.about">About</button>
    </${a.menu}>
  `;let r=document.createElement("div");r.slot="toolbar",r.style.display="flex",r.style.flexWrap="wrap",r.style.gap="8px",r.style.padding="6px 8px",r.style.alignItems="center",r.innerHTML=`
    <${a.iconButton} id="tool-refresh" aria-label="Refresh">${xo()}</${a.iconButton}>
    <${a.button} id="tool-run">Run</${a.button}>
    <${a.button} id="tool-close">Close</${a.button}>
  `;let i=document.createElement(a.statusbar);i.slot="statusbar",i.innerHTML='<span id="status-main">Ready</span><span id="status-count">0 selected</span><span id="status-mode">Normal</span>';let n=document.createElement("div");n.style.display="grid",n.style.gap="12px",n.innerHTML=`
    <${a.group} caption="Target">
      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap:8px; align-items:center;">
        <${a.input} id="target-input" placeholder="CSS selector or current selection"></${a.input}>
        <${a.button} id="target-refresh">Refresh</${a.button}>
        <${a.button} id="target-pick">Pick Again</${a.button}>
      </div>
    </${a.group}>

    <${a.panel}>
      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap:12px;">
        <${a.group} caption="Options">
          <div style="display:grid; gap:8px;">
            <${a.checkbox} checked id="opt-trim">Trim whitespace</${a.checkbox}>
            <${a.checkbox} id="opt-links">Include links</${a.checkbox}>
            <${a.checkbox} checked id="opt-visible">Only visible nodes</${a.checkbox}>
            <div style="display:grid; gap:6px; margin-top:4px;">
              <${a.radio} name="mode" value="text" checked>Text</${a.radio}>
              <${a.radio} name="mode" value="html">HTML</${a.radio}>
            </div>
          </div>
        </${a.group}>

        <${a.group} caption="Output">
          <${a.tabs} id="output-tabs">
            <${a.tabPanel} label="Result" selected>
              <${a.textarea} id="result-output" rows="6" placeholder="Extraction result"></${a.textarea}>
            </${a.tabPanel}>
            <${a.tabPanel} label="History">
              <${a.listbox} id="history-list">
                <div role="option" aria-selected="true" data-value="run-1">Run #1</div>
                <div role="option" data-value="run-2">Run #2</div>
                <div role="option" data-value="run-3">Run #3</div>
              </${a.listbox}>
            </${a.tabPanel}>
          </${a.tabs}>
        </${a.group}>
      </div>
    </${a.panel}>

    <${a.group} caption="Actions">
      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap:12px; align-items:center;">
        <div style="display:grid; gap:8px;">
          <label style="display:grid; gap:4px;">Preset
            <${a.select} id="preset-select">
              <option value="quick" selected>Quick</option>
              <option value="balanced">Balanced</option>
              <option value="full">Full</option>
            </${a.select}>
          </label>
          <label style="display:grid; gap:4px;">Confidence
            <${a.range} id="confidence-range" min="0" max="100" value="65"></${a.range}>
          </label>
        </div>
        <div style="display:grid; gap:8px;">
          <${a.progress} id="run-progress" value="0" max="100"></${a.progress}>
          <div style="display:flex; flex-wrap:wrap; justify-content:flex-end; gap:8px;">
            <${a.button} id="action-run">Run</${a.button}>
            <${a.button} id="action-close">Close</${a.button}>
          </div>
        </div>
      </div>
    </${a.group}>
  `,e.append(o,r,n,i);let h=()=>i.querySelector("#status-main"),u=()=>i.querySelector("#status-count"),p=()=>i.querySelector("#status-mode"),m=(b)=>{h().textContent=b},M=(b)=>{if(p().textContent=b,n.dataset.mode=b,b==="Compact")n.style.gap="8px";else n.style.gap="12px"},S=()=>e.requestClose(),y=()=>{m("Running...");let b=n.querySelector("#run-progress"),f=Number(b.getAttribute("value")||"0");f=Math.min(100,f+35),b.setAttribute("value",String(f));let T=n.querySelector("#result-output");T.value=`Extracted ${f} records from ${n.querySelector("#target-input").value||"current page"}.`,u().textContent=`${Math.ceil(f/10)} selected`,m(f>=100?"Completed":"Running step complete")};return o.commandRegistry.register({id:"tool.run",label:"Run",run:y}),o.commandRegistry.register({id:"tool.reset",label:"Reset",run:()=>{n.querySelector("#run-progress").setAttribute("value","0"),n.querySelector("#result-output").value="",m("Ready"),u().textContent="0 selected"}}),o.commandRegistry.register({id:"tool.close",label:"Close",run:S}),o.commandRegistry.register({id:"view.compact",label:"Compact",run:()=>M("Compact")}),o.commandRegistry.register({id:"view.normal",label:"Normal",run:()=>M("Normal")}),o.commandRegistry.register({id:"help.about",label:"About",run:()=>m("AWW Bookmarklet Framework v1")}),r.querySelector("#tool-run").addEventListener("click",y),r.querySelector("#tool-close").addEventListener("click",S),r.querySelector("#tool-refresh").addEventListener("click",()=>m("Refreshed target snapshot")),n.querySelector("#target-refresh").addEventListener("click",()=>m("Target refreshed")),n.querySelector("#target-pick").addEventListener("click",()=>m("Pick mode enabled")),n.querySelector("#action-run").addEventListener("click",y),n.querySelector("#action-close").addEventListener("click",S),n.querySelector("#history-list").addEventListener("change",(b)=>{m(`History selected: ${b.detail.value}`)}),n.querySelectorAll(`${a.radio}[name='mode']`).forEach((b)=>{b.addEventListener("change",()=>{if(b.hasAttribute("checked"))m(`Mode switched to ${b.getAttribute("value")}`)})}),n.querySelector("#confidence-range").addEventListener("input",(b)=>{u().textContent=`${b.target.value}% confidence`}),e}function yo(t={}){return{text:String(t.text??""),html:t.html==null?"":String(t.html),imageBlob:t.imageBlob??null}}async function re(t={},e=globalThis){let o=yo(t);if(!o.text&&!o.html&&!o.imageBlob)return{ok:!1,status:"empty",reason:"No clipboard payload was provided.",fallbackText:""};let i=e.navigator?.clipboard,n=o.text||o.html;if(!i)return{ok:!1,status:"fallback",reason:"Clipboard API is unavailable.",fallbackText:n};try{if(o.html&&typeof i.write==="function"&&typeof e.ClipboardItem==="function"){let h=new e.ClipboardItem({"text/html":new Blob([o.html],{type:"text/html"}),"text/plain":new Blob([o.text||o.html],{type:"text/plain"})});return await i.write([h]),{ok:!0,status:"success",method:"write"}}if(o.imageBlob&&typeof i.write==="function"&&typeof e.ClipboardItem==="function"){let h=new e.ClipboardItem({[o.imageBlob.type||"image/png"]:o.imageBlob});return await i.write([h]),{ok:!0,status:"success",method:"write"}}if(typeof i.writeText==="function"&&n)return await i.writeText(n),{ok:!0,status:"success",method:"writeText"};return{ok:!1,status:"fallback",reason:"Clipboard API cannot write this payload.",fallbackText:n}}catch(h){return{ok:!1,status:"failed",reason:h?.message||"Clipboard write failed.",error:h,fallbackText:n}}}var St={[c.workspaceBg]:"rgba(0, 0, 0, 0)",[c.windowBg]:"#eef1f5",[c.panelBg]:"#f3f5f7",[c.titlebarActiveBg]:"#dce2e9",[c.titlebarInactiveBg]:"#cfd5dd",[c.titlebarFg]:"#121820",[c.borderStrong]:"#4f5966",[c.borderSubtle]:"#a8b0ba",[c.focusRing]:"#174f9c",[c.buttonBg]:"#edf1f5",[c.buttonFg]:"#111720",[c.buttonActiveBg]:"#d8dee6",[c.inputBg]:"#f8f9fa",[c.inputFg]:"#111720",[c.menuBg]:"#f3f5f7",[c.menuFg]:"#0e1621",[c.selectionBg]:"#1f5eae",[c.selectionFg]:"#f2f8ff",[c.statusbarBg]:"#e2e7ed",[c.appShellBg]:"#eef1f5",[c.surfaceRaisedBg]:"#fbfcfd",[c.surfaceInsetBg]:"#dfe4ea",[c.textMuted]:"#44505f",[c.textHelp]:"#5f6a78",[c.dividerColor]:"#c7cdd5",[c.infoBg]:"#e8f2ff",[c.infoFg]:"#18549e",[c.infoBorder]:"#8db4e8",[c.successBg]:"#e7f4eb",[c.successFg]:"#1e6a3a",[c.successBorder]:"#86ba91",[c.warningBg]:"#fff4d8",[c.warningFg]:"#76520c",[c.warningBorder]:"#d7ad4d",[c.dangerBg]:"#fff0ee",[c.dangerFg]:"#a12824",[c.dangerBorder]:"#da7b73",[c.overlayBackdrop]:"rgba(12, 18, 28, 0.38)",[c.overlayShadow]:"0 18px 44px rgba(0, 0, 0, 0.24)",[c.cardBg]:"#fbfcfe",[c.cardSelectedBg]:"#e8f1ff",[c.metricBg]:"#ffffff",[c.codeBg]:"#e8edf4",[c.codeFg]:"#172131",[c.shadowDepth]:"inset 1px 1px 0 #ffffff, inset -1px -1px 0 #a8b0ba",[c.frostOpacity]:"1",[c.space1]:"4px",[c.space2]:"8px",[c.space3]:"12px",[c.controlHeight]:"30px",[c.titleHeight]:"32px"};class Et{#t;constructor(t=St){this.#t={...t}}get tokens(){return{...this.#t}}setTheme(t){return this.#t={...this.#t,...t},this.tokens}applyTheme(t){for(let[e,o]of Object.entries(this.#t))t.style.setProperty(e,o)}}var C=new Et(St);class It{#t=new Set;#e=null;#o=1;#r;#a=!1;constructor(){if(this.#r=()=>this.clampAll(),window.addEventListener("resize",this.#r,{passive:!0}),window.visualViewport)window.visualViewport.addEventListener("resize",this.#r,{passive:!0}),window.visualViewport.addEventListener("scroll",this.#r,{passive:!0})}register(t){if(this.#a||this.#t.has(t))return;this.#t.add(t);let e=t.getRect();if(!e)t.setRect(this.getSpawnRect());else t.setRect(A(e));this.focus(t)}unregister(t){if(!this.#t.delete(t))return;if(this.#e===t){this.#e=null;let e=[...this.#t].at(-1)??null;if(e)this.focus(e)}}getSpawnRect(){return Bt(this.#t.size,L(),v)}focus(t){if(!this.#t.has(t))return;if(this.#e&&this.#e!==t)this.#e.setActive(!1);this.#e=t,t.setActive(!0),t.setZIndex(this.#o++)}clampAll(){for(let t of this.#t){let e=t.getRect();if(!e)continue;t.setRect(A(e))}}destroy(){if(this.#a)return;if(this.#a=!0,window.removeEventListener("resize",this.#r),window.visualViewport)window.visualViewport.removeEventListener("resize",this.#r),window.visualViewport.removeEventListener("scroll",this.#r);this.#t.clear(),this.#e=null}}function Mt(){if(!globalThis[k.rootsByVersion])globalThis[k.rootsByVersion]=new Map;return globalThis[k.rootsByVersion]}function Ao(t=x){let e=document.createElement(a.desktopRoot);e.dataset.version=t,document.documentElement.append(e),C.applyTheme(e);let o={version:t,root:e,manager:new It,owners:new Set,destroy(){this.manager.destroy(),this.root.remove(),this.owners.clear()}};return e.__awwManager=o.manager,o}function Tt(t="default-owner",e=x){let o=Mt(),r=o.get(e);if(!r||!r.root.isConnected)r=Ao(e),o.set(e,r);return r.owners.add(t),globalThis[k.lastAcquiredRoot]=r.root,globalThis[k.version]=e,r}function Lt(t="default-owner",e=x){let o=Mt(),r=o.get(e);if(!r)return;if(r.owners.delete(t),r.owners.size>0)return;if(r.destroy(),o.delete(e),globalThis[k.lastAcquiredRoot]===r.root)delete globalThis[k.lastAcquiredRoot]}function Pt(t=x){return Mt().get(t)??null}function ae(t=x){let e=Mt();if(t==="*"){for(let[r,i]of e)i.destroy(),e.delete(r);delete globalThis[k.lastAcquiredRoot];return}let o=e.get(t);if(!o)return;if(o.destroy(),e.delete(t),globalThis[k.lastAcquiredRoot]===o.root)delete globalThis[k.lastAcquiredRoot]}var Yt={logo:'<rect x="3" y="3" width="18" height="18" fill="currentColor" stroke="none"/><path d="M7 16V8h3l2 8 2-8h3v8" stroke="#f6f8fb"/><path d="M7 12h3M14 12h3" stroke="#f6f8fb"/>',window:'<rect x="4" y="5" width="16" height="14"/><path d="M4 9h16M7 7h1M10 7h1"/>',minimize:'<path d="M7 17h10"/>',maximize:'<rect x="7" y="7" width="10" height="10"/><path d="M10 4h10v10"/>',close:'<path d="M6 6l12 12M18 6L6 18"/>',menu:'<path d="M5 7h14M5 12h14M5 17h14"/>',panel:'<rect x="5" y="5" width="14" height="14"/><path d="M8 8h8M8 12h8M8 16h5"/>',back:'<path d="M14 6l-6 6 6 6M9 12h10"/>',forward:'<path d="M10 6l6 6-6 6M5 12h10"/>',refresh:'<path d="M18 8a7 7 0 1 0 1 6M18 4v4h-4"/>',search:'<circle cx="10" cy="10" r="5"/><path d="M14 14l6 6"/>',lock:'<rect x="6" y="10" width="12" height="10"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/>',url:'<rect x="4" y="6" width="16" height="12"/><path d="M7 10h10M7 14h7"/>',link:'<path d="M10 8l2-2a4 4 0 0 1 6 6l-2 2M14 16l-2 2a4 4 0 0 1-6-6l2-2M9 15l6-6"/>',external:'<rect x="5" y="7" width="12" height="12"/><path d="M12 5h7v7M19 5l-8 8"/>',copyUrl:'<rect x="8" y="5" width="10" height="14"/><path d="M6 8H4v11h10v-2"/>',star:'<path d="M12 4l2.4 5 5.6.8-4 3.9.9 5.5-4.9-2.6-4.9 2.6.9-5.5-4-3.9 5.6-.8z"/>',fullscreen:'<path d="M5 10V5h5M14 5h5v5M19 14v5h-5M10 19H5v-5"/>',more:'<circle cx="6" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="18" cy="12" r="1" fill="currentColor" stroke="none"/>',capture:'<path d="M5 10V5h5M14 5h5v5M19 14v5h-5M10 19H5v-5M9 12h6"/>',console:'<rect x="4" y="6" width="16" height="12"/><path d="M7 10l3 2-3 2M12 15h5"/>',eye:'<path d="M3 12s3-5 9-5 9 5 9 5-3 5-9 5-9-5-9-5z"/><circle cx="12" cy="12" r="2"/>',upload:'<path d="M12 17V5M8 9l4-4 4 4M5 19h14"/>',dialog:'<rect x="5" y="6" width="14" height="12"/><path d="M5 10h14M8 8h1"/>',gear:'<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/>',sliders:'<path d="M5 7h14M5 12h14M5 17h14"/><rect x="8" y="5" width="3" height="4"/><rect x="14" y="10" width="3" height="4"/><rect x="6" y="15" width="3" height="4"/>',copy:'<rect x="8" y="5" width="10" height="14"/><path d="M6 8H4v11h10"/>',paste:'<path d="M9 5h6l1 3H8z"/><rect x="6" y="8" width="12" height="12"/>',cut:'<circle cx="7" cy="7" r="2"/><circle cx="7" cy="17" r="2"/><path d="M9 8l9 9M9 16l9-9"/>',edit:'<path d="M5 17l1 3 3-1 9-9-4-4zM13 7l4 4"/>',trash:'<path d="M5 7h14M9 7V5h6v2M7 7l1 13h8l1-13M10 10v7M14 10v7"/>',markdown:'<rect x="4" y="6" width="16" height="12"/><path d="M7 15V9l3 4 3-4v6M16 9v6M14 13l2 2 2-2"/>',folder:'<path d="M3 8h7l2 2h9v9H3z"/>',document:'<path d="M7 3h7l4 4v14H7zM14 3v5h4"/>',article:'<path d="M7 4h10v16H7zM10 8h4M10 12h4M10 16h4"/>',text:'<path d="M5 6h14M12 6v12M9 18h6"/>',image:'<rect x="5" y="6" width="14" height="12"/><path d="M7 16l4-5 3 3 2-2 3 4"/><circle cx="9" cy="9" r="1" fill="currentColor" stroke="none"/>',list:'<path d="M9 7h10M9 12h10M9 17h10"/><path d="M5 7h1M5 12h1M5 17h1"/>',table:'<rect x="4" y="5" width="16" height="14"/><path d="M4 10h16M4 15h16M10 5v14M15 5v14"/>',metrics:'<path d="M5 19V9M12 19V5M19 19v-7M3 19h18"/>',code:'<path d="M8 8l-4 4 4 4M16 8l4 4-4 4M14 5l-4 14"/>',note:'<path d="M6 4h12v14l-4 3H6zM14 18v3M9 8h6M9 12h6"/>',info:'<circle cx="12" cy="12" r="9"/><path d="M12 10v7M12 7h.01"/>',success:'<circle cx="12" cy="12" r="9"/><path d="M7 12l3 3 7-7"/>',warning:'<path d="M12 4l9 16H3zM12 9v5M12 17h.01"/>',error:'<circle cx="12" cy="12" r="9"/><path d="M8 8l8 8M16 8l-8 8"/>',neutral:'<circle cx="12" cy="12" r="9"/><path d="M8 12h8"/>',selected:'<rect x="5" y="5" width="14" height="14"/><path d="M8 12l3 3 5-6"/>',unselected:'<rect x="5" y="5" width="14" height="14"/>',radioSelected:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3" fill="currentColor" stroke="none"/>',radio:'<circle cx="12" cy="12" r="8"/>',progress:'<rect x="5" y="9" width="14" height="6"/><path d="M6 12h8"/>',progressIndeterminate:'<rect x="5" y="9" width="14" height="6"/><path d="M7 14l4-4M12 14l4-4"/>',sync:'<path d="M18 8a7 7 0 0 0-12-1M6 4v4h4M6 16a7 7 0 0 0 12 1M18 20v-4h-4"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v6l4 2"/>',draft:'<path d="M6 4h12v16H6zM9 8h6M9 12h4"/><path d="M16 16l3 3"/>',shield:'<path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z"/><path d="M9 12l2 2 4-5"/>',blocked:'<circle cx="12" cy="12" r="9"/><path d="M6 18L18 6"/>',frameBlocked:'<path d="M5 10V5h5M14 5h5v5M19 14v5h-5M10 19H5v-5" stroke-dasharray="4 3"/>',accessBlocked:'<rect x="6" y="10" width="12" height="10"/><path d="M8 10V7a4 4 0 0 1 8 0v3M9 15h6"/>',browserBlocked:'<rect x="4" y="6" width="16" height="12"/><path d="M4 10h16M8 14l8 0M9 17l6-6"/>',noResults:'<circle cx="10" cy="10" r="5"/><path d="M14 14l5 5M5 19h14" stroke-dasharray="3 3"/>',noCaptures:'<path d="M5 10V5h5M14 5h5v5M19 14v5h-5M10 19H5v-5" stroke-dasharray="4 3"/>',noSelection:'<rect x="5" y="5" width="14" height="14" stroke-dasharray="4 3"/>',retry:'<path d="M18 8a7 7 0 1 0 1 6M18 4v4h-4"/>',permissions:'<path d="M9 19a5 5 0 0 1 6-8M12 4a4 4 0 1 1 0 8M16 16h5M18.5 13.5v5"/>',grid:'<rect x="5" y="5" width="5" height="5"/><rect x="14" y="5" width="5" height="5"/><rect x="5" y="14" width="5" height="5"/><rect x="14" y="14" width="5" height="5"/>',filter:'<path d="M4 6h16l-6 7v5l-4 2v-7z"/>',sort:'<path d="M8 5v14M5 8l3-3 3 3M16 19V5M13 16l3 3 3-3"/>',columns:'<rect x="4" y="5" width="16" height="14"/><path d="M10 5v14M16 5v14"/>',pane:'<rect x="4" y="5" width="16" height="14"/><path d="M12 5v14"/>'},So=Object.freeze(Object.keys(Yt));function Eo(t,{label:e="",className:o="ui-icon"}={}){let r=Yt[t]||Yt.panel,i=e?`role="img" aria-label="${Mo(e)}"`:'aria-hidden="true"';return`<svg class="${o}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter" ${i}>${r}</svg>`}function Mo(t){return String(t).replace(/[&<>"']/g,(e)=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e])}var ie=0;function se(t="bookmarklet-tool"){return ie+=1,`${t}-${ie}`}function To(t,e){if(!String(t||"").startsWith("awwbookmarklet-"))throw Error("Custom bookmarklet component tags must use the awwbookmarklet- prefix.");return Ct(t,e),customElements.get(t)}function Lo({title:t="AWW Tool",rect:e=null,closable:o=!0,content:r=null}={}){E();let i=document.createElement(a.window);if(i.setAttribute("title",t),o===!1)i.setAttribute("closable","false");if(e)i.setRect(e);if(r)if(typeof r==="string")i.innerHTML=N(r);else i.append(r);return i}function ne(t,{ownerPrefix:e="bookmarklet-tool",rect:o=null}={}){E();let r=se(e),i=Tt(r),n=typeof t==="function"?t():Rt();if(o)n.setRect(o);i.root.append(n);let h=!1,u=()=>{if(h)return;h=!0,Lt(r)};return n.addEventListener("awwbookmarklet-window-closed",u,{once:!0}),n.addEventListener("awwbookmarklet-window-disconnected",u,{once:!0}),n.addEventListener("awwbookmarklet-window-close-request",()=>{queueMicrotask(()=>{if(!n.isConnected)u()})}),n}function Co(t,{ownerPrefix:e="bookmarklet-tool",rect:o=null}={}){E();let r=se(e),i=Tt(r);if(o&&typeof t.setRect==="function")t.setRect(o);i.root.append(t);let n=!1,h=()=>{if(n)return;n=!0,Lt(r)};return t.addEventListener("awwbookmarklet-window-closed",h,{once:!0}),t.addEventListener("awwbookmarklet-window-disconnected",h,{once:!0}),t}function _o(){return ne(()=>Rt({title:"Page Extraction Tool"}),{ownerPrefix:"example-tool"})}function No(t,e=null){let o=C.setTheme(t||{}),r=e||Pt(x)?.root;if(r)C.applyTheme(r);return o}function Bo(){ae("*")}E();globalThis.awwtools=globalThis.awwtools||{};globalThis.awwtools.bookmarkletUi={version:x,tags:a,tokens:c,geometry:v,registerAllComponents:E,defineComponent:To,createWindow:Lo,openWindow:ne,mountWindow:Co,bootstrapExampleTool:_o,shutdownAll:Bo,acquireDesktopRoot:Tt,releaseDesktopRoot:Lt,getDesktopRecord:Pt,setTheme:No,themeService:C,ThemeService:Et,CommandRegistry:_,styles:{adoptStyles:l,base:d,css:s},url:{buildSearchUrl:kt,deriveHostname:xt,isHttpUrl:oe,normalizeSearchTemplate:$t,resolveNavigationInput:vt},sanitizeHtml:N,copyToClipboard:re,showToast:te};globalThis.awwbookmarklet=globalThis.awwtools.bookmarkletUi;export{Bo as shutdownAll,te as showToast,No as setTheme,N as sanitizeHtml,vt as resolveNavigationInput,Nt as resizeRectFromEdges,Lt as releaseDesktopRoot,E as registerAllComponents,H as rectToStyle,ne as openBookmarkletWindow,$t as normalizeSearchTemplate,Co as mountWindow,oe as isHttpUrl,Eo as iconSvg,L as getViewportRect,Bt as getSpawnRect,Pt as getDesktopRecord,xt as deriveHostname,Ct as defineOnce,To as defineBookmarkletComponent,C as defaultThemeService,s as css,Lo as createWindow,re as copyToClipboard,A as clampRect,kt as buildSearchUrl,_o as bootstrapExampleTool,l as adoptStyles,Tt as acquireDesktopRoot,Et as ThemeService,a as TAGS,c as PUBLIC_TOKENS,So as ICON_NAMES,x as FRAMEWORK_VERSION,St as DEFAULT_THEME,v as DEFAULT_GEOMETRY,_ as CommandRegistry,d as BASE_COMPONENT_STYLES,$ as AwwWindow,yt as AwwUrlPicker,rt as AwwToolbar,lt as AwwToast,z as AwwTextarea,K as AwwTabs,G as AwwTabPanel,Q as AwwStatusbar,it as AwwStatusLine,ct as AwwStateOverlay,ft as AwwShortcutHelp,U as AwwSelect,pt as AwwRichPreview,W as AwwRange,F as AwwRadio,j as AwwProgress,J as AwwPanel,At as AwwMetricCard,R as AwwMenubar,I as AwwMenu,mt as AwwManualCopy,X as AwwListbox,bt as AwwListItem,ht as AwwList,D as AwwInput,Y as AwwIconButton,Z as AwwGroup,at as AwwField,dt as AwwEmptyState,nt as AwwDialog,O as AwwDesktopRoot,gt as AwwCommandPalette,V as AwwCheckbox,ut as AwwCard,P as AwwButton,wt as AwwBrowserPanel,tt as AwwAppShell,st as AwwAlert};
