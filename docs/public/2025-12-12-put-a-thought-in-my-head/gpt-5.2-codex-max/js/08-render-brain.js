(function () {
  'use strict';

  var BT = window.BrainToy;
  if (!BT) return;

  function setLayerVisible(layer, isActive) {
    if (!layer || !layer.group) return;
    if (isActive) layer.group.classList.add('is-active');
    else layer.group.classList.remove('is-active');
  }

  function applyPlanToLayer(layer, plan) {
    BT.util.setAttr(layer.path, 'd', plan.pathD);
    BT.util.setAttr(layer.text, 'font-size', plan.fontSize);
    var centered = plan.mode === 'hero' || plan.mode === 'band';
    BT.util.setAttr(layer.textPath, 'startOffset', centered ? '50%' : '0%');
    if (centered) layer.text.setAttribute('text-anchor', 'middle');
    else layer.text.removeAttribute('text-anchor');
    BT.util.safeSetText(layer.textPath, plan.text);
  }

  function render(plan, opts) {
    var scene = BT.services.sceneState;
    if (!scene) return;

    var options = opts || {};

    var activeKey = scene.activeLayerKey || 'A';
    var nextKey = activeKey === 'A' ? 'B' : 'A';
    var active = scene.layers[activeKey];
    var next = scene.layers[nextKey];

    if (plan.mode === 'empty') {
      scene.emptyLabel.style.opacity = '1';
      scene.dust.classList.add('is-on');
      var layers = [active, next];
      for (var i = 0; i < layers.length; i++) {
        layers[i].group.classList.remove('is-ripple');
        layers[i].group.classList.remove('is-appear');
        if (!BT.config.motion.reduced) layers[i].group.classList.add('is-drain');
      }
      setLayerVisible(active, false);
      setLayerVisible(next, false);
      window.setTimeout(function () {
        for (var j = 0; j < layers.length; j++) layers[j].group.classList.remove('is-drain');
      }, BT.config.transitions.drainMs);
      scene.activeLayerKey = activeKey;
      return;
    }

    scene.emptyLabel.style.opacity = '0';
    scene.dust.classList.remove('is-on');

    applyPlanToLayer(next, plan);

    next.group.classList.remove('is-drain');
    next.group.classList.remove('is-ripple');
    next.group.classList.remove('is-appear');
    if (!BT.config.motion.reduced) {
      next.group.classList.add(options.appear ? 'is-appear' : 'is-ripple');
    }
    setLayerVisible(next, true);
    setLayerVisible(active, false);

    window.setTimeout(function () {
      next.group.classList.remove('is-ripple');
      next.group.classList.remove('is-appear');
    }, options.appear ? BT.config.transitions.appearMs : BT.config.transitions.reflowMs);

    scene.activeLayerKey = nextKey;
  }

  function clearBrain(animated) {
    var scene = BT.services.sceneState;
    if (!scene) return;
    if (!animated) {
      scene.emptyLabel.style.opacity = '1';
      scene.dust.classList.add('is-on');
      scene.layers.A.group.classList.remove('is-active');
      scene.layers.B.group.classList.remove('is-active');
      return;
    }
    scene.layers.A.group.classList.remove('is-active');
    scene.layers.B.group.classList.remove('is-active');
    window.setTimeout(function () {
      scene.emptyLabel.style.opacity = '1';
      scene.dust.classList.add('is-on');
    }, BT.config.transitions.drainMs);
  }

  BT.services.brainRenderer = {
    render: render,
    clearBrain: clearBrain,
  };
})();
