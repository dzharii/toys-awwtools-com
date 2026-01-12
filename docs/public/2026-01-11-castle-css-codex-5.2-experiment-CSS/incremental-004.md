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

  /* Connect / social button */
  --ui-color-connect-top: #1f8ed6;
  --ui-color-connect-bot: #0f5aa8;
  --ui-color-connect-stroke: #0b3f7d;
  --ui-color-connect-frameHot: #ff7a00;

  /* Weekly contest panel + podium */
  --ui-color-contest-top: #758aa6;
  --ui-color-contest-bot: #546b86;
  --ui-color-contest-stroke: #2f4158;

  --ui-color-ribbon-top: #1e8aa8;
  --ui-color-ribbon-bot: #0f627f;

  --ui-color-podium-leftTop: #a9c6ea;
  --ui-color-podium-leftBot: #86abd9;

  --ui-color-podium-midTop: #ffe11a;
  --ui-color-podium-midBot: #ffc000;

  --ui-color-podium-rightTop: #f28a2d;
  --ui-color-podium-rightBot: #d86d13;

  /* Team screens */
  --ui-color-teamTop-top: #748aa7;
  --ui-color-teamTop-bot: #5a6f8b;
  --ui-color-teamTop-stroke: #2f4158;

  --ui-color-chip-top: #e7dbc1;
  --ui-color-chip-bot: #d6c6a3;
  --ui-color-chip-stroke: rgba(0,0,0,.22);

  --ui-color-warn-top: #ffcc33;
  --ui-color-warn-bot: #f0a800;
  --ui-color-warn-stroke: #c97e00;

  --ui-color-grayBtn-top: #6e7b8f;
  --ui-color-grayBtn-bot: #4f5d74;
  --ui-color-grayBtn-stroke: #2f3a4f;

  --ui-color-orangeBtn-top: #ffd14a;
  --ui-color-orangeBtn-bot: #f2a400;
  --ui-color-orangeBtn-stroke: #c97e00;

  --ui-color-bubble-top: #d6a9a0;
  --ui-color-bubble-bot: #c58e85;
  --ui-color-bubble-stroke: rgba(0,0,0,.18);

  --ui-color-track-top: #f3d992;
  --ui-color-track-bot: #e4c372;
  --ui-color-track-stroke: rgba(0,0,0,.22);

  --ui-color-fill-top: #87d535;
  --ui-color-fill-bot: #5fb21a;
  --ui-color-fill-stroke: rgba(0,0,0,.16);

  --ui-color-heart-top: #ff4b4b;
  --ui-color-heart-bot: #c31313;
  --ui-color-heart-stroke: rgba(0,0,0,.18);

  /* Collect cards overlay */
  --ui-color-glow: rgba(255,220,110,.75);
  --ui-color-cardFrame-top: #bfe6ff;
  --ui-color-cardFrame-bot: #6bb6ff;
  --ui-color-cardFrame-stroke: rgba(0,0,0,.22);
  --ui-color-cardLabel-top: #2ebc3a;
  --ui-color-cardLabel-bot: #1c8c24;
  --ui-color-badgeNew-top: #ff4b4b;
  --ui-color-badgeNew-bot: #c31313;
  --ui-color-star: #ffd14a;

  /* Home HUD */
  --ui-color-hudPill-top: #f8f0d0;
  --ui-color-hudPill-bot: #e6d8ab;
  --ui-color-hudPill-stroke: rgba(0,0,0,.18);
}

/* ADD: "Your Cards" spotlight overlay content */
.bklt__spotWrap{
  width: min(520px, 96vw);
  display: grid;
  justify-items: center;
  gap: 14px;
}

.bklt__spotTitle{
  font-size: 54px;
  color: var(--ui-color-text-cream);
  text-shadow:
    0 3px 0 rgba(0,0,0,.30),
    3px 0 0 rgba(122,74,0,.95), -3px 0 0 rgba(122,74,0,.95),
    0 3px 0 rgba(122,74,0,.95), 0 -3px 0 rgba(122,74,0,.95);
}

.bklt__cardGrid{
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 22px;
  padding: 6px 10px;
}

.bklt__collectCard{
  position: relative;
  border-radius: 18px;
  padding: 10px;
  background: radial-gradient(circle at 50% 15%, rgba(255,255,255,.35), rgba(255,255,255,0) 55%),
    linear-gradient(180deg, var(--ui-color-cardFrame-top), var(--ui-color-cardFrame-bot));
  border: 4px solid var(--ui-color-cardFrame-stroke);
  box-shadow:
    0 0 0 10px rgba(255,255,255,.10),
    0 0 40px var(--ui-color-glow),
    0 16px 28px rgba(0,0,0,.30),
    var(--ui-shadow-inset-gloss);
  overflow: visible;
  min-height: 220px;
  display: grid;
  grid-template-rows: 1fr auto;
}

.bklt__collectCard::before{
  content:"";
  position:absolute;
  inset: 6px;
  border-radius: 14px;
  border: 3px solid rgba(255,255,255,.45);
  pointer-events: none;
}

.bklt__cardArt{
  border-radius: 12px;
  background:
    linear-gradient(180deg, rgba(255,255,255,.22), rgba(255,255,255,0)),
    radial-gradient(circle at 40% 30%, rgba(255,255,255,.25), rgba(255,255,255,0) 55%),
    linear-gradient(180deg, #0d6cc8, #083b7d);
  border: 3px solid rgba(0,0,0,.16);
  box-shadow: inset 0 10px 18px rgba(255,255,255,.10);
  position: relative;
  overflow: hidden;
}

.bklt__cardArt--snow{
  background:
    linear-gradient(180deg, rgba(255,255,255,.24), rgba(255,255,255,0)),
    radial-gradient(circle at 40% 30%, rgba(255,255,255,.28), rgba(255,255,255,0) 55%),
    linear-gradient(180deg, #4a7cbf, #1b3a67);
}

.bklt__cardArt::after{
  content:"";
  position:absolute;
  inset: -40px;
  background: radial-gradient(circle at 30% 30%, rgba(255,255,255,.22), rgba(255,255,255,0) 55%);
  transform: rotate(15deg);
}

.bklt__cardLabel{
  margin-top: 10px;
  height: 48px;
  border-radius: 12px;
  border: 3px solid rgba(0,0,0,.18);
  background: linear-gradient(180deg, var(--ui-color-cardLabel-top), var(--ui-color-cardLabel-bot));
  display: grid;
  place-items: center;
  color: #fff6bf;
  text-shadow:
    0 3px 0 rgba(0,0,0,.30),
    2px 0 0 rgba(20,45,10,.75), -2px 0 0 rgba(20,45,10,.75),
    0 2px 0 rgba(20,45,10,.75), 0 -2px 0 rgba(20,45,10,.75);
  font-size: 20px;
  letter-spacing: .2px;
}

.bklt__starsRow{
  position: absolute;
  left: 10px;
  top: -18px;
  display: flex;
  gap: 4px;
  filter: drop-shadow(0 4px 0 rgba(0,0,0,.22));
}

.bklt__star{
  font-size: 26px;
  color: var(--ui-color-star);
  text-shadow: 0 2px 0 rgba(0,0,0,.18);
}

.bklt__badgeNew{
  position: absolute;
  right: -10px;
  top: -12px;
  width: 54px;
  height: 54px;
  border-radius: 999px;
  border: 4px solid rgba(0,0,0,.22);
  background: radial-gradient(circle at 30% 30%, var(--ui-color-badgeNew-top), var(--ui-color-badgeNew-bot));
  box-shadow: 0 12px 18px rgba(0,0,0,.22), inset 0 8px 0 rgba(255,255,255,.18);
  display: grid;
  place-items: center;
  color: #fff6bf;
  text-shadow: 0 3px 0 rgba(0,0,0,.28);
  font-size: 18px;
}

.bklt__spotHint{
  margin-top: 8px;
  font-size: 40px;
  color: var(--ui-color-text-cream);
  text-shadow:
    0 3px 0 rgba(0,0,0,.30),
    2px 0 0 rgba(8,40,80,.65), -2px 0 0 rgba(8,40,80,.65),
    0 2px 0 rgba(8,40,80,.65), 0 -2px 0 rgba(8,40,80,.65);
}

/* ADD: HUD pills and meter (home / level top strip) */
.bklt__hudRow{
  display: grid;
  grid-template-columns: 64px 1fr 44px;
  gap: 10px;
  align-items: center;
  padding: 12px 14px 10px;
}

.bklt__hudAvatar{
  width: 58px;
  height: 58px;
  border-radius: 16px;
  border: 4px solid rgba(0,0,0,.22);
  background: linear-gradient(180deg, rgba(255,255,255,.22), rgba(255,255,255,0)), #d8ecff;
  box-shadow: var(--ui-shadow-inset-gloss);
}

.bklt__hudGear{
  width: 44px;
  height: 44px;
  border-radius: 999px;
  border: 4px solid rgba(0,0,0,.22);
  background: linear-gradient(180deg, #3aa8ff, #1d62b6);
  box-shadow: 0 10px 16px rgba(0,0,0,.18), var(--ui-shadow-inset-gloss);
  position: relative;
}

.bklt__hudGear::before{
  content:"";
  position:absolute;
  inset: 12px;
  border-radius: 6px;
  background: rgba(255,255,255,.35);
  box-shadow: 0 2px 0 rgba(0,0,0,.14);
}

.bklt__hudPills{
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
}

.bklt__hudPill{
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 34px;
  padding: 0 10px;
  border-radius: 16px;
  border: 3px solid var(--ui-color-hudPill-stroke);
  background: linear-gradient(180deg, var(--ui-color-hudPill-top), var(--ui-color-hudPill-bot));
  box-shadow: inset 0 6px 0 rgba(255,255,255,.18);
  color: rgba(60,45,25,.85);
  text-shadow: 0 2px 0 rgba(255,255,255,.20);
  font-size: 18px;
}

.bklt__hudDot{
  width: 22px;
  height: 22px;
  border-radius: 999px;
  border: 3px solid rgba(0,0,0,.18);
  background: radial-gradient(circle at 30% 30%, #ffeaa2, #f2b233);
  box-shadow: 0 2px 0 rgba(0,0,0,.12);
}

.bklt__meterBar{
  padding: 0 14px 12px;
}

.bklt__meterBar .bklt__track{
  height: 22px;
  border-radius: 12px;
}

.bklt__meterBar .bklt__trackText{
  font-size: 18px;
}
```

```html
<!-- ADD: new demo section (append after your latest demo section) -->
<section class="demoBlock">
  <h2 class="demoHeading">Demo 6: Your Cards overlay</h2>

  <div class="bklt__overlay demoOverlay" role="dialog" aria-modal="true" aria-label="Your cards">
    <div class="bklt__spotWrap">
      <div class="bklt__spotTitle">Your Cards</div>

      <div class="bklt__cardGrid" aria-label="New cards">
        <div class="bklt__collectCard" role="button" tabindex="0" aria-label="Thermometer new card">
          <div class="bklt__starsRow" aria-hidden="true">
            <span class="bklt__star">★</span>
            <span class="bklt__star">★</span>
          </div>
          <div class="bklt__badgeNew" aria-hidden="true">New</div>
          <div class="bklt__cardArt" aria-hidden="true"></div>
          <div class="bklt__cardLabel">Thermometer</div>
        </div>

        <div class="bklt__collectCard" role="button" tabindex="0" aria-label="Snowdrops new card">
          <div class="bklt__starsRow" aria-hidden="true">
            <span class="bklt__star">★</span>
            <span class="bklt__star">★</span>
          </div>
          <div class="bklt__badgeNew" aria-hidden="true">New</div>
          <div class="bklt__cardArt bklt__cardArt--snow" aria-hidden="true"></div>
          <div class="bklt__cardLabel">Snowdrops</div>
        </div>
      </div>

      <div class="bklt__spotHint">Tap to Claim</div>
    </div>
  </div>
</section>

<!-- ADD: new demo section (append after Demo 6) -->
<section class="demoBlock">
  <h2 class="demoHeading">Demo 7: Home HUD (top strip + progress + actions)</h2>

  <div class="bklt__overlay demoOverlay" role="dialog" aria-modal="true" aria-label="Home">
    <div class="bklt__app" role="document">
      <div class="bklt__hudRow" aria-label="Top HUD">
        <div class="bklt__hudAvatar" aria-hidden="true"></div>

        <div class="bklt__hudPills" aria-label="Resources">
          <div class="bklt__hudPill"><span class="bklt__hudDot" aria-hidden="true"></span>16840</div>
          <div class="bklt__hudPill"><span class="bklt__hudDot" aria-hidden="true"></span>50:05</div>
          <div class="bklt__hudPill"><span class="bklt__hudDot" aria-hidden="true"></span>599</div>
        </div>

        <div class="bklt__hudGear" aria-hidden="true"></div>
      </div>

      <div class="bklt__meterBar" aria-label="Progress">
        <div class="bklt__track" style="height:22px" aria-label="Progress 273 of 350">
          <div class="bklt__fill" style="width:78%" aria-hidden="true"></div>
          <div class="bklt__trackText">273/350</div>
        </div>
      </div>

      <div class="bklt__connectArea" aria-label="Primary actions">
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:14px; width:min(520px,92%)">
          <button class="bklt__btnWide bklt__btnWide--green" type="button">Level 3600</button>
          <button class="bklt__btnWide bklt__btnWide--orange" type="button">New Area</button>
        </div>
      </div>

      <nav class="bklt__bottomNav" aria-label="Bottom navigation">
        <div class="bklt__navItem">
          <div class="bklt__navIcon" aria-hidden="true"></div>
          <div>Stars</div>
        </div>
        <div class="bklt__navItem">
          <div class="bklt__navIcon" aria-hidden="true"></div>
          <div>Leaderboard</div>
        </div>
        <div class="bklt__navItem">
          <div class="bklt__navIcon" aria-hidden="true"></div>
          <div>Team</div>
        </div>
        <div class="bklt__navItem">
          <div class="bklt__navIcon" aria-hidden="true"></div>
          <div>Shield</div>
        </div>
        <div class="bklt__navItem bklt__navItem--active">
          <div class="bklt__navIcon" aria-hidden="true"></div>
          <div>Home</div>
        </div>
      </nav>
    </div>
  </div>
</section>
```
