I will add only the new UI primitives from these two screenshots (team header bar, info modal card with stats grid, pill counters, chat/request cards, progress bar with heart icon, and orange/gray buttons), and provide incremental CSS plus an appended demo HTML section.


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
}

/* ADD: team top bar (shield + name + action button) */
.bklt__teamTop{
  margin: 14px;
  padding: 14px 14px;
  border-radius: 18px;
  border: 4px solid var(--ui-color-teamTop-stroke);
  background: linear-gradient(180deg, var(--ui-color-teamTop-top), var(--ui-color-teamTop-bot));
  box-shadow: 0 10px 18px rgba(0,0,0,.22), var(--ui-shadow-inset-gloss);
  display: grid;
  grid-template-columns: 66px 1fr auto;
  gap: 12px;
  align-items: center;
}

.bklt__shield{
  width: 58px;
  height: 58px;
  border-radius: 16px;
  border: 4px solid rgba(0,0,0,.22);
  background: linear-gradient(180deg, rgba(255,255,255,.22), rgba(255,255,255,0)), #d8ecff;
  box-shadow: var(--ui-shadow-inset-gloss);
  display: grid;
  place-items: center;
  position: relative;
  overflow: hidden;
}

.bklt__shield::before{
  content:"";
  width: 32px;
  height: 26px;
  border-radius: 4px 4px 12px 12px;
  background: linear-gradient(180deg, #ffffff, #d8dde6);
  box-shadow: 0 3px 0 rgba(0,0,0,.18);
  transform: translateY(2px);
}

.bklt__teamName{
  font-size: 32px;
  color: var(--ui-color-text-cream);
  text-shadow:
    0 3px 0 rgba(0,0,0,.30),
    2px 0 0 rgba(8,40,80,.65), -2px 0 0 rgba(8,40,80,.65),
    0 2px 0 rgba(8,40,80,.65), 0 -2px 0 rgba(8,40,80,.65);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ADD: compact action button variants (orange, gray, red) */
.bklt__btnAction{
  height: 56px;
  padding: 0 18px;
  border-radius: 14px;
  border: 4px solid rgba(0,0,0,.22);
  box-shadow: var(--ui-shadow-inset-gloss);
  font-size: 28px;
  line-height: 1;
  color: var(--ui-color-text-cream);
  text-shadow: var(--ui-shadow-text);
  white-space: nowrap;
}

.bklt__btnAction--orange{
  border-color: var(--ui-color-orangeBtn-stroke);
  background: linear-gradient(180deg, var(--ui-color-orangeBtn-top), var(--ui-color-orangeBtn-bot));
}

.bklt__btnAction--gray{
  border-color: var(--ui-color-grayBtn-stroke);
  background: linear-gradient(180deg, var(--ui-color-grayBtn-top), var(--ui-color-grayBtn-bot));
}

.bklt__btnAction--danger{
  border-color: var(--ui-color-danger-stroke);
  background: linear-gradient(180deg, var(--ui-color-danger-top), var(--ui-color-danger-mid) 60%, var(--ui-color-danger-bot));
}

/* ADD: team info card inside panel */
.bklt__teamCard{
  margin: 14px;
  padding: 14px;
  border-radius: 18px;
  border: 4px solid var(--ui-color-teamTop-stroke);
  background: linear-gradient(180deg, var(--ui-color-teamTop-top), var(--ui-color-teamTop-bot));
  box-shadow: 0 10px 18px rgba(0,0,0,.22), var(--ui-shadow-inset-gloss);
}

.bklt__teamCardHeader{
  display: grid;
  grid-template-columns: 66px 1fr auto;
  gap: 12px;
  align-items: center;
}

.bklt__capacity{
  text-align: right;
  color: rgba(18,40,60,.75);
}

.bklt__capacityLabel{
  display: block;
  font-size: 18px;
}

.bklt__capacityChip{
  margin-top: 6px;
  display: inline-block;
  padding: 6px 10px;
  border-radius: 12px;
  border: 3px solid rgba(0,0,0,.18);
  background: linear-gradient(180deg, #a7b6c8, #7d90a7);
  color: #10324f;
  text-shadow: 0 2px 0 rgba(255,255,255,.18);
  font-size: 20px;
}

.bklt__teamSub{
  margin-top: 6px;
  font-size: 22px;
  color: rgba(10,30,45,.70);
  text-shadow: 0 2px 0 rgba(255,255,255,.15);
}

/* ADD: stats grid */
.bklt__stats{
  margin-top: 14px;
  padding: 14px;
  border-radius: 16px;
  border: 3px solid rgba(0,0,0,.18);
  background: rgba(255,255,255,.06);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 16px;
}

.bklt__stat{
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  color: rgba(10,30,45,.80);
}

.bklt__statLabel{
  font-size: 22px;
  color: rgba(10,30,45,.70);
  text-shadow: 0 2px 0 rgba(255,255,255,.12);
}

.bklt__statValue{
  font-size: 26px;
  color: rgba(10,30,45,.88);
  text-shadow: 0 2px 0 rgba(255,255,255,.12);
  white-space: nowrap;
}

.bklt__dot{
  display: inline-block;
  width: 14px;
  height: 14px;
  border-radius: 999px;
  margin-right: 8px;
  background: linear-gradient(180deg, var(--ui-color-warn-top), var(--ui-color-warn-bot));
  border: 3px solid var(--ui-color-warn-stroke);
  box-shadow: 0 2px 0 rgba(0,0,0,.12);
  vertical-align: -1px;
}

/* ADD: compact chip (helps count) */
.bklt__chip{
  display: inline-grid;
  place-items: center;
  min-width: 44px;
  height: 34px;
  padding: 0 10px;
  border-radius: 12px;
  border: 3px solid var(--ui-color-chip-stroke);
  background: linear-gradient(180deg, var(--ui-color-chip-top), var(--ui-color-chip-bot));
  color: rgba(60,45,25,.75);
  text-shadow: 0 2px 0 rgba(255,255,255,.20);
  font-size: 20px;
}

.bklt__chip--green{
  background: linear-gradient(180deg, var(--ui-color-fill-top), var(--ui-color-fill-bot));
  border-color: rgba(0,0,0,.16);
  color: rgba(18,60,40,.90);
}

/* ADD: team roster row (rank + avatar + name + helps + level) */
.bklt__row--team{
  grid-template-columns: 54px 74px 1fr 84px 96px;
}

.bklt__helpCol{
  justify-self: end;
  text-align: center;
  color: rgba(60,45,25,.70);
}

.bklt__helpLabel{
  display: block;
  font-size: 18px;
}

.bklt__helpValue{
  display: inline-block;
  margin-top: 6px;
}

/* ADD: request cards list */
.bklt__reqList{
  padding: 6px 14px 14px;
  display: grid;
  gap: 14px;
}

.bklt__reqRow{
  display: grid;
  grid-template-columns: 78px 1fr;
  gap: 12px;
  align-items: start;
}

.bklt__reqAvatar{
  width: 72px;
  height: 72px;
  border-radius: 16px;
  border: 4px solid rgba(0,0,0,.22);
  background: linear-gradient(180deg, rgba(255,255,255,.22), rgba(255,255,255,0)), #d8ecff;
  box-shadow: var(--ui-shadow-inset-gloss);
  overflow: hidden;
}

.bklt__reqAvatar img{
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.bklt__reqCard{
  border-radius: 18px;
  border: 4px solid var(--ui-color-bubble-stroke);
  background: linear-gradient(180deg, var(--ui-color-bubble-top), var(--ui-color-bubble-bot));
  box-shadow: 0 10px 16px rgba(0,0,0,.18), var(--ui-shadow-inset-gloss);
  overflow: hidden;
}

.bklt__reqHeader{
  padding: 10px 14px;
  font-size: 22px;
  color: rgba(60,30,25,.85);
  text-shadow: 0 2px 0 rgba(255,255,255,.18);
  background: rgba(255,255,255,.10);
}

.bklt__reqBody{
  padding: 12px 14px 14px;
  background: linear-gradient(180deg, #f7edc9, #e6d8ab);
  display: grid;
  grid-template-columns: 1fr 120px;
  gap: 12px;
  align-items: center;
}

/* Progress bar with heart */
.bklt__progress{
  display: grid;
  grid-template-columns: 58px 1fr;
  gap: 10px;
  align-items: center;
}

.bklt__heart{
  width: 54px;
  height: 46px;
  position: relative;
  transform: translateY(2px);
}

.bklt__heart::before,
.bklt__heart::after{
  content:"";
  position:absolute;
  width: 28px;
  height: 42px;
  top: 6px;
  background: linear-gradient(180deg, var(--ui-color-heart-top), var(--ui-color-heart-bot));
  border: 3px solid var(--ui-color-heart-stroke);
  border-bottom: 0;
  border-radius: 18px 18px 0 0;
  box-shadow: 0 6px 0 rgba(0,0,0,.10);
}

.bklt__heart::before{ left: 11px; transform: rotate(-45deg); transform-origin: 0 100%; }
.bklt__heart::after { left: 25px; transform: rotate(45deg); transform-origin: 100% 100%; }

.bklt__track{
  height: 34px;
  border-radius: 14px;
  border: 3px solid var(--ui-color-track-stroke);
  background: linear-gradient(180deg, var(--ui-color-track-top), var(--ui-color-track-bot));
  box-shadow: inset 0 6px 0 rgba(255,255,255,.18);
  position: relative;
  overflow: hidden;
}

.bklt__fill{
  height: 100%;
  width: var(--ui-progress, 50%);
  background: linear-gradient(180deg, var(--ui-color-fill-top), var(--ui-color-fill-bot));
  box-shadow: inset 0 6px 0 rgba(255,255,255,.14);
}

.bklt__trackText{
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  font-size: 26px;
  color: rgba(60,45,25,.85);
  text-shadow: 0 2px 0 rgba(255,255,255,.20);
}

/* Footer dual actions */
.bklt__dualActions{
  padding: 14px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.bklt__btnWide{
  height: 78px;
  border-radius: 18px;
  border: 4px solid rgba(0,0,0,.22);
  box-shadow: var(--ui-shadow-inset-gloss), 0 10px 16px rgba(0,0,0,.18);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-size: 34px;
  color: var(--ui-color-text-cream);
  text-shadow: var(--ui-shadow-text);
}

.bklt__btnWide--orange{
  border-color: var(--ui-color-orangeBtn-stroke);
  background: linear-gradient(180deg, var(--ui-color-orangeBtn-top), var(--ui-color-orangeBtn-bot));
}

.bklt__btnWide--green{
  border-color: rgba(0,0,0,.18);
  background: linear-gradient(180deg, var(--ui-color-fill-top), var(--ui-color-fill-bot));
}

.bklt__btnIconChat{
  width: 42px;
  height: 32px;
  border-radius: 10px;
  background: rgba(255,255,255,.16);
  border: 3px solid rgba(0,0,0,.18);
  position: relative;
  box-shadow: inset 0 6px 0 rgba(255,255,255,.16);
}

.bklt__btnIconChat::after{
  content:"";
  position:absolute;
  left: 10px;
  bottom: -8px;
  width: 16px;
  height: 16px;
  background: inherit;
  border-left: inherit;
  border-bottom: inherit;
  transform: rotate(45deg);
}

.bklt__btnIconHeart{
  width: 34px;
  height: 30px;
  position: relative;
}

.bklt__btnIconHeart::before,
.bklt__btnIconHeart::after{
  content:"";
  position:absolute;
  width: 18px;
  height: 28px;
  top: 4px;
  background: linear-gradient(180deg, var(--ui-color-heart-top), var(--ui-color-heart-bot));
  border: 3px solid var(--ui-color-heart-stroke);
  border-bottom: 0;
  border-radius: 14px 14px 0 0;
}

.bklt__btnIconHeart::before{ left: 6px; transform: rotate(-45deg); transform-origin: 0 100%; }
.bklt__btnIconHeart::after { left: 16px; transform: rotate(45deg); transform-origin: 100% 100%; }
```

```html
<!-- ADD: new demo section (append after your latest demo section) -->
<section class="demoBlock">
  <h2 class="demoHeading">Demo 5: Team info + My team requests</h2>

  <div class="bklt__overlay demoOverlay" role="dialog" aria-modal="true" aria-label="Team screens">
    <div class="bklt__app" role="document">
      <div class="bklt__appTop">
        <h1 class="bklt__screenTitle">My Team</h1>
      </div>

      <div class="bklt__teamTop" aria-label="Team header">
        <div class="bklt__shield" aria-hidden="true"></div>
        <div class="bklt__teamName">Crown Tha Kings</div>
        <button class="bklt__btnAction bklt__btnAction--orange" type="button">Team Info</button>
      </div>

      <div class="bklt__reqList" aria-label="Requests list">
        <div class="bklt__reqRow">
          <div class="bklt__reqAvatar">
            <img alt="" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='72' height='72'%3E%3Crect width='72' height='72' rx='14' fill='%23d8ecff'/%3E%3Ctext x='36' y='46' font-size='22' text-anchor='middle' fill='%232a5c78' font-family='system-ui'%3ETJ%3C/text%3E%3C/svg%3E" />
          </div>
          <div class="bklt__reqCard">
            <div class="bklt__reqHeader">TEEJAY asking for lives!</div>
            <div class="bklt__reqBody">
              <div class="bklt__progress" style="--ui-progress:80%">
                <div class="bklt__heart" aria-hidden="true"></div>
                <div class="bklt__track" aria-label="Progress 4 of 5">
                  <div class="bklt__fill" aria-hidden="true"></div>
                  <div class="bklt__trackText">4/5</div>
                </div>
              </div>
              <button class="bklt__btnAction bklt__btnAction--gray" type="button">Help</button>
            </div>
          </div>
        </div>

        <div class="bklt__reqRow">
          <div class="bklt__reqAvatar">
            <img alt="" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='72' height='72'%3E%3Crect width='72' height='72' rx='14' fill='%23cfe3ff'/%3E%3Ctext x='36' y='46' font-size='22' text-anchor='middle' fill='%232a5c78' font-family='system-ui'%3Edrt%3C/text%3E%3C/svg%3E" />
          </div>
          <div class="bklt__reqCard">
            <div class="bklt__reqHeader">drt asking for lives!</div>
            <div class="bklt__reqBody">
              <div class="bklt__progress" style="--ui-progress:60%">
                <div class="bklt__heart" aria-hidden="true"></div>
                <div class="bklt__track" aria-label="Progress 3 of 5">
                  <div class="bklt__fill" aria-hidden="true"></div>
                  <div class="bklt__trackText">3/5</div>
                </div>
              </div>
              <button class="bklt__btnAction bklt__btnAction--gray" type="button">Help</button>
            </div>
          </div>
        </div>

        <div class="bklt__reqRow">
          <div class="bklt__reqAvatar">
            <img alt="" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='72' height='72'%3E%3Crect width='72' height='72' rx='14' fill='%23bfe6ff'/%3E%3Ctext x='36' y='46' font-size='22' text-anchor='middle' fill='%232a5c78' font-family='system-ui'%3EDN%3C/text%3E%3C/svg%3E" />
          </div>
          <div class="bklt__reqCard">
            <div class="bklt__reqHeader">Danell asking for lives!</div>
            <div class="bklt__reqBody">
              <div class="bklt__progress" style="--ui-progress:20%">
                <div class="bklt__heart" aria-hidden="true"></div>
                <div class="bklt__track" aria-label="Progress 1 of 5">
                  <div class="bklt__fill" aria-hidden="true"></div>
                  <div class="bklt__trackText">1/5</div>
                </div>
              </div>
              <button class="bklt__btnAction bklt__btnAction--gray" type="button">Help</button>
            </div>
          </div>
        </div>
      </div>

      <div class="bklt__dualActions" aria-label="Actions">
        <button class="bklt__btnWide bklt__btnWide--orange" type="button">
          <span class="bklt__btnIconChat" aria-hidden="true"></span>
          <span>Message</span>
        </button>
        <button class="bklt__btnWide bklt__btnWide--green" type="button">
          <span class="bklt__btnIconHeart" aria-hidden="true"></span>
          <span>Request</span>
        </button>
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
        <div class="bklt__navItem bklt__navItem--active">
          <div class="bklt__navIcon" aria-hidden="true"></div>
          <div>Team</div>
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

      <div style="height:18px"></div>

      <div class="bklt__overlay demoOverlay" role="dialog" aria-modal="true" aria-label="Team info modal">
        <div class="bklt__panel" role="document">
          <button class="bklt__close" type="button" aria-label="Close"></button>

          <header class="bklt__hdr">
            <h1 class="bklt__title">Team Info</h1>
          </header>

          <section class="bklt__body">
            <div class="bklt__teamCard" aria-label="Team info">
              <div class="bklt__teamCardHeader">
                <div class="bklt__shield" aria-hidden="true"></div>

                <div>
                  <div class="bklt__teamName" style="font-size:34px">Crown Tha Kings</div>
                  <div class="bklt__teamSub">Twelve Tribes World Wide</div>
                </div>

                <div class="bklt__capacity">
                  <span class="bklt__capacityLabel">Capacity</span>
                  <span class="bklt__capacityChip">47/50</span>
                </div>
              </div>

              <div class="bklt__stats" aria-label="Stats grid">
                <div class="bklt__stat">
                  <span class="bklt__statLabel">Team Score:</span>
                  <span class="bklt__statValue">77666</span>
                </div>
                <div class="bklt__stat">
                  <span class="bklt__statLabel">Activity:</span>
                  <span class="bklt__statValue"><span class="bklt__dot" aria-hidden="true"></span>Medium</span>
                </div>
                <div class="bklt__stat">
                  <span class="bklt__statLabel">Required Level:</span>
                  <span class="bklt__statValue">0</span>
                </div>
                <div class="bklt__stat">
                  <span class="bklt__statLabel">Team Type:</span>
                  <span class="bklt__statValue">Open</span>
                </div>
                <div class="bklt__stat">
                  <span class="bklt__statLabel">Required Crown:</span>
                  <span class="bklt__statValue">0</span>
                </div>
                <div></div>
              </div>

              <div style="display:flex; justify-content:flex-end; margin-top:12px">
                <button class="bklt__btnAction bklt__btnAction--danger" type="button">Leave</button>
              </div>
            </div>

            <div class="bklt__list" role="list" style="padding:14px 0 0; background:transparent">
              <div class="bklt__row bklt__row--team" role="listitem">
                <div class="bklt__rank bklt__rank--gold">1</div>
                <div class="bklt__avatar">
                  <img class="bklt__avatarImg" alt="" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect width='64' height='64' rx='12' fill='%23bfe6ff'/%3E%3Ctext x='32' y='40' font-size='20' text-anchor='middle' fill='%232a5c78' font-family='system-ui'%3E1%3C/text%3E%3C/svg%3E" />
                </div>
                <div class="bklt__meta">
                  <p class="bklt__name">Danell</p>
                  <p class="bklt__sub">&amp; Grand Knight</p>
                </div>
                <div class="bklt__helpCol">
                  <span class="bklt__helpLabel">Helps</span>
                  <span class="bklt__chip bklt__helpValue">2</span>
                </div>
                <div class="bklt__level">
                  <span class="bklt__levelLabel">Level</span>
                  <span class="bklt__levelValue bklt__levelValue--big">12736</span>
                </div>
              </div>

              <div class="bklt__row bklt__row--team" role="listitem">
                <div class="bklt__rank bklt__rank--silver">2</div>
                <div class="bklt__avatar">
                  <img class="bklt__avatarImg" alt="" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect width='64' height='64' rx='12' fill='%23d8ecff'/%3E%3Ctext x='32' y='40' font-size='20' text-anchor='middle' fill='%232a5c78' font-family='system-ui'%3E2%3C/text%3E%3C/svg%3E" />
                </div>
                <div class="bklt__meta">
                  <p class="bklt__name">Mia</p>
                </div>
                <div class="bklt__helpCol">
                  <span class="bklt__helpLabel">Helps</span>
                  <span class="bklt__chip bklt__helpValue">0</span>
                </div>
                <div class="bklt__level">
                  <span class="bklt__levelLabel">Level</span>
                  <span class="bklt__levelValue bklt__levelValue--big">10485</span>
                </div>
              </div>

              <div class="bklt__row bklt__row--team bklt__row--highlight" role="listitem">
                <div class="bklt__rank bklt__rank--neutral">6</div>
                <div class="bklt__avatar">
                  <img class="bklt__avatarImg" alt="" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect width='64' height='64' rx='12' fill='%23bfe6ff'/%3E%3Ctext x='32' y='40' font-size='18' text-anchor='middle' fill='%232a5c78' font-family='system-ui'%3EME%3C/text%3E%3C/svg%3E" />
                </div>
                <div class="bklt__meta">
                  <p class="bklt__name">Have a nice day</p>
                </div>
                <div class="bklt__helpCol">
                  <span class="bklt__helpLabel">Helps</span>
                  <span class="bklt__chip bklt__chip--green bklt__helpValue">3</span>
                </div>
                <div class="bklt__level">
                  <span class="bklt__levelLabel">Level</span>
                  <span class="bklt__levelValue bklt__levelValue--big">3600</span>
                </div>
              </div>
            </div>

          </section>
        </div>
      </div>

    </div>
  </div>
</section>
```
