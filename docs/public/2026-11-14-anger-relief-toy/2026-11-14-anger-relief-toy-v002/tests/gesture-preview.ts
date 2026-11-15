import { mountCirclePrototype } from "../src/experimental/circle-gesture";
import type { Resources } from "../src/sdk/resources";
let session: Resources | undefined;
document.querySelector<HTMLInputElement>("#enable")!.onchange = (event) => {
  session?.dispose();
  session = undefined;
  if ((event.target as HTMLInputElement).checked)
    session = mountCirclePrototype(document, () => {
      document.querySelector("#result")!.textContent =
        "Gesture recognized. The production integration is deferred pending native browser validation.";
    });
};
window.addEventListener("pagehide", () => session?.dispose(), { once: true });
