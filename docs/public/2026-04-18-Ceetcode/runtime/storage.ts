import { localStorageKeys } from "./types";

function safeStorage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function loadSelectedProblemId(): string | null {
  return safeStorage()?.getItem(localStorageKeys.selectedProblem) ?? null;
}

export function saveSelectedProblemId(problemId: string): void {
  safeStorage()?.setItem(localStorageKeys.selectedProblem, problemId);
}

export function loadDraft(problemId: string): string | null {
  return safeStorage()?.getItem(`${localStorageKeys.draftPrefix}${problemId}`) ?? null;
}

export function saveDraft(problemId: string, source: string): void {
  safeStorage()?.setItem(`${localStorageKeys.draftPrefix}${problemId}`, source);
}

export function clearDraft(problemId: string): void {
  safeStorage()?.removeItem(`${localStorageKeys.draftPrefix}${problemId}`);
}

export function loadCustomTests(problemId: string): string | null {
  return safeStorage()?.getItem(`${localStorageKeys.customPrefix}${problemId}`) ?? null;
}

export function saveCustomTests(problemId: string, value: string): void {
  safeStorage()?.setItem(`${localStorageKeys.customPrefix}${problemId}`, value);
}
