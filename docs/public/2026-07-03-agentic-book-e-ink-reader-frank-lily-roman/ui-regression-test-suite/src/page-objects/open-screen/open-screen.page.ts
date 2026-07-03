import type { Locator } from "@playwright/test";
import { PageObjectBase, type UiTestAppContext } from "../../framework/page-object/page-object-base.js";
import type { ICtlBase } from "../../framework/controls/control-interfaces.js";
import {
  LocatorCtlButton,
  LocatorCtlElement,
  LocatorCtlStatus,
} from "../../framework/controls/locator-controls.js";
import {
  FIXTURES,
  fixturePath,
  fixtureMimeType,
  readFixtureText,
  type FixtureName,
} from "../../framework/support/fixtures.js";

/**
 * The file-open screen: dropzone, file picker, open button, error/notice
 * region, and RSS link. Exposes user intent: open a file by picker or by drag
 * and drop, read the notice, follow the RSS link.
 */
export class OpenScreenPageObject extends PageObjectBase {
  readonly dropzone: LocatorCtlElement;
  readonly openButton: LocatorCtlButton;
  readonly notice: LocatorCtlStatus;
  readonly rssLink: LocatorCtlElement;

  constructor(app: UiTestAppContext) {
    super(app, "open-screen");
    this.dropzone = new LocatorCtlElement(
      "open-screen dropzone",
      this.page.getByTestId("open-screen-region-dropzone"),
    );
    this.openButton = new LocatorCtlButton(
      "open-screen open button",
      this.page.getByTestId("open-screen-button-open"),
    );
    this.notice = new LocatorCtlStatus(
      "open-screen notice",
      this.page.getByTestId("open-screen-status-notice"),
    );
    this.rssLink = new LocatorCtlElement(
      "open-screen rss link",
      this.page.getByTestId("open-screen-link-rss"),
    );
  }

  protected rootLocator(): Locator {
    return this.page.getByTestId("open-screen-region-root");
  }

  expectedControls(): ICtlBase[] {
    return [this.dropzone, this.openButton];
  }

  private fileInput(): Locator {
    return this.page.getByTestId("open-screen-input-file");
  }

  /** Open a fixture through the hidden file <input> (file-picker path). */
  async openByPicker(name: FixtureName): Promise<void> {
    await this.fileInput().setInputFiles(fixturePath(name));
  }

  /** Open several fixtures at once through the picker (multi-file rejection). */
  async openManyByPicker(names: FixtureName[]): Promise<void> {
    await this.fileInput().setInputFiles(names.map((n) => fixturePath(n)));
  }

  /** Drop a single text fixture onto the dropzone via a synthetic DataTransfer. */
  async dropFile(name: FixtureName): Promise<void> {
    const content = await readFixtureText(name);
    await this.dispatchDrop([{ name: FIXTURES[name].file, type: fixtureMimeType(name), content }]);
  }

  /** Drop multiple text fixtures at once (multi-file rejection path). */
  async dropFiles(names: FixtureName[]): Promise<void> {
    const files = await Promise.all(
      names.map(async (n) => ({
        name: FIXTURES[n].file,
        type: fixtureMimeType(n),
        content: await readFixtureText(n),
      })),
    );
    await this.dispatchDrop(files);
  }

  private async dispatchDrop(files: { name: string; type: string; content: string }[]): Promise<void> {
    await this.page.evaluate((payload) => {
      const dt = new DataTransfer();
      for (const f of payload) {
        dt.items.add(new File([f.content], f.name, { type: f.type }));
      }
      const zone = document.querySelector('[data-testid="open-screen-region-dropzone"]');
      if (!zone) throw new Error("dropzone not found");
      const event = new DragEvent("drop", { bubbles: true, cancelable: true });
      Object.defineProperty(event, "dataTransfer", { value: dt });
      zone.dispatchEvent(event);
    }, files);
  }

  async isNoticeVisible(): Promise<boolean> {
    return this.notice.isVisible();
  }

  async noticeText(): Promise<string> {
    return this.notice.getText();
  }

  async clickOpenButton(): Promise<void> {
    await this.openButton.click();
  }

  /**
   * Build an oversized in-memory File (> hard limit) and hand it to the app's
   * file-open handler directly. Committing a >15MB fixture to the repo is
   * avoided; the File is synthesized in-page instead.
   */
  async openOversizedInPage(sizeBytes: number, fileName = "too-large.txt"): Promise<void> {
    await this.page.evaluate(
      ({ size, name }) => {
        const chunk = "A".repeat(1024 * 64);
        const parts: string[] = [];
        let total = 0;
        while (total < size) {
          parts.push(chunk);
          total += chunk.length;
        }
        const file = new File(parts, name, { type: "text/plain" });
        const w = window as unknown as {
          __einkReader?: { fileOpen?: { handleFileList(list: File[]): void } };
        };
        w.__einkReader?.fileOpen?.handleFileList([file]);
      },
      { size: sizeBytes, name: fileName },
    );
  }
}
