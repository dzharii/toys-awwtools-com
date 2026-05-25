---

A00 AGENTS.md

---

!!! DIRECTIVE: READ AND REMEMBER: WORK_PROTOCOL_V001.md
!!! DIRECTIVE: ON After Session compaction, re-read AGNETS.md and WORK_PROTOCOL_V001.md
!!! DIRECTIVE: Use WORK_PROTOCOL_CHECKLIST_V001.md to get quick protocol reminder. 

!!! DIRECTIVE: USE browser use to communicate with chatgpt.
!!! DIRECTIVE: ALWAYS use chrome browser for browser use. The connection between codex and google chrome is established via installed extension.

!!! DIRECTIVE: When asking ChatGPT or ChatGPT image generation software to create raster image assets, sprites, icons, cutouts, atlases, or textures that require transparency, Codex must explicitly instruct it to use true alpha transparency in the output PNG files. Codex must explicitly warn in the prompt that fake transparency is a common problem with the tool output: the tool often renders checkerboard or solid backgrounds that only look transparent but are not real alpha. Codex must ask for actual transparent pixels outside the subject, no checkerboard background, no white/gray placeholder background, and no simulated transparency pattern.

You are allowed to stop only when you see that the error is critical and unfixable after 3 or 5 attempts to prevent wasting the resources. Clearly report error to the user. 
Otherwise, you are expected to not to stop until the project is implemented completely and until you can go work autonomously.


Directive: Codex must maintain one primary ChatGPT conversation for the entire project workflow. 
After Codex creates or opens the initial ChatGPT chat, 
Codex must capture and save the current ChatGPT chat URL, 
including its conversation UUID when present, in the local project artifacts. 
If the browser session is interrupted, the page crashes, the tab is closed, 
or Codex needs to recover context later, 
Codex may open a new browser tab, but it must reopen the saved chat URL instead of starting a new ChatGPT conversation. 
The purpose is to preserve the shared planning context across research, brainstorming, specification writing, review, and final implementation planning. 
Codex must treat the saved ChatGPT URL as part of the project state, and must only start a new ChatGPT conversation if the saved conversation is technically inaccessible; 
in that case, Codex must document the failure, summarize the existing saved artifacts into the new chat, save the new chat URL, and continue from there.



# AGENTS.md

## ChatGPT Computer-Use Relay Protocol

This file defines the required workflow for using Codex computer use to ask ChatGPT for project help, retrieve ChatGPT's answer, persist the answer into the project, and continue work from that answer.

Codex must follow this file exactly when the user asks Codex to "ask ChatGPT", "check with ChatGPT", "use ChatGPT", "get ChatGPT's answer", "ask the ChatGPT app", "ask the browser ChatGPT", or gives any equivalent instruction.

This workflow exists because Codex does not have direct API access to the user's configured ChatGPT environment, including ChatGPT memory, custom instructions, project context, UI-only features, connected apps, or other ChatGPT-side configuration. Codex must therefore use computer use as a controlled UI relay.

Codex is an OpenAI coding agent for writing, reviewing, and shipping code. OpenAI also documents browser/computer-use style agent workflows where login or browser control may require user takeover, so this protocol must assume the ChatGPT UI can change and must validate controls before relying on cached selectors or labels. 


---

B00 Purpose

---


## Purpose

The purpose of this protocol is to create a repeatable handshake between Codex and ChatGPT through the ChatGPT user interface.

The required outcome is:

1. Codex opens ChatGPT using computer use.
2. Codex validates that it can create or access a chat.
3. Codex sends a deterministic test message.
4. Codex verifies that ChatGPT replies with the exact expected deterministic content.
5. Codex discovers how to copy the full assistant reply.
6. Codex stores discovered UI control information in the project cache.
7. Codex sends the real user-requested prompt to ChatGPT.
8. Codex copies the full ChatGPT answer.
9. Codex writes the copied answer to a timestamped file under the project-local tmp folder.
10. Codex reads the saved answer file.
11. Codex uses the saved answer as source material for the project task.
12. Codex updates cache metadata when UI controls, labels, copy behavior, or workflow assumptions change.

Codex must not treat the ChatGPT UI as stable. Codex must treat all UI labels, button locations, menu shapes, keyboard shortcuts, selectors, accessibility names, and DOM structure as volatile.


---

C00 Trigger Conditions

---


## Trigger Conditions

Codex must initiate this protocol when the user instruction contains an explicit or implied request to consult ChatGPT.

Examples that must trigger this protocol:

"Ask ChatGPT to write the specification."

"Ask ChatGPT what it remembers about this."

"Use ChatGPT to draft the content."

"Check with ChatGPT and bring the answer back."

"Ask the browser ChatGPT."

"Use computer use to ask ChatGPT."

"Get ChatGPT's answer and continue."

"Ask ChatGPT to perform this task."

Codex must not initiate this protocol for normal code edits, repo inspection, local tests, formatting, linting, or other tasks that do not require ChatGPT.

If the user instruction is ambiguous but contains "ChatGPT", Codex must assume this protocol is required unless the user clearly means documentation about ChatGPT rather than using ChatGPT.


---

D00 Required Project Folders

---


## Required Project Folders

Codex must create the following project-local folders before using this workflow:

.tmp/chatgpt-relay

.cache/chatgpt-relay

Codex must not write relay artifacts outside the project root unless the user explicitly instructs otherwise.

Codex must not use the operating system temp folder for relay answer files.

Codex must not store copied ChatGPT answers only in memory. Every copied ChatGPT answer must be persisted to a timestamped file before Codex analyzes or uses it.


---

E00 Required Files

---


## Required Files

Codex must maintain these files:

.cache/chatgpt-relay/controls.json

.cache/chatgpt-relay/session.json

.cache/chatgpt-relay/last-handshake.json

.cache/chatgpt-relay/failures.jsonl

.tmp/chatgpt-relay/YYYY-MM-DD_HH-mm-ss_chatgpt-reply.md

.tmp/chatgpt-relay/YYYY-MM-DD_HH-mm-ss_chatgpt-prompt.md

.tmp/chatgpt-relay/YYYY-MM-DD_HH-mm-ss_clipboard.txt

Codex may create additional diagnostic files only when useful.

Every cache file must contain a top-level `collectedAt` timestamp in ISO 8601 format.

Every cache file must contain a top-level `schemaVersion`.

Every cache file must contain enough information for a future Codex run to decide whether the cache can be reused.


---

F00 Cache Schema

---


## Cache Schema

The controls cache must use this shape:

{
  "schemaVersion": 1,
  "collectedAt": "2026-05-23T00:00:00.000Z",
  "chatgptUrl": "https://chatgpt.com/",
  "browser": {
    "name": "string",
    "version": "string or unknown",
    "platform": "string or unknown"
  },
  "controls": {
    "newChat": {
      "status": "working | missing | stale | unknown",
      "lastKnownLabel": "string or null",
      "lastKnownRole": "string or null",
      "lastKnownLocationHint": "string or null",
      "activationMethod": "click | keyboard | direct-url | unknown",
      "validatedAt": "ISO timestamp or null",
      "notes": "string"
    },
    "messageInput": {
      "status": "working | missing | stale | unknown",
      "lastKnownLabel": "string or null",
      "lastKnownPlaceholder": "string or null",
      "lastKnownRole": "string or null",
      "activationMethod": "click | keyboard | unknown",
      "submitMethod": "Enter | Ctrl+Enter | button | unknown",
      "validatedAt": "ISO timestamp or null",
      "notes": "string"
    },
    "sendButton": {
      "status": "working | missing | stale | unknown",
      "lastKnownLabel": "string or null",
      "lastKnownRole": "string or null",
      "lastKnownLocationHint": "string or null",
      "validatedAt": "ISO timestamp or null",
      "notes": "string"
    },
    "assistantMessage": {
      "status": "working | missing | stale | unknown",
      "lastKnownRole": "string or null",
      "lastKnownContainerHint": "string or null",
      "completionDetectionMethod": "stop-button-disappears | text-stabilizes | copy-button-appears | unknown",
      "validatedAt": "ISO timestamp or null",
      "notes": "string"
    },
    "copyAssistantMessage": {
      "status": "working | missing | stale | unknown",
      "lastKnownLabel": "string or null",
      "lastKnownRole": "string or null",
      "lastKnownLocationHint": "string or null",
      "activationMethod": "visible-button | hover-button | context-menu | keyboard | unknown",
      "validatedAt": "ISO timestamp or null",
      "notes": "string"
    }
  },
  "cachePolicy": {
    "maxAgeHours": 168,
    "forceRevalidateOnFailure": true,
    "reuseIfYoungerThanHours": 24,
    "revalidateIfOlderThanHours": 168
  }
}

The session cache must use this shape:

{
  "schemaVersion": 1,
  "collectedAt": "2026-05-23T00:00:00.000Z",
  "lastUsableChatUrl": "string or null",
  "lastHandshakeStatus": "passed | failed | unknown",
  "lastHandshakeAt": "ISO timestamp or null",
  "lastSuccessfulReplyFile": "string or null",
  "notes": "string"
}

The handshake cache must use this shape:

{
  "schemaVersion": 1,
  "collectedAt": "2026-05-23T00:00:00.000Z",
  "testPrompt": "Reply with exactly: Hello world",
  "expectedReply": "Hello world",
  "actualReply": "string",
  "passed": true,
  "copyMethodUsed": "string",
  "replyFile": "string",
  "clipboardFile": "string",
  "notes": "string"
}

The failures log must be JSON Lines. Each line must use this shape:

{
  "schemaVersion": 1,
  "failedAt": "2026-05-23T00:00:00.000Z",
  "stage": "open-chatgpt | new-chat | send-test-message | wait-for-reply | copy-reply | dump-clipboard | validate-reply | send-real-message | save-real-reply | unknown",
  "error": "string",
  "observedUi": "string",
  "recoveryAttempted": "string",
  "resolved": false
}


---

G00 Timestamp Rules

---


## Timestamp Rules

Codex must use the current local system timestamp when naming files.

Codex must use file-friendly names.

Codex must use this filename format:

YYYY-MM-DD_HH-mm-ss_chatgpt-prompt.md

YYYY-MM-DD_HH-mm-ss_chatgpt-reply.md

YYYY-MM-DD_HH-mm-ss_clipboard.txt

Codex must not use characters that are invalid in Windows filenames.

Codex must include a timestamp inside every saved prompt and reply file.

Codex must include the source of the content inside every saved file.

A saved prompt file must begin with:

---
kind: chatgpt-relay-prompt
createdAt: 2026-05-23T00:00:00.000Z
source: codex
---

A saved reply file must begin with:

---
kind: chatgpt-relay-reply
createdAt: 2026-05-23T00:00:00.000Z
source: chatgpt-ui-copy
---

Codex must not overwrite an existing relay file.


---

H00 Handshake Test Message

---


## Handshake Test Message

Before sending a real project prompt to ChatGPT, Codex must validate the UI relay using this deterministic test prompt:

Reply with exactly: Hello world

Codex must expect this exact reply:

Hello world

The comparison must ignore leading and trailing whitespace.

The comparison must not ignore extra words.

The comparison must not ignore punctuation differences.

The comparison must not accept markdown wrapping.

The comparison must not accept quoted text.

The comparison must pass only if the normalized copied reply is exactly:

Hello world

If the handshake fails, Codex must not send the real project prompt yet.

If the handshake fails, Codex must attempt one rediscovery of the relevant control path.

If the second handshake fails, Codex must stop and report the failure to the user with the saved diagnostic file paths.


---

I00 Control Discovery

---


## Control Discovery

Codex must discover UI controls in this order:

1. Check .cache/chatgpt-relay/controls.json.
2. If controls.json exists and is younger than 24 hours, try cached controls first.
3. If cached controls work, update validatedAt timestamps.
4. If cached controls fail, mark the failed controls as stale.
5. Rediscover controls from the current UI.
6. Save rediscovered controls to controls.json.
7. Continue the handshake.
8. If rediscovery fails, write a failure entry and stop.

Codex must prefer stable semantic signals over visual location.

Preferred signals are:

1. Accessible role.
2. Accessible name.
3. Visible button label.
4. Placeholder text.
5. Keyboard behavior.
6. Relative location.
7. Visual icon shape.
8. Pixel location.

Codex must not rely only on absolute screen coordinates unless no other option exists.

If Codex must use a coordinate-based action, it must write that limitation into controls.json under notes.

If the ChatGPT UI changes, Codex must update controls.json during the same run.

Codex must not repeatedly rediscover controls when the cache is fresh and working.


---

J00 Opening ChatGPT

---


## Opening ChatGPT

Codex must open ChatGPT in the browser using computer use.

The preferred URL is:

https://chatgpt.com/

Codex must wait until the page is interactive.

Codex must detect whether the user is signed in.

If sign-in is required, Codex must stop and ask the user to complete sign-in manually.

Codex must not attempt to enter passwords, one-time codes, passkeys, recovery codes, or other credentials.

After the user completes sign-in, Codex may resume the workflow.

Codex must not store credentials in cache files.

Codex must not store authentication cookies, tokens, session storage, local storage, or browser profile data in project files.


---

K00 New Chat Creation

---


## New Chat Creation

For the handshake, Codex must use a new ChatGPT chat unless the user explicitly instructs it to reuse an existing chat.

Codex must find the new chat control.

Codex must activate the new chat control.

Codex must verify that the message input is available after creating the new chat.

If the new chat control is missing, Codex may attempt a direct URL navigation to ChatGPT's default new-chat page.

If that fails, Codex must mark the newChat control as missing or stale and stop.

After a successful new chat creation, Codex must update session.json with the current usable chat URL if the URL is available.


---

L00 Sending the Test Prompt

---


## Sending the Test Prompt

Codex must place this exact text into the ChatGPT message input:

Reply with exactly: Hello world

Codex must submit the prompt using the cached submit method if it is known and working.

If the cached submit method fails, Codex must rediscover the submit method.

Codex must wait for ChatGPT to finish responding.

Codex must not copy the reply while generation is still in progress.

Codex may detect completion by one of these methods:

1. A stop button disappears.
2. A send button reappears.
3. The assistant message text remains stable.
4. A copy button becomes available for the assistant message.

Codex must record the completion detection method in controls.json.


---

M00 Copying the Assistant Reply

---


## Copying the Assistant Reply

Codex must copy the entire assistant reply using the ChatGPT UI copy control when available.

Codex must prefer the assistant-message copy button over manual text selection.

Codex must not copy the whole page.

Codex must not copy the user's prompt.

Codex must not rely on partial visible text.

Codex must locate the copy control associated with the latest assistant message.

Codex must activate the copy control.

Codex must wait briefly for the clipboard to update.

Codex must then dump the clipboard to a project-local file.

On Windows PowerShell, Codex may use:

$Timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$Dir = Join-Path (Get-Location) ".tmp/chatgpt-relay"
New-Item -ItemType Directory -Force -Path $Dir | Out-Null
$ClipboardFile = Join-Path $Dir "$Timestamp`_clipboard.txt"
Get-Clipboard -Raw | Set-Content -LiteralPath $ClipboardFile -Encoding UTF8

Codex must then read the clipboard file back from disk.

Codex must validate that the clipboard content matches the expected reply during handshake.

If the clipboard is empty, stale, or does not contain the expected content, Codex must not proceed to the real prompt.


---

N00 Saving the Handshake Reply

---


## Saving the Handshake Reply

After copying the handshake reply, Codex must save it as a markdown file under:

.tmp/chatgpt-relay

The file must use this format:

YYYY-MM-DD_HH-mm-ss_chatgpt-reply.md

The file must include front matter.

The file must include the copied reply exactly as retrieved from the clipboard.

Codex must update last-handshake.json with:

1. The test prompt.
2. The expected reply.
3. The actual copied reply.
4. Whether the handshake passed.
5. The copy method used.
6. The reply file path.
7. The clipboard file path.
8. The timestamp.

Codex must update session.json after a successful handshake.


---

O00 Real Prompt Construction

---


## Real Prompt Construction

After the handshake passes, Codex may send the real user-requested task to ChatGPT.

Codex must construct the real prompt carefully.

The real prompt must include:

1. The user's requested task.
2. The relevant project context.
3. Any known constraints.
4. The desired output format.
5. A request for concise, directly usable output.
6. A warning not to invent project facts.
7. A request to ask clarifying questions only if necessary.

Codex must not include secrets, credentials, tokens, private keys, session cookies, or unrelated repository content.

Codex must not paste large files into ChatGPT unless the user explicitly asked for that and the content is necessary.

Codex must save the exact real prompt to:

.tmp/chatgpt-relay/YYYY-MM-DD_HH-mm-ss_chatgpt-prompt.md

Codex must send the exact same prompt that it saved.

If Codex edits the prompt after saving it, Codex must create a new prompt file instead of modifying the old one.


---

P00 Real Prompt Template

---


## Real Prompt Template

Use this template for the real ChatGPT prompt unless the user gives a more specific format:

You are helping with a software project. Use the information below and produce directly usable output.

Task:
<USER_REQUEST>

Project context:
<PROJECT_CONTEXT_SUMMARY>

Relevant files or snippets:
<RELEVANT_SNIPPETS>

Constraints:
<CONSTRAINTS>

Output requirements:
<OUTPUT_REQUIREMENTS>

Do not invent facts about the repository. If something is unknown, say it is unknown. Prefer actionable output. Avoid unnecessary preamble.

Return only the requested content.


---

Q00 Sending the Real Prompt

---


## Sending the Real Prompt

Codex must send the real prompt only after the handshake passes.

Codex may use the same ChatGPT chat used for the handshake unless the user requested a separate chat.

Codex must wait for the answer to complete.

Codex must copy only the latest assistant answer.

Codex must dump the clipboard to a timestamped clipboard file.

Codex must save the copied answer to:

.tmp/chatgpt-relay/YYYY-MM-DD_HH-mm-ss_chatgpt-reply.md

Codex must read the saved reply file before using the answer.

Codex must not rely only on visible UI text.

Codex must not paraphrase from memory when a saved answer file exists.

Codex must cite or reference the saved reply file in its own internal reasoning and project notes when using ChatGPT's answer.


---

R00 Answer Validation

---


## Answer Validation

After saving the real ChatGPT answer, Codex must validate the file before using it.

Codex must check:

1. The file exists.
2. The file is non-empty.
3. The file was created during the current run.
4. The file contains assistant answer content, not the user prompt.
5. The file does not contain only "Hello world".
6. The file does not contain obvious UI noise such as navigation labels only.
7. The file does not contain unrelated clipboard content.

If validation fails, Codex must attempt to copy the latest assistant message one more time.

If validation fails twice, Codex must stop and report the problem.

Codex must not continue with stale clipboard content.


---

S00 Cache Refresh Rules

---


## Cache Refresh Rules

Codex must use cached controls when all of these are true:

1. controls.json exists.
2. controls.json is valid JSON.
3. controls.json has schemaVersion 1.
4. controls.json has collectedAt.
5. controls.json is younger than 24 hours.
6. The cached control path succeeds during validation.

Codex must revalidate cached controls when any of these are true:

1. controls.json is older than 24 hours.
2. controls.json is missing required fields.
3. Any cached control fails.
4. The ChatGPT UI looks materially different.
5. The copy button cannot be found.
6. The handshake answer does not equal "Hello world".
7. The user explicitly asks to refresh the relay cache.

Codex must fully rediscover controls when any of these are true:

1. controls.json is older than 168 hours.
2. A required control is marked stale.
3. The page layout has changed.
4. The prior copy method no longer works.
5. A previous run failed at the same stage.

Codex must write every successful rediscovery back to controls.json.

Codex must preserve useful historical notes when updating controls.json, but the current working values must be easy to identify.


---

T00 Failure Handling

---


## Failure Handling

Codex must fail closed.

If Codex cannot confirm that the relay is working, Codex must not send the real prompt.

If Codex cannot copy the reply, Codex must not pretend that it has ChatGPT's answer.

If Codex sees a login, CAPTCHA, account warning, rate limit, model limit, unavailable page, or security prompt, Codex must stop and ask the user to take over.

Codex must write a JSONL failure record to:

.cache/chatgpt-relay/failures.jsonl

Codex must include:

1. Timestamp.
2. Stage.
3. Observed UI state.
4. Cached control state.
5. Recovery attempted.
6. Whether the failure was resolved.

Codex must report failures in a compact form.

The failure report must include:

1. The failed stage.
2. The suspected cause.
3. The diagnostic file path.
4. The next action required from the user.

Codex must not expose credentials, cookies, tokens, or private browser data in failure reports.


---

U00 User Takeover Rules

---


## User Takeover Rules

Codex must request user takeover when human-only interaction is required.

Human-only interaction includes:

1. Login.
2. Multi-factor authentication.
3. CAPTCHA.
4. Account recovery.
5. Payment or plan confirmation.
6. Security warning.
7. Consent dialog that requires user judgment.
8. Any prompt that asks for credentials or personal information.

Codex must not enter or store credentials.

Codex must resume only after the user confirms that the browser is ready.

After takeover, Codex must rerun the handshake before sending any real prompt.


---

V00 Security and Privacy Rules

---


## Security and Privacy Rules

Codex must not send secrets to ChatGPT.

Codex must not send .env files.

Codex must not send API keys.

Codex must not send access tokens.

Codex must not send private keys.

Codex must not send session cookies.

Codex must not send passwords.

Codex must not send unrelated proprietary source code.

Codex must minimize context before sending a prompt.

Codex must prefer summaries and targeted snippets over full files.

Codex must ask the user before sending sensitive business, customer, legal, medical, financial, or personal data.

Codex must store ChatGPT replies only inside the project-local .tmp/chatgpt-relay folder unless instructed otherwise.

Codex must assume that any copied ChatGPT answer can contain sensitive context and must not commit relay files to git unless the user explicitly asks.


---

W00 Git Ignore Requirement

---


## Git Ignore Requirement

Codex must check whether the project has a .gitignore file.

If .gitignore exists, Codex must ensure these entries are present:

.tmp/chatgpt-relay/
.cache/chatgpt-relay/

If .gitignore does not exist, Codex must create it with these entries:

.tmp/chatgpt-relay/
.cache/chatgpt-relay/

Codex must not commit relay prompt files, reply files, clipboard dumps, cache files, or failure logs unless the user explicitly asks.


---

X00 Required Run Log

---


## Required Run Log

For each real ChatGPT relay run, Codex must create or append a compact run log at:

.tmp/chatgpt-relay/run-log.md

Each entry must include:

Timestamp:
User request summary:
Prompt file:
Reply file:
Clipboard file:
Handshake status:
Cache reused:
Controls refreshed:
Outcome:

The run log must not include secrets.

The run log must not include full copied answers unless the user asks.


---

Y00 Minimal Happy Path

---


## Minimal Happy Path

Codex must execute this exact sequence for the normal successful workflow:

1. Ensure .tmp/chatgpt-relay exists.
2. Ensure .cache/chatgpt-relay exists.
3. Ensure .gitignore excludes both relay folders.
4. Load controls.json if present.
5. Open https://chatgpt.com/.
6. Confirm ChatGPT is usable.
7. Create a new chat.
8. Send: Reply with exactly: Hello world
9. Wait for the reply to complete.
10. Copy the latest assistant reply.
11. Dump clipboard to .tmp/chatgpt-relay/YYYY-MM-DD_HH-mm-ss_clipboard.txt.
12. Save the assistant reply to .tmp/chatgpt-relay/YYYY-MM-DD_HH-mm-ss_chatgpt-reply.md.
13. Validate that the reply is exactly: Hello world
14. Update last-handshake.json.
15. Update controls.json.
16. Save the real prompt to .tmp/chatgpt-relay/YYYY-MM-DD_HH-mm-ss_chatgpt-prompt.md.
17. Send the real prompt to ChatGPT.
18. Wait for the reply to complete.
19. Copy the latest assistant reply.
20. Dump clipboard to a new timestamped clipboard file.
21. Save the answer to a new timestamped reply file.
22. Read the saved reply file.
23. Validate that the saved reply is not stale or empty.
24. Use the saved reply to continue the project task.
25. Append run-log.md.


---

Z00 Operational Rules

---


## Operational Rules

Codex must be conservative with UI assumptions.

Codex must avoid unnecessary rediscovery.

Codex must keep cache files machine-readable.

Codex must keep failure logs append-only.

Codex must update cache timestamps whenever validation succeeds.

Codex must mark stale controls explicitly instead of silently replacing them.

Codex must never claim that ChatGPT was consulted unless the real ChatGPT reply was copied, saved, read back, and used.

Codex must never continue from the handshake answer as if it were the real answer.

Codex must always distinguish between:

1. Handshake prompt.
2. Handshake reply.
3. Real prompt.
4. Real reply.
5. Clipboard dump.
6. Cache metadata.
7. Failure log.

Codex must treat this protocol as mandatory whenever the user asks to involve ChatGPT through computer use.


---

AA00 Companion agents.env Example

---

env
# agents.env
# ChatGPT relay configuration for Codex computer use.
# Do not store secrets in this file.

CHATGPT_RELAY_ENABLED=true
CHATGPT_RELAY_URL=https://chatgpt.com/
CHATGPT_RELAY_TMP_DIR=.tmp/chatgpt-relay
CHATGPT_RELAY_CACHE_DIR=.cache/chatgpt-relay

CHATGPT_RELAY_CONTROLS_FILE=.cache/chatgpt-relay/controls.json
CHATGPT_RELAY_SESSION_FILE=.cache/chatgpt-relay/session.json
CHATGPT_RELAY_HANDSHAKE_FILE=.cache/chatgpt-relay/last-handshake.json
CHATGPT_RELAY_FAILURES_FILE=.cache/chatgpt-relay/failures.jsonl
CHATGPT_RELAY_RUN_LOG=.tmp/chatgpt-relay/run-log.md

CHATGPT_RELAY_HANDSHAKE_PROMPT=Reply with exactly: Hello world
CHATGPT_RELAY_HANDSHAKE_EXPECTED=Hello world

CHATGPT_RELAY_REUSE_CACHE_IF_YOUNGER_THAN_HOURS=24
CHATGPT_RELAY_REVALIDATE_CACHE_IF_OLDER_THAN_HOURS=24
CHATGPT_RELAY_FORCE_REDISCOVERY_IF_OLDER_THAN_HOURS=168

CHATGPT_RELAY_REQUIRE_HANDSHAKE_BEFORE_REAL_PROMPT=true
CHATGPT_RELAY_REQUIRE_CLIPBOARD_DUMP=true
CHATGPT_RELAY_REQUIRE_REPLY_FILE=true
CHATGPT_RELAY_REQUIRE_REPLY_READBACK=true

CHATGPT_RELAY_ALLOW_COORDINATE_CONTROLS=false
CHATGPT_RELAY_ALLOW_SECRET_TRANSMISSION=false
CHATGPT_RELAY_ALLOW_OS_TEMP_OUTPUT=false
CHATGPT_RELAY_ALLOW_GIT_COMMIT_OF_RELAY_FILES=false


---

AB00 PowerShell Clipboard Dump Snippet

---

powershell
$Timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$Root = Get-Location
$RelayDir = Join-Path $Root ".tmp/chatgpt-relay"

New-Item -ItemType Directory -Force -Path $RelayDir | Out-Null

$ClipboardFile = Join-Path $RelayDir "$Timestamp`_clipboard.txt"
$ReplyFile = Join-Path $RelayDir "$Timestamp`_chatgpt-reply.md"

$ClipboardText = Get-Clipboard -Raw

$ClipboardText | Set-Content -LiteralPath $ClipboardFile -Encoding UTF8

$FrontMatter = @"
---
kind: chatgpt-relay-reply
createdAt: $(Get-Date -Format o)
source: chatgpt-ui-copy
clipboardFile: $ClipboardFile
---

"@

$FrontMatter + $ClipboardText | Set-Content -LiteralPath $ReplyFile -Encoding UTF8

Get-Content -LiteralPath $ReplyFile -Raw



DIRECTIVE: Progress logging for coding agent

Record progress with objective detail.

Rules:
- Avoid bias.
- Do not state improvement without evidence.
- For each request, include: condensed restatement, intent, problem.
- Split work into concrete tasks.
- Describe what changed, why, and measurable behavior impact.
- Include assumptions, constraints, and open questions.
- Cite evidence from tests, logs, or metrics when available.
- Keep language neutral and specific.

H00 Daily progress file rules

Use one file per day for progress.

Current repository convention:
- Use `daily_progress_report/YYYY-MM-DD-PROGRESS.md`.
- For current date, append new entries to existing file.
- Do not modify prior-date files.
- Separate entries with one empty line.
- Start each entry with an ISO 8601 timestamp, for example `2025-03-14`.

I00 Reading and precedence

When reading progress files for context:
- Newer information is source of truth.
- Within one file, the last entry overrides earlier conflicting notes.
- Across files, the latest date file overrides conflicting notes from older files.
- Never rewrite history; record a new entry.

J00 Entry structure

Use this structure for each entry.

#+begin_sample <ISO-8601 timestamp>

Request
A short restatement of the original request in one or two sentences.

Intent
Why we do this now. State the goal and the user or system pain.

Problem
The current behavior or limitation that motivates the change. Keep it factual.

Planned impact
The expected changes in behavior or performance. Use objective terms and, if possible, measurable criteria.

Tasks

* Task 1
* Task 2
* Task 3

Implementation
What changed in the codebase. Mention modules, files, functions, and interfaces that you touched.

Rationale
Why this approach was selected over other reasonable options. Note key tradeoffs.

Evidence
What proves the change works. Summarize tests, logs, or metrics, and link to artifacts if available.

Limitations and risks
Known gaps, follow ups, or side effects.

Status
Done, in progress, or blocked. If blocked, state the blocker and next action.
#+end_sample


For preogress reporting create folder daily_progress_report in the project folder you are currently working in. 

---

AC00 Sources

---

OpenAI describes Codex as an AI agent for writing, reviewing, and shipping code, which supports using this as an agent-facing workflow document rather than a normal user guide. OpenAI also documents ChatGPT agent/browser workflows where login can require user takeover, which is why the protocol requires stopping for credentials and rerunning the handshake after takeover. ([help.openai.com][1])

[1]: https://help.openai.com/en/articles/11369540-using-codex-with-your-chatgpt-plan?utm_source=chatgpt.com "Using Codex with your ChatGPT plan"
