(function () {
  "use strict";

  var BJ = window.BrainJoke;
  if (!BJ) return;

  function normalize(raw) {
    if (raw == null) return "";
    var t = String(raw);
    t = t.replace(/\r\n/g, "\n");
    t = t.replace(/\t/g, " ");
    t = t.replace(/\n+/g, " ");
    t = t.replace(/\s+/g, " ").trim();
    return t;
  }

  BJ.ui.input = (function () {
    var dom = null;
    var listeners = [];
    var last = "";

    function emit(text) {
      for (var i = 0; i < listeners.length; i++) listeners[i](text);
    }

    function setHintVisible(visible) {
      dom.hint.style.opacity = visible ? "1" : "0";
      dom.hint.style.height = visible ? "" : "0";
      dom.hint.style.overflow = visible ? "" : "hidden";
    }

    function handleInput() {
      var next = normalize(dom.input.value);
      if (next === last) return;
      last = next;
      setHintVisible(!next);
      emit(next);
    }

    function init() {
      if (dom) return;
      dom = BJ.services.dom.ready();
      if (!dom.ok) throw new Error("DOM not ready");

      dom.input.addEventListener("input", handleInput);
      dom.input.addEventListener("change", handleInput);
      dom.input.addEventListener("paste", function () {
        setTimeout(handleInput, 0);
      });

      setHintVisible(true);
    }

    return {
      init: init,
      onTextChange: function (fn) {
        listeners.push(fn);
        return function unsubscribe() {
          listeners = listeners.filter(function (x) {
            return x !== fn;
          });
        };
      },
      getText: function () {
        return last;
      },
      setText: function (text) {
        init();
        dom.input.value = String(text || "");
        handleInput();
      },
      clearText: function () {
        init();
        dom.input.value = "";
        handleInput();
      },
      _normalize: normalize,
    };
  })();
})();

