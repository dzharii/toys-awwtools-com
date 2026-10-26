(function () {
  'use strict';

  lpLog.initFromSettings();

  interface SettingOption {
    value: string | number | boolean;
    label?: string | number | boolean;
  }

  interface SettingDefinition {
    keyPath: string;
    debugName: string;
    label: string;
    description: string;
    type?: string;
    defaultValue?: unknown;
    value?: unknown;
    allowedValues?: Array<string | number | boolean>;
    options?: SettingOption[];
    min?: number;
    max?: number;
    step?: number | string;
    unit?: string;
    uiControl: string;
  }

  interface SettingsCategory {
    label: string;
    description?: string;
    order?: number;
    settings?: SettingDefinition[];
  }

  interface SettingsDocument extends Record<string, unknown> {
    categories?: SettingsCategory[];
  }

  interface SnoozeValue {
    presetMinutes: number;
    untilEpochMs: number | null;
  }

  function requireElement<T extends HTMLElement>(id: string, ctor: { new(): T }): T {
    const element = document.getElementById(id);
    if (!(element instanceof ctor)) {
      throw new Error(`Missing required settings element: ${id}`);
    }
    return element;
  }

  type SettingsPageDocument = SettingsDocument;

  let currentDoc: SettingsPageDocument | null = null;
  const root = requireElement('settings-root', HTMLElement);
  const globalResetButton = document.getElementById('global-reset');

  document.addEventListener('DOMContentLoaded', init);

  async function init() {
    try {
      lpLog.info('[settings] Attempting to initialize settings page UI');
      currentDoc = await lpSettings.loadSettingsDocument() as SettingsPageDocument;
      lpLog.setLevelFromSettingsDocument(currentDoc);
      render();
      if (globalResetButton) {
        globalResetButton.addEventListener('click', handleGlobalReset);
      }
      root.setAttribute('aria-busy', 'false');
      lpLog.info('[settings] Initialized settings page UI', {
        categoryCount: Array.isArray(currentDoc.categories) ? currentDoc.categories.length : 0
      });
    } catch (error) {
      lpLog.error('[settings] Failed to initialize settings page UI', {
        reason: error instanceof Error ? error.message : String(error)
      });
      root.textContent = 'Failed to load settings.';
      root.setAttribute('aria-busy', 'false');
    }
  }

  function render() {
    if (!currentDoc) return;
    root.innerHTML = '';

    const categories = [...(currentDoc.categories || [])].sort((a, b) => {
      const orderA = typeof a.order === 'number' ? a.order : Number.MAX_SAFE_INTEGER;
      const orderB = typeof b.order === 'number' ? b.order : Number.MAX_SAFE_INTEGER;
      return orderA - orderB;
    });

    categories.forEach((category) => {
      const categoryEl = document.createElement('section');
      categoryEl.className = 'category';

      const title = document.createElement('h2');
      title.className = 'category-title';
      title.textContent = category.label;
      categoryEl.appendChild(title);

      if (category.description) {
        const desc = document.createElement('p');
        desc.className = 'category-description';
        desc.textContent = category.description;
        categoryEl.appendChild(desc);
      }

      (category.settings || []).forEach((setting) => {
        categoryEl.appendChild(renderSettingRow(setting));
      });

      root.appendChild(categoryEl);
    });
  }

  function renderSettingRow(setting: SettingDefinition): HTMLElement {
    const row = document.createElement('div');
    row.className = 'setting-row';

    const meta = document.createElement('div');
    meta.className = 'setting-meta';

    const label = document.createElement('p');
    label.className = 'setting-label';
    label.textContent = setting.label;
    meta.appendChild(label);

    const debug = document.createElement('p');
    debug.className = 'setting-debug';
    debug.textContent = setting.debugName;
    meta.appendChild(debug);

    const description = document.createElement('p');
    description.className = 'setting-description';
    description.textContent = setting.description;
    meta.appendChild(description);

    const control = document.createElement('div');
    control.className = 'setting-control';

    const actions = document.createElement('div');
    actions.className = 'setting-actions';

    const resetBtn = document.createElement('button');
    resetBtn.className = 'lp-button';
    resetBtn.textContent = 'Reset';
    resetBtn.title = 'Reset to default';
    resetBtn.addEventListener('click', async () => {
      await resetSetting(setting.keyPath);
      render();
    });
    actions.appendChild(resetBtn);

    const controlNode = createControl(setting);
    if (controlNode) {
      control.appendChild(controlNode);
    }
    control.appendChild(actions);

    row.appendChild(meta);
    row.appendChild(control);

    return row;
  }

  function createControl(setting: SettingDefinition): HTMLElement {
    const type = setting.uiControl;
    if (!currentDoc) {
      throw new Error('Settings document has not been loaded.');
    }
    const effectiveValue = lpSettings.getEffectiveValue(currentDoc, setting.keyPath);

    if (type === 'checkbox') {
      const wrapper = document.createElement('label');
      wrapper.style.display = 'flex';
      wrapper.style.alignItems = 'center';
      wrapper.style.gap = '8px';

      const input = document.createElement('input');
      input.type = 'checkbox';
      input.checked = Boolean(effectiveValue);
      input.setAttribute('aria-label', setting.label);
      if (setting.keyPath === 'miniWebBrowser.autoApplyReaderMode') {
        input.dataset.testid = 'settings-mini-web-browser-checkbox-auto-reader-mode';
      }
      if (setting.keyPath === 'privacySecurity.autoRemoveTrackingParams') {
        input.dataset.testid = 'settings-privacy-security-checkbox-auto-remove-tracking-params';
      }
      input.addEventListener('change', async () => {
        await updateSetting(setting, input.checked);
        render();
      });

      wrapper.appendChild(input);
      wrapper.appendChild(document.createTextNode('Enabled'));
      return wrapper;
    }

    if (type === 'number') {
      const wrapper = document.createElement('div');
      wrapper.style.display = 'flex';
      wrapper.style.alignItems = 'center';
      wrapper.style.gap = '6px';

      const input = document.createElement('input');
      input.type = 'number';
      input.className = 'lp-input';
      input.value = String(effectiveValue ?? '');
      if (typeof setting.min === 'number') input.min = String(setting.min);
      if (typeof setting.max === 'number') input.max = String(setting.max);
      if (typeof setting.step === 'number' || typeof setting.step === 'string') input.step = String(setting.step);

      const error = document.createElement('div');
      error.className = 'setting-error';
      error.style.display = 'none';

      const handleChange = async () => {
        const raw = input.value;
        const parsed = Number(raw);
        if (Number.isNaN(parsed)) {
          input.classList.add('lp-error');
          error.textContent = 'Enter a number';
          error.style.display = 'block';
          return;
        }

        let next = parsed;
        if (typeof setting.min === 'number') next = Math.max(setting.min, next);
        if (typeof setting.max === 'number') next = Math.min(setting.max, next);

        if (next !== parsed) {
          input.value = String(next);
        }

        input.classList.remove('lp-error');
        error.style.display = 'none';
        await updateSetting(setting, next);
        render();
      };

      input.addEventListener('change', handleChange);
      input.addEventListener('blur', handleChange);

      wrapper.appendChild(input);
      if (setting.unit) {
        const unit = document.createElement('span');
        unit.className = 'unit';
        unit.textContent = setting.unit;
        wrapper.appendChild(unit);
      }

      const controlWrapper = document.createElement('div');
      controlWrapper.appendChild(wrapper);
      controlWrapper.appendChild(error);
      return controlWrapper;
    }

    if (type === 'radio' && Array.isArray(setting.allowedValues)) {
      const group = document.createElement('div');
      group.className = 'lp-radio-group';
      setting.allowedValues.forEach((value) => {
        const option = document.createElement('label');
        const input = document.createElement('input');
        input.type = 'radio';
        input.name = setting.keyPath;
        input.value = String(value);
        input.checked = value === effectiveValue;
        input.addEventListener('change', async () => {
          await updateSetting(setting, value);
          render();
        });
        option.appendChild(input);
        option.appendChild(document.createTextNode(String(value)));
        group.appendChild(option);
      });
      return group;
    }

    if (type === 'select') {
      const select = document.createElement('select');
      select.className = 'lp-input';
      const options = Array.isArray(setting.options) && setting.options.length
        ? setting.options
        : (setting.allowedValues || []).map((value) => ({ value, label: value }));
      options.forEach((opt) => {
        const optionEl = document.createElement('option');
        optionEl.value = String(opt.value);
        optionEl.textContent = opt.label !== undefined ? String(opt.label) : String(opt.value);
        optionEl.selected = opt.value === effectiveValue;
        select.appendChild(optionEl);
      });
      select.addEventListener('change', async () => {
        await updateSetting(setting, select.value);
        render();
      });
      return select;
    }

    if (type === 'snooze') {
      const wrapper = document.createElement('div');
      wrapper.className = 'snooze-control';

      const select = document.createElement('select');
      select.className = 'lp-input';
      const options = Array.isArray(setting.options) && setting.options.length
        ? setting.options
        : [];
      options.forEach((opt) => {
        const optionEl = document.createElement('option');
        optionEl.value = String(opt.value);
        optionEl.textContent = opt.label !== undefined ? String(opt.label) : String(opt.value);
        select.appendChild(optionEl);
      });

      const normalized = normalizeSnoozeValue(effectiveValue, setting.defaultValue);
      select.value = String(normalized.presetMinutes);

      select.addEventListener('change', async () => {
        const minutes = Number.parseInt(select.value, 10);
        const next = {
          presetMinutes: Number.isFinite(minutes) ? minutes : normalized.presetMinutes,
          untilEpochMs: normalized.untilEpochMs
        };
        await updateSetting(setting, next);
        render();
      });

      const snoozeBtn = document.createElement('button');
      snoozeBtn.className = 'lp-button';
      snoozeBtn.textContent = 'Snooze';
      snoozeBtn.addEventListener('click', async () => {
        const minutes = Number.parseInt(select.value, 10);
        const presetMinutes = Number.isFinite(minutes) ? minutes : normalized.presetMinutes;
        const untilEpochMs = Date.now() + presetMinutes * 60 * 1000;
        const next = {
          presetMinutes,
          untilEpochMs
        };
        await updateSetting(setting, next);
        render();
      });

      const status = document.createElement('div');
      status.className = 'snooze-status';
      const untilMs = Number(normalized.untilEpochMs);
      if (Number.isFinite(untilMs) && untilMs > Date.now()) {
        const remainingMinutes = Math.max(1, Math.ceil((untilMs - Date.now()) / 60000));
        status.textContent = `Snoozed until ${new Date(untilMs).toLocaleString()} (${remainingMinutes} min left)`;
      } else {
        status.textContent = 'Not snoozed';
      }

      const controlRow = document.createElement('div');
      controlRow.className = 'snooze-row';
      controlRow.appendChild(select);
      controlRow.appendChild(snoozeBtn);

      wrapper.appendChild(controlRow);
      wrapper.appendChild(status);
      return wrapper;
    }

    if (type === 'text') {
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'lp-input';
      input.value = typeof effectiveValue === 'string' ? effectiveValue : '';
      input.addEventListener('change', async () => {
        const val = input.value;
        await updateSetting(setting, val === '' ? null : val);
        render();
      });
      return input;
    }

    const fallback = document.createElement('span');
    fallback.textContent = String(effectiveValue ?? '');
    return fallback;
  }

  function normalizeSnoozeValue(value: unknown, defaultValue: unknown): SnoozeValue {
    const fallback: SnoozeValue = defaultValue && typeof defaultValue === 'object'
      ? {
        presetMinutes: Number((defaultValue as Partial<SnoozeValue>).presetMinutes ?? 5),
        untilEpochMs: (defaultValue as Partial<SnoozeValue>).untilEpochMs ?? null
      }
      : { presetMinutes: 5, untilEpochMs: null } as SnoozeValue;
    const normalized = value && typeof value === 'object' ? value as Partial<SnoozeValue> : fallback;
    const fallbackPresetMinutes = Number.isFinite(Number(fallback.presetMinutes)) ? Number(fallback.presetMinutes) : 5;
    return {
      presetMinutes: Number.isFinite(Number(normalized.presetMinutes)) ? Number(normalized.presetMinutes) : fallbackPresetMinutes,
      untilEpochMs: Number.isFinite(Number(normalized.untilEpochMs)) ? Number(normalized.untilEpochMs) : null
    };
  }

  async function updateSetting(setting: SettingDefinition, value: unknown): Promise<void> {
    lpLog.info('[settings] Attempting to change setting', {
      keyPath: setting.keyPath,
      control: setting.uiControl || ''
    });
    try {
      await lpSettings.setSetting(setting.keyPath, value);
      currentDoc = await lpSettings.loadSettingsDocument(true) as SettingsPageDocument;
      lpLog.info('[settings] Changed setting', {
        keyPath: setting.keyPath,
        loggingLevelChanged: setting.keyPath === 'logging.level'
      });
    } catch (error) {
      lpLog.error('[settings] Failed to change setting', {
        keyPath: setting.keyPath,
        reason: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  async function resetSetting(keyPath: string): Promise<void> {
    lpLog.info('[settings] Attempting to reset setting', {
      keyPath
    });
    try {
      await lpSettings.resetSetting(keyPath);
      currentDoc = await lpSettings.loadSettingsDocument(true) as SettingsPageDocument;
      lpLog.info('[settings] Reset setting', {
        keyPath
      });
    } catch (error) {
      lpLog.error('[settings] Failed to reset setting', {
        keyPath,
        reason: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  async function handleGlobalReset() {
    const confirmed = window.confirm('Reset all settings to their default values? Bookmarks are not affected.');
    if (!confirmed) {
      lpLog.warn('[settings] Canceled reset all settings');
      return;
    }
    lpLog.info('[settings] Attempting to reset all settings');
    try {
      await lpSettings.resetAllSettings();
      currentDoc = await lpSettings.loadSettingsDocument(true) as SettingsPageDocument;
      render();
      lpLog.info('[settings] Reset all settings');
    } catch (error) {
      lpLog.error('[settings] Failed to reset all settings', {
        reason: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }
})();
