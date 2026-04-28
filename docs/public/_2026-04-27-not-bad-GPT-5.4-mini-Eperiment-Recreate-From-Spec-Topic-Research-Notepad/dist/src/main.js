import { registerAllComponents } from "../ui-framework/src/components/register-all.js";
import { ResearchNotepadApp } from "./app.js";
import { createLogger } from "./observability/logger.js";

registerAllComponents();

const log = createLogger("App", "Bootstrap");
log.info("Bootstrapping app", { context: { url: window.location.href, logging: globalThis.trnDebug?.getLoggingSettings?.() } });

const root = document.getElementById("app");
if (!root) throw new Error("App root not found.");

const app = new ResearchNotepadApp(root);
globalThis.trnApp = app;
app.bootstrap();

