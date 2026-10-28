// A dedicated touch-oriented composition, not the desktop tree restyled by a breakpoint.
export class MobileLabView extends HTMLElement {
  mount({ button, onTabChange }) {
    this.onTabChange = onTabChange;
    this.innerHTML = `
      <header class="mobile-header">
        <div class="brand"><img src="assets/mark.svg" width="27" height="27" alt=""><h1>XOR Path <span>Lab</span></h1></div>
        <span class="spacer"></span><span class="mobile-xor-pill">XOR <strong id="mobile-xor">0</strong></span>
        ${button('mobile-menu','Menu','mobile-menu-button','aria-label="Workspace menu"')}
      </header>
      <div class="mobile-casebar"><label class="sr-only" for="case-select">Test case</label><select id="case-select"></select>${button('cases','Cases')}</div>
      <div id="storage-warning" class="storage-warning" hidden></div>
      <main id="main" class="mobile-main">
        <section id="workspace" class="mobile-panel" data-mobile-panel="explore" role="tabpanel" aria-labelledby="tab-explore">
          <div class="panel-heading"><span id="grid-meta" class="muted"></span><span class="spacer"></span><div class="segmented">${button('explore','Explore','','aria-pressed="true"')}${button('edit','Edit','','aria-pressed="false"')}</div></div>
          <div class="toolbar mobile-grid-toolbar">${button('undo','Undo')}${button('reset-path','Reset path')}${button('toggle-optimal','Show optimal paths','optimal-toggle','aria-pressed="false"')}<span class="spacer"></span>${button('grid-tools','Tools')}</div>
          <div id="optimal-controls" class="optimal-controls" hidden></div>
          <div id="board-viewport" tabindex="0" aria-label="Grid. Tap a highlighted next cell to move. Scroll to pan."><div id="board"></div></div>
          <div class="board-footer"><div class="legend"><span><i class="legend-current"></i>Current</span><span><i class="legend-visited"></i>Visited</span><span><i class="legend-next"></i>Next XOR</span><span><i class="legend-finish"></i>Finish</span><span id="representative-legend" hidden><i class="legend-representative"></i>Trace</span></div></div>
          <div class="path-toolbar"><span id="path-status"></span><span class="spacer"></span>${button('move-right','Right &rarr;')}${button('move-down','Down &darr;')}${button('check','Check path','primary')}</div>
          <div id="verdict" role="status" hidden></div>
        </section>
        <aside id="inspector" class="mobile-panel" data-mobile-panel="inspect" role="tabpanel" aria-labelledby="tab-inspect" hidden>
          <div class="panel-heading"><span class="eyebrow">PATH INSPECTOR</span><span class="spacer"></span><span class="subtle-label">Your experiment</span></div>
          <div id="inspector-scroll"><div id="manual"></div></div>
        </aside>
        <section id="learning" class="mobile-panel" data-mobile-panel="learn" role="tabpanel" aria-labelledby="tab-learn" hidden>
          <div class="panel-heading"><span class="eyebrow">FIELD NOTES</span><span class="spacer"></span><span id="hint-count"></span>${button('reset-learning','Reset progress')}</div>
          <div id="article-scroll"><div class="article-intro"><div><h2>Discovery before disclosure.</h2><p>Move right or down from the top left to the bottom right. XOR every visited value. Reveal a hint when you want one.</p><a href="https://leetcode.com/problems/minimum-xor-path-in-a-grid/" target="_blank" rel="noreferrer">LeetCode 3882 &nearr;</a><span class="intro-note">0-1023 per cell &middot; up to 1,000 cells</span></div></div><div id="lessons"></div></div>
        </section>
        <section class="mobile-panel mobile-debug-panel" data-mobile-panel="debug" role="tabpanel" aria-labelledby="tab-debug" hidden><div class="panel-heading"><span class="eyebrow">ALGORITHM DEBUGGER</span></div><div class="mobile-debug-scroll"><section id="debugger"></section></div></section>
      </main>
      <nav id="mobile-tabs" class="mobile-tabs" role="tablist" aria-label="Workspace views">${[['explore','Explore'],['inspect','Inspect'],['learn','Learn'],['debug','Debug']].map(([id,label])=>`<button id="tab-${id}" role="tab" data-action="mobile-tab" data-tab="${id}" aria-controls="${id === 'explore' ? 'workspace' : id === 'inspect' ? 'inspector' : id === 'learn' ? 'learning' : 'mobile-debug-panel'}" aria-selected="false">${label}</button>`).join('')}</nav>
      <footer class="statusbar"><span class="status-dot"></span><span id="save-status">Saved locally</span><span id="mode-status">Explore mode</span><span class="spacer"></span><span id="zoom-label">100%</span></footer>`;
    this.querySelector('[data-mobile-panel="debug"]').id = 'mobile-debug-panel';
    this.querySelector('#mobile-tabs').addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault(); event.stopPropagation();
      const tabs = [...this.querySelectorAll('[role="tab"]')];
      const current = tabs.findIndex(tab => tab.getAttribute('aria-selected') === 'true');
      const index = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (current + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      this.onTabChange(tabs[index].dataset.tab);
      tabs[index].focus();
    });
  }
  applySettings(settings) {
    this.dataset.density = settings.density;
    this.setTab(settings.tab);
  }
  setTab(tab) {
    for (const panel of this.querySelectorAll('[data-mobile-panel]')) panel.hidden = panel.dataset.mobilePanel !== tab;
    for (const button of this.querySelectorAll('[role="tab"]')) {
      const selected = button.dataset.tab === tab;
      button.setAttribute('aria-selected', selected);
      button.tabIndex = selected ? 0 : -1;
    }
  }
}
customElements.define('xor-mobile-view', MobileLabView);
