# Verification for change request 004

## Windows build portability (2026-11-16)

The development build and browser-test entry point convert their project file URLs with `fileURLToPath` before changing directory. This fixes the Windows `/C:/...` startup failure and decodes checkout names containing spaces, `#` or `%`. The build regression copies the trusted project into a disposable local directory with those characters, invokes the build from another working directory, checks the generated extension files and removes the copy.

On Windows ARM64 with Bun 1.4.4, the development build produced all 18 effect bundles and all 139 tests passed. This build-only repair does not establish native visual or audio acceptance or change the release review gate. The formatting check could not run because Prettier was missing; frozen dependency restoration returned HTTP 404 from the configured package feed for `prettier-3.10.1.tgz` and `ws-8.23.0.tgz`. Dependency versions and the lockfile were not changed.

## Existing feature verification

The final verification and source snapshot are recorded in evidence/004/verification.json and source-manifest.json. Component checks execute trusted packaged content and independently injected effect bundles in Happy DOM, with virtual time, rendering-call instrumentation and resource assertions. They verify integration but do not measure native layout, pixels, audio output or hardware performance.

Native Playwright was attempted again with the installed browser, packaged dist, persistent extension profile and synthetic discussion fixture. The environment initially lacked /tmp; a writable workspace temporary directory resolved that setup error. Chromium then failed at process_singleton_posix.cc:297 with socket() failed: Operation not permitted (1), followed by a crashpad ptrace restriction. evidence/004/browser-result.json preserves the complete error. No sandbox escalation or security workaround was attempted.

The authored browser suite covers actual command dispatch,920x720 and1440x1000 viewports, inventory outer/button rectangles before/during/after, complete dial traversal and selection, repeated Punch/Text Bomb, persistent Flashlight, catalog dragging, native keyboard and host controls, hold opt-in/cancellation/completion, reduced motion, refresh and screenshots/video. It also renders the actual shared audio profiles through OfflineAudioContext on the development audition page. These native assertions did not execute because startup failed. There are zero native screenshots or motion recordings of the final build.

The three separator concept PNG/SVGs were rendered and inspected as static design prototypes. They are not screenshots of a running browser extension. Original user reference recordings and historical003 image-generation studies remain unchanged. Current code uses lightweight glass, original colored icons and the selected metallic-cover direction; perceived fidelity still needs native inspection.

Shared audio tests use instrumented fake native nodes to establish lazy creation, clock scheduling, eight-voice bounds, throttled ticks, ownership, live settings, cancellation, suspension and recovery. These tests do not render DSP or establish timbre, pleasantness, subjective loudness or repeated-use comfort. The audition surface is supplied so actual listening can be performed on a capable machine. No external samples were chosen or licensed by assumption.

Open acceptance gates are native composition/motion/zoom and measured inventory geometry; actual Web Audio/autoplay/listening comfort; branded Chrome/Edge and OS-native hold/default-action compatibility; hardware frame/heap behavior; deeper historical-source/version review and final independent approval. The release build rejects review-pending effects rather than treating the development package as production-certified.
