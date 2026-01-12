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
}

/* ADD: weekly contest panel */
.bklt__contest{
  margin: 14px;
  padding: 16px 14px 14px;
  border-radius: 18px;
  border: 4px solid var(--ui-color-contest-stroke);
  background:
    linear-gradient(135deg, rgba(255,255,255,.06) 25%, rgba(255,255,255,0) 25%) 0 0/34px 34px,
    linear-gradient(225deg, rgba(255,255,255,.06) 25%, rgba(255,255,255,0) 25%) 0 0/34px 34px,
    linear-gradient(315deg, rgba(0,0,0,.05) 25%, rgba(0,0,0,0) 25%) 0 0/34px 34px,
    linear-gradient(45deg, rgba(0,0,0,.05) 25%, rgba(0,0,0,0) 25%) 0 0/34px 34px,
    linear-gradient(180deg, var(--ui-color-contest-top), var(--ui-color-contest-bot));
  box-shadow: 0 10px 18px rgba(0,0,0,.22), var(--ui-shadow-inset-gloss);
  position: relative;
}

.bklt__infoBtn{
  position: absolute;
  left: 12px;
  top: 14px;
  width: 38px;
  height: 38px;
  border-radius: 999px;
  border: 4px solid rgba(0,0,0,.25);
  background: radial-gradient(circle at 30% 30%, #5ad4ff, #1a86c2 65%, #0f5a95);
  box-shadow: 0 8px 14px rgba(0,0,0,.22), inset 0 6px 0 rgba(255,255,255,.18);
  display: grid;
  place-items: center;
  color: #e9f7ff;
  text-shadow: 0 2px 0 rgba(0,0,0,.25);
  font-size: 26px;
  line-height: 1;
}

.bklt__ribbon{
  width: min(360px, 88%);
  margin: 2px auto 14px;
  padding: 12px 16px;
  border-radius: 14px;
  border: 4px solid rgba(0,0,0,.22);
  background: linear-gradient(180deg, var(--ui-color-ribbon-top), var(--ui-color-ribbon-bot));
  box-shadow: 0 10px 16px rgba(0,0,0,.22), var(--ui-shadow-inset-gloss);
  text-align: center;
  color: var(--ui-color-text-cream);
  text-shadow:
    0 3px 0 rgba(0,0,0,.30),
    2px 0 0 rgba(8,40,80,.65), -2px 0 0 rgba(8,40,80,.65),
    0 2px 0 rgba(8,40,80,.65), 0 -2px 0 rgba(8,40,80,.65);
  font-size: 40px;
  position: relative;
}

.bklt__ribbon::before,
.bklt__ribbon::after{
  content:"";
  position:absolute;
  top: 50%;
  width: 34px;
  height: 34px;
  background: linear-gradient(180deg, rgba(0,0,0,.18), rgba(0,0,0,0));
  border-radius: 8px;
  transform: translateY(-50%) rotate(45deg);
  opacity: .65;
}

.bklt__ribbon::before{ left: -14px; }
.bklt__ribbon::after{ right: -14px; }

/* ADD: podium */
.bklt__podium{
  display: grid;
  grid-template-columns: 1fr 1.05fr 1fr;
  gap: 12px;
  align-items: end;
}

.bklt__podCard{
  border-radius: 16px;
  border: 4px solid rgba(0,0,0,.20);
  box-shadow: 0 10px 16px rgba(0,0,0,.18), var(--ui-shadow-inset-gloss);
  padding: 46px 10px 12px;
  text-align: center;
  position: relative;
}

.bklt__podCard--left{
  background: linear-gradient(180deg, var(--ui-color-podium-leftTop), var(--ui-color-podium-leftBot));
}

.bklt__podCard--mid{
  padding-top: 56px;
  background: linear-gradient(180deg, var(--ui-color-podium-midTop), var(--ui-color-podium-midBot));
}

.bklt__podCard--right{
  background: linear-gradient(180deg, var(--ui-color-podium-rightTop), var(--ui-color-podium-rightBot));
}

.bklt__podAvatar{
  width: 64px;
  height: 64px;
  position: absolute;
  top: -22px;
  left: 50%;
  transform: translateX(-50%);
  border-radius: 16px;
  border: 4px solid rgba(0,0,0,.22);
  background: linear-gradient(180deg, rgba(255,255,255,.22), rgba(255,255,255,0)), #d8ecff;
  box-shadow: 0 10px 16px rgba(0,0,0,.18), inset 0 8px 0 rgba(255,255,255,.18);
  overflow: hidden;
}

.bklt__podAvatar img{
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.bklt__podName{
  font-size: 26px;
  color: rgba(20,35,55,.92);
  text-shadow: 0 2px 0 rgba(255,255,255,.25);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bklt__podSub{
  margin-top: 4px;
  font-size: 18px;
  color: rgba(20,35,55,.70);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bklt__podScore{
  margin-top: 10px;
  font-size: 26px;
  color: rgba(20,35,55,.92);
  text-shadow: 0 2px 0 rgba(255,255,255,.25);
}

.bklt__podScore b{ font-weight: 900; }

.bklt__podRank{
  width: 42px;
  height: 42px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  position: absolute;
  left: 50%;
  bottom: -16px;
  transform: translateX(-50%);
  border: 4px solid rgba(0,0,0,.22);
  box-shadow: inset 0 6px 0 rgba(255,255,255,.18);
  color: #3a2a00;
  text-shadow: 0 2px 0 rgba(255,255,255,.35);
  font-size: 24px;
  background: radial-gradient(circle at 30% 30%, #ffe39a, var(--ui-color-rank-gold));
}

.bklt__podRank--2{ background: radial-gradient(circle at 30% 30%, #eef3f7, var(--ui-color-rank-silver)); }
.bklt__podRank--3{ background: radial-gradient(circle at 30% 30%, #ffd2a8, var(--ui-color-rank-bronze)); }

/* ADD: list rows with right score column */
.bklt__row--score{
  grid-template-columns: 54px 74px 1fr 96px;
}

.bklt__scoreCol{
  justify-self: end;
  text-align: right;
  color: rgba(60,45,25,.70);
}

.bklt__scoreLabel{
  display: block;
  font-size: 18px;
}

.bklt__scoreValueBig{
  display: block;
  font-size: 36px;
  color: rgba(60,45,25,.80);
  text-shadow: 0 2px 0 rgba(255,255,255,.25);
}
```

```html
<!-- ADD: new demo section (append after your latest demo section) -->
<section class="demoBlock">
  <h2 class="demoHeading">Demo 4: Weekly contest</h2>

  <div class="bklt__overlay demoOverlay" role="dialog" aria-modal="true" aria-label="Leaderboard weekly contest">
    <div class="bklt__app" role="document">
      <div class="bklt__appTop">
        <h1 class="bklt__screenTitle">Leaderboard</h1>

        <div class="bklt__tabs" role="tablist" aria-label="Leaderboard tabs">
          <button class="bklt__tab bklt__tab--active" role="tab" aria-selected="true">Weekly</button>
          <button class="bklt__tab" role="tab" aria-selected="false">Friends</button>
          <button class="bklt__tab" role="tab" aria-selected="false">Players</button>
          <button class="bklt__tab" role="tab" aria-selected="false">Teams</button>
        </div>
      </div>

      <div class="bklt__contest" aria-label="Weekly contest panel">
        <button class="bklt__infoBtn" type="button" aria-label="Info">i</button>

        <div class="bklt__ribbon">Weekly Contest</div>

        <div class="bklt__podium" aria-label="Top 3">
          <div class="bklt__podCard bklt__podCard--left">
            <div class="bklt__podAvatar">
              <img alt="" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect width='64' height='64' rx='12' fill='%23d8ecff'/%3E%3Ctext x='32' y='40' font-size='22' text-anchor='middle' fill='%232a5c78' font-family='system-ui'%3E2%3C/text%3E%3C/svg%3E" />
            </div>
            <div class="bklt__podName">amigo</div>
            <div class="bklt__podSub">my team</div>
            <div class="bklt__podScore">Score: <b>31</b></div>
            <div class="bklt__podRank bklt__podRank--2" aria-hidden="true">2</div>
          </div>

          <div class="bklt__podCard bklt__podCard--mid">
            <div class="bklt__podAvatar">
              <img alt="" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect width='64' height='64' rx='12' fill='%23bfe6ff'/%3E%3Ctext x='32' y='40' font-size='22' text-anchor='middle' fill='%232a5c78' font-family='system-ui'%3E1%3C/text%3E%3C/svg%3E" />
            </div>
            <div class="bklt__podName">195</div>
            <div class="bklt__podSub">&nbsp;</div>
            <div class="bklt__podScore">Score: <b>33</b></div>
            <div class="bklt__podRank" aria-hidden="true">1</div>
          </div>

          <div class="bklt__podCard bklt__podCard--right">
            <div class="bklt__podAvatar">
              <img alt="" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect width='64' height='64' rx='12' fill='%23cfe3ff'/%3E%3Ctext x='32' y='40' font-size='22' text-anchor='middle' fill='%232a5c78' font-family='system-ui'%3E3%3C/text%3E%3C/svg%3E" />
            </div>
            <div class="bklt__podName">Hulya</div>
            <div class="bklt__podSub">Ayarsizlar</div>
            <div class="bklt__podScore">Score: <b>16</b></div>
            <div class="bklt__podRank bklt__podRank--3" aria-hidden="true">3</div>
          </div>
        </div>
      </div>

      <div class="bklt__list" role="list">
        <div class="bklt__row bklt__row--score" role="listitem">
          <div class="bklt__rank bklt__rank--neutral">6</div>
          <div class="bklt__avatar">
            <img class="bklt__avatarImg" alt="" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect width='64' height='64' rx='12' fill='%23d8ecff'/%3E%3Ctext x='32' y='40' font-size='22' text-anchor='middle' fill='%232a5c78' font-family='system-ui'%3E6%3C/text%3E%3C/svg%3E" />
          </div>
          <div class="bklt__meta">
            <p class="bklt__name">Yee</p>
            <p class="bklt__sub">THV</p>
          </div>
          <div class="bklt__scoreCol">
            <span class="bklt__scoreLabel">Score</span>
            <span class="bklt__scoreValueBig">3</span>
          </div>
        </div>

        <div class="bklt__row bklt__row--score bklt__row--highlight" role="listitem">
          <div class="bklt__rank bklt__rank--neutral">7</div>
          <div class="bklt__avatar">
            <img class="bklt__avatarImg" alt="" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect width='64' height='64' rx='12' fill='%23bfe6ff'/%3E%3Ctext x='32' y='40' font-size='18' text-anchor='middle' fill='%232a5c78' font-family='system-ui'%3EME%3C/text%3E%3C/svg%3E" />
          </div>
          <div class="bklt__meta">
            <p class="bklt__name">Have a nice day</p>
            <p class="bklt__sub">Crown Tha Kings</p>
          </div>
          <div class="bklt__scoreCol">
            <span class="bklt__scoreLabel">Score</span>
            <span class="bklt__scoreValueBig">2</span>
          </div>
        </div>

        <div class="bklt__row bklt__row--score" role="listitem">
          <div class="bklt__rank bklt__rank--neutral">8</div>
          <div class="bklt__avatar">
            <img class="bklt__avatarImg" alt="" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect width='64' height='64' rx='12' fill='%23d8ecff'/%3E%3Ctext x='32' y='40' font-size='22' text-anchor='middle' fill='%232a5c78' font-family='system-ui'%3E8%3C/text%3E%3C/svg%3E" />
          </div>
          <div class="bklt__meta">
            <p class="bklt__name">osama</p>
            <p class="bklt__sub">w x j</p>
          </div>
          <div class="bklt__scoreCol">
            <span class="bklt__scoreLabel">Score</span>
            <span class="bklt__scoreValueBig">0</span>
          </div>
        </div>
      </div>

      <div class="bklt__connectArea" aria-label="Play with friends">
        <button class="bklt__btnConnect" type="button" aria-label="Play with friends">
          <div class="bklt__btnConnectInner">
            <div class="bklt__fbIcon" aria-hidden="true">f</div>
            <div class="bklt__btnConnectText">Play With Friends</div>
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
