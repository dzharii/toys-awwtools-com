(() => {
  const initTabs = (root) => {
    const tabs = Array.from(root.querySelectorAll('[role="tab"][data-tab]'));
    const panels = Array.from(root.querySelectorAll('[data-tab-panel]'));
    if (!tabs.length || !panels.length) {
      return;
    }

    const activate = (tab, shouldFocus = false) => {
      const name = tab.dataset.tab;
      tabs.forEach((btn) => {
        const isActive = btn === tab;
        btn.classList.toggle('bklt__tab--active', isActive);
        btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
        btn.tabIndex = isActive ? 0 : -1;
      });
      panels.forEach((panel) => {
        panel.hidden = panel.dataset.tabPanel !== name;
      });
      if (shouldFocus) {
        tab.focus();
      }
    };

    const initial = tabs.find((tab) => tab.classList.contains('bklt__tab--active')) || tabs[0];
    activate(initial);

    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => activate(tab, true));
      tab.addEventListener('keydown', (event) => {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
          return;
        }
        event.preventDefault();
        const direction = event.key === 'ArrowRight' ? 1 : -1;
        const nextIndex = (index + direction + tabs.length) % tabs.length;
        activate(tabs[nextIndex], true);
      });
    });
  };

  const initSegGroup = (group) => {
    const buttons = Array.from(group.querySelectorAll('[data-seg]'));
    const panels = Array.from(group.querySelectorAll('[data-seg-panel]'));
    if (!buttons.length || !panels.length) {
      return;
    }

    const activate = (button) => {
      const name = button.dataset.seg;
      buttons.forEach((btn) => {
        const isActive = btn === button;
        btn.classList.toggle('bklt__segBtn--active', isActive);
        btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });
      panels.forEach((panel) => {
        panel.hidden = panel.dataset.segPanel !== name;
      });
    };

    const initial = buttons.find((btn) => btn.classList.contains('bklt__segBtn--active')) || buttons[0];
    activate(initial);

    buttons.forEach((btn) => {
      btn.addEventListener('click', () => activate(btn));
    });
  };

  const initPressables = () => {
    const pressables = document.querySelectorAll('[data-press]');
    pressables.forEach((el) => {
      const labelEl = el.querySelector('[data-label]') || el;
      const defaultLabel = labelEl.textContent.trim();
      el.dataset.defaultLabel = defaultLabel;
      if (el.matches('button, [role="button"]')) {
        el.setAttribute('aria-pressed', 'false');
      }

      const togglePressed = () => {
        const pressed = el.classList.toggle('is-pressed');
        if (el.matches('button, [role="button"]')) {
          el.setAttribute('aria-pressed', pressed ? 'true' : 'false');
        }
        const pressedLabel = el.getAttribute('data-press-label');
        if (pressedLabel) {
          labelEl.textContent = pressed ? pressedLabel : el.dataset.defaultLabel;
        }
      };

      el.addEventListener('click', togglePressed);
      if (el.getAttribute('role') === 'button') {
        el.addEventListener('keydown', (event) => {
          if (event.key !== 'Enter' && event.key !== ' ') {
            return;
          }
          event.preventDefault();
          togglePressed();
        });
      }
    });
  };

  document.querySelectorAll('[data-tabs]').forEach(initTabs);
  document.querySelectorAll('[data-seg-group]').forEach(initSegGroup);
  initPressables();
})();
