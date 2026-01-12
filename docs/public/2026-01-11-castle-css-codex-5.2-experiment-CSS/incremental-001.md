```css
/* UPDATE: replace the existing ".bklt{ ... }" token block with this full version */
.bklt{
  /* Typography */
  --ui-font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
  --ui-font-size: 16px;
  --ui-line-height: 1.2;
  --ui-font-weight: 900;

  /* Layering */
  --ui-z-overlay: 2147483647;

  /* Radii */
  --ui-radius-lg: 28px;
  --ui-radius-md: 22px;
  --ui-radius-sm: 18px;

  /* Shadows */
  --ui-shadow-elev: 0 18px 45px rgba(0,0,0,.55);
  --ui-shadow-soft: 0 10px 18px rgba(0,0,0,.25);
  --ui-shadow-text: 0 3px 0 rgba(0,0,0,.30);
  --ui-shadow-inset-gloss: inset 0 8px 0 rgba(255,255,255,.18);

  /* Overlay */
  --ui-color-overlay: rgba(0,0,0,.55);

  /* Text */
  --ui-color-text: #0b2a4a;
  --ui-color-text-cream: #fff6c7;

  /* Accent frame (gold) */
  --ui-color-accent-strong: #f4a900;
  --ui-color-accent-soft: #ffd25b;

  /* Modal / panels */
  --ui-color-panel-top: #2f7ed5;
  --ui-color-panel-bot: #1a5fb2;
  --ui-color-panel-border: #0f4f9b;

  --ui-color-inset-top: #2b73c6;
  --ui-color-inset-bot: #1b5aa8;

  /* Card */
  --ui-color-card-top: #ffffff;
  --ui-color-card-mid: #fff3cf;
  --ui-color-card-bot: #f2dfaa;

  /* Header title (modal) */
  --ui-color-title-text: #fff7b9;
  --ui-color-title-stroke: #103e77;
  --ui-color-title-shadow: rgba(0,0,0,.35);
  --ui-color-header-top: #2d79cf;
  --ui-color-header-bot: #175aa7;

  /* Controls (neutral and active) */
  --ui-color-control-top: #6e86a1;
  --ui-color-control-bot: #506783;
  --ui-color-control-stroke: #2f4158;

  --ui-color-controlActive-top: #b35cff;
  --ui-color-controlActive-bot: #7a2fe3;
  --ui-color-controlActive-stroke: #4d238f;

  /* CTA (green) */
  --ui-color-cta-top: #b9ef4f;
  --ui-color-cta-mid: #66b10a;
  --ui-color-cta-bot: #3e7f00;
  --ui-color-cta-stroke: #2e6f18;
  --ui-color-cta-text: #fff6bf;

  /* Danger (close) */
  --ui-color-danger-top: #ff6a6a;
  --ui-color-danger-mid: #e21414;
  --ui-color-danger-bot: #b80f0f;
  --ui-color-danger-stroke: #b80f0f;
  --ui-color-danger-icon: #fff3df;

  /* App surfaces (leaderboard) */
  --ui-color-app-top: #2f6fb1;
  --ui-color-app-bot: #1f4e86;

  --ui-color-bar-top: #6c87a4;
  --ui-color-bar-bot: #4f6886;
  --ui-color-bar-stroke: #3b526a;

  /* Rows */
  --ui-color-row-top: #f7edc9;
  --ui-color-row-bot: #e6d8ab;
  --ui-color-row-stroke: rgba(0,0,0,.18);

  /* Row highlight (friends list green) */
  --ui-color-rowHi-top: #87d535;
  --ui-color-rowHi-bot: #5fb21a;

  /* Rank colors */
  --ui-color-rank-gold: #f2b233;
  --ui-color-rank-silver: #92a0ad;
  --ui-color-rank-bronze: #c8792f;
  --ui-color-rank-neutral: #d6d2b4;

  /* Score badge */
  --ui-color-badge-top: #8e3cff;
  --ui-color-badge-bot: #5a18c8;
  --ui-color-badge-stroke: #3d0f93;
  --ui-color-badge-text: #fff3c4;

  /* Connect button */
  --ui-color-connect-top: #1f8ed6;
  --ui-color-connect-bot: #0f5aa8;
  --ui-color-connect-stroke: #0b3f7d;
  --ui-color-connect-frameHot: #ff7a00;
}

/* ADD: friends list row variants */
.bklt__row--simple{
  grid-template-columns: 54px 74px 1fr 96px;
}

.bklt__row--highlight{
  background: linear-gradient(180deg, var(--ui-color-rowHi-top), var(--ui-color-rowHi-bot));
  border-color: rgba(0,0,0,.14);
}

.bklt__row--highlight .bklt__name{
  color: rgba(18,60,40,.95);
  text-shadow: 0 2px 0 rgba(255,255,255,.18);
}

.bklt__row--highlight .bklt__sub{
  color: rgba(18,60,40,.75);
}

/* ADD: slightly larger level number variant (matches screenshot proportions) */
.bklt__levelValue--big{ font-size: 36px; }

/* ADD: connect area + button */
.bklt__connectArea{
  padding: 18px 14px 22px;
  display: grid;
  place-items: center;
  background: rgba(0,0,0,.06);
}

.bklt__btnConnect{
  width: min(420px, 92%);
  height: 94px;
  border-radius: 18px;
  padding: 8px;
  background: linear-gradient(180deg, rgba(255,255,255,.10), rgba(255,255,255,0));
  border: 4px solid rgba(0,0,0,.35);
  box-shadow: 0 10px 18px rgba(0,0,0,.25);
}

.bklt__btnConnectInner{
  height: 100%;
  border-radius: 14px;
  border: 4px solid var(--ui-color-connect-frameHot);
  background: linear-gradient(180deg, var(--ui-color-connect-top), var(--ui-color-connect-bot));
  box-shadow: var(--ui-shadow-inset-gloss);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  position: relative;
}

.bklt__btnConnectInner::before{
  content:"";
  position:absolute;
  inset: 8px;
  border-radius: 10px;
  border: 3px solid var(--ui-color-connect-stroke);
  pointer-events: none;
  opacity: .85;
}

.bklt__btnConnectInner::after{
  content:"";
  position:absolute;
  left: 14px;
  right: 14px;
  top: 10px;
  height: 22px;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(255,255,255,.08), rgba(255,255,255,.30), rgba(255,255,255,.08));
  pointer-events: none;
}

.bklt__fbIcon{
  width: 46px;
  height: 46px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: rgba(255,255,255,.16);
  border: 3px solid rgba(0,0,0,.18);
  box-shadow: inset 0 6px 0 rgba(255,255,255,.18);
  font-size: 38px;
  line-height: 1;
  color: var(--ui-color-text-cream);
  text-shadow: 0 3px 0 rgba(0,0,0,.25);
}

.bklt__btnConnectText{
  font-size: 46px;
  color: var(--ui-color-text-cream);
  text-shadow:
    0 3px 0 rgba(0,0,0,.30),
    2px 0 0 rgba(8,40,80,.75), -2px 0 0 rgba(8,40,80,.75),
    0 2px 0 rgba(8,40,80,.75), 0 -2px 0 rgba(8,40,80,.75);
}
```

```html
<!-- ADD: new demo section (append after your existing demos) -->
<section class="demoBlock">
  <h2 class="demoHeading">Demo 3: Friends tab + Connect</h2>

  <div class="bklt__overlay demoOverlay" role="dialog" aria-modal="true" aria-label="Leaderboard friends">
    <div class="bklt__app" role="document">
      <div class="bklt__appTop">
        <h1 class="bklt__screenTitle">Leaderboard</h1>

        <div class="bklt__tabs" role="tablist" aria-label="Leaderboard tabs">
          <button class="bklt__tab" role="tab" aria-selected="false">Weekly</button>
          <button class="bklt__tab bklt__tab--active" role="tab" aria-selected="true">Friends</button>
          <button class="bklt__tab" role="tab" aria-selected="false">Players</button>
          <button class="bklt__tab" role="tab" aria-selected="false">Teams</button>
        </div>

        <div class="bklt__segRow" role="group" aria-label="Friends actions">
          <button class="bklt__segBtn bklt__segBtn--active" type="button">Friends List</button>
          <button class="bklt__segBtn" type="button">Add Friends</button>
        </div>
      </div>

      <div class="bklt__list" role="list">
        <div class="bklt__row bklt__row--simple bklt__row--highlight" role="listitem">
          <div class="bklt__rank bklt__rank--gold">1</div>
          <div class="bklt__avatar">
            <img class="bklt__avatarImg" alt="" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect width='64' height='64' rx='12' fill='%23bfe6ff'/%3E%3Ctext x='32' y='40' font-size='20' text-anchor='middle' fill='%232a5c78' font-family='system-ui'%3EME%3C/text%3E%3C/svg%3E" />
          </div>
          <div class="bklt__meta">
            <p class="bklt__name">Have a nice day</p>
            <p class="bklt__sub">Crown Tha Kings</p>
          </div>
          <div class="bklt__level">
            <span class="bklt__levelLabel">Level</span>
            <span class="bklt__levelValue bklt__levelValue--big">3600</span>
          </div>
        </div>

        <div class="bklt__row bklt__row--simple" role="listitem">
          <div class="bklt__rank bklt__rank--silver">2</div>
          <div class="bklt__avatar">
            <img class="bklt__avatarImg" alt="" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect width='64' height='64' rx='12' fill='%23d8ecff'/%3E%3Ctext x='32' y='40' font-size='22' text-anchor='middle' fill='%232a5c78' font-family='system-ui'%3E2%3C/text%3E%3C/svg%3E" />
          </div>
          <div class="bklt__meta">
            <p class="bklt__name">Fortfahren</p>
          </div>
          <div class="bklt__level">
            <span class="bklt__levelLabel">Level</span>
            <span class="bklt__levelValue bklt__levelValue--big">3051</span>
          </div>
        </div>
      </div>

      <div class="bklt__connectArea" aria-label="Connect">
        <button class="bklt__btnConnect" type="button" aria-label="Connect with Facebook">
          <div class="bklt__btnConnectInner">
            <div class="bklt__fbIcon" aria-hidden="true">f</div>
            <div class="bklt__btnConnectText">Connect</div>
          </div>
        </button>
      </div>

      <nav class="bklt__bottomNav" aria-label="Bottom navigation">
        <div class="bklt__navItem">
          <div class="bklt__navIcon" aria-hidden="true"></div>
          <div>Stars</div>
        </div>
        <div class="bklt__navItem bklt__navItem--active">
          <div class="bklt__navIcon" aria-hidden="true"></div>
          <div>Leaderboard</div>
        </div>
        <div class="bklt__navItem">
          <div class="bklt__navIcon" aria-hidden="true"></div>
          <div>Castle</div>
        </div>
        <div class="bklt__navItem">
          <div class="bklt__navIcon" aria-hidden="true"></div>
          <div>Shield</div>
        </div>
        <div class="bklt__navItem">
          <div class="bklt__navIcon" aria-hidden="true"></div>
          <div>Cards</div>
        </div>
      </nav>
    </div>
  </div>
</section>
```
