(function () {
  'use strict';

  var BT = window.BrainToy;
  if (!BT) return;

  function initScene() {
    var dom = BT.services.dom;
    var svg = dom.byId('brainToySvg');
    var cavityPath = dom.byId('cavityPath');
    var brainHost = dom.byId('brainHost');
    var skullRim = dom.byId('skullRim');
    var cavityBox = cavityPath.getBBox();
    var cavityCenter = {
      x: cavityBox.x + cavityBox.width * 0.5,
      y: cavityBox.y + cavityBox.height * 0.52,
    };

    var defs = svg.querySelector('defs') || BT.util.svgEl('defs');
    if (!defs.parentNode) svg.insertBefore(defs, svg.firstChild);

    var clipPath = BT.util.svgEl('clipPath');
    clipPath.id = 'cavityClip';
    clipPath.setAttribute('clipPathUnits', 'userSpaceOnUse');
    var cavityClone = cavityPath.cloneNode(true);
    cavityClone.removeAttribute('class');
    cavityClone.removeAttribute('style');
    cavityClone.removeAttribute('id');
    clipPath.appendChild(cavityClone);
    defs.appendChild(clipPath);

    var brainGroup = BT.util.svgEl('g');
    brainGroup.id = 'brainGroup';
    brainGroup.setAttribute('clip-path', 'url(#cavityClip)');

    var emptyLabel = BT.util.svgEl('text');
    emptyLabel.id = 'emptyLabel';
    emptyLabel.setAttribute('class', 'brain-empty');
    emptyLabel.setAttribute('text-anchor', 'middle');
    emptyLabel.setAttribute('x', String(cavityCenter.x));
    emptyLabel.setAttribute('y', String(cavityCenter.y));
    BT.util.safeSetText(emptyLabel, 'nothing in there');

    var dust = BT.util.svgEl('g');
    dust.id = 'dust';
    dust.setAttribute('class', 'dust is-on');
    var motes = [
      { x: cavityCenter.x - cavityBox.width * 0.16, y: cavityCenter.y - cavityBox.height * 0.08, r: 4, cls: 'mote-a' },
      { x: cavityCenter.x + cavityBox.width * 0.05, y: cavityCenter.y - cavityBox.height * 0.18, r: 3, cls: 'mote-b' },
      { x: cavityCenter.x + cavityBox.width * 0.18, y: cavityCenter.y + cavityBox.height * 0.1, r: 3.5, cls: 'mote-c' },
    ];
    for (var i = 0; i < motes.length; i++) {
      var c = BT.util.svgEl('circle');
      c.setAttribute('cx', String(motes[i].x));
      c.setAttribute('cy', String(motes[i].y));
      c.setAttribute('r', String(motes[i].r));
      c.setAttribute('class', motes[i].cls);
      dust.appendChild(c);
    }

    var web = BT.util.svgEl('path');
    web.setAttribute(
      'd',
      'M ' +
        (cavityCenter.x - cavityBox.width * 0.12) +
        ' ' +
        (cavityCenter.y + cavityBox.height * 0.22) +
        ' C ' +
        (cavityCenter.x - cavityBox.width * 0.06) +
        ' ' +
        (cavityCenter.y + cavityBox.height * 0.12) +
        ' ' +
        (cavityCenter.x + cavityBox.width * 0.02) +
        ' ' +
        (cavityCenter.y + cavityBox.height * 0.14) +
        ' ' +
        (cavityCenter.x + cavityBox.width * 0.1) +
        ' ' +
        (cavityCenter.y + cavityBox.height * 0.2)
    );
    web.setAttribute('fill', 'none');
    web.setAttribute('stroke', 'rgba(34, 36, 54, 0.22)');
    web.setAttribute('stroke-width', '3');
    web.setAttribute('stroke-linecap', 'round');
    web.setAttribute('stroke-linejoin', 'round');
    dust.appendChild(web);

    brainGroup.appendChild(dust);
    brainGroup.appendChild(emptyLabel);

    var layers = {};
    var layerNames = ['A', 'B'];
    for (var j = 0; j < layerNames.length; j++) {
      var name = layerNames[j];
      var path = BT.util.svgEl('path');
      path.id = 'brainPath' + name;
      path.setAttribute('d', 'M 0 0');
      defs.appendChild(path);

      var layer = BT.util.svgEl('g');
      layer.id = 'brainLayer' + name;
      layer.setAttribute('class', 'brain-layer');

      var text = BT.util.svgEl('text');
      text.id = 'brainText' + name;
      text.setAttribute('class', 'brain-text');
      text.setAttribute('dominant-baseline', 'middle');

      var textPath = BT.util.svgEl('textPath');
      textPath.id = 'brainTextPath' + name;
      textPath.setAttribute('href', '#brainPath' + name);
      textPath.setAttribute('startOffset', '0%');
      text.appendChild(textPath);
      layer.appendChild(text);

      layers[name] = {
        group: layer,
        path: path,
        text: text,
        textPath: textPath,
      };
      brainGroup.appendChild(layer);
    }

    brainHost.appendChild(brainGroup);
    if (skullRim && skullRim.parentNode) skullRim.parentNode.appendChild(skullRim);

    dom.byId('characterRig').classList.add('character-breathe');

    return {
      svg: svg,
      cavityPath: cavityPath,
      brainGroup: brainGroup,
      emptyLabel: emptyLabel,
      dust: dust,
      layers: layers,
    };
  }

  BT.services.scene = { initScene: initScene };
})();
