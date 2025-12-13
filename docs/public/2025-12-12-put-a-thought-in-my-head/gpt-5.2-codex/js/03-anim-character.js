(function () {
  "use strict";

  var BJ = window.BrainJoke;
  if (!BJ) return;

  function makeCharacterTask() {
    var dom = BJ.services.dom.ready();
    var character = dom.character;
    var pupil = dom.pupil;
    var eyelid = dom.eyelid;

    var cfg = BJ.config;
    var centerX = 410;
    var centerY = 300;

    var pupilBase = { x: Number(pupil.getAttribute("cx")) || 0, y: Number(pupil.getAttribute("cy")) || 0 };
    var pupilPos = { x: 0, y: 0 };
    var pupilTarget = { x: 0, y: 0 };
    var nextSaccadeAt = 0;

    var blink = { phase: 0, state: "idle", nextAt: 0, startedAt: 0 };

    function setPupilOffset(dx, dy) {
      pupil.setAttribute("transform", "translate(" + dx.toFixed(2) + " " + dy.toFixed(2) + ")");
      pupil.setAttribute("cx", String(pupilBase.x));
      pupil.setAttribute("cy", String(pupilBase.y));
    }

    function setBlink(amount) {
      var a = BJ.util.clamp(amount, 0, 1);
      eyelid.style.opacity = String(a);
    }

    function scheduleNextSaccade(now) {
      nextSaccadeAt = now + BJ.util.rand(cfg.saccade.idleMsMin, cfg.saccade.idleMsMax);
      pupilTarget.x = BJ.util.rand(-cfg.saccade.rangePx, cfg.saccade.rangePx);
      pupilTarget.y = BJ.util.rand(-cfg.saccade.rangePx * 0.6, cfg.saccade.rangePx * 0.6);
    }

    function scheduleNextBlink(now) {
      blink.nextAt = now + BJ.util.rand(cfg.blink.idleMsMin, cfg.blink.idleMsMax);
    }

    scheduleNextSaccade(BJ.util.now());
    scheduleNextBlink(BJ.util.now());

    return function tick(nowMs) {
      var intensity = BJ.state.wiggleMode ? 1.25 : 1;
      if (BJ.state.reducedMotion) intensity *= 0.25;

      var bob = Math.sin((nowMs / cfg.breathe.periodMs) * Math.PI * 2) * cfg.breathe.ampPx * intensity;
      var sway = Math.sin((nowMs / cfg.sway.periodMs) * Math.PI * 2) * cfg.sway.ampDeg * intensity;

      character.setAttribute(
        "transform",
        "translate(0 " + bob.toFixed(2) + ") rotate(" + sway.toFixed(3) + " " + centerX + " " + centerY + ")"
      );

      if (nowMs >= nextSaccadeAt) scheduleNextSaccade(nowMs);
      var settle = 1 - Math.exp(-Math.max(0, nowMs - (nextSaccadeAt - cfg.saccade.idleMsMin)) / cfg.saccade.settleMs);
      pupilPos.x += (pupilTarget.x - pupilPos.x) * (0.12 + 0.2 * settle);
      pupilPos.y += (pupilTarget.y - pupilPos.y) * (0.12 + 0.2 * settle);
      setPupilOffset(pupilPos.x * intensity, pupilPos.y * intensity);

      if (BJ.state.reducedMotion) {
        setBlink(0);
        return;
      }

      if (blink.state === "idle" && nowMs >= blink.nextAt) {
        blink.state = "closing";
        blink.startedAt = nowMs;
      }

      if (blink.state === "closing") {
        var tClose = (nowMs - blink.startedAt) / cfg.blink.closeMs;
        if (tClose >= 1) {
          blink.state = "hold";
          blink.startedAt = nowMs;
          setBlink(1);
        } else {
          setBlink(BJ.util.easeOutCubic(tClose));
        }
      } else if (blink.state === "hold") {
        if (nowMs - blink.startedAt >= cfg.blink.holdMs) {
          blink.state = "opening";
          blink.startedAt = nowMs;
        }
      } else if (blink.state === "opening") {
        var tOpen = (nowMs - blink.startedAt) / cfg.blink.openMs;
        if (tOpen >= 1) {
          blink.state = "idle";
          setBlink(0);
          scheduleNextBlink(nowMs);
        } else {
          setBlink(1 - BJ.util.easeOutCubic(tOpen));
        }
      }
    };
  }

  BJ.services.characterAnim = (function () {
    var running = false;
    var task = null;

    function startIdle() {
      if (running) return;
      if (!BJ.services.scheduler) throw new Error("Scheduler not ready");
      if (!task) task = makeCharacterTask();
      BJ.services.scheduler.addRafTask("character", task);
      running = true;
    }

    function stopIdle() {
      if (!running) return;
      BJ.services.scheduler.removeRafTask("character");
      running = false;
    }

    function setIntensity(enabled) {
      BJ.state.wiggleMode = !!enabled;
    }

    return { startIdle: startIdle, stopIdle: stopIdle, setIntensity: setIntensity };
  })();
})();

