(function () {
  'use strict';

  var BT = window.BrainToy;
  if (!BT) return;

  var listeners = [];
  var thinkTimer = 0;

  function pulseThinking() {
    if (BT.config.motion.reduced) return;
    document.documentElement.classList.add('is-thinking');
    if (thinkTimer) window.clearTimeout(thinkTimer);
    thinkTimer = window.setTimeout(function () {
      document.documentElement.classList.remove('is-thinking');
      thinkTimer = 0;
    }, 460);
  }

  function normalizeText(raw) {
    if (!raw) return '';
    var t = String(raw);
    var softCap = BT.config.maxTextChars * 2;
    if (t.length > softCap) t = t.slice(0, softCap);
    t = t.replace(/\r\n/g, '\n');
    t = t.replace(/[\n\r]+/g, ' ');
    t = t.replace(/\s{2,}/g, ' ');
    t = t.trim();
    if (t.length > BT.config.maxTextChars) t = t.slice(0, BT.config.maxTextChars);
    return t;
  }

  function onTextChange(fn) {
    listeners.push(fn);
    return function () {
      var idx = listeners.indexOf(fn);
      if (idx >= 0) listeners.splice(idx, 1);
    };
  }

  function emit(text) {
    for (var i = 0; i < listeners.length; i++) listeners[i](text);
  }

  function initInput() {
    var dom = BT.services.dom;
    var input = dom.byId('thoughtInput');
    var hint = dom.byId('emptyHint');
    var wiggleToggle = dom.byId('wiggleToggle');
    var reducedMotionToggle = dom.byId('reducedMotionToggle');

    function updateHintVisible(text) {
      if (!hint) return;
      if (text && text.trim()) hint.classList.add('is-hidden');
      else hint.classList.remove('is-hidden');
    }

    if (wiggleToggle) {
      function applyWiggle() {
        BT.config.motion.wiggle = !!wiggleToggle.checked;
        if (BT.services.characterAnim && BT.services.characterAnim.setIntensity) {
          BT.services.characterAnim.setIntensity(BT.config.motion.wiggle ? 1.2 : 1);
        }
      }
      wiggleToggle.addEventListener('change', applyWiggle);
      applyWiggle();
    }

    if (reducedMotionToggle) {
      function applyReduced() {
        BT.config.motion.reduced = !!reducedMotionToggle.checked;
        if (BT.services.scheduler && BT.services.scheduler.setReducedMotion) {
          BT.services.scheduler.setReducedMotion(BT.config.motion.reduced);
        }
      }
      reducedMotionToggle.addEventListener('change', applyReduced);
      applyReduced();
    }

    input.addEventListener('input', function () {
      var text = normalizeText(input.value);
      BT.state.text = text;
      updateHintVisible(text);
      pulseThinking();
      emit(text);
    });

    updateHintVisible(input.value);
  }

  BT.services.input = {
    initInput: initInput,
    onTextChange: onTextChange,
    normalizeText: normalizeText,
  };
})();
