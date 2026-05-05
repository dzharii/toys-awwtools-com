function createWideRows() {
  const rows = [];
  for (let row = 0; row < 16; row += 1) {
    const item = {
      id: `wide-${row + 1}`,
      status: row % 5 === 0 ? "failed" : "complete",
      durationMs: 40 + row * 13,
      error: row % 5 === 0 ? { code: "E_TIMEOUT", message: "Timed out after retry." } : null
    };
    for (let column = 0; column < 86; column += 1) {
      const key = `metric_${String(column + 1).padStart(2, "0")}`;
      item[key] = row % 3 === 0 ? column : null;
    }
    rows.push(item);
  }
  return rows;
}

export const EXAMPLES = [
  {
    id: "root-array",
    title: "Root Array",
    description: "Simple root array with success and error fields.",
    kind: "json",
    text: JSON.stringify(
      [
        { id: "task-1", success: true, durationMs: 120 },
        { id: "task-2", success: false, error: { code: "E_TIMEOUT", message: "Timed out" }, durationMs: 1200 }
      ],
      null,
      2
    )
  },
  {
    id: "object-results",
    title: "Batch Results",
    description: "Object payload with metadata and results[] records.",
    kind: "json",
    text: JSON.stringify(
      {
        jobId: "batch-2026-05-04-a",
        startedAt: "2026-05-04T12:00:00Z",
        results: [
          { id: "a", status: "complete", success: true, durationMs: 88 },
          { id: "b", status: "failed", success: false, error: { code: "E_TIMEOUT", message: "Timed out" }, durationMs: 1331 },
          { id: "c", status: "warning", retryCount: 1, message: "retry used", durationMs: 240 }
        ],
        summary: { total: 3, failed: 1 }
      },
      null,
      2
    )
  },
  {
    id: "jsonl-logs",
    title: "JSONL Logs",
    description: "Line-based JSON records with level/status fields.",
    kind: "jsonl",
    text: [
      '{"timestamp":"2026-05-04T12:00:00Z","level":"info","message":"started","ok":true}',
      '{"timestamp":"2026-05-04T12:00:01Z","level":"error","message":"timeout contacting service","ok":false,"errorCode":"E_TIMEOUT"}',
      '{"timestamp":"2026-05-04T12:00:02Z","level":"warning","message":"retrying","retryCount":1}'
    ].join("\n")
  },
  {
    id: "nested-failures",
    title: "Nested Failures",
    description: "Nested data.items[] with summarized arrays and failure signals.",
    kind: "json",
    text: JSON.stringify(
      {
        data: {
          items: [
            {
              requestId: "req-1",
              status: "failed",
              attempts: [
                { n: 1, status: "timeout" },
                { n: 2, status: "timeout" }
              ],
              error: {
                code: "E_RETRY_EXHAUSTED",
                message: "All retries timed out"
              }
            },
            {
              requestId: "req-2",
              status: "complete",
              attempts: [{ n: 1, status: "ok" }]
            }
          ]
        }
      },
      null,
      2
    )
  },
  {
    id: "mixed-schema",
    title: "Mixed Schema",
    description: "Rows with missing/null/empty and mixed field types.",
    kind: "json",
    text: JSON.stringify(
      [
        { id: 1, status: "complete", result: { score: 0.98 } },
        { id: 2, status: "failed", error: null },
        { id: 3, ok: false, errors: [] },
        { id: 4, success: false, error: { message: "" } }
      ],
      null,
      2
    )
  },
  {
    id: "wide-records",
    title: "Wide Records",
    description: "Many columns to test visibility defaults and render caps.",
    kind: "json",
    text: JSON.stringify(createWideRows(), null, 2)
  },
  {
    id: "formula-export",
    title: "Formula Export",
    description: "Strings that look like spreadsheet formulas for export safety checks.",
    kind: "json",
    text: JSON.stringify(
      [
        { id: 1, note: '=IMPORTXML("http://bad")', success: true },
        { id: 2, note: "+cmd", success: false },
        { id: 3, note: "-10", success: true }
      ],
      null,
      2
    )
  }
];

