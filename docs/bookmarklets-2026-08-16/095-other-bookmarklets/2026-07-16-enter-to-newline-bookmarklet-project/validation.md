---

A00 Validation Summary

---

The 1.0.0 source passed JavaScript syntax validation with Node.js, package consistency validation with the included static validation script, and behavioral validation in headless Chromium.

---

B00 Browser Behaviors Verified

---

The browser harness verified panel creation, open Shadow DOM isolation, textarea newline insertion, input-event dispatch, form submission through Ctrl+Enter, contenteditable newline insertion, ambiguous send-control rejection, cleanup through the panel, controller removal, unchanged Enter events after cleanup, reactivation after cleanup, and second-run toggle deactivation.

---

C00 Validation Artifacts

---

Machine-readable results are stored in `tests/validation-results.json`. The executable browser harness is stored in `tests/browser-test.html`. Package consistency checks are stored in `tests/static-validation.mjs`.

The browser test is a controlled page harness. It does not replace manual verification against future ChatGPT interface changes or third-party custom editors.
