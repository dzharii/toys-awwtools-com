import { localStorageKeys } from "./types";
import { createLogger } from "./logging";

const storageLog = createLogger("Persistence", "Storage");
let reportedStorageUnavailable = false;
let reportedStorageWriteFailure = false;

function safeStorage(): Storage | null {
  try {
    return window.localStorage;
  } catch (error) {
    if (!reportedStorageUnavailable) {
      reportedStorageUnavailable = true;
      storageLog.warn("Browser storage is unavailable; persistence will be disabled", {
        context: { message: error instanceof Error ? error.message : String(error) }
      });
    }
    return null;
  }
}

export function loadSelectedProblemId(): string | null {
  const value = safeStorage()?.getItem(localStorageKeys.selectedProblem) ?? null;
  storageLog.info("Selected problem loaded", {
    context: { found: value !== null, problemId: value }
  });
  return value;
}

export function saveSelectedProblemId(problemId: string): void {
  const storage = safeStorage();
  if (!storage) return;
  try {
    storage.setItem(localStorageKeys.selectedProblem, problemId);
    storageLog.info("Selected problem saved", {
      context: { problemId }
    });
  } catch (error) {
    if (!reportedStorageWriteFailure) {
      reportedStorageWriteFailure = true;
      storageLog.warn("Failed to persist selected problem", {
        context: { message: error instanceof Error ? error.message : String(error) }
      });
    }
  }
}

export function loadDraft(problemId: string): string | null {
  return safeStorage()?.getItem(`${localStorageKeys.draftPrefix}${problemId}`) ?? null;
}

export function saveDraft(problemId: string, source: string): void {
  const storage = safeStorage();
  if (!storage) return;
  try {
    storage.setItem(`${localStorageKeys.draftPrefix}${problemId}`, source);
  } catch (error) {
    if (!reportedStorageWriteFailure) {
      reportedStorageWriteFailure = true;
      storageLog.warn("Failed to persist draft source", {
        context: { problemId, message: error instanceof Error ? error.message : String(error) }
      });
    }
  }
}

export function clearDraft(problemId: string): void {
  safeStorage()?.removeItem(`${localStorageKeys.draftPrefix}${problemId}`);
  storageLog.info("Draft cleared", {
    context: { problemId }
  });
}

export function loadCustomTests(problemId: string): string | null {
  return safeStorage()?.getItem(`${localStorageKeys.customPrefix}${problemId}`) ?? null;
}

export function saveCustomTests(problemId: string, value: string): void {
  const storage = safeStorage();
  if (!storage) return;
  try {
    storage.setItem(`${localStorageKeys.customPrefix}${problemId}`, value);
  } catch (error) {
    if (!reportedStorageWriteFailure) {
      reportedStorageWriteFailure = true;
      storageLog.warn("Failed to persist custom tests", {
        context: { problemId, message: error instanceof Error ? error.message : String(error) }
      });
    }
  }
}
