2026-04-10

A00

## Appendix: local Playwright test harness and self-validation task for Codex

The current final iteration is preserved and considered good enough to keep as the working base. This next task is not a redesign task. This is a testing and validation task.

Codex must now switch into infrastructure and verification mode. Its job is to understand the current execution environment, install the required browser automation tooling, build a local test harness around the existing static site, and use that harness to test its own output. The main purpose is to create a reliable ad hoc browser-based validation setup that can be improved over time.

B00

## First objective

Codex must first determine where it is running and what is already available in the environment.

Before changing anything, Codex should inspect and log at least the following:

current working directory
OS and distribution details
available shell tools
Node.js version, if installed
npm version, if installed
Python version, if installed
whether apt-get is available
whether Google Chrome or Chromium is already present
whether any local server tooling already exists in the project
whether the website is a static site and what its entry point is

Codex should not assume the environment. It should inspect it first and record what it found in a simple, readable setup summary.

C00

## Core requirement

Codex must install and configure a Playwright-based browser testing setup using Node.js and JavaScript. The browser target for this harness is Chrome only. The browser must run in headless mode, but the browser context must be configured to mimic a realistic desktop user environment with a 1920 by 1080 viewport.

The harness must support the following:

launching the browser reliably
starting or attaching to a local server that serves the current site
opening the site
collecting logs and screenshots
interacting with the page
describing the page through a page-object-style abstraction
validating core functionality
cleaning up the browser and any related processes afterward

D00

## Installation and setup policy

Codex may use apt-get for system-level dependencies and npm for project dependencies. Codex should prefer a straightforward local Node.js project structure and keep the harness maintainable.

Codex should install whatever is necessary for this harness to work, but it should do so with basic discipline. It should avoid unnecessary packages and keep the setup focused.

At minimum, Codex should ensure the availability of:

Node.js and npm, if not already installed
Playwright for Node.js
a Chrome-compatible browser installation suitable for Playwright use
a lightweight local HTTP server approach for serving the site, if the project does not already have one

If Google Chrome is not available, Codex should install it or install a Chrome-compatible browser in a way that is explicit and documented. The intended target is Chrome-style automation, not a vague multi-browser setup.

E00

## Browser process management requirement

Codex must be careful and explicit about browser process cleanup.

The user has stated that Codex is the only thing that will be running Chrome in this environment. That means Codex may safely clean up Chrome-related processes if needed for reliable test runs. Codex should still do this carefully and deliberately.

Codex should implement the harness so that it attempts normal shutdown first. If Chrome or related automation processes do not close properly, Codex should be prepared to detect and terminate them. Cleanup behavior should be part of the harness design, not an afterthought.

The harness should try to leave the environment clean after a run. If cleanup fails, it should log that clearly.

F00

## Server setup requirement

Codex must start a local server so the static site can be exercised like a real website rather than by directly opening files in a browser tab.

Codex may use a simple Node.js-based static server. If the project already includes a good way to serve the site locally, Codex may reuse it. Otherwise, it should add a simple server entry point.

The server logic should include:

choosing a port
starting the server
waiting until the server is reachable
passing the base URL into the tests
shutting the server down after tests complete

Codex should not assume the server is ready instantly. It should wait until the server responds successfully before launching tests.

G00

## Test harness structure

Codex should create a separate testing area inside the project rather than scattering test logic randomly.

A good structure would include a dedicated folder for browser tests, support utilities, page objects, logs, and screenshots. The naming can vary, but the organization should be clear.

A suitable structure might contain:

a Playwright configuration file
a test folder
a page-objects folder
a utilities folder
a screenshots folder
a logs folder
a scripts folder for setup, cleanup, and server orchestration

The structure should support growth over time. This is not just one script. It should be a small test harness.

H00

## Required logging and telemetry

The harness must produce useful logging. The purpose is not only pass or fail. The purpose is observability.

Codex should log at least:

environment summary
browser launch parameters
server start and stop events
test start and end
page navigation events
console errors from the page
network failures if practical
high-level actions taken during the test
key assertions and their outcomes
cleanup status

The harness should also capture screenshots at meaningful points. At minimum, it should capture:

initial page load
after the app appears ready
after one or more key interactions
failure state if a test assertion fails

If useful, Codex may also capture a trace or additional telemetry artifacts, but that is optional unless it meaningfully improves debugging.

I00

## Page-object requirement

Codex should describe the site as a page object, or a small set of page objects, rather than writing a long pile of raw selectors in a single test file.

The page object should model the important parts of the application such as:

top-level navigation or hero area
filters
catalog or problem list
selected problem detail area
progression map or SVG
topic guide links if present
solved-state controls if present

The page object should provide readable methods for common actions and state checks, such as opening the site, selecting a problem, applying a filter, reading the selected title, verifying that details updated, checking whether a selected state is visible, and taking a named screenshot.

This should be treated as a maintainable testing abstraction, not just a one-off helper.

J00

## First testing objective

The first job of the harness is to test Codex's own output. That means the first implemented tests should validate the current site at a practical end-to-end level.

The initial tests should at minimum verify:

the site loads successfully from the local server
the main application renders without obvious fatal errors
the catalog appears
a problem can be selected
the detail panel updates to reflect the selected problem
key visible content exists in the selected detail
the progression map or other major navigation structure renders
one or more filters can be used
filtering affects visible content in some expected way
screenshots can be captured successfully

If the site includes solved-state persistence, topic guide navigation, or repository-coverage elements, Codex should test those too.

K00

## Validation mindset

Codex should not implement the harness and then stop. It should run the harness against the current site and use the results to validate whether the product is actually functioning.

The harness should be treated as a practical self-check tool. If the test reveals that something is broken, unclear, missing, or unreliable, Codex should log that result clearly. If something obvious is missing from the harness after the first run, Codex should improve the harness.

This task should therefore include both creation and use of the harness.

L00

## Improvement-over-time expectation

This harness is intended to improve over time. Codex should build it so that additional tests can be added later without rewriting the whole thing.

Codex should also notice obvious missing pieces during implementation. For example, if screenshot naming is weak, make it better. If log output is too thin, improve it. If cleanup is unreliable, strengthen it. If server startup is fragile, make it more robust.

The right mindset is to build a useful local testing foundation, not just to barely satisfy a single-run script requirement.

M00

## Runtime requirements

The browser must run headless. The viewport must be configured to 1920 by 1080. The setup should resemble a normal desktop browser session as much as practical for this purpose.

Codex should define the browser launch explicitly and not rely on vague defaults. If it uses a persistent context or a custom executable path, that should be done intentionally and clearly.

If the site needs a wait strategy, Codex should use reliable waits based on rendered content, server readiness, or stable selectors, not arbitrary sleep-heavy behavior.

N00

## Cleanup requirements

At the end of a successful or failed run, Codex should attempt to cleanly shut down:

the browser instance
the browser context
the local server process
any extra Chrome processes it started or any leftover Chrome automation processes that failed to close properly

Cleanup should run even on failure where possible. If a process has to be force-killed, Codex should note that in logs.

O00

## Output artifacts

After implementing and running the harness, Codex should produce a clear record of what it created and what happened.

Useful artifacts include:

the test code
the Playwright configuration
page object definitions
setup and cleanup scripts
screenshots
log files
a short README or usage note for how to run the harness again

The project should remain easy to understand for a human reading it later.

P00

## Suggested implementation order

Codex should work in this order unless it finds a clearly better one.

First inspect the environment.
Then verify Node.js and package tooling.
Then install required dependencies.
Then ensure Chrome or a Chrome-compatible browser is available.
Then add or confirm a local static server.
Then create the Playwright configuration.
Then create page objects.
Then write the first validation tests.
Then add logging and screenshot capture.
Then run the harness against the current site.
Then improve anything obviously weak.
Then verify cleanup behavior.

Q00

## What Codex should tell itself while doing this

Codex should think of this as building a local browser-based validation rig for its own generated product. It should behave like an engineer setting up a practical verification environment, not like a model writing a toy sample.

The goal is not abstract testing purity. The goal is a useful, local, ad hoc but maintainable test harness that can open the site, inspect it, click it, log what happened, capture screenshots, and tell whether the current output is actually working.

R00

## Acceptance criteria

This task is complete only if all of the following are true.

Codex inspected and summarized the execution environment.
Codex installed the required software using apt-get and npm as needed.
Codex created a Node.js and JavaScript Playwright-based test harness.
The harness launches Chrome in headless mode with a 1920 by 1080 viewport.
The harness starts a local server for the site.
The harness models the page through a page-object-style abstraction.
The harness logs useful telemetry and captures screenshots.
The harness runs at least an initial validation flow against the current site.
The harness attempts proper cleanup of browser and server processes.
The harness leaves behind a maintainable structure that can be extended later.

S00

## Direct task statement for Codex

The current final website iteration is preserved and considered good. Do not redesign it in this task. Instead, figure out the current environment, install the required browser automation stack, create a Node.js and JavaScript Playwright harness using Chrome in headless mode at 1920 by 1080, start a local server for the site, build page objects, add logging and screenshots, run the harness against the current site, validate that the app works, and clean up browser and server processes properly. Improve the harness where needed during implementation so it becomes a useful local testing foundation rather than a throwaway script.
