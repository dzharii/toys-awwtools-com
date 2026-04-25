var O="0.1.0",r={desktopRoot:"awwbookmarklet-desktop-root",window:"awwbookmarklet-window",menubar:"awwbookmarklet-menubar",menu:"awwbookmarklet-menu",button:"awwbookmarklet-button",iconButton:"awwbookmarklet-icon-button",input:"awwbookmarklet-input",textarea:"awwbookmarklet-textarea",checkbox:"awwbookmarklet-checkbox",radio:"awwbookmarklet-radio",select:"awwbookmarklet-select",range:"awwbookmarklet-range",progress:"awwbookmarklet-progress",tabs:"awwbookmarklet-tabs",tabPanel:"awwbookmarklet-tab-panel",listbox:"awwbookmarklet-listbox",group:"awwbookmarklet-group",panel:"awwbookmarklet-panel",statusbar:"awwbookmarklet-statusbar",appShell:"awwbookmarklet-app-shell",toolbar:"awwbookmarklet-toolbar",field:"awwbookmarklet-field",statusLine:"awwbookmarklet-status-line",alert:"awwbookmarklet-alert",dialog:"awwbookmarklet-dialog",toast:"awwbookmarklet-toast",emptyState:"awwbookmarklet-empty-state",stateOverlay:"awwbookmarklet-state-overlay",list:"awwbookmarklet-list",listItem:"awwbookmarklet-list-item",card:"awwbookmarklet-card",richPreview:"awwbookmarklet-rich-preview",browserPanel:"awwbookmarklet-browser-panel",manualCopy:"awwbookmarklet-manual-copy",commandPalette:"awwbookmarklet-command-palette",shortcutHelp:"awwbookmarklet-shortcut-help",urlPicker:"awwbookmarklet-url-picker",metricCard:"awwbookmarklet-metric-card"},S={rootsByVersion:Symbol.for("awwtools.bookmarkletUi.overlayRootsByVersion"),lastAcquiredRoot:Symbol.for("awwtools.bookmarkletUi.lastAcquiredRoot"),version:Symbol.for("awwtools.bookmarkletUi.frameworkVersion")},H=2147481000,c={workspaceBg:"--awwbookmarklet-workspace-bg",windowBg:"--awwbookmarklet-window-bg",panelBg:"--awwbookmarklet-panel-bg",titlebarActiveBg:"--awwbookmarklet-titlebar-active-bg",titlebarInactiveBg:"--awwbookmarklet-titlebar-inactive-bg",titlebarFg:"--awwbookmarklet-titlebar-fg",borderStrong:"--awwbookmarklet-border-strong",borderSubtle:"--awwbookmarklet-border-subtle",focusRing:"--awwbookmarklet-focus-ring",buttonBg:"--awwbookmarklet-button-bg",buttonFg:"--awwbookmarklet-button-fg",buttonActiveBg:"--awwbookmarklet-button-active-bg",inputBg:"--awwbookmarklet-input-bg",inputFg:"--awwbookmarklet-input-fg",menuBg:"--awwbookmarklet-menu-bg",menuFg:"--awwbookmarklet-menu-fg",selectionBg:"--awwbookmarklet-selection-bg",selectionFg:"--awwbookmarklet-selection-fg",statusbarBg:"--awwbookmarklet-statusbar-bg",appShellBg:"--awwbookmarklet-app-shell-bg",surfaceRaisedBg:"--awwbookmarklet-surface-raised-bg",surfaceInsetBg:"--awwbookmarklet-surface-inset-bg",textMuted:"--awwbookmarklet-text-muted",textHelp:"--awwbookmarklet-text-help",dividerColor:"--awwbookmarklet-divider-color",infoBg:"--awwbookmarklet-info-bg",infoFg:"--awwbookmarklet-info-fg",infoBorder:"--awwbookmarklet-info-border",successBg:"--awwbookmarklet-success-bg",successFg:"--awwbookmarklet-success-fg",successBorder:"--awwbookmarklet-success-border",warningBg:"--awwbookmarklet-warning-bg",warningFg:"--awwbookmarklet-warning-fg",warningBorder:"--awwbookmarklet-warning-border",dangerBg:"--awwbookmarklet-danger-bg",dangerFg:"--awwbookmarklet-danger-fg",dangerBorder:"--awwbookmarklet-danger-border",overlayBackdrop:"--awwbookmarklet-overlay-backdrop",overlayShadow:"--awwbookmarklet-overlay-shadow",cardBg:"--awwbookmarklet-card-bg",cardSelectedBg:"--awwbookmarklet-card-selected-bg",metricBg:"--awwbookmarklet-metric-bg",codeBg:"--awwbookmarklet-code-bg",codeFg:"--awwbookmarklet-code-fg",shadowDepth:"--awwbookmarklet-shadow-depth",frostOpacity:"--awwbookmarklet-frost-opacity",space1:"--awwbookmarklet-space-1",space2:"--awwbookmarklet-space-2",space3:"--awwbookmarklet-space-3",controlHeight:"--awwbookmarklet-size-control-h",titleHeight:"--awwbookmarklet-size-title-h"},A={minWidth:320,minHeight:200,minVisibleTitlebar:36,spawnWidth:520,spawnHeight:420,spawnX:60,spawnY:60,cascadeStep:28};function Ae(t,e){if(!customElements.get(t))customElements.define(t,e)}function Vt(t){for(let[e,o]of t)Ae(e,o)}var Ee=typeof ShadowRoot<"u"&&"adoptedStyleSheets"in ShadowRoot.prototype&&typeof CSSStyleSheet<"u"&&"replaceSync"in CSSStyleSheet.prototype,Ut=new Map,U=new Map;function Me(t){let e=0;for(let o=0;o<t.length;o+=1)e=e*31+t.charCodeAt(o)|0;return`s${Math.abs(e)}`}function Ce(t){let e=Ut.get(t);if(!e)e=new CSSStyleSheet,e.replaceSync(t),Ut.set(t,e);return e}function Te(t,e){let o=Me(e);if(t.querySelector(`style[data-aww-style='${o}']`))return;let a=document.createElement("style");a.dataset.awwStyle=o,a.textContent=e,t.append(a)}function l(t,e){if(Ee){let a=[...t.adoptedStyleSheets];for(let s of e){let i=Ce(s);if(!a.includes(i))a.push(i)}t.adoptedStyleSheets=a;return}for(let o of e)Te(t,o)}function n(t,...e){let o="";for(let a=0;a<t.length;a+=1)if(o+=t[a],a<e.length)o+=String(e[a]??"");if(!U.has(o))U.set(o,o);return U.get(o)}var d=n`
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
`;var $e=n`
  :host {
    position: fixed;
    inset: 0;
    z-index: ${H};
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
`;class z extends HTMLElement{constructor(){super();let t=this.attachShadow({mode:"open"});l(t,[d,$e]),t.innerHTML=`
      <div id="layer" part="layer">
        <slot></slot>
      </div>
    `}}function R(){if(window.visualViewport)return{x:window.visualViewport.offsetLeft,y:window.visualViewport.offsetTop,width:window.visualViewport.width,height:window.visualViewport.height};return{x:0,y:0,width:window.innerWidth,height:window.innerHeight}}function L(t,e=R(),o=A){let a=o.minWidth??A.minWidth,s=o.minHeight??A.minHeight,i=o.minVisibleTitlebar??A.minVisibleTitlebar,h=Math.min(a,e.width),v=Math.min(s,e.height),g=Math.max(h,Math.min(t.width,e.width)),k=Math.max(v,Math.min(t.height,e.height)),_=e.x+e.width-i,$=e.x-g+i,M=e.y+e.height-i,w=Math.min(Math.max(t.x,$),_),x=Math.min(Math.max(t.y,e.y),M);return{x:w,y:x,width:g,height:k}}function q(t,e,o){return Math.max(Math.min(e,o),Math.min(t,o))}function zt(t,e,o,a,s=R(),i=A){let h=i.minWidth??A.minWidth,v=i.minHeight??A.minHeight,g=Math.min(h,s.width),k=Math.min(v,s.height),_=t.x+t.width,$=t.y+t.height,M=t.x,w=t.y,x=t.width,N=t.height;if(e.includes("e"))x=q(t.width+o,g,s.width);if(e.includes("s"))N=q(t.height+a,k,s.height);if(e.includes("w"))x=q(t.width-o,g,s.width),M=_-x;if(e.includes("n"))N=q(t.height-a,k,s.height),w=$-N;return L({x:M,y:w,width:x,height:N},s,i)}function Wt(t=0,e=R(),o=A){let a=Math.min(o.spawnWidth,e.width-12),s=Math.min(o.spawnHeight,e.height-12),i={x:e.x+o.spawnX+t*o.cascadeStep,y:e.y+o.spawnY+t*o.cascadeStep,width:a,height:s};return L(i,e,o)}function W(t){return{left:`${Math.round(t.x)}px`,top:`${Math.round(t.y)}px`,width:`${Math.round(t.width)}px`,height:`${Math.round(t.height)}px`}}var Le=n`
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
`;function _e(t){return t?.dataset?.edge||""}function jt(t){return t.button===0}class j extends HTMLElement{static observedAttributes=["title","closable"];#t=null;#e=null;#o=null;#a=null;#r=0;constructor(){super();let t=this.attachShadow({mode:"open"});l(t,[d,Le]),t.innerHTML=`
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
    `,this.#s()}connectedCallback(){if(!this.#t)this.#t={x:72,y:72,width:520,height:420},this.#d(this.#t);this.setAttribute("data-active",this.getAttribute("data-active")??"true"),this.#l(),this.#i(),this.#n();let t=this.closest("awwbookmarklet-desktop-root");this.#e=t?.__awwManager??null,this.#e?.register(this),this.addEventListener("pointerdown",this.#c)}disconnectedCallback(){this.#e?.unregister(this),this.#e=null,this.removeEventListener("pointerdown",this.#c),this.#f(),this.dispatchEvent(new CustomEvent("awwbookmarklet-window-disconnected"))}attributeChangedCallback(t){if(t==="title")this.#l();if(t==="closable")this.#i()}getRect(){return this.#t?{...this.#t}:null}setRect(t){this.#t=L(t),this.#d(this.#t)}setActive(t){this.setAttribute("data-active",String(Boolean(t)))}setZIndex(t){this.style.zIndex=String(t)}requestClose(){if(!this.isClosable())return;if(!this.dispatchEvent(new CustomEvent("awwbookmarklet-window-close-request",{bubbles:!0,composed:!0,cancelable:!0})))return;this.remove(),this.dispatchEvent(new CustomEvent("awwbookmarklet-window-closed",{bubbles:!0,composed:!0}))}isClosable(){let t=this.getAttribute("closable");return t===null?!0:t!=="false"}#s(){let t=this.shadowRoot,e=t.querySelector(".titlebar"),o=t.querySelector(".system-menu-button"),a=t.querySelector(".close");e.addEventListener("pointerdown",this.#g),o.addEventListener("click",this.#p),o.addEventListener("dblclick",this.#u),o.addEventListener("keydown",this.#h),a.addEventListener("click",()=>this.requestClose());for(let s of t.querySelectorAll(".resize-handle"))s.addEventListener("pointerdown",this.#b);for(let s of["menubar","toolbar","statusbar"])t.querySelector(`slot[name='${s}']`).addEventListener("slotchange",()=>this.#n())}#l(){let t=this.getAttribute("title")||"AWW Tool";this.shadowRoot.querySelector(".title").textContent=t,this.shadowRoot.querySelector(".shell").setAttribute("aria-label",t)}#i(){this.shadowRoot.querySelector(".close").disabled=!this.isClosable()}#n(){let t=this.shadowRoot,e=(o)=>t.querySelector(`slot[name='${o}']`).assignedElements({flatten:!0}).length>0;t.querySelector(".menubar").hidden=!e("menubar"),t.querySelector(".toolbar").hidden=!e("toolbar"),t.querySelector(".status").hidden=!e("statusbar")}#d(t){Object.assign(this.style,W(t))}#c=()=>{this.#e?.focus(this)};#p=(t)=>{t.stopPropagation(),this.dispatchEvent(new CustomEvent("awwbookmarklet-window-system-menu",{bubbles:!0,composed:!0,detail:{anchor:this.shadowRoot.querySelector(".system-menu-button")}}))};#u=(t)=>{t.stopPropagation(),this.requestClose()};#h=(t)=>{if(t.key==="Enter"||t.key===" ")t.preventDefault(),this.#p(t)};#g=(t)=>{if(!jt(t))return;if(t.target.closest("button"))return;t.preventDefault(),this.#e?.focus(this),this.#o={startX:t.clientX,startY:t.clientY,currentX:t.clientX,currentY:t.clientY,startRect:this.getRect(),pointerId:t.pointerId,target:t.currentTarget},this.shadowRoot.querySelector(".titlebar").style.cursor="grabbing",this.#m(t.currentTarget,t.pointerId)};#b=(t)=>{if(!jt(t))return;t.preventDefault();let e=_e(t.currentTarget);if(!e)return;this.#e?.focus(this),this.#a={edge:e,startX:t.clientX,startY:t.clientY,currentX:t.clientX,currentY:t.clientY,startRect:this.getRect(),previewRect:this.getRect(),pointerId:t.pointerId,target:t.currentTarget},this.#m(t.currentTarget,t.pointerId)};#m(t,e){try{t.setPointerCapture?.(e)}catch{}window.addEventListener("pointermove",this.#k,{passive:!0}),window.addEventListener("pointerup",this.#w),window.addEventListener("pointercancel",this.#w)}#f(){let t=this.#o||this.#a;if(window.removeEventListener("pointermove",this.#k),window.removeEventListener("pointerup",this.#w),window.removeEventListener("pointercancel",this.#w),t?.target?.hasPointerCapture?.(t.pointerId))try{t.target.releasePointerCapture(t.pointerId)}catch{}if(this.#r)cancelAnimationFrame(this.#r),this.#r=0;this.style.transform="",this.shadowRoot.querySelector(".titlebar").style.cursor="grab"}#k=(t)=>{if(this.#o){if(t.pointerId!==this.#o.pointerId)return;this.#o.currentX=t.clientX,this.#o.currentY=t.clientY,this.#v();return}if(this.#a){if(t.pointerId!==this.#a.pointerId)return;this.#a.currentX=t.clientX,this.#a.currentY=t.clientY,this.#v()}};#w=(t)=>{let e=this.#o||this.#a;if(e&&t.pointerId!==e.pointerId)return;if(e?.target?.hasPointerCapture?.(e.pointerId))try{e.target.releasePointerCapture(e.pointerId)}catch{}if(this.#o){let o=this.#o.currentX-this.#o.startX,a=this.#o.currentY-this.#o.startY;this.style.transform="",this.setRect({...this.#o.startRect,x:this.#o.startRect.x+o,y:this.#o.startRect.y+a}),this.#o=null}if(this.#a)this.style.transform="",this.setRect(this.#a.previewRect),this.#a=null;this.#f()};#v(){if(this.#r)return;this.#r=requestAnimationFrame(()=>{if(this.#r=0,this.#o)this.#y();if(this.#a)this.#x()})}#y(){let t=this.#o.currentX-this.#o.startX,e=this.#o.currentY-this.#o.startY;this.style.transform=`translate3d(${t}px, ${e}px, 0)`}#x(){let{edge:t,startRect:e,startX:o,startY:a,currentX:s,currentY:i}=this.#a,h=s-o,v=i-a,g=zt(e,t,h,v);this.#a.previewRect=g,Object.assign(this.style,W(g))}}class G{#t=new Map;register(t){if(!t?.id||typeof t.run!=="function")throw TypeError("Command must include stable id and run(context)");return this.#t.set(t.id,t),()=>this.#t.delete(t.id)}has(t){return this.#t.has(t)}resolve(t){return this.#t.get(t)??null}isEnabled(t,e={}){let o=this.resolve(t);if(!o)return!1;return typeof o.isEnabled==="function"?o.isEnabled(e):!0}isChecked(t,e={}){let o=this.resolve(t);if(!o)return!1;return typeof o.isChecked==="function"?o.isChecked(e):!1}run(t,e={}){let o=this.resolve(t);if(!o||!this.isEnabled(t,e))return!1;return o.run(e),!0}toJSON(t={}){return[...this.#t.values()].map((e)=>({id:e.id,label:e.label??e.id,shortcut:e.shortcut??"",enabled:typeof e.isEnabled==="function"?e.isEnabled(t):!0,checked:typeof e.isChecked==="function"?e.isChecked(t):!1}))}}var Ne=n`
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
`;class K extends HTMLElement{#t=[];#e=new Map;#o=new WeakSet;#a=-1;#r="";#s=null;constructor(){super();this.commandRegistry=new G;let t=this.attachShadow({mode:"open"});l(t,[d,Ne]),t.innerHTML='<div id="bar" role="menubar" part="bar"><slot></slot></div>',t.querySelector("slot").addEventListener("slotchange",()=>this.#l()),this.addEventListener("keydown",this.#p),this.addEventListener("click",this.#c)}connectedCallback(){this.#l(),document.addEventListener("pointerdown",this.#h,!0),this.#s=this.closest("awwbookmarklet-window"),this.#s?.addEventListener("awwbookmarklet-window-system-menu",this.#b)}disconnectedCallback(){document.removeEventListener("pointerdown",this.#h,!0),this.#s?.removeEventListener("awwbookmarklet-window-system-menu",this.#b),this.#s=null,this.closeAllMenus()}openFirstMenu(){if(!this.#t.length)return;this.#n(0),this.#i(this.#t[0],!0)}closeAllMenus(){for(let t of this.#e.values())t.close();for(let t of this.#t)delete t.dataset.open;this.#r=""}#l(){let t=[...this.children],e=[...this.#e.entries()].filter(([,o])=>o.isConnected&&o.parentNode!==this);this.#t=t.filter((o)=>o.hasAttribute("data-menu")),this.#e=new Map(e);for(let o of t.filter((a)=>a.tagName.toLowerCase()==="awwbookmarklet-menu")){let a=o.getAttribute("name")||"";if(a)this.#e.set(a,o),this.#m(o)}if(this.#t.forEach((o,a)=>{o.setAttribute("role","menuitem"),o.tabIndex=a===this.#a?0:-1}),this.#t.length&&this.#a===-1)this.#n(0)}#i(t,e=!1){let o=t.getAttribute("data-menu"),a=this.#e.get(o);if(!a)return;this.closeAllMenus(),t.dataset.open="true";let s=this.closest("awwbookmarklet-window")?.closest("awwbookmarklet-desktop-root");if(a.portalTo(s),a.openAtViewportRect(t.getBoundingClientRect()),this.#r=o,e)a.focusFirst()}#n(t){if(!this.#t.length)return;this.#a=(t+this.#t.length)%this.#t.length,this.#t.forEach((e,o)=>{e.tabIndex=o===this.#a?0:-1}),this.#t[this.#a].focus()}#d(t){if(this.#n(this.#a+t),this.#r){let e=this.#t[this.#a];this.#i(e,!0)}}#c=(t)=>{let e=t.target.closest("[data-menu]");if(!e||!this.contains(e))return;if(e.dataset.open==="true"){this.closeAllMenus();return}this.#n(this.#t.indexOf(e)),this.#i(e,!0)};#p=(t)=>{if(!this.#t.length)return;if(["ArrowRight","ArrowLeft"].includes(t.key)){t.preventDefault(),this.#d(t.key==="ArrowRight"?1:-1);return}if(["Enter"," ","ArrowDown"].includes(t.key)){t.preventDefault(),this.#i(this.#t[this.#a],!0);return}if(t.key==="Escape")t.preventDefault(),this.closeAllMenus()};#u=()=>{if(this.closeAllMenus(),this.#a>=0)this.#t[this.#a]?.focus()};#h=(t)=>{let e=t.target,o=[...this.#e.values()].some((a)=>a.contains(e));if(!this.contains(e)&&!o)this.closeAllMenus()};#g=(t)=>{let e=t.detail?.commandId;if(!e)return;this.commandRegistry.run(e,{menubar:this,trigger:t.detail.source})};#b=()=>{this.openFirstMenu()};#m(t){if(this.#o.has(t))return;this.#o.add(t),t.addEventListener("awwbookmarklet-menu-dismiss",this.#u),t.addEventListener("awwbookmarklet-menu-select",this.#u),t.addEventListener("awwbookmarklet-command",this.#g)}}var Oe=n`
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
`;function Kt(t){return t.hasAttribute("data-separator")||t.getAttribute("role")==="separator"}function Gt(t){return!Kt(t)&&!t.hasAttribute("disabled")&&t.getAttribute("aria-disabled")!=="true"}class X extends HTMLElement{#t=-1;#e="";#o=0;#a=null;#r=null;constructor(){super();let t=this.attachShadow({mode:"open"});l(t,[d,Oe]),t.innerHTML='<div id="panel" part="panel" role="menu"><slot></slot></div>',this.addEventListener("keydown",this.#i),this.addEventListener("click",this.#l),t.querySelector("slot").addEventListener("slotchange",()=>this.#s())}connectedCallback(){this.hidden=!1,this.setAttribute("aria-hidden",this.hasAttribute("open")?"false":"true"),this.#s()}disconnectedCallback(){clearTimeout(this.#o)}getItems(){return[...this.children].filter(Gt)}portalTo(t){if(!t||this.parentNode===t)return;if(!this.#a)this.#a=this.parentNode,this.#r=this.nextSibling;t.append(this)}restorePortal(){if(!this.#a)return;let t=this.#a,e=this.#r?.parentNode===t?this.#r:null;if(this.#a=null,this.#r=null,t.isConnected)t.insertBefore(this,e)}openAtViewportRect(t){this.style.left="-9999px",this.style.top="-9999px",this.setAttribute("open","");let e=Math.max(200,this.offsetWidth||220),o=window.visualViewport,a=o?.offsetLeft??0,s=o?.offsetTop??0,i=o?.width??window.innerWidth,h=o?.height??window.innerHeight,v=this.offsetHeight||Math.min(h*0.5,240),g=t.left,k=t.bottom+2;if(g+e>a+i-6)g=a+i-e-6;if(k+v>s+h-6)k=Math.max(s+6,t.top-v-2);this.style.left=`${Math.max(a+6,g)}px`,this.style.top=`${Math.max(s+6,k)}px`,this.setAttribute("aria-hidden","false"),this.#t=-1}close(){this.removeAttribute("open"),this.setAttribute("aria-hidden","true"),this.#n(-1),this.restorePortal()}focusFirst(){let t=this.getItems();if(t.length===0)return;this.#n(0),t[0].focus()}#s(){for(let t of this.children){if(Kt(t))continue;if(!t.hasAttribute("role"))t.setAttribute("role","menuitem");t.tabIndex=-1}}#l=(t)=>{let e=t.target.closest("[role='menuitem']");if(!e||!Gt(e))return;let o=e.getAttribute("data-command")||"";if(o)this.dispatchEvent(new CustomEvent("awwbookmarklet-command",{bubbles:!0,composed:!0,detail:{commandId:o,source:e}}));this.dispatchEvent(new CustomEvent("awwbookmarklet-menu-select",{bubbles:!0,composed:!0}))};#i=(t)=>{let e=this.getItems();if(!e.length)return;if(t.key==="ArrowDown"){t.preventDefault();let o=(this.#t+1+e.length)%e.length;this.#n(o),e[o].focus();return}if(t.key==="ArrowUp"){t.preventDefault();let o=(this.#t-1+e.length)%e.length;this.#n(o),e[o].focus();return}if(t.key==="Home"){t.preventDefault(),this.#n(0),e[0].focus();return}if(t.key==="End"){t.preventDefault();let o=e.length-1;this.#n(o),e[o].focus();return}if(t.key==="Escape"){t.preventDefault(),this.dispatchEvent(new CustomEvent("awwbookmarklet-menu-dismiss",{bubbles:!0,composed:!0}));return}if(t.key.length===1&&/\S/.test(t.key)){this.#e+=t.key.toLowerCase(),clearTimeout(this.#o),this.#o=setTimeout(()=>{this.#e=""},450);let o=e.findIndex((a)=>a.textContent.trim().toLowerCase().startsWith(this.#e));if(o!==-1)this.#n(o),e[o].focus()}if(t.key==="Enter"||t.key===" "){let o=e[this.#t];if(!o)return;t.preventDefault(),o.click()}};#n(t){let e=this.getItems();this.#t=t,e.forEach((o,a)=>{if(a===t)o.dataset.highlighted="true";else delete o.dataset.highlighted})}}var Be=n`
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
`;class Z extends HTMLElement{static observedAttributes=["disabled","busy","pressed"];constructor(){super();let t=this.attachShadow({mode:"open"});l(t,[d,Be]),t.innerHTML='<button part="control" type="button"><slot></slot></button>',this.control=t.querySelector("button"),this.control.addEventListener("click",(e)=>{if(e.stopPropagation(),this.disabled||this.busy){e.preventDefault();return}let o=this.getAttribute("command");if(o)this.dispatchEvent(new CustomEvent("awwbookmarklet-command-request",{bubbles:!0,composed:!0,detail:{commandId:o,source:this}}));this.dispatchEvent(new MouseEvent("click",{bubbles:!0,composed:!0,cancelable:!0}))})}get disabled(){return this.hasAttribute("disabled")}set disabled(t){this.toggleAttribute("disabled",Boolean(t))}get busy(){return this.hasAttribute("busy")}set busy(t){this.toggleAttribute("busy",Boolean(t))}attributeChangedCallback(){this.control.disabled=this.disabled||this.busy,this.control.setAttribute("aria-pressed",this.hasAttribute("pressed")?"true":"false"),this.control.setAttribute("aria-busy",this.busy?"true":"false")}}var Re=n`
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
`;class Q extends HTMLElement{static observedAttributes=["disabled","busy","pressed","label","aria-label"];constructor(){super();let t=this.attachShadow({mode:"open"});l(t,[d,Re]),t.innerHTML='<button part="control" type="button"><slot></slot></button>',this.control=t.querySelector("button"),this.control.addEventListener("click",(e)=>{if(e.stopPropagation(),this.disabled||this.busy){e.preventDefault();return}let o=this.getAttribute("command");if(o)this.dispatchEvent(new CustomEvent("awwbookmarklet-command-request",{bubbles:!0,composed:!0,detail:{commandId:o,source:this}}));this.dispatchEvent(new MouseEvent("click",{bubbles:!0,composed:!0,cancelable:!0}))})}get disabled(){return this.hasAttribute("disabled")}set disabled(t){this.toggleAttribute("disabled",Boolean(t))}get busy(){return this.hasAttribute("busy")}set busy(t){this.toggleAttribute("busy",Boolean(t))}attributeChangedCallback(){this.control.disabled=this.disabled||this.busy;let t=this.getAttribute("label")||this.getAttribute("aria-label")||"";if(t)this.control.setAttribute("aria-label",t);this.control.setAttribute("aria-pressed",this.hasAttribute("pressed")?"true":"false"),this.control.setAttribute("aria-busy",this.busy?"true":"false")}}var Pe=n`
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
`,He=["value","placeholder","disabled","type","name","required","min","max","step","autocomplete","spellcheck"];class J extends HTMLElement{static observedAttributes=He;constructor(){super();let t=this.attachShadow({mode:"open"});l(t,[d,Pe]),t.innerHTML='<input part="control" />',this.control=t.querySelector("input"),this.control.addEventListener("input",(e)=>{e.stopPropagation(),this.setAttribute("value",this.control.value),this.dispatchEvent(new Event("input",{bubbles:!0,composed:!0}))}),this.control.addEventListener("change",(e)=>{e.stopPropagation(),this.setAttribute("value",this.control.value),this.dispatchEvent(new Event("change",{bubbles:!0,composed:!0}))})}get value(){return this.control.value}set value(t){this.setAttribute("value",String(t??""))}get disabled(){return this.hasAttribute("disabled")}set disabled(t){this.toggleAttribute("disabled",Boolean(t))}attributeChangedCallback(t,e,o){if(t==="disabled"){this.control.disabled=this.hasAttribute("disabled");return}if(t==="required"){this.control.required=this.hasAttribute("required");return}if(t==="value"){this.control.value=o??"";return}if(o===null){this.control.removeAttribute(t);return}this.control.setAttribute(t,o)}}var qe=n`
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
`,Ie=["value","placeholder","disabled","rows","name","required","autocomplete","spellcheck"];class tt extends HTMLElement{static observedAttributes=Ie;constructor(){super();let t=this.attachShadow({mode:"open"});l(t,[d,qe]),t.innerHTML='<textarea part="control"></textarea>',this.control=t.querySelector("textarea"),this.control.addEventListener("input",(e)=>{e.stopPropagation(),this.setAttribute("value",this.control.value),this.dispatchEvent(new Event("input",{bubbles:!0,composed:!0}))}),this.control.addEventListener("change",(e)=>{e.stopPropagation(),this.setAttribute("value",this.control.value),this.dispatchEvent(new Event("change",{bubbles:!0,composed:!0}))})}get value(){return this.control.value}set value(t){this.setAttribute("value",String(t??""))}get disabled(){return this.hasAttribute("disabled")}set disabled(t){this.toggleAttribute("disabled",Boolean(t))}attributeChangedCallback(t,e,o){if(t==="disabled"){this.control.disabled=this.hasAttribute("disabled");return}if(t==="required"){this.control.required=this.hasAttribute("required");return}if(t==="value"){this.control.value=o??"";return}if(o===null){this.control.removeAttribute(t);return}this.control.setAttribute(t,o)}}var De=n`
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
`,Ye=["checked","disabled","name","value"];class et extends HTMLElement{static observedAttributes=Ye;constructor(){super();let t=this.attachShadow({mode:"open"});l(t,[d,De]),t.innerHTML='<label><input type="checkbox" part="control" /><span part="label"><slot></slot></span></label>',this.control=t.querySelector("input"),this.control.addEventListener("change",(e)=>{e.stopPropagation(),this.toggleAttribute("checked",this.control.checked),this.dispatchEvent(new Event("change",{bubbles:!0,composed:!0}))})}get checked(){return this.hasAttribute("checked")}set checked(t){this.toggleAttribute("checked",Boolean(t))}get disabled(){return this.hasAttribute("disabled")}set disabled(t){this.toggleAttribute("disabled",Boolean(t))}get value(){return this.getAttribute("value")??"on"}set value(t){this.setAttribute("value",String(t??""))}attributeChangedCallback(t,e,o){if(t==="checked"){this.control.checked=this.hasAttribute("checked");return}if(t==="disabled"){this.control.disabled=this.hasAttribute("disabled");return}if(o===null){this.control.removeAttribute(t);return}this.control.setAttribute(t,o)}}var Fe=n`
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
`,Ve=["checked","disabled","name","value"];class ot extends HTMLElement{static observedAttributes=Ve;constructor(){super();let t=this.attachShadow({mode:"open"});l(t,[d,Fe]),t.innerHTML='<label><input type="radio" part="control" /><span part="label"><slot></slot></span></label>',this.control=t.querySelector("input"),this.control.addEventListener("change",(e)=>{if(e.stopPropagation(),this.toggleAttribute("checked",this.control.checked),this.control.checked)this.#t();this.dispatchEvent(new Event("change",{bubbles:!0,composed:!0}))})}get checked(){return this.hasAttribute("checked")}set checked(t){this.toggleAttribute("checked",Boolean(t))}get disabled(){return this.hasAttribute("disabled")}set disabled(t){this.toggleAttribute("disabled",Boolean(t))}get value(){return this.getAttribute("value")??"on"}set value(t){this.setAttribute("value",String(t??""))}attributeChangedCallback(t,e,o){if(t==="checked"){if(this.control.checked=this.hasAttribute("checked"),this.control.checked)this.#t();return}if(t==="disabled"){this.control.disabled=this.hasAttribute("disabled");return}if(o===null){this.control.removeAttribute(t);return}this.control.setAttribute(t,o)}#t(){let t=this.getAttribute("name");if(!t)return;let o=this.getRootNode().querySelectorAll?.("awwbookmarklet-radio")??[];for(let a of o)if(a!==this&&a.getAttribute("name")===t)a.removeAttribute("checked")}}var Ue=n`
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
`,ze=["disabled","name","value","required"];class at extends HTMLElement{static observedAttributes=ze;#t=null;constructor(){super();let t=this.attachShadow({mode:"open"});l(t,[d,Ue]),t.innerHTML='<div class="wrap"><select part="control"></select><span class="arrow" aria-hidden="true"></span></div>',this.control=t.querySelector("select"),this.control.addEventListener("change",(e)=>{e.stopPropagation(),this.setAttribute("value",this.control.value),this.dispatchEvent(new Event("change",{bubbles:!0,composed:!0}))})}connectedCallback(){this.#e(),this.#t=new MutationObserver(()=>this.#e()),this.#t.observe(this,{childList:!0,subtree:!0,attributes:!0,attributeFilter:["selected","disabled","value"]})}disconnectedCallback(){this.#t?.disconnect(),this.#t=null}get value(){return this.control.value}set value(t){this.setAttribute("value",String(t??""))}get disabled(){return this.hasAttribute("disabled")}set disabled(t){this.toggleAttribute("disabled",Boolean(t))}attributeChangedCallback(t,e,o){if(t==="disabled"){this.control.disabled=this.hasAttribute("disabled");return}if(t==="required"){this.control.required=this.hasAttribute("required");return}if(t==="value"){this.control.value=o??"";return}if(o===null){this.control.removeAttribute(t);return}this.control.setAttribute(t,o)}#e(){let t=[...this.querySelectorAll("option")];this.control.textContent="";for(let o of t){let a=document.createElement("option");a.value=o.value,a.textContent=o.textContent,a.disabled=o.disabled,a.selected=o.selected,this.control.append(a)}let e=this.getAttribute("value");if(e!==null)this.control.value=e;else if(this.control.selectedIndex>=0)this.setAttribute("value",this.control.value)}}var We=n`
  :host { display: inline-block; min-width: 160px; }

  input[type="range"] {
    width: 100%;
    margin: 0;
    accent-color: var(--awwbookmarklet-selection-bg, #1f5eae);
  }

  input[type="range"]:focus-visible { outline: none; box-shadow: var(--_ring); }
`,je=["min","max","step","value","disabled","name"];class rt extends HTMLElement{static observedAttributes=je;constructor(){super();let t=this.attachShadow({mode:"open"});l(t,[d,We]),t.innerHTML='<input type="range" part="control" />',this.control=t.querySelector("input"),this.control.addEventListener("input",(e)=>{e.stopPropagation(),this.setAttribute("value",this.control.value),this.dispatchEvent(new Event("input",{bubbles:!0,composed:!0}))}),this.control.addEventListener("change",(e)=>{e.stopPropagation(),this.setAttribute("value",this.control.value),this.dispatchEvent(new Event("change",{bubbles:!0,composed:!0}))})}get value(){return this.control.value}set value(t){this.setAttribute("value",String(t??""))}get disabled(){return this.hasAttribute("disabled")}set disabled(t){this.toggleAttribute("disabled",Boolean(t))}attributeChangedCallback(t,e,o){if(t==="disabled"){this.control.disabled=this.hasAttribute("disabled");return}if(t==="value"){this.control.value=o??"";return}if(o===null){this.control.removeAttribute(t);return}this.control.setAttribute(t,o)}}var Ge=n`
  :host { display: inline-block; min-width: 160px; }

  progress {
    width: 100%;
    height: 14px;
    border: 1px solid var(--awwbookmarklet-border-strong, #232a33);
    border-radius: 0;
    background: var(--awwbookmarklet-panel-bg, #f8fafc);
    accent-color: var(--awwbookmarklet-selection-bg, #1f5eae);
  }
`,Ke=["value","max"];class st extends HTMLElement{static observedAttributes=Ke;constructor(){super();let t=this.attachShadow({mode:"open"});l(t,[d,Ge]),t.innerHTML='<progress part="control"></progress>',this.control=t.querySelector("progress")}get value(){return this.control.value}set value(t){this.setAttribute("value",String(t??""))}get max(){return this.control.max}set max(t){this.setAttribute("max",String(t??""))}attributeChangedCallback(t,e,o){if(t==="value"){if(o===null)this.control.removeAttribute("value");else this.control.value=Number(o);return}if(t==="max"){if(o===null)this.control.removeAttribute("max");else this.control.max=Number(o);return}if(o===null){this.control.removeAttribute(t);return}this.control.setAttribute(t,o)}}var Xe=n`
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
`,Ze=n`
  :host { display: block; }
`,Xt=0;class it extends HTMLElement{constructor(){super();let t=this.attachShadow({mode:"open"});l(t,[d,Ze]),t.innerHTML="<slot></slot>"}}class nt extends HTMLElement{#t=[];#e=[];#o=0;#a=null;#r=!1;#s;constructor(){super();Xt+=1,this.#s=`awwbookmarklet-tabs-${Xt}`;let t=this.attachShadow({mode:"open"});l(t,[d,Xe]),t.innerHTML='<div id="tablist" role="tablist" part="tablist"></div><div id="panels" part="panels"><slot></slot></div>',t.querySelector("#tablist").addEventListener("keydown",this.#d),t.querySelector("#tablist").addEventListener("click",this.#n)}connectedCallback(){this.#l(),this.#a=new MutationObserver(()=>{if(!this.#r)this.#l()}),this.#a.observe(this,{childList:!0,attributes:!0,subtree:!0,attributeFilter:["label","selected"]})}disconnectedCallback(){this.#a?.disconnect(),this.#a=null}#l(){if(this.#e=[...this.children].filter((o)=>o.tagName.toLowerCase()===r.tabPanel),!this.#e.length){this.#t=[],this.shadowRoot.querySelector("#tablist").textContent="";return}let t=this.#e.findIndex((o)=>o.hasAttribute("selected"));this.#o=t>=0?t:0;let e=this.shadowRoot.querySelector("#tablist");e.textContent="",this.#t=this.#e.map((o,a)=>{let s=document.createElement("button");return s.type="button",s.id=`${this.id||this.#s}-tab-${a}`,s.setAttribute("role","tab"),s.setAttribute("aria-controls",`${this.id||this.#s}-panel-${a}`),s.textContent=o.getAttribute("label")||`Tab ${a+1}`,s.dataset.index=String(a),s.tabIndex=a===this.#o?0:-1,s.setAttribute("aria-selected",a===this.#o?"true":"false"),e.append(s),s}),this.#i(this.#o,!1)}#i(t,e=!0){if(!this.#t.length)return;this.#o=(t+this.#t.length)%this.#t.length,this.#t.forEach((o,a)=>{let s=a===this.#o;if(o.tabIndex=s?0:-1,o.setAttribute("aria-selected",s?"true":"false"),e&&s)o.focus()}),this.#r=!0;try{this.#e.forEach((o,a)=>{o.toggleAttribute("selected",a===this.#o),o.hidden=a!==this.#o,o.id=`${this.id||this.#s}-panel-${a}`,o.setAttribute("role","tabpanel"),o.setAttribute("aria-labelledby",`${this.id||this.#s}-tab-${a}`)})}finally{queueMicrotask(()=>{this.#r=!1})}}#n=(t)=>{let e=t.target.closest("button[role='tab']");if(!e)return;this.#i(Number(e.dataset.index),!0)};#d=(t)=>{if(!this.#t.length)return;if(t.key==="ArrowRight"){t.preventDefault(),this.#i(this.#o+1,!0);return}if(t.key==="ArrowLeft"){t.preventDefault(),this.#i(this.#o-1,!0);return}if(t.key==="Home"){t.preventDefault(),this.#i(0,!0);return}if(t.key==="End")t.preventDefault(),this.#i(this.#t.length-1,!0)}}var Qe=n`
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
`,Zt=0;function Je(t){return t.getAttribute("role")==="option"&&t.getAttribute("aria-disabled")!=="true"}class lt extends HTMLElement{#t=[];#e=-1;#o="";#a=0;#r;constructor(){super();Zt+=1,this.#r=`awwbookmarklet-listbox-${Zt}`;let t=this.attachShadow({mode:"open"});l(t,[d,Qe]),t.innerHTML='<div id="list" role="listbox" part="list" tabindex="0"><slot></slot></div>',t.querySelector("#list").addEventListener("keydown",this.#n),t.querySelector("#list").addEventListener("click",this.#i),t.querySelector("slot").addEventListener("slotchange",()=>this.#s())}connectedCallback(){this.#s()}#s(){if(this.#t=[...this.children].filter(Je),!this.#t.length){this.#e=-1,this.shadowRoot.querySelector("#list").removeAttribute("aria-activedescendant");return}if(this.#t.forEach((t,e)=>{if(!t.id)t.id=`${this.#r}-option-${e}`}),this.#e=this.#t.findIndex((t)=>t.getAttribute("aria-selected")==="true"),this.#e<0)this.#e=0;this.#l(this.#e,!1)}#l(t,e=!0){if(!this.#t.length)return;if(this.#e=(t+this.#t.length)%this.#t.length,this.#t.forEach((o,a)=>{let s=a===this.#e;o.setAttribute("aria-selected",s?"true":"false"),o.dataset.selected=s?"true":"false"}),this.shadowRoot.querySelector("#list").setAttribute("aria-activedescendant",this.#t[this.#e].id),e){let o=this.#t[this.#e];this.dispatchEvent(new CustomEvent("change",{bubbles:!0,composed:!0,detail:{index:this.#e,value:o.getAttribute("data-value")??o.textContent?.trim()??""}}))}}#i=(t)=>{let e=t.target.closest("[role='option']");if(!e||e.getAttribute("aria-disabled")==="true")return;let o=this.#t.indexOf(e);if(o!==-1)this.#l(o,!0)};#n=(t)=>{if(!this.#t.length)return;if(t.key==="ArrowDown"){t.preventDefault(),this.#l(this.#e+1,!0);return}if(t.key==="ArrowUp"){t.preventDefault(),this.#l(this.#e-1,!0);return}if(t.key==="Home"){t.preventDefault(),this.#l(0,!0);return}if(t.key==="End"){t.preventDefault(),this.#l(this.#t.length-1,!0);return}if(t.key.length===1&&/\S/.test(t.key)){this.#o+=t.key.toLowerCase(),clearTimeout(this.#a),this.#a=setTimeout(()=>{this.#o=""},450);let e=this.#t.findIndex((o)=>o.textContent?.trim().toLowerCase().startsWith(this.#o));if(e!==-1)this.#l(e,!0)}}}var to=n`
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
`;class dt extends HTMLElement{static observedAttributes=["caption"];constructor(){super();let t=this.attachShadow({mode:"open"});l(t,[d,to]),t.innerHTML='<section class="group" part="group"><div class="caption" part="caption"></div><div class="content" part="content"><slot></slot></div></section>'}connectedCallback(){this.#t()}attributeChangedCallback(){this.#t()}#t(){let t=this.getAttribute("caption")||"",e=this.shadowRoot.querySelector(".caption");e.textContent=t,e.hidden=!t}}var eo=n`
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
`;class ct extends HTMLElement{constructor(){super();let t=this.attachShadow({mode:"open"});l(t,[d,eo]),t.innerHTML=`
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
    `,this.titleSlot=t.querySelector("slot[name='title']"),this.subtitleSlot=t.querySelector("slot[name='subtitle']"),this.actionsSlot=t.querySelector("slot[name='actions']"),this.footerSlot=t.querySelector("slot[name='footer']"),[this.titleSlot,this.subtitleSlot,this.actionsSlot,this.footerSlot].forEach((e)=>{e.addEventListener("slotchange",()=>this.#t())})}connectedCallback(){this.#t()}#t(){let t=[this.titleSlot,this.subtitleSlot,this.actionsSlot].some((o)=>o.assignedNodes({flatten:!0}).length>0),e=this.footerSlot.assignedNodes({flatten:!0}).length>0;this.dataset.hasHeader=t?"true":"false",this.dataset.hasFooter=e?"true":"false"}}var oo=n`
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
`;class pt extends HTMLElement{constructor(){super();let t=this.attachShadow({mode:"open"});l(t,[d,oo]),t.innerHTML='<div id="bar" role="status" part="bar"><slot></slot></div>'}}var ao=n`
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
`;class ut extends HTMLElement{constructor(){super();let t=this.attachShadow({mode:"open"});l(t,[d,ao]),t.innerHTML=`
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
    `}}var ro=new Set(["neutral","info","success","warning","danger"]),so=new Set(["compact","normal","spacious"]),io=new Set(["start","center","end","between"]),no=new Set(["horizontal","vertical","inline"]),Qt=0;function I(t="aww"){return Qt+=1,`${t}-${Qt}`}function y(t,e="neutral"){return ro.has(t)?t:e}function Jt(t,e="normal"){return so.has(t)?t:e}function te(t,e="start"){return io.has(t)?t:e}function D(t,e="horizontal"){return no.has(t)?t:e}function lo(t){if(!t||t.disabled||t.getAttribute?.("aria-disabled")==="true")return!1;if(t.tabIndex>=0)return!0;return/^(A|BUTTON|INPUT|SELECT|TEXTAREA)$/.test(t.tagName)&&!t.hasAttribute("disabled")}function ht(t){if(!t?.querySelectorAll)return[];return[...t.querySelectorAll("a[href],button,input,select,textarea,[tabindex]")].filter(lo)}function f(t,e,o={},a={}){return t.dispatchEvent(new CustomEvent(e,{bubbles:!0,composed:!0,cancelable:Boolean(a.cancelable),detail:o}))}var co=n`
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
`;class bt extends HTMLElement{static observedAttributes=["density","align","orientation","disabled","busy"];constructor(){super();let t=this.attachShadow({mode:"open"});l(t,[d,co]),t.innerHTML='<div class="toolbar" part="toolbar"><slot></slot></div>'}connectedCallback(){this.#t()}attributeChangedCallback(){this.#t()}#t(){this.dataset.density=Jt(this.getAttribute("density")),this.dataset.align=te(this.getAttribute("align"));let t=D(this.getAttribute("orientation"),"horizontal");if(this.getAttribute("orientation")!==t)this.setAttribute("orientation",t);this.setAttribute("aria-disabled",this.hasAttribute("disabled")||this.hasAttribute("busy")?"true":"false")}}var po=n`
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
`;class mt extends HTMLElement{static observedAttributes=["label","help","error","required","tone","orientation","disabled"];#t={label:I("aww-field-label"),help:I("aww-field-help"),error:I("aww-field-error")};constructor(){super();let t=this.attachShadow({mode:"open"});l(t,[d,po]),t.innerHTML=`
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
    `,this.controlSlot=t.querySelector("slot:not([name])"),this.labelText=t.querySelector("[data-label-text]"),this.helpText=t.querySelector("[data-help-text]"),this.errorText=t.querySelector("[data-error-text]"),this.requiredMark=t.querySelector(".required"),this.controlSlot.addEventListener("slotchange",()=>this.#o())}connectedCallback(){this.#e()}attributeChangedCallback(){this.#e()}#e(){let t=D(this.getAttribute("orientation"),"vertical");if(this.getAttribute("orientation")!==t)this.setAttribute("orientation",t);let e=this.getAttribute("error")||"";this.dataset.invalid=e?"true":"false",this.dataset.tone=e?"danger":y(this.getAttribute("tone")),this.labelText.textContent=this.getAttribute("label")||"",this.helpText.textContent=e?"":this.getAttribute("help")||"",this.errorText.textContent=e,this.requiredMark.textContent=this.hasAttribute("required")?" *":"",this.#o()}#o(){let t=this.controlSlot.assignedElements({flatten:!0})[0];if(!t)return;if(!t.hasAttribute("aria-labelledby"))t.setAttribute("aria-labelledby",this.#t.label);let e=[];if(this.getAttribute("help"))e.push(this.#t.help);if(this.getAttribute("error"))e.push(this.#t.error);if(e.length)t.setAttribute("aria-describedby",e.join(" "));else t.removeAttribute("aria-describedby");t.toggleAttribute("required",this.hasAttribute("required")),t.toggleAttribute("disabled",this.hasAttribute("disabled")),t.setAttribute("aria-invalid",this.getAttribute("error")?"true":"false")}}var uo=n`
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
`;class wt extends HTMLElement{static observedAttributes=["tone","live","busy"];constructor(){super();let t=this.attachShadow({mode:"open"});l(t,[d,uo]),t.innerHTML='<span class="dot" part="indicator" aria-hidden="true"></span><span part="text"><slot></slot></span>'}connectedCallback(){this.#t()}attributeChangedCallback(){this.#t()}update(t,e={}){if(e.tone)this.setAttribute("tone",e.tone);if(e.live)this.setAttribute("live",e.live);this.textContent=String(t??"")}#t(){this.dataset.tone=y(this.getAttribute("tone"));let t=this.getAttribute("live")||"polite";this.setAttribute("aria-live",["off","polite","assertive"].includes(t)?t:"polite"),this.setAttribute("aria-busy",this.hasAttribute("busy")?"true":"false")}}var ho=n`
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
`;class gt extends HTMLElement{static observedAttributes=["tone","title","dismissible","open"];constructor(){super();let t=this.attachShadow({mode:"open"});l(t,[d,ho]),t.innerHTML=`
      <section class="alert" part="alert">
        <div class="icon" part="icon"><slot name="icon"></slot></div>
        <div class="content" part="content">
          <div class="title" part="title"><slot name="title"></slot><span data-title-text></span></div>
          <div class="message" part="message"><slot></slot></div>
          <div class="actions" part="actions"><slot name="actions"></slot></div>
        </div>
        <button type="button" part="close-button" aria-label="Dismiss" hidden>x</button>
      </section>
    `,this.closeButton=t.querySelector("button"),this.titleText=t.querySelector("[data-title-text]"),this.closeButton.addEventListener("click",()=>this.dismiss())}connectedCallback(){if(!this.hasAttribute("open"))this.setAttribute("open","");this.#t()}attributeChangedCallback(){this.#t()}dismiss(){if(f(this,"awwbookmarklet-alert-dismiss",{source:this},{cancelable:!0}))this.removeAttribute("open")}#t(){this.dataset.tone=y(this.getAttribute("tone"),"info"),this.closeButton.hidden=!this.hasAttribute("dismissible"),this.titleText.textContent=this.getAttribute("title")||"",this.setAttribute("role",this.dataset.tone==="danger"?"alert":"status")}}var ee="awwbookmarklet-overlay-layer";function ft(){if(typeof document>"u")return null;let t=globalThis[S.lastAcquiredRoot]||document.body||document.documentElement,e=t.querySelector?.(`:scope > .${ee}`);if(!e)e=document.createElement("div"),e.className=ee,Object.assign(e.style,{position:"fixed",inset:"0",pointerEvents:"none",zIndex:String(H+5000)}),t.append(e);return e}function oe(t){let e=ft();if(!e||t.parentNode===e)return null;let o={parent:t.parentNode,nextSibling:t.nextSibling};return e.append(t),o}function kt(t,e){if(!e?.parent?.isConnected)return;let o=e.nextSibling?.parentNode===e.parent?e.nextSibling:null;e.parent.insertBefore(t,o)}var bo=n`
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
`;class vt extends HTMLElement{static observedAttributes=["open","label","modal"];#t=null;#e=null;constructor(){super();let t=this.attachShadow({mode:"open"});l(t,[d,bo]),t.innerHTML=`
      <div class="backdrop" part="backdrop"></div>
      <section class="panel" part="panel" role="dialog" aria-modal="true" tabindex="-1">
        <header class="header" part="header">
          <div class="title" part="title"><slot name="title"></slot></div>
          <button type="button" part="close-button" aria-label="Close">x</button>
        </header>
        <div class="body" part="body"><slot></slot></div>
        <footer class="footer" part="footer"><slot name="footer"></slot></footer>
      </section>
    `,this.panel=t.querySelector(".panel"),this.backdrop=t.querySelector(".backdrop"),this.closeButton=t.querySelector("button"),this.closeButton.addEventListener("click",()=>this.close("button")),this.backdrop.addEventListener("click",()=>{if(this.hasAttribute("close-on-backdrop"))this.close("backdrop")}),this.addEventListener("keydown",(e)=>this.#r(e))}connectedCallback(){this.#o()}disconnectedCallback(){kt(this,this.#t)}attributeChangedCallback(){this.#o()}show(){this.setAttribute("open","")}close(t="api"){if(!f(this,"awwbookmarklet-dialog-cancel",{reason:t},{cancelable:!0}))return!1;return this.removeAttribute("open"),f(this,"awwbookmarklet-dialog-close",{reason:t}),!0}#o(){if(this.panel.setAttribute("aria-label",this.getAttribute("label")||"Dialog"),this.hasAttribute("open")){if(!this.#t)this.#t=oe(this);this.#e||=document.activeElement,queueMicrotask(()=>this.#a()),f(this,"awwbookmarklet-dialog-open",{source:this});return}if(this.#t){let t=this.#e;if(kt(this,this.#t),this.#t=null,this.#e=null,t?.focus)t.focus()}}#a(){(ht(this)[0]||this.closeButton||this.panel).focus()}#r(t){if(!this.hasAttribute("open"))return;if(t.key==="Escape"&&this.getAttribute("close-on-escape")!=="false"){t.preventDefault(),this.close("escape");return}if(t.key!=="Tab"||!this.hasAttribute("modal"))return;let e=ht(this);if(!e.length){t.preventDefault(),this.panel.focus();return}let o=e[0],a=e[e.length-1];if(t.shiftKey&&document.activeElement===o)t.preventDefault(),a.focus();else if(!t.shiftKey&&document.activeElement===a)t.preventDefault(),o.focus()}}var mo=n`
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
`,ae=new Map;function wo(){let t=ft();if(!t)return null;let e=t.querySelector(":scope > [data-aww-toast-stack]");if(!e)e=document.createElement("div"),e.dataset.awwToastStack="true",Object.assign(e.style,{position:"fixed",right:"12px",bottom:"12px",display:"grid",gap:"8px",justifyItems:"end",pointerEvents:"none"}),t.append(e);return e}class yt extends HTMLElement{static observedAttributes=["tone","timeout"];#t=0;constructor(){super();let t=this.attachShadow({mode:"open"});l(t,[d,mo]),t.innerHTML='<section class="toast" part="toast" role="status" aria-live="polite"><slot></slot></section>',this.addEventListener("mouseenter",()=>clearTimeout(this.#t)),this.addEventListener("mouseleave",()=>this.startTimer())}connectedCallback(){this.#e(),this.startTimer()}disconnectedCallback(){clearTimeout(this.#t)}attributeChangedCallback(){this.#e()}startTimer(){clearTimeout(this.#t);let t=Number(this.getAttribute("timeout")||"2800");if(t<=0)return;this.#t=setTimeout(()=>this.remove(),t)}#e(){this.dataset.tone=y(this.getAttribute("tone"),"info")}}function xt({message:t="",tone:e="info",timeout:o=2800,key:a=""}={}){let s=wo();if(!s)return null;let i=a?ae.get(a):null;if(!i?.isConnected){if(i=document.createElement("awwbookmarklet-toast"),a)ae.set(a,i);s.append(i)}return i.setAttribute("tone",e),i.setAttribute("timeout",String(o)),i.textContent=String(t??""),i.startTimer?.(),i}var go=n`
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
`;class St extends HTMLElement{static observedAttributes=["title","description"];constructor(){super();let t=this.attachShadow({mode:"open"});l(t,[d,go]),t.innerHTML=`
      <section class="empty" part="empty">
        <div class="title" part="title"></div>
        <div class="description" part="description"></div>
        <div class="content" part="content"><slot></slot></div>
        <div class="actions" part="actions"><slot name="actions"></slot></div>
      </section>
    `,this.titleNode=t.querySelector(".title"),this.descriptionNode=t.querySelector(".description")}connectedCallback(){this.#t()}attributeChangedCallback(){this.#t()}#t(){this.titleNode.textContent=this.getAttribute("title")||"Nothing to show",this.descriptionNode.textContent=this.getAttribute("description")||""}}var fo=n`
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
`,ko={loading:"info",empty:"neutral",error:"danger",blocked:"warning",success:"success",custom:"neutral"};class At extends HTMLElement{static observedAttributes=["state","label","tone"];constructor(){super();let t=this.attachShadow({mode:"open"});l(t,[d,fo]),t.innerHTML=`
      <section class="surface" part="surface">
        <div class="indicator" part="indicator" aria-hidden="true"></div>
        <div class="label" part="label"></div>
        <div part="actions"><slot name="actions"></slot></div>
      </section>
    `,this.labelNode=t.querySelector(".label")}connectedCallback(){this.#t()}attributeChangedCallback(){this.#t()}#t(){let t=this.getAttribute("state")||"loading",e=ko[t]||"neutral";this.dataset.tone=y(this.getAttribute("tone"),e),this.labelNode.textContent=this.getAttribute("label")||t,this.setAttribute("role",t==="error"||t==="blocked"?"alert":"status"),this.setAttribute("aria-live",t==="error"||t==="blocked"?"assertive":"polite")}}var vo=n`
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
`;class Et extends HTMLElement{static observedAttributes=["empty-text"];constructor(){super();let t=this.attachShadow({mode:"open"});l(t,[d,vo]),t.innerHTML=`
      <div class="list" part="list" role="list"><slot></slot></div>
      <div class="empty" part="empty" hidden>
        <slot name="empty"></slot>
        <awwbookmarklet-empty-state></awwbookmarklet-empty-state>
      </div>
    `,this.slot=t.querySelector("slot:not([name])"),this.empty=t.querySelector(".empty"),this.emptyState=t.querySelector("awwbookmarklet-empty-state"),this.slot.addEventListener("slotchange",()=>this.#t())}connectedCallback(){this.#t()}attributeChangedCallback(){this.#t()}#t(){let t=this.slot.assignedElements({flatten:!0}).filter((e)=>e.slot!=="empty");this.empty.hidden=t.length>0,this.emptyState.setAttribute("title",this.getAttribute("empty-text")||"No items")}}var yo=n`
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
`;function xo(t){return(t.composedPath?.()||[]).some((o)=>{if(!o?.slot)return!1;return o.slot==="actions"||o.slot==="trailing"})}class Mt extends HTMLElement{static observedAttributes=["tone","selected","disabled","interactive","selectable"];constructor(){super();let t=this.attachShadow({mode:"open"});l(t,[d,yo]),t.innerHTML=`
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
    `,this.surface=t.querySelector(".item"),this.surface.addEventListener("click",(e)=>this.#e(e)),this.surface.addEventListener("keydown",(e)=>this.#o(e))}connectedCallback(){this.#t()}attributeChangedCallback(){this.#t()}#t(){this.dataset.tone=y(this.getAttribute("tone")),this.surface.tabIndex=this.hasAttribute("interactive")||this.hasAttribute("selectable")?0:-1,this.surface.setAttribute("aria-selected",this.hasAttribute("selected")?"true":"false"),this.surface.setAttribute("aria-disabled",this.hasAttribute("disabled")?"true":"false")}#e(t){if(this.hasAttribute("disabled")||xo(t))return;if(!this.hasAttribute("interactive")&&!this.hasAttribute("selectable"))return;if(this.hasAttribute("selectable"))this.toggleAttribute("selected",!this.hasAttribute("selected"));f(this,"awwbookmarklet-list-item-activate",{selected:this.hasAttribute("selected"),source:this})}#o(t){if(t.key!=="Enter"&&t.key!==" ")return;t.preventDefault(),this.surface.click()}}var So=n`
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
`;class Ct extends HTMLElement{static observedAttributes=["tone"];constructor(){super();let t=this.attachShadow({mode:"open"});l(t,[d,So]),t.innerHTML=`
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
    `}connectedCallback(){this.#t()}attributeChangedCallback(){this.#t()}#t(){this.dataset.tone=y(this.getAttribute("tone"))}}var Ao=new Set(["A","ABBR","B","BLOCKQUOTE","BR","CODE","DD","DIV","DL","DT","EM","H1","H2","H3","H4","H5","H6","HR","I","IMG","LI","OL","P","PRE","S","SPAN","STRONG","SUB","SUP","TABLE","TBODY","TD","TFOOT","TH","THEAD","TR","U","UL"]),Eo=new Set(["title","aria-label","aria-hidden","role"]),Mo=new Set(["colspan","rowspan"]);function Co(t){let e=String(t??"").trim().replace(/[\u0000-\u001f\s]+/g,"");if(!e)return!0;if(e.startsWith("#")||e.startsWith("/")||e.startsWith("./")||e.startsWith("../"))return!0;try{let o=new URL(e,"https://example.invalid/");return["http:","https:","mailto:"].includes(o.protocol)}catch{return!1}}function re(t,e){for(let o of[...t.children])re(o,e);if(!Ao.has(t.tagName)){t.replaceWith(...t.childNodes);return}if(t.tagName==="IMG"&&e.images==="hidden"){t.remove();return}for(let o of[...t.attributes]){let a=o.name.toLowerCase(),s=o.value,i=Mo.has(a)&&["TD","TH"].includes(t.tagName);if(!(Eo.has(a)||i||t.tagName==="A"&&["href","target","rel"].includes(a)||t.tagName==="IMG"&&["src","alt","width","height"].includes(a))||a.startsWith("on")||a==="style"){t.removeAttribute(o.name);continue}if((a==="href"||a==="src")&&!Co(s))t.removeAttribute(o.name)}if(t.tagName==="A"){if(t.hasAttribute("href")&&e.links!=="plain")t.setAttribute("rel","noopener noreferrer"),t.setAttribute("target","_blank");else if(e.links==="plain")t.removeAttribute("href")}}function To(t,e){let s=new DOMParser().parseFromString(`<div>${String(t??"")}</div>`,"text/html").body.firstElementChild;return re(s,e),s.innerHTML}function $o(t){return String(t??"").replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi,"").replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi,"").replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi,"").replace(/\s(href|src)\s*=\s*("|')?\s*javascript:[^"'\s>]*/gi,"").replace(/<\/?(iframe|object|embed|form|input|button|meta|link)[^>]*>/gi,"")}function se(t,e={}){let o={links:e.links||"safe",images:e.images||"constrained"};if(typeof DOMParser<"u")return To(t,o);return $o(t)}var Lo=n`
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
`;class Tt extends HTMLElement{static observedAttributes=["empty-text","links","images"];#t="";constructor(){super();let t=this.attachShadow({mode:"open"});l(t,[d,Lo]),t.innerHTML=`
      <section class="wrap" part="wrap">
        <div class="empty" part="empty"></div>
        <div class="content" part="content"></div>
      </section>
    `,this.emptyNode=t.querySelector(".empty"),this.contentNode=t.querySelector(".content")}connectedCallback(){this.#e()}attributeChangedCallback(){this.#e()}get html(){return this.#t}set html(t){this.#t=se(t,{links:this.getAttribute("links")||"safe",images:this.getAttribute("images")||"constrained"}),this.#e()}setUnsafeHTML(t){this.#t=String(t??""),this.#e()}#e(){if(!this.contentNode)return;this.emptyNode.textContent=this.getAttribute("empty-text")||"Nothing to preview.",this.contentNode.innerHTML=this.#t,this.dataset.empty=this.#t.trim()?"false":"true"}}var _o=n`
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
`;class $t extends HTMLElement{static observedAttributes=["src","sandbox","referrerpolicy","loading","error","title","loading-label","error-label"];constructor(){super();let t=this.attachShadow({mode:"open"});l(t,[d,_o]),t.innerHTML=`
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
    `,this.frame=t.querySelector("iframe"),this.addressFallback=t.querySelector("[data-address]"),this.overlay=t.querySelector("awwbookmarklet-state-overlay"),this.frame.addEventListener("load",()=>{this.removeAttribute("loading"),f(this,"awwbookmarklet-frame-load",{src:this.src})}),this.frame.addEventListener("error",()=>{this.setAttribute("error",""),f(this,"awwbookmarklet-frame-error",{src:this.src})})}connectedCallback(){this.#t()}attributeChangedCallback(){this.#t()}get src(){return this.getAttribute("src")||""}set src(t){this.setAttribute("src",String(t??""))}retry(){if(f(this,"awwbookmarklet-frame-retry",{src:this.src}),this.src)this.setAttribute("loading",""),this.removeAttribute("error"),this.frame.src=this.src}openExternally(){f(this,"awwbookmarklet-frame-fallback-open",{src:this.src})}#t(){if(!this.frame)return;let t=this.getAttribute("src")||"about:blank";if(this.frame.getAttribute("src")!==t)this.frame.setAttribute("src",t);this.frame.setAttribute("title",this.getAttribute("title")||"Browser panel"),this.frame.setAttribute("sandbox",this.getAttribute("sandbox")||"allow-scripts allow-forms allow-same-origin"),this.frame.setAttribute("referrerpolicy",this.getAttribute("referrerpolicy")||"no-referrer"),this.addressFallback.textContent=this.getAttribute("src")||"No page loaded";let e=this.hasAttribute("error");this.overlay.setAttribute("state",e?"blocked":"loading"),this.overlay.setAttribute("label",e?this.getAttribute("error-label")||"This page could not be loaded here.":this.getAttribute("loading-label")||"Loading page")}}var No=n`
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
`;class Lt extends HTMLElement{static observedAttributes=["label","value"];constructor(){super();let t=this.attachShadow({mode:"open"});l(t,[d,No]),t.innerHTML=`
      <section class="wrap" part="wrap">
        <div class="label" part="label"></div>
        <div part="description"><slot>Automatic copy is unavailable. Select the text below and copy it manually.</slot></div>
        <textarea part="control" readonly></textarea>
      </section>
    `,this.labelNode=t.querySelector(".label"),this.control=t.querySelector("textarea")}connectedCallback(){this.#t()}attributeChangedCallback(){this.#t()}get value(){return this.control.value}set value(t){this.setAttribute("value",String(t??""))}selectText(){this.control.focus(),this.control.select()}#t(){this.labelNode.textContent=this.getAttribute("label")||"Manual copy required",this.control.value=this.getAttribute("value")||""}}var Oo=n`
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
`;class _t extends HTMLElement{static observedAttributes=["placeholder","empty-text"];#t=[];#e=[];#o=0;constructor(){super();let t=this.attachShadow({mode:"open"});l(t,[d,Oo]),t.innerHTML=`
      <section class="palette" part="palette">
        <input part="input" type="search" autocomplete="off" spellcheck="false" aria-label="Filter commands" />
        <div class="list" part="list" role="listbox" aria-label="Commands"></div>
      </section>
    `,this.input=t.querySelector("input"),this.list=t.querySelector(".list"),this.input.addEventListener("input",()=>this.#a()),this.input.addEventListener("keydown",(e)=>this.#l(e))}connectedCallback(){this.#r()}attributeChangedCallback(){this.#r()}get commands(){return this.#t}set commands(t){this.#t=Array.isArray(t)?t:[],this.#a()}focusInput(){this.input?.focus()}#a(){let t=this.input?.value.trim().toLowerCase()||"";this.#e=this.#t.filter((e)=>{if(!t)return!0;return[e.label,e.group,e.shortcut,...e.keywords||[]].join(" ").toLowerCase().includes(t)}),this.#o=Math.min(this.#o,Math.max(0,this.#e.length-1)),this.#s(),f(this,"awwbookmarklet-command-palette-filter",{query:t,count:this.#e.length})}#r(){if(!this.input)return;this.input.placeholder=this.getAttribute("placeholder")||"Type a command",this.#a()}#s(){if(this.list.textContent="",!this.#e.length){let t=document.createElement("div");t.className="empty",t.setAttribute("part","empty"),t.textContent=this.getAttribute("empty-text")||"No matching commands.",this.list.append(t);return}this.#e.forEach((t,e)=>{let o=document.createElement("button");o.type="button",o.className="command",o.setAttribute("part","command"),o.disabled=Boolean(t.disabled),o.setAttribute("role","option"),o.setAttribute("aria-selected",e===this.#o?"true":"false"),o.innerHTML=`
        <span>
          <span class="label" part="label"></span>
          <span class="meta" part="meta"></span>
        </span>
        <span class="shortcut" part="shortcut"></span>
      `,o.querySelector(".label").textContent=String(t.label||t.id||"Untitled command"),o.querySelector(".meta").textContent=[t.group,t.description].filter(Boolean).join(" - "),o.querySelector(".shortcut").textContent=String(t.shortcut||""),o.addEventListener("click",()=>this.#i(t)),this.list.append(o)})}#l(t){if(t.key==="ArrowDown"||t.key==="ArrowUp"){t.preventDefault();let e=t.key==="ArrowDown"?1:-1,o=this.#e.length;if(!o)return;this.#o=(this.#o+e+o)%o,this.#s();return}if(t.key==="Enter"){t.preventDefault();let e=this.#e[this.#o];if(e)this.#i(e)}}#i(t){if(t.disabled)return;if(f(this,"awwbookmarklet-command-palette-execute",{commandId:t.id||"",command:t,source:this}),typeof t.run==="function")t.run(t)}}var Bo=n`
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
`;class Nt extends HTMLElement{static observedAttributes=["empty-text"];#t=[];constructor(){super();let t=this.attachShadow({mode:"open"});l(t,[d,Bo]),t.innerHTML='<section class="help" part="help"></section>',this.helpNode=t.querySelector(".help")}connectedCallback(){this.#e()}attributeChangedCallback(){this.#e()}get shortcuts(){return this.#t}set shortcuts(t){this.#t=Array.isArray(t)?t:[],this.#e()}#e(){if(!this.helpNode)return;if(this.helpNode.textContent="",!this.#t.length){let e=document.createElement("div");e.setAttribute("part","empty"),e.textContent=this.getAttribute("empty-text")||"No shortcuts available.",this.helpNode.append(e);return}let t=new Map;for(let e of this.#t){let o=String(e.group||"General");if(!t.has(o))t.set(o,[]);t.get(o).push(e)}for(let[e,o]of t){let a=document.createElement("section");a.className="group",a.setAttribute("part","group");let s=document.createElement("div");s.className="group-title",s.setAttribute("part","group-title"),s.textContent=e,a.append(s);for(let i of o){let h=document.createElement("div");h.className="row",h.setAttribute("part","row");let v=document.createElement("kbd");v.setAttribute("part","shortcut"),v.textContent=String(i.shortcut||"");let g=document.createElement("div");g.className="description",g.setAttribute("part","description"),g.textContent=String(i.description||i.label||""),h.append(v,g),a.append(h)}this.helpNode.append(a)}}}var Ro=new Set(["javascript:","data:","file:","chrome:","about:"]);function Wr(t){try{let e=new URL(String(t??"").trim());return e.protocol==="http:"||e.protocol==="https:"}catch{return!1}}function Po(t,e="https://www.google.com/search?q={query}"){let o=String(t||"").trim();if(!o||!o.includes("{query}"))return e;try{let a=o.replace("{query}","test"),s=new URL(a);if(s.protocol!=="http:"&&s.protocol!=="https:")return e;return o}catch{return e}}function ie(t,e="https://www.google.com/search?q={query}"){return Po(e).replace("{query}",encodeURIComponent(String(t??"").trim()))}function ne(t,e="https://www.google.com/search?q={query}"){let o=String(t??"").trim();if(!o)return{kind:"ignore",input:o};try{let a=new URL(o);if(a.protocol==="http:"||a.protocol==="https:")return{kind:"navigate_url",input:o,targetUrl:a.href};if(Ro.has(a.protocol))return{kind:"blocked_protocol",input:o,protocol:a.protocol}}catch{}if(/^[\w.-]+\.[a-z]{2,}([/:?#].*)?$/i.test(o))try{return{kind:"navigate_url",input:o,targetUrl:new URL(`https://${o}`).href}}catch{return{kind:"search",input:o,query:o,targetUrl:ie(o,e)}}return{kind:"search",input:o,query:o,targetUrl:ie(o,e)}}function le(t){try{return new URL(String(t??"").trim()).hostname}catch{return""}}var Ho=n`
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
`;class Ot extends HTMLElement{static observedAttributes=["value","placeholder","search-template","open"];#t=[];#e=0;constructor(){super();let t=this.attachShadow({mode:"open"});l(t,[d,Ho]),t.innerHTML=`
      <section class="picker" part="picker">
        <input part="input" type="text" autocomplete="off" spellcheck="false" aria-label="URL or search query" />
        <div class="list" part="list" role="listbox"></div>
      </section>
    `,this.input=t.querySelector("input"),this.list=t.querySelector(".list"),this.input.addEventListener("input",()=>this.#a()),this.input.addEventListener("focus",()=>this.#r()),this.input.addEventListener("keydown",(e)=>this.#l(e))}connectedCallback(){this.#o()}attributeChangedCallback(){this.#o()}get value(){return this.input?.value||""}set value(t){this.setAttribute("value",String(t??""))}get suggestions(){return this.#t}set suggestions(t){this.#t=Array.isArray(t)?t:[],this.#n()}close(){this.removeAttribute("open")}#o(){if(!this.input)return;let t=this.getAttribute("value")||"";if(this.input.value!==t)this.input.value=t;this.input.placeholder=this.getAttribute("placeholder")||"Type URL or search query",this.#n()}#a(){this.setAttribute("value",this.input.value),this.#e=0,this.#r(),f(this,"awwbookmarklet-url-picker-query",{query:this.input.value,decision:this.#s()})}#r(){if(this.#t.length||this.input.value.trim())this.setAttribute("open","")}#s(){return ne(this.input.value,this.getAttribute("search-template")||void 0)}#l(t){if(t.key==="Escape"){this.close();return}if(t.key==="ArrowDown"||t.key==="ArrowUp"){t.preventDefault();let e=this.#i().length;if(!e)return;let o=t.key==="ArrowDown"?1:-1;this.#e=(this.#e+o+e)%e,this.setAttribute("open",""),this.#n();return}if(t.key==="Enter"){t.preventDefault();let e=this.#i()[this.#e];if(e)this.#d(e);else this.#d({type:"direct",decision:this.#s()})}}#i(){let t=this.#s();return[...t.kind==="ignore"||t.kind==="blocked_protocol"?[]:[{type:"direct",decision:t}],...this.#t]}#n(){if(!this.list)return;this.list.textContent="",this.#i().forEach((e,o)=>{let a=document.createElement("button");a.type="button",a.className="option",a.setAttribute("part","option"),a.setAttribute("role","option"),a.setAttribute("aria-selected",o===this.#e?"true":"false");let s=document.createElement("span");s.className="title",s.setAttribute("part","title");let i=document.createElement("span");if(i.className="meta",i.setAttribute("part","meta"),e.type==="direct")s.textContent=e.decision.kind==="navigate_url"?`Open ${e.decision.targetUrl}`:`Search for "${e.decision.query}"`,i.textContent=e.decision.kind==="navigate_url"?le(e.decision.targetUrl):e.decision.targetUrl;else s.textContent=String(e.title||e.label||e.url||"Untitled"),i.textContent=String(e.description||e.url||"");a.append(s,i),a.addEventListener("click",()=>this.#d(e)),this.list.append(a)})}#d(t){let e=t.type==="direct"?t.decision:{kind:"navigate_url",input:t.url||"",targetUrl:t.url||""};if(e.kind==="blocked_protocol"||e.kind==="ignore")return;this.value=e.targetUrl||"",this.close(),f(this,"awwbookmarklet-url-picker-apply",{item:t,decision:e,source:this})}}var qo=n`
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
`;class Bt extends HTMLElement{static observedAttributes=["label","value","description","delta","tone"];constructor(){super();let t=this.attachShadow({mode:"open"});l(t,[d,qo]),t.innerHTML=`
      <section class="metric" part="metric">
        <div class="label" part="label"><slot name="label"></slot><span data-label></span></div>
        <div class="value" part="value"><slot name="value"></slot><span data-value></span></div>
        <div class="delta" part="delta"><slot name="delta"></slot><span data-delta></span></div>
        <div class="description" part="description"><slot name="description"></slot><span data-description></span><slot></slot></div>
      </section>
    `,this.labelNode=t.querySelector("[data-label]"),this.valueNode=t.querySelector("[data-value]"),this.deltaNode=t.querySelector("[data-delta]"),this.descriptionNode=t.querySelector("[data-description]")}connectedCallback(){this.#t()}attributeChangedCallback(){this.#t()}#t(){this.dataset.tone=y(this.getAttribute("tone")),this.labelNode.textContent=this.getAttribute("label")||"",this.valueNode.textContent=this.getAttribute("value")||"",this.deltaNode.textContent=this.getAttribute("delta")||"",this.descriptionNode.textContent=this.getAttribute("description")||""}}function de(){Vt([[r.desktopRoot,z],[r.window,j],[r.menubar,K],[r.menu,X],[r.button,Z],[r.iconButton,Q],[r.input,J],[r.textarea,tt],[r.checkbox,et],[r.radio,ot],[r.select,at],[r.range,rt],[r.progress,st],[r.tabs,nt],[r.tabPanel,it],[r.listbox,lt],[r.group,dt],[r.panel,ct],[r.statusbar,pt],[r.appShell,ut],[r.toolbar,bt],[r.field,mt],[r.statusLine,wt],[r.alert,gt],[r.dialog,vt],[r.toast,yt],[r.emptyState,St],[r.stateOverlay,At],[r.list,Et],[r.listItem,Mt],[r.card,Ct],[r.richPreview,Tt],[r.browserPanel,$t],[r.manualCopy,Lt],[r.commandPalette,_t],[r.shortcutHelp,Nt],[r.urlPicker,Ot],[r.metricCard,Bt]])}var Rt={[c.workspaceBg]:"rgba(0, 0, 0, 0)",[c.windowBg]:"#eef1f5",[c.panelBg]:"#f3f5f7",[c.titlebarActiveBg]:"#dce2e9",[c.titlebarInactiveBg]:"#cfd5dd",[c.titlebarFg]:"#121820",[c.borderStrong]:"#4f5966",[c.borderSubtle]:"#a8b0ba",[c.focusRing]:"#174f9c",[c.buttonBg]:"#edf1f5",[c.buttonFg]:"#111720",[c.buttonActiveBg]:"#d8dee6",[c.inputBg]:"#f8f9fa",[c.inputFg]:"#111720",[c.menuBg]:"#f3f5f7",[c.menuFg]:"#0e1621",[c.selectionBg]:"#1f5eae",[c.selectionFg]:"#f2f8ff",[c.statusbarBg]:"#e2e7ed",[c.appShellBg]:"#eef1f5",[c.surfaceRaisedBg]:"#fbfcfd",[c.surfaceInsetBg]:"#dfe4ea",[c.textMuted]:"#44505f",[c.textHelp]:"#5f6a78",[c.dividerColor]:"#c7cdd5",[c.infoBg]:"#e8f2ff",[c.infoFg]:"#18549e",[c.infoBorder]:"#8db4e8",[c.successBg]:"#e7f4eb",[c.successFg]:"#1e6a3a",[c.successBorder]:"#86ba91",[c.warningBg]:"#fff4d8",[c.warningFg]:"#76520c",[c.warningBorder]:"#d7ad4d",[c.dangerBg]:"#fff0ee",[c.dangerFg]:"#a12824",[c.dangerBorder]:"#da7b73",[c.overlayBackdrop]:"rgba(12, 18, 28, 0.38)",[c.overlayShadow]:"0 18px 44px rgba(0, 0, 0, 0.24)",[c.cardBg]:"#fbfcfe",[c.cardSelectedBg]:"#e8f1ff",[c.metricBg]:"#ffffff",[c.codeBg]:"#e8edf4",[c.codeFg]:"#172131",[c.shadowDepth]:"inset 1px 1px 0 #ffffff, inset -1px -1px 0 #a8b0ba",[c.frostOpacity]:"1",[c.space1]:"4px",[c.space2]:"8px",[c.space3]:"12px",[c.controlHeight]:"30px",[c.titleHeight]:"32px"};class ce{#t;constructor(t=Rt){this.#t={...t}}get tokens(){return{...this.#t}}setTheme(t){return this.#t={...this.#t,...t},this.tokens}applyTheme(t){for(let[e,o]of Object.entries(this.#t))t.style.setProperty(e,o)}}var pe=new ce(Rt);class Pt{#t=new Set;#e=null;#o=1;#a;#r=!1;constructor(){if(this.#a=()=>this.clampAll(),window.addEventListener("resize",this.#a,{passive:!0}),window.visualViewport)window.visualViewport.addEventListener("resize",this.#a,{passive:!0}),window.visualViewport.addEventListener("scroll",this.#a,{passive:!0})}register(t){if(this.#r||this.#t.has(t))return;this.#t.add(t);let e=t.getRect();if(!e)t.setRect(this.getSpawnRect());else t.setRect(L(e));this.focus(t)}unregister(t){if(!this.#t.delete(t))return;if(this.#e===t){this.#e=null;let e=[...this.#t].at(-1)??null;if(e)this.focus(e)}}getSpawnRect(){return Wt(this.#t.size,R(),A)}focus(t){if(!this.#t.has(t))return;if(this.#e&&this.#e!==t)this.#e.setActive(!1);this.#e=t,t.setActive(!0),t.setZIndex(this.#o++)}clampAll(){for(let t of this.#t){let e=t.getRect();if(!e)continue;t.setRect(L(e))}}destroy(){if(this.#r)return;if(this.#r=!0,window.removeEventListener("resize",this.#a),window.visualViewport)window.visualViewport.removeEventListener("resize",this.#a),window.visualViewport.removeEventListener("scroll",this.#a);this.#t.clear(),this.#e=null}}function Y(){if(!globalThis[S.rootsByVersion])globalThis[S.rootsByVersion]=new Map;return globalThis[S.rootsByVersion]}function Io(t=O){let e=document.createElement(r.desktopRoot);e.dataset.version=t,document.documentElement.append(e),pe.applyTheme(e);let o={version:t,root:e,manager:new Pt,owners:new Set,destroy(){this.manager.destroy(),this.root.remove(),this.owners.clear()}};return e.__awwManager=o.manager,o}function Ht(t="default-owner",e=O){let o=Y(),a=o.get(e);if(!a||!a.root.isConnected)a=Io(e),o.set(e,a);return a.owners.add(t),globalThis[S.lastAcquiredRoot]=a.root,globalThis[S.version]=e,a}function qt(t="default-owner",e=O){let o=Y(),a=o.get(e);if(!a)return;if(a.owners.delete(t),a.owners.size>0)return;if(a.destroy(),o.delete(e),globalThis[S.lastAcquiredRoot]===a.root)delete globalThis[S.lastAcquiredRoot]}function Zs(t=O){return Y().get(t)??null}function Qs(t=O){let e=Y();if(t==="*"){for(let[a,s]of e)s.destroy(),e.delete(a);delete globalThis[S.lastAcquiredRoot];return}let o=e.get(t);if(!o)return;if(o.destroy(),e.delete(t),globalThis[S.lastAcquiredRoot]===o.root)delete globalThis[S.lastAcquiredRoot]}function Do(){return'<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="square"/></svg>'}function ue({title:t="Page Extraction Tool"}={}){let e=document.createElement(r.window);e.setAttribute("title",t);let o=document.createElement(r.menubar);o.slot="menubar",o.innerHTML=`
    <button type="button" data-menu="file">File</button>
    <button type="button" data-menu="view">View</button>
    <button type="button" data-menu="help">Help</button>

    <${r.menu} name="file">
      <button type="button" data-command="tool.run">Run</button>
      <button type="button" data-command="tool.reset">Reset</button>
      <div data-separator role="separator"></div>
      <button type="button" data-command="tool.close">Close</button>
    </${r.menu}>

    <${r.menu} name="view">
      <button type="button" data-command="view.compact">Compact Mode</button>
      <button type="button" data-command="view.normal">Normal Mode</button>
    </${r.menu}>

    <${r.menu} name="help">
      <button type="button" data-command="help.about">About</button>
    </${r.menu}>
  `;let a=document.createElement("div");a.slot="toolbar",a.style.display="flex",a.style.flexWrap="wrap",a.style.gap="8px",a.style.padding="6px 8px",a.style.alignItems="center",a.innerHTML=`
    <${r.iconButton} id="tool-refresh" aria-label="Refresh">${Do()}</${r.iconButton}>
    <${r.button} id="tool-run">Run</${r.button}>
    <${r.button} id="tool-close">Close</${r.button}>
  `;let s=document.createElement(r.statusbar);s.slot="statusbar",s.innerHTML='<span id="status-main">Ready</span><span id="status-count">0 selected</span><span id="status-mode">Normal</span>';let i=document.createElement("div");i.style.display="grid",i.style.gap="12px",i.innerHTML=`
    <${r.group} caption="Target">
      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap:8px; align-items:center;">
        <${r.input} id="target-input" placeholder="CSS selector or current selection"></${r.input}>
        <${r.button} id="target-refresh">Refresh</${r.button}>
        <${r.button} id="target-pick">Pick Again</${r.button}>
      </div>
    </${r.group}>

    <${r.panel}>
      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap:12px;">
        <${r.group} caption="Options">
          <div style="display:grid; gap:8px;">
            <${r.checkbox} checked id="opt-trim">Trim whitespace</${r.checkbox}>
            <${r.checkbox} id="opt-links">Include links</${r.checkbox}>
            <${r.checkbox} checked id="opt-visible">Only visible nodes</${r.checkbox}>
            <div style="display:grid; gap:6px; margin-top:4px;">
              <${r.radio} name="mode" value="text" checked>Text</${r.radio}>
              <${r.radio} name="mode" value="html">HTML</${r.radio}>
            </div>
          </div>
        </${r.group}>

        <${r.group} caption="Output">
          <${r.tabs} id="output-tabs">
            <${r.tabPanel} label="Result" selected>
              <${r.textarea} id="result-output" rows="6" placeholder="Extraction result"></${r.textarea}>
            </${r.tabPanel}>
            <${r.tabPanel} label="History">
              <${r.listbox} id="history-list">
                <div role="option" aria-selected="true" data-value="run-1">Run #1</div>
                <div role="option" data-value="run-2">Run #2</div>
                <div role="option" data-value="run-3">Run #3</div>
              </${r.listbox}>
            </${r.tabPanel}>
          </${r.tabs}>
        </${r.group}>
      </div>
    </${r.panel}>

    <${r.group} caption="Actions">
      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap:12px; align-items:center;">
        <div style="display:grid; gap:8px;">
          <label style="display:grid; gap:4px;">Preset
            <${r.select} id="preset-select">
              <option value="quick" selected>Quick</option>
              <option value="balanced">Balanced</option>
              <option value="full">Full</option>
            </${r.select}>
          </label>
          <label style="display:grid; gap:4px;">Confidence
            <${r.range} id="confidence-range" min="0" max="100" value="65"></${r.range}>
          </label>
        </div>
        <div style="display:grid; gap:8px;">
          <${r.progress} id="run-progress" value="0" max="100"></${r.progress}>
          <div style="display:flex; flex-wrap:wrap; justify-content:flex-end; gap:8px;">
            <${r.button} id="action-run">Run</${r.button}>
            <${r.button} id="action-close">Close</${r.button}>
          </div>
        </div>
      </div>
    </${r.group}>
  `,e.append(o,a,i,s);let h=()=>s.querySelector("#status-main"),v=()=>s.querySelector("#status-count"),g=()=>s.querySelector("#status-mode"),k=(w)=>{h().textContent=w},_=(w)=>{if(g().textContent=w,i.dataset.mode=w,w==="Compact")i.style.gap="8px";else i.style.gap="12px"},$=()=>e.requestClose(),M=()=>{k("Running...");let w=i.querySelector("#run-progress"),x=Number(w.getAttribute("value")||"0");x=Math.min(100,x+35),w.setAttribute("value",String(x));let N=i.querySelector("#result-output");N.value=`Extracted ${x} records from ${i.querySelector("#target-input").value||"current page"}.`,v().textContent=`${Math.ceil(x/10)} selected`,k(x>=100?"Completed":"Running step complete")};return o.commandRegistry.register({id:"tool.run",label:"Run",run:M}),o.commandRegistry.register({id:"tool.reset",label:"Reset",run:()=>{i.querySelector("#run-progress").setAttribute("value","0"),i.querySelector("#result-output").value="",k("Ready"),v().textContent="0 selected"}}),o.commandRegistry.register({id:"tool.close",label:"Close",run:$}),o.commandRegistry.register({id:"view.compact",label:"Compact",run:()=>_("Compact")}),o.commandRegistry.register({id:"view.normal",label:"Normal",run:()=>_("Normal")}),o.commandRegistry.register({id:"help.about",label:"About",run:()=>k("AWW Bookmarklet Framework v1")}),a.querySelector("#tool-run").addEventListener("click",M),a.querySelector("#tool-close").addEventListener("click",$),a.querySelector("#tool-refresh").addEventListener("click",()=>k("Refreshed target snapshot")),i.querySelector("#target-refresh").addEventListener("click",()=>k("Target refreshed")),i.querySelector("#target-pick").addEventListener("click",()=>k("Pick mode enabled")),i.querySelector("#action-run").addEventListener("click",M),i.querySelector("#action-close").addEventListener("click",$),i.querySelector("#history-list").addEventListener("change",(w)=>{k(`History selected: ${w.detail.value}`)}),i.querySelectorAll(`${r.radio}[name='mode']`).forEach((w)=>{w.addEventListener("change",()=>{if(w.hasAttribute("checked"))k(`Mode switched to ${w.getAttribute("value")}`)})}),i.querySelector("#confidence-range").addEventListener("input",(w)=>{v().textContent=`${w.target.value}% confidence`}),e}var It={logo:'<rect x="3" y="3" width="18" height="18" fill="currentColor" stroke="none"/><path d="M7 16V8h3l2 8 2-8h3v8" stroke="#f6f8fb"/><path d="M7 12h3M14 12h3" stroke="#f6f8fb"/>',window:'<rect x="4" y="5" width="16" height="14"/><path d="M4 9h16M7 7h1M10 7h1"/>',minimize:'<path d="M7 17h10"/>',maximize:'<rect x="7" y="7" width="10" height="10"/><path d="M10 4h10v10"/>',close:'<path d="M6 6l12 12M18 6L6 18"/>',menu:'<path d="M5 7h14M5 12h14M5 17h14"/>',panel:'<rect x="5" y="5" width="14" height="14"/><path d="M8 8h8M8 12h8M8 16h5"/>',back:'<path d="M14 6l-6 6 6 6M9 12h10"/>',forward:'<path d="M10 6l6 6-6 6M5 12h10"/>',refresh:'<path d="M18 8a7 7 0 1 0 1 6M18 4v4h-4"/>',search:'<circle cx="10" cy="10" r="5"/><path d="M14 14l6 6"/>',lock:'<rect x="6" y="10" width="12" height="10"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/>',url:'<rect x="4" y="6" width="16" height="12"/><path d="M7 10h10M7 14h7"/>',link:'<path d="M10 8l2-2a4 4 0 0 1 6 6l-2 2M14 16l-2 2a4 4 0 0 1-6-6l2-2M9 15l6-6"/>',external:'<rect x="5" y="7" width="12" height="12"/><path d="M12 5h7v7M19 5l-8 8"/>',copyUrl:'<rect x="8" y="5" width="10" height="14"/><path d="M6 8H4v11h10v-2"/>',star:'<path d="M12 4l2.4 5 5.6.8-4 3.9.9 5.5-4.9-2.6-4.9 2.6.9-5.5-4-3.9 5.6-.8z"/>',fullscreen:'<path d="M5 10V5h5M14 5h5v5M19 14v5h-5M10 19H5v-5"/>',more:'<circle cx="6" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="18" cy="12" r="1" fill="currentColor" stroke="none"/>',capture:'<path d="M5 10V5h5M14 5h5v5M19 14v5h-5M10 19H5v-5M9 12h6"/>',console:'<rect x="4" y="6" width="16" height="12"/><path d="M7 10l3 2-3 2M12 15h5"/>',eye:'<path d="M3 12s3-5 9-5 9 5 9 5-3 5-9 5-9-5-9-5z"/><circle cx="12" cy="12" r="2"/>',upload:'<path d="M12 17V5M8 9l4-4 4 4M5 19h14"/>',dialog:'<rect x="5" y="6" width="14" height="12"/><path d="M5 10h14M8 8h1"/>',gear:'<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/>',sliders:'<path d="M5 7h14M5 12h14M5 17h14"/><rect x="8" y="5" width="3" height="4"/><rect x="14" y="10" width="3" height="4"/><rect x="6" y="15" width="3" height="4"/>',copy:'<rect x="8" y="5" width="10" height="14"/><path d="M6 8H4v11h10"/>',paste:'<path d="M9 5h6l1 3H8z"/><rect x="6" y="8" width="12" height="12"/>',cut:'<circle cx="7" cy="7" r="2"/><circle cx="7" cy="17" r="2"/><path d="M9 8l9 9M9 16l9-9"/>',edit:'<path d="M5 17l1 3 3-1 9-9-4-4zM13 7l4 4"/>',trash:'<path d="M5 7h14M9 7V5h6v2M7 7l1 13h8l1-13M10 10v7M14 10v7"/>',markdown:'<rect x="4" y="6" width="16" height="12"/><path d="M7 15V9l3 4 3-4v6M16 9v6M14 13l2 2 2-2"/>',folder:'<path d="M3 8h7l2 2h9v9H3z"/>',document:'<path d="M7 3h7l4 4v14H7zM14 3v5h4"/>',article:'<path d="M7 4h10v16H7zM10 8h4M10 12h4M10 16h4"/>',text:'<path d="M5 6h14M12 6v12M9 18h6"/>',image:'<rect x="5" y="6" width="14" height="12"/><path d="M7 16l4-5 3 3 2-2 3 4"/><circle cx="9" cy="9" r="1" fill="currentColor" stroke="none"/>',list:'<path d="M9 7h10M9 12h10M9 17h10"/><path d="M5 7h1M5 12h1M5 17h1"/>',table:'<rect x="4" y="5" width="16" height="14"/><path d="M4 10h16M4 15h16M10 5v14M15 5v14"/>',metrics:'<path d="M5 19V9M12 19V5M19 19v-7M3 19h18"/>',code:'<path d="M8 8l-4 4 4 4M16 8l4 4-4 4M14 5l-4 14"/>',note:'<path d="M6 4h12v14l-4 3H6zM14 18v3M9 8h6M9 12h6"/>',info:'<circle cx="12" cy="12" r="9"/><path d="M12 10v7M12 7h.01"/>',success:'<circle cx="12" cy="12" r="9"/><path d="M7 12l3 3 7-7"/>',warning:'<path d="M12 4l9 16H3zM12 9v5M12 17h.01"/>',error:'<circle cx="12" cy="12" r="9"/><path d="M8 8l8 8M16 8l-8 8"/>',neutral:'<circle cx="12" cy="12" r="9"/><path d="M8 12h8"/>',selected:'<rect x="5" y="5" width="14" height="14"/><path d="M8 12l3 3 5-6"/>',unselected:'<rect x="5" y="5" width="14" height="14"/>',radioSelected:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3" fill="currentColor" stroke="none"/>',radio:'<circle cx="12" cy="12" r="8"/>',progress:'<rect x="5" y="9" width="14" height="6"/><path d="M6 12h8"/>',progressIndeterminate:'<rect x="5" y="9" width="14" height="6"/><path d="M7 14l4-4M12 14l4-4"/>',sync:'<path d="M18 8a7 7 0 0 0-12-1M6 4v4h4M6 16a7 7 0 0 0 12 1M18 20v-4h-4"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v6l4 2"/>',draft:'<path d="M6 4h12v16H6zM9 8h6M9 12h4"/><path d="M16 16l3 3"/>',shield:'<path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z"/><path d="M9 12l2 2 4-5"/>',blocked:'<circle cx="12" cy="12" r="9"/><path d="M6 18L18 6"/>',frameBlocked:'<path d="M5 10V5h5M14 5h5v5M19 14v5h-5M10 19H5v-5" stroke-dasharray="4 3"/>',accessBlocked:'<rect x="6" y="10" width="12" height="10"/><path d="M8 10V7a4 4 0 0 1 8 0v3M9 15h6"/>',browserBlocked:'<rect x="4" y="6" width="16" height="12"/><path d="M4 10h16M8 14l8 0M9 17l6-6"/>',noResults:'<circle cx="10" cy="10" r="5"/><path d="M14 14l5 5M5 19h14" stroke-dasharray="3 3"/>',noCaptures:'<path d="M5 10V5h5M14 5h5v5M19 14v5h-5M10 19H5v-5" stroke-dasharray="4 3"/>',noSelection:'<rect x="5" y="5" width="14" height="14" stroke-dasharray="4 3"/>',retry:'<path d="M18 8a7 7 0 1 0 1 6M18 4v4h-4"/>',permissions:'<path d="M9 19a5 5 0 0 1 6-8M12 4a4 4 0 1 1 0 8M16 16h5M18.5 13.5v5"/>',grid:'<rect x="5" y="5" width="5" height="5"/><rect x="14" y="5" width="5" height="5"/><rect x="5" y="14" width="5" height="5"/><rect x="14" y="14" width="5" height="5"/>',filter:'<path d="M4 6h16l-6 7v5l-4 2v-7z"/>',sort:'<path d="M8 5v14M5 8l3-3 3 3M16 19V5M13 16l3 3 3-3"/>',columns:'<rect x="4" y="5" width="16" height="14"/><path d="M10 5v14M16 5v14"/>',pane:'<rect x="4" y="5" width="16" height="14"/><path d="M12 5v14"/>'},Dt=Object.freeze(Object.keys(It));function m(t,{label:e="",className:o="ui-icon"}={}){let a=It[t]||It.panel,s=e?`role="img" aria-label="${Yo(e)}"`:'aria-hidden="true"';return`<svg class="${o}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter" ${s}>${a}</svg>`}function Yo(t){return String(t).replace(/[&<>"']/g,(e)=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e])}de();var ge="catalog-page";Ht(ge);var he=0;function Fo(t){return he+=1,`${t}-${he}`}function fe(t,e){let o=Fo(e);return Ht(o).root.append(t),t.addEventListener("awwbookmarklet-window-closed",()=>qt(o),{once:!0}),t}function be(){fe(ue({title:"Session Capture Console"}),"example")}function me(){let t=document.createElement(r.window);t.setAttribute("title","Blank Shell"),t.innerHTML=`
    <${r.panel}>
      <span slot="title">Empty workspace</span>
      <p class="inline-note">Movable, resizable shell with optional regions.</p>
      <p class="inline-note">Resize this window to check narrow layout behavior.</p>
    </${r.panel}>
    <${r.statusbar} slot="statusbar"><span>Ready</span><span>Blank</span><span>No errors</span></${r.statusbar}>
  `,t.setRect({x:110,y:80,width:430,height:270}),fe(t,"blank")}function p(t,e={}){let{variant:o="secondary",icon:a="",id:s="",disabled:i=!1,aria:h=""}=e;return`<button class="os-button os-button--${o}"${s?` id="${s}"`:""}${i?" disabled":""}${h?` aria-label="${h}"`:""}>${a?m(a):""}<span>${t}</span></button>`}function E(t,e,o={}){let{id:a="",pressed:s=!1}=o;return`<button class="icon-button"${a?` id="${a}"`:""} aria-label="${t}"${s?' aria-pressed="true"':""}>${m(e)}</button>`}function T(t){return`<kbd class="keycap">${t}</kbd>`}function C(t,e,o={}){let{help:a="",error:s="",required:i=!1,disabled:h=!1}=o;return`
    <label class="field-row${h?" is-disabled":""}${s?" is-invalid":""}">
      <span class="field-label">${t}${i?'<span aria-hidden="true">*</span>':""}</span>
      <span class="field-main">${e}${a?`<small>${a}</small>`:""}${s?`<small class="field-error">${s}</small>`:""}</span>
    </label>
  `}function u({title:t,icon:e="panel",meta:o="",className:a="",body:s="",actions:i=""}){return`
    <section class="catalog-panel ${a}">
      <header class="panel-titlebar">
        <span class="panel-title">${m(e)}<span>${t}</span></span>
        ${o?`<span class="panel-meta">${o}</span>`:""}
        ${i?`<span class="panel-actions">${i}</span>`:""}
      </header>
      <div class="panel-body">${s}</div>
    </section>
  `}function F({title:t,body:e,footer:o="",className:a=""}){return`
    <div class="mini-window ${a}">
      <div class="mini-titlebar">
        <span>${m("window")} ${t}</span>
        <span class="window-controls" aria-hidden="true"><i></i><i></i><i></i></span>
      </div>
      <div class="mini-body">${e}</div>
      ${o?`<div class="mini-status">${o}</div>`:""}
    </div>
  `}function b(t,e,o,a,s=""){return`
    <article class="state-card state-card--${t}">
      <span class="state-icon">${m(e)}</span>
      <span class="state-copy"><strong>${o}</strong><small>${a}</small></span>
      ${s?`<span class="state-action">${s}</span>`:""}
    </article>
  `}function Vo(t){return`<div class="metric-register">${t.map((e)=>`
    <div><span>${e.label}</span><strong>${e.value}</strong><small>${e.detail}</small></div>
  `).join("")}</div>`}function Yt(t){return`
    <div class="command-surface">
      <label class="search-box">${m("search")}<input value="" placeholder="Type a command or search..." aria-label="Command search" /><span>${T("Ctrl+K")}</span></label>
      <div class="command-list" role="listbox" aria-label="Commands">
        ${t.map((e,o)=>`
          <button class="command-row${o===0?" is-selected":""}" type="button" role="option" aria-selected="${o===0?"true":"false"}">
            ${m(e.icon)}
            <span><strong>${e.title}</strong><small>${e.desc}</small></span>
            <span class="shortcut">${e.keys.map(T).join("")}</span>
          </button>
        `).join("")}
      </div>
      <footer class="command-footer"><span>${T("↑")} ${T("↓")} Navigate</span><span>${T("Enter")} Execute</span><span>${T("Esc")} Close</span></footer>
    </div>
  `}function Uo(){let t=[["url","https://example.com/research","Current page"],["article","https://example.com/research/notes","Recent page"],["table","https://example.com/research/data","Recent page"],["clock","https://example.com/research/archive","Visited 2d ago"],["search",'Search history for "research"',"Press Enter to search all history"]];return`
    <div class="url-surface">
      <label class="select-like"><input value="https://example.com/research" aria-label="URL picker" /><button aria-label="Open URL suggestions">${m("menu")}</button></label>
      <div class="url-list" role="listbox" aria-label="URL suggestions">
        ${t.map((e,o)=>`
          <button class="url-row${o===0?" is-selected":""}" type="button" role="option" aria-selected="${o===0?"true":"false"}">
            ${m(e[0])}<span><strong>${e[1]}</strong><small>${e[2]}</small></span>
          </button>
        `).join("")}
      </div>
    </div>
  `}function V(t="https://example.com/research"){return`
    <div class="browser-toolbar">
      ${E("Back","back")}
      ${E("Forward","forward")}
      ${E("Refresh","refresh")}
      <label class="browser-address">${m("lock")}<input value="${t}" aria-label="Address" /></label>
      ${E("Bookmark","star")}
      ${E("Fullscreen","fullscreen",{pressed:!0})}
      ${E("More","more")}
    </div>
  `}function zo(){return`
    <section class="system-overview">
      <div class="product-cell">
        <div class="app-logo">${m("logo",{label:"AWW"})}</div>
        <div>
          <h1>Component Catalog for Constrained Bookmarklet Tools</h1>
          <p>A curated set of primitives, patterns, and interaction tools for injection, capture, preview, commands, and resilient fallback paths.</p>
        </div>
        <div class="hero-actions">
          ${p("Open Sample Tool",{variant:"primary",id:"hero-example"})}
          ${p("Open Blank Window",{id:"hero-blank"})}
        </div>
      </div>
      ${F({title:"System Preview / Session Capture Console",className:"system-preview",body:`
          <div class="register-line"><span>Target</span><strong>https://example.org/reports</strong></div>
          <div class="register-line"><span>Mode</span><strong>Bookmarklet / constrained</strong></div>
          <div class="meter-row"><span>CPU</span><progress value="18" max="100"></progress><small>18%</small></div>
        `,footer:"<span>Ready</span><span>Policy: limited</span>"})}
      <div class="status-register">
        <fieldset>
          <legend>System Status</legend>
          <div><span>Environment</span><strong>Browser</strong></div>
          <div><span>Permissions</span><strong>Limited</strong></div>
          <div><span>Migration mode</span><strong>Enabled</strong></div>
          <div><span>Fallback mode</span><strong>Available</strong></div>
          <hr />
          <div><span>Last sync</span><strong>1m ago</strong></div>
          <div><span>Local cache</span><strong>128 items</strong></div>
        </fieldset>
      </div>
    </section>
  `}function ke(){return u({title:"Desktop Shell",icon:"window",meta:"runtime",body:`
      ${F({title:"Floating Shell",body:`
          <p class="inline-note">Window runtime, focus, drag, resize, and status behavior.</p>
          <div class="button-row">${p("Open Sample Tool",{variant:"primary",id:"open-example"})}${p("New Blank Window",{id:"open-blank"})}</div>
        `,footer:"<span>document: loaded</span><span>injection: active</span><span>mode: bookmarklet</span><span>statusbar: on</span>"})}
    `})}function ve(){return u({title:"Control Primitives",icon:"sliders",meta:"forms",body:`
      <div class="tab-sample"><button class="is-active">Buttons</button><button>Inputs</button><button>Selects</button><button>Checks</button><button>Sliders</button><button>Misc</button></div>
      <div class="button-row">${p("Primary",{variant:"primary"})}${p("Default")}${p("Ghost",{variant:"ghost"})}${p("Danger",{variant:"danger"})}${p("Disabled",{disabled:!0})}${E("Add","selected")}${E("Remove","minimize")}</div>
      <div class="control-grid">
        <input class="os-input" value="text input" aria-label="Text input" />
        <select class="os-input" aria-label="Select option"><option>Select option</option></select>
        <textarea class="os-input" rows="4" aria-label="Textarea">text area content...</textarea>
        <div class="range-stack"><label><input type="range" value="60" /> <span>60%</span></label><progress value="72" max="100"></progress></div>
      </div>
      <div class="button-row checks"><label><input type="checkbox" checked /> Checkbox</label><label><input type="radio" checked name="demo-radio" /> Radio A</label><label><input type="radio" name="demo-radio" /> Radio B</label></div>
    `})}function ye(){return u({title:"Field Matrix",icon:"table",meta:"fields",body:`
      <div class="field-matrix">
        ${C("Label - required",'<input class="os-input" value="value" />',{required:!0})}
        ${C("URL picker",'<select class="os-input"><option>https://example.com</option></select>')}
        ${C("Date and time",'<input class="os-input" type="datetime-local" value="2026-04-25T17:30" />')}
        ${C("Capture mode",'<select class="os-input"><option>Visible viewport</option><option>Full page</option></select>')}
        ${C("Reminder offset",'<input class="os-input" type="number" value="60" />',{error:"Offset must be between 1 and 1680."})}
        ${C("Filename prefix",'<input class="os-input" value="session_" />',{help:"Letters, numbers, dash and underscore."})}
        ${C("Disabled setting",'<label><input type="checkbox" disabled /> This option is disabled.</label>',{disabled:!0})}
        ${C("Help text",'<input class="os-input" value="readable" />',{help:"Help text explains the expected value."})}
      </div>
    `})}function xe(){return u({title:"Feedback Matrix",icon:"info",meta:"states",body:`
      <div class="state-stack">
        ${b("info","info","Private note saved","Your private note was saved successfully.",p("View note"))}
        ${b("warning","warning","Draft restored","We restored a local draft from 2m ago.",p("Review"))}
        ${b("success","success","Export completed","Blocks exported to markdown.",p("Open folder"))}
        ${b("danger","error","Upload denied","Permissions policy blocked the upload.",p("Retry"))}
        ${b("neutral","selected","Browser blocked frame","The frame refused to load content.",p("Open externally"))}
      </div>
    `})}function Se(){return u({title:"Application Shell Example",icon:"console",meta:"workflow",className:"span-8",body:`
      ${F({title:"Session Capture Console",body:`
          <div class="menu-strip"><span>Console</span><span>Actions</span><span>View</span><span>Help</span><button>Collect</button><button>Refresh</button><button>Clear</button></div>
          ${b("warning","warning","Draft available","A previous capture draft can be restored before starting a new run.",p("Review"))}
          <div class="three-grid">
            <div class="group-box"><strong>Target</strong><input class="os-input" value="https://example.org/articles/12345" /><small>Mode: constrained<br />Viewport: 1280 x 800<br />Injected: active</small></div>
            <div class="group-box"><strong>Quick actions</strong>${p("Capture visible",{icon:"capture"})}${p("Open preview",{icon:"eye"})}${p("Copy as markdown",{icon:"markdown"})}</div>
            <div class="group-box"><strong>Activity log</strong><small>10:12:45 Capture completed<br />10:12:40 Preview opened<br />10:12:35 Commands loaded</small></div>
          </div>
        `,footer:'<span>Memory <progress value="34" max="100"></progress> 34%</span><span>DOM nodes: 1,842</span><span>Events: 24</span><span>Idle</span>'})}
    `})}function Wo(){return u({title:"Browser State Preview",icon:"url",meta:"context",className:"span-4",body:`
      <div class="browser-panel-preview">
        ${V("https://example.com/research")}
        <div class="metric-register three">
          <div>${m("info")}<span>Selected text</span><strong>142 chars</strong></div>
          <div>${m("image")}<span>Images found</span><strong>8</strong></div>
          <div>${m("link")}<span>Links found</span><strong>12</strong></div>
        </div>
        ${b("warning","warning","Frame refused to load","The frame blocked access to this resource.",p("Retry")+p("Open externally"))}
        <div class="mini-status"><span>Status: partially available</span><span>Policy: restricted</span></div>
      </div>
    `})}function jo(){return`
    <div class="screen-heading"><strong>Overview / Shell & Primitives</strong><span>Foundational shell, controls, fields, feedback, command preview, and browser state inventory.</span></div>
    <div class="screen-grid">
      ${ke()}
      ${ve()}
      ${ye()}
      ${xe()}
      ${Se()}
      ${Wo()}
    </div>
  `}function Go(){return`
    <div class="screen-heading"><strong>Primitives</strong><span>Strict control scale, field alignment, semantic feedback, state cues, and reusable pictogram assets.</span></div>
    <div class="screen-grid">
      ${ke()}
      ${ve()}
      ${ye()}
      ${xe()}
      ${u({title:"Command Palette Preview",icon:"console",className:"span-6",body:Yt(Ft().slice(0,5))})}
      ${u({title:"Icon Grammar",icon:"grid",className:"span-6",body:`<div class="icon-preview-grid">${Dt.slice(0,30).map((t)=>`<span title="${t}">${m(t)}<small>${t}</small></span>`).join("")}</div>`})}
    </div>
  `}function Ko(){let t=Ft();return`
    <div class="screen-heading"><strong>Application Patterns</strong><span>Composed patterns that solve common workflows in constrained environments.</span></div>
    <div class="screen-grid">
      ${Se()}
      ${u({title:"Rows & Cards",icon:"list",meta:"results",className:"span-8",body:`
          <div class="results-toolbar"><input class="os-input" placeholder="Search results..." /><button>Filter</button><button>Sort: Newest</button>${E("List view","list",{pressed:!0})}${E("Grid view","grid")}</div>
          <div class="result-grid">${["Article Header","Author Block","Published Date","Hero Image","Summary Section","Related Links"].map((e,o)=>`
            <article class="result-card"><label><input type="checkbox" ${o===0?"checked":""}/> <strong>${e}</strong></label><small>Selector: ${o===0?"h1:title":".capture-item"}<br />Text nodes: ${o+1}</small><span class="ok-dot"></span> Captured · 10:1${o} AM</article>
          `).join("")}</div>
          <div class="pager"><span>Showing 1-6 of 34</span><button>|&lt;</button><button>&lt;</button><button class="is-active">1</button><button>2</button><button>3</button><button>&gt;</button><button>&gt;|</button></div>
        `})}
      ${u({title:"Command Palette Preview",icon:"console",className:"span-4",body:Yt(t.slice(0,5))})}
      ${u({title:"Preview Pane",icon:"eye",className:"span-4",body:`
          <div class="document-surface compact">
            <div class="tab-sample"><button class="is-active">Preview</button><button>HTML</button><button>Text</button><button>Markdown</button></div>
            <article><h3>Understanding Constrained Environments</h3><p>Constrained bookmarklet tools run inside the page, not the page. Design for resilience, minimal footprint, and graceful fallbacks.</p><div class="image-placeholder"></div></article>
            <div class="mini-status"><span>Viewport: 1280x800</span><span>Zoom: 100%</span><span>Theme: Auto</span></div>
          </div>
        `})}
      ${u({title:"Metrics & Status Compact",icon:"metrics",className:"span-4",body:Vo([{label:"Captures",value:"24",detail:"+6 this hour"},{label:"Preview opens",value:"18",detail:"+4 this hour"},{label:"Commands run",value:"31",detail:"+9 this hour"},{label:"Errors",value:"0",detail:"No change"},{label:"Uptime",value:"2h 14m",detail:"Session time"}])})}
      ${u({title:"Feedback Matrix Inline",icon:"info",className:"span-8",body:`<div class="inline-states">${b("info","info","Private note saved","Saved successfully.")}${b("success","success","Export completed","Markdown exported.")}${b("warning","warning","Browser blocked frame","Retry opened externally.")}${b("danger","error","Upload denied","Policy blocked upload.")}</div>`})}
    </div>
  `}function Xo(){return`
    <div class="screen-grid">
      ${u({title:"Browser Panel Preview",icon:"url",className:"span-6",body:`
          ${V("https://example.com/research/market-trends")}
          <div class="metric-register three"><div>${m("info")}<span>Selected text</span><strong>218 chars</strong></div><div>${m("image")}<span>Images found</span><strong>14</strong></div><div>${m("link")}<span>Links found</span><strong>9</strong></div></div>
          ${b("success","success","Capture completed","Blocks exported to markdown.",p("Open folder"))}
          ${b("warning","warning","Draft restored","We restored your draft from 2m ago.",p("Review draft"))}
        `})}
      ${u({title:"Content State Matrix",icon:"table",className:"span-6",actions:p("Legend"),body:`
          <table class="state-table">
            <thead><tr><th>State</th><th>Preview panel</th><th>Document surface</th><th>Browser panel</th></tr></thead>
            <tbody>
              ${P("Success","success",["Content captured","Research Notes","Capture completed"])}
              ${P("Warning","warning",["Partial capture","Missing elements","Draft restored"])}
              ${P("Error","danger",["Capture failed","Unable to load","Upload failed"])}
              ${P("Neutral","neutral",["No selection","No content yet","Idle"])}
              ${P("Blocked","blocked",["Preview blocked","Access blocked","Browser blocked frame"])}
            </tbody>
          </table>
        `})}
      ${u({title:"Preview / Document Surface",icon:"article",className:"span-6",body:`
          <div class="document-surface">
            <div class="editor-toolbar"><select><option>Markdown</option></select><button>B</button><button>I</button><button>H1</button><button>H2</button><button>•</button><button>Preview</button><button>Split</button></div>
            <div class="split-doc"><section><h3># Market Research Notes</h3><p>This document captures key findings from the current session.</p><ul><li>Customer segments and behaviors</li><li>Competitive landscape</li><li>Opportunities and risks</li></ul></section><section><h3>Market Research Notes</h3><p>This document captures key findings from the current session.</p><ul><li>Customer segments and behaviors</li><li>Competitive landscape</li><li>Opportunities and risks</li></ul></section></div>
            <div class="mini-status"><span>Words: 132</span><span>Chars: 871</span><span>All changes saved</span></div>
          </div>
        `})}
      ${u({title:"Fallback Copy & Manual Path",icon:"copy",className:"span-6",actions:p("Options"),body:`
          ${b("info","info","Automatic capture is not available","Use manual copy or export your own content.")}
          <div class="manual-grid"><div class="group-box"><strong>Manual copy steps</strong><ol><li>Select the content in the page.</li><li>Copy it to your clipboard (${T("Ctrl+C")}).</li><li>Paste into the document editor.</li><li>Add notes and export.</li></ol>${p("Open editor")}</div><div class="group-box"><strong>Helpful shortcuts</strong><dl><dt>Copy</dt><dd>Ctrl+C</dd><dt>Paste</dt><dd>Ctrl+V</dd><dt>Open editor</dt><dd>Ctrl+E</dd><dt>Export markdown</dt><dd>Ctrl+M</dd></dl></div></div>
        `})}
      ${u({title:"Empty States",icon:"noResults",className:"span-4",body:`<div class="empty-grid">${B("noCaptures","No captures yet","Start by capturing content from the browser.","Capture now")}${B("noResults","No results found","Try adjusting your search or filters.","Clear filters")}${B("folder","Folder is empty","Exports will appear here after capture.","Open folder")}</div>`})}
      ${u({title:"Blocked Preview States",icon:"blocked",className:"span-4",body:`<div class="empty-grid blocked">${B("browserBlocked","Frame refused to load","The frame blocked access to this content.","Open externally")}${B("accessBlocked","Preview blocked","Your policy prevents previewing this content.","Learn more")}${B("frameBlocked","Cross-origin blocked","This content can't be previewed here.","Try manual copy")}</div>`})}
      ${u({title:"Feedback / Status Surfaces",icon:"info",className:"span-4",body:`<div class="state-stack">${b("success","success","Export completed","34 blocks exported successfully.",p("Open folder"))}${b("warning","warning","Sync delayed","We'll retry in the background.",p("Details"))}${b("danger","error","Upload denied","Permissions policy blocked upload.",p("Retry"))}${b("neutral","neutral","Idle","System is ready.",'<span class="ok-led"></span>')}</div>`})}
    </div>
  `}function P(t,e,o){return`<tr><th>${m(e==="blocked"?"blocked":e==="danger"?"error":e==="neutral"?"neutral":e)} ${t}</th>${o.map((s)=>`<td><span class="matrix-cell matrix-cell--${e}"><strong>${s}</strong><small>${e==="blocked"?"Structured fallback.":"State cue and message."}</small></span></td>`).join("")}</tr>`}function B(t,e,o,a){return`<article class="empty-state">${m(t)}<strong>${e}</strong><small>${o}</small>${p(a)}</article>`}function Zo(){return`
    <div class="screen-grid">
      ${u({title:"Command Palette Preview",icon:"console",className:"span-6",body:Yt(Ft())})}
      ${u({title:"URL Picker / Suggestions",icon:"url",className:"span-3",body:Uo()})}
      ${u({title:"Keyboard Shortcuts",icon:"table",className:"span-3",body:`<dl class="shortcut-list">${[["Ctrl + K","Open command palette"],["Ctrl + Shift + C","Capture visible content"],["Ctrl + Alt + O","Open capture console"],["Ctrl + Shift + P","Toggle preview pane"],["Ctrl + C","Copy selected text"],["Ctrl + E","Export as markdown"],["Ctrl + F","Search in page"],["Ctrl + ,","Open settings"],["Esc","Close overlays"],["Enter","Confirm / Execute"]].map(([t,e])=>`<div><dt>${t.split(" + ").map(T).join("<span>+</span>")}</dt><dd>${e}</dd></div>`).join("")}</dl>`})}
      ${u({title:"Browser Action Surface",icon:"capture",className:"span-7",body:`${V()}<div class="action-grid">${p("Capture",{icon:"capture"})}${p("Preview",{icon:"eye"})}${p("Console",{icon:"console"})}${p("Export",{icon:"upload"})}${p("More",{icon:"more"})}</div><div class="inline-states">${b("success","success","Capture completed","Blocks exported to markdown.")}${b("warning","warning","Python not detected","Some features will be limited.",p("Open console"))}</div>`})}
      ${u({title:"Compact Shell Preview",icon:"window",className:"span-5",body:F({title:"Mini Capture Shell",body:`<div class="shell-register"><span>doc: loaded</span><span>injection: active</span><span>mode: bookmarklet</span><span>statusbar: on</span><span>items: 34</span><span>last sync: 1m ago</span></div><div class="button-row">${p("Capture")}${p("Preview")}${p("Export")}${p("Settings")}</div>`})})}
      ${u({title:"Feedback & Action Strip",icon:"info",className:"span-12",body:`<div class="action-strip">${b("success","success","Success","Operation completed.")}${b("info","info","Info","This is an informational note.")}${b("warning","warning","Warn","This action may have limits.")}${b("danger","error","Error","Something prevented this.")}<span class="strip-buttons">${p("Open dialog",{variant:"primary",id:"open-demo-dialog"})}${p("Toast",{id:"toast-success"})}${p("Warn",{id:"toast-warning"})}${p("Export")}${p("...",{aria:"More actions"})}</span></div>`})}
    </div>
  `}function Qo(){let t=[["Rich Text to Markdown","Local editor chrome, preview tabs, markdown export, and manual copy fallback.",["app shell","preview","manual copy"]],["Page Screenshot","Capture form with browser preview, export states, and retry paths.",["browser panel","state"]],["Form Context Select","Selectable content rows and saved-session dialog.",["rows","dialog"]],["Session Snapshot","Capture dashboard with warnings and ZIP export.",["register","progress"]],["Notifications","Reminder forms, disabled policy states, and grouped results.",["field","alert"]],["Mini/Multi Browser","Address bar, tile commands, iframe fallback, and shortcuts.",["url picker","commands"]],["Bookmarklet","Injection active status, mode register, and compact shell controls.",["shell","status"]],["Browser Panel","Policy, cross-origin, and open-external states.",["browser","blocked"]],["Command Palette","Keyboard-first command discovery with keycaps and selected rows.",["commands","keys"]],["Fallback Copy","Manual path as resilient workflow, not panic state.",["fallback","copy"]],["Metrics","Status-register counters replacing generic KPI cards.",["register","metrics"]]];return`
    <div class="screen-grid">
      ${u({title:"Mini Browser Composition",icon:"url",className:"span-6",body:`
          <div class="mini-browser-composition">
            ${V("https://example.com/research")}
            <div class="loaded-page">
              <main><h3>Research workspace</h3><p>Mock loaded page with selected article regions and page-action feedback.</p><section class="selected-region"><strong>Selected article</strong><p>Lead paragraph, comparison table, and code snippet are ready for capture.</p></section><div class="data-table"><span>Heading</span><span>Captured</span><span>Quote</span><span>Review</span><span>Image</span><span>Skipped</span></div></main>
              <aside><strong>Page actions</strong>${p("Copy markdown",{icon:"markdown"})}${p("Open externally",{icon:"external"})}${p("Retry blocked frame",{icon:"retry"})}</aside>
            </div>
            <div class="mini-status"><span>Loaded example.com/research</span><span>Selected blocks: 4</span><span>Policy: limited</span></div>
          </div>
        `})}
      ${u({title:"Migration Cards",icon:"panel",className:"span-6",body:`<div class="migration-grid">${t.map(([e,o,a])=>`<article class="migration-card"><h3>${e}</h3><p>${o}</p><div>${a.map((s)=>`<span>${s}</span>`).join("")}</div></article>`).join("")}</div>`})}
      ${u({title:"Icon System Preview",icon:"grid",className:"span-12",body:`<div class="icon-preview-grid">${Dt.map((e)=>`<span title="${e}">${m(e)}<small>${e}</small></span>`).join("")}</div>`})}
    </div>
  `}function Ft(){return[{icon:"capture",title:"Capture visible content",desc:"Capture the currently visible portion of the page",keys:["Ctrl","Shift","C"]},{icon:"console",title:"Open capture console",desc:"Open the session capture console",keys:["Ctrl","Alt","O"]},{icon:"eye",title:"Toggle preview pane",desc:"Show or hide the preview panel",keys:["Ctrl","Shift","P"]},{icon:"copy",title:"Copy selected text",desc:"Copy text from selection to clipboard",keys:["Ctrl","C"]},{icon:"markdown",title:"Export as markdown",desc:"Export captured content as markdown",keys:["Ctrl","E"]},{icon:"search",title:"Search in page",desc:"Find text within the current page",keys:["Ctrl","F"]},{icon:"gear",title:"Open settings",desc:"Open bookmarklet settings",keys:["Ctrl",","]}]}function Jo(){let t=document.createElement("main");return t.className="catalog-app",t.innerHTML=`
    <section class="app-frame" aria-label="AWW Bookmarklet component catalog">
      <header class="app-titlebar">
        <div class="title-identity">${m("logo")}<span>Component Catalog for Constrained Bookmarklet Tools</span></div>
        <div class="build-meta"><span>Build 0.9.0</span><span>RetroOS 3.11</span></div>
        <div class="window-controls" aria-hidden="true"><i></i><i></i><i></i></div>
      </header>
      <nav class="menu-row" aria-label="Application menu"><button>File</button><button>Edit</button><button>View</button><button>Tools</button><button>Window</button><button>Help</button></nav>
      ${zo()}
      <div class="catalog-tabs" role="tablist" aria-label="Catalog sections">
        ${[["overview","Overview"],["primitives","Primitives"],["patterns","App Patterns"],["states","Content States"],["commands","Command Surfaces"],["migration","Migration Proof"]].map(([e,o],a)=>`<button id="tab-${e}" role="tab" aria-controls="panel-${e}" aria-selected="${a===0?"true":"false"}" tabindex="${a===0?"0":"-1"}" data-tab="${e}">${o}</button>`).join("")}
      </div>
      <section class="tab-panels">
        <div id="panel-overview" role="tabpanel" aria-labelledby="tab-overview" data-panel="overview">${jo()}</div>
        <div id="panel-primitives" role="tabpanel" aria-labelledby="tab-primitives" data-panel="primitives" hidden>${Go()}</div>
        <div id="panel-patterns" role="tabpanel" aria-labelledby="tab-patterns" data-panel="patterns" hidden>${Ko()}</div>
        <div id="panel-states" role="tabpanel" aria-labelledby="tab-states" data-panel="states" hidden>${Xo()}</div>
        <div id="panel-commands" role="tabpanel" aria-labelledby="tab-commands" data-panel="commands" hidden>${Zo()}</div>
        <div id="panel-migration" role="tabpanel" aria-labelledby="tab-migration" data-panel="migration" hidden>${Qo()}</div>
      </section>
      <footer class="bottom-status"><span>Ready</span><span>RetroOS 3.11</span><span>CAPS</span><span>NUM</span><span>SCRL</span></footer>
    </section>
    <${r.dialog} id="demo-dialog" modal label="Demo dialog" close-on-backdrop>
      <span slot="title">System dialog</span>
      <p class="inline-note">The dialog uses the shared overlay path and inherits the retro system tokens.</p>
      <${r.toolbar} slot="footer" align="end"><${r.button} id="demo-dialog-close">Close</${r.button}></${r.toolbar}>
    </${r.dialog}>
  `,t}function we(t,e,o=!1){let a=[...t.querySelectorAll("[role='tab'][data-tab]")],s=[...t.querySelectorAll("[role='tabpanel'][data-panel]")];a.forEach((i)=>{let h=i.dataset.tab===e;if(i.setAttribute("aria-selected",h?"true":"false"),i.tabIndex=h?0:-1,h&&o)i.focus()}),s.forEach((i)=>{i.hidden=i.dataset.panel!==e})}function ta(t){t.querySelector("#hero-example")?.addEventListener("click",be),t.querySelector("#hero-blank")?.addEventListener("click",me),t.querySelectorAll("#open-example").forEach((e)=>e.addEventListener("click",be)),t.querySelectorAll("#open-blank").forEach((e)=>e.addEventListener("click",me)),t.addEventListener("click",(e)=>{let o=e.target.closest("[role='tab'][data-tab]");if(o)we(t,o.dataset.tab,!0);if(e.target.closest("#toast-success"))xt({key:"demo-toast",message:"Operation completed",tone:"success",timeout:1800});if(e.target.closest("#toast-warning"))xt({key:"demo-toast",message:"Manual fallback may be required",tone:"warning",timeout:2200});if(e.target.closest("#open-demo-dialog"))t.querySelector("#demo-dialog")?.show();if(e.target.closest("#demo-dialog-close"))t.querySelector("#demo-dialog")?.close("demo")}),t.querySelector(".catalog-tabs")?.addEventListener("keydown",(e)=>{let o=[...t.querySelectorAll("[role='tab'][data-tab]")],a=o.findIndex((i)=>i.getAttribute("aria-selected")==="true"),s=a;if(e.key==="ArrowRight")s=(a+1)%o.length;else if(e.key==="ArrowLeft")s=(a-1+o.length)%o.length;else if(e.key==="Home")s=0;else if(e.key==="End")s=o.length-1;else return;e.preventDefault(),we(t,o[s].dataset.tab,!0)})}function ea(){let t=document.getElementById("catalog-root")||document.body,e=Jo();t.append(e),ta(t)}ea();window.addEventListener("beforeunload",()=>{qt(ge)});
