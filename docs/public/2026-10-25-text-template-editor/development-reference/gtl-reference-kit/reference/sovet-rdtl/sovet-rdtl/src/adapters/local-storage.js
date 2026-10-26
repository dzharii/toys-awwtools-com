import {emptyState, readableState, validState} from '../domain/chat-state.js';
import {persistentState} from '../domain/persistent-state.js';
export {emptyState, validState} from '../domain/chat-state.js';
export const STORAGE_KEY = 'sovet-rdtl.state.v2';

export function createStorage(storage, options = {}) {
  let snapshot = null;
  return {
    load() {
      try {
        snapshot = storage.getItem(STORAGE_KEY);
        if (!snapshot) return {state: emptyState()};
        try { return {state: readableState(JSON.parse(snapshot), options)}; }
        catch { return {state: emptyState()}; }
      } catch {
        return {state: emptyState(), error: 'Не удалось прочитать историю: хранилище недоступно.'};
      }
    },
    save(value) {
      const state=persistentState(value);
      if (!validState(state, options)) throw Error('Некорректное состояние истории.');
      try {
        if (storage.getItem(STORAGE_KEY) !== snapshot) throw Error('conflict');
        const value = JSON.stringify(state);
        storage.setItem(STORAGE_KEY, value);
        snapshot = value;
      } catch (error) {
        if (error.message === 'conflict') throw Error('История изменилась в другой вкладке. Обнови страницу.');
        throw Error('Не удалось сохранить историю: хранилище недоступно или заполнено. Текущий разговор остаётся в памяти.');
      }
    },
    reset(state) {
      if (!validState(state, options)) throw Error('Некорректное состояние истории.');
      try {
        const value = JSON.stringify(state);
        storage.setItem(STORAGE_KEY, value);
        snapshot = value;
      } catch { throw Error('Не удалось очистить историю: хранилище недоступно.'); }
    }
  };
}
