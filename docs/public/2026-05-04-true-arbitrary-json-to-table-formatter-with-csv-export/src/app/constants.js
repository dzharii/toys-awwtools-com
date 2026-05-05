export const APP_TITLE = "JSON Table Inspector";
export const APP_SUBTITLE = "Paste arbitrary JSON/JSONL. Detect row data. Inspect failures as table.";

export const STORAGE_KEY = "json-table-inspector.state.v1";
export const LOGGER_DEFAULT_LEVEL = "info";

export const DENSITY_VALUES = ["compact", "normal", "roomy"];
export const DEFAULT_DENSITY = "compact";

export const DEFAULT_LEFT_PANE_WIDTH_PERCENT = 38;
export const DEFAULT_RIGHT_TOP_HEIGHT_PX = 190;

export const MIN_LEFT_PANE_WIDTH_PX = 280;
export const MIN_RIGHT_PANE_WIDTH_PX = 420;
export const MIN_RIGHT_TOP_HEIGHT_PX = 120;
export const MIN_RIGHT_BOTTOM_HEIGHT_PX = 160;

export const PANE_GRIP_SIZE_PX = 10;

export const TABLE_QUICK_FILTERS = ["all", "issues", "failures", "warnings", "ok", "unknown"];
export const TABLE_RENDER_LIMIT = 1000;
export const TABLE_RENDER_CELL_LIMIT = 50000;

export const HEALTH_LEVELS = ["failure", "warning", "ok", "unknown"];
export const HEALTH_ORDER = {
  failure: 0,
  warning: 1,
  unknown: 2,
  ok: 3
};

export const COLUMN_ORDER_PRESETS = ["failureFirst", "coverageFirst", "originalOrder", "alphabetical"];

export const PERFORMANCE_LIMITS = {
  largeCharCount: 1_000_000,
  veryLargeCharCount: 5_000_000,
  largeRowCount: 5_000,
  veryLargeRowCount: 25_000,
  largeColumnCount: 200,
  veryLargeColumnCount: 1_000,
  renderRowLimit: TABLE_RENDER_LIMIT,
  renderCellLimit: TABLE_RENDER_CELL_LIMIT
};
