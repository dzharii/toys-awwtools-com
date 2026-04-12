const fs = require("fs");
const path = require("path");
const { ensureDir, sanitizeSegment } = require("./logger");

async function writeTestDiagnostic(testInfo, explorer, extra = {}) {
  const diagnosticsDir =
    process.env.BROWSER_TEST_DIAGNOSTICS_DIR ||
    path.join(process.cwd(), "browser-tests", "artifacts", "diagnostics");
  ensureDir(diagnosticsDir);
  const filePath = path.join(diagnosticsDir, `${sanitizeSegment(testInfo.title)}.json`);
  const snapshot = explorer ? await explorer.collectSnapshot().catch(() => ({})) : {};
  const payload = {
    title: testInfo.title,
    status: testInfo.status,
    expectedStatus: testInfo.expectedStatus,
    duration: testInfo.duration,
    snapshot,
    ...extra,
  };
  fs.writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  return filePath;
}

module.exports = {
  writeTestDiagnostic,
};
