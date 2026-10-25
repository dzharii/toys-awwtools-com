import {isBackgroundId} from '../config/backgrounds.js';

export const STATE_VERSION = 2;
export const emptyState = () => ({schemaVersion: STATE_VERSION, nextChatNumber: 1, selectedChatId: null, chats: []});
const tones = new Set(['ironic', 'strict', 'sarcastic']);
const kinds = new Set(['opening', 'reply', 'closing', 'social_imitation', 'fallback', 'silence']);
const identifier = value => typeof value === 'string' && /^[a-zA-Z0-9._:-]{1,128}$/u.test(value);
const timestamp = value => typeof value === 'string' && Number.isFinite(Date.parse(value));
const strings = value => Array.isArray(value) && value.every(item => typeof item === 'string' && item.length > 0);

export function validMessage(message, {expressions} = {}) {
  if (!message || !identifier(message.id) || typeof message.text !== 'string' || !message.text.trim()
      || message.text.length > 6000 || !timestamp(message.createdAt)) return false;
  if (message.role === 'user') return message.kind === 'input';
  if (message.role !== 'assistant' || !kinds.has(message.kind) || !strings(message.expressionIds)
      || !strings(message.familyIds) || message.familyIds.length !== message.expressionIds.length) return false;
  if (message.kind === 'silence') {
    return message.text === '(молчит)' && message.expressionIds.length === 0 && message.familyIds.length === 0
      && message.tone == null;
  }
  if (!tones.has(message.tone) || !['common', 'odessa'].includes(message.sourceLibrary)
      || !message.expressionIds.length || !['core', 'extended'].includes(message.tier)) return false;
  if (expressions && message.expressionIds.some((id, index) => {
    const expression = expressions.get(id);
    return !expression || message.familyIds[index] !== expression.familyId || expression.library !== message.sourceLibrary || !expression.tones.includes(message.tone)
      || (['opening', 'closing'].includes(message.kind) && !expression.scenarios?.includes(message.kind))
      || (!['opening', 'closing'].includes(message.kind) && expression.scenarios && !expression.scenarios.includes('normal'));
  })) return false;
  if (message.parts != null && (!Array.isArray(message.parts) || message.parts.length !== message.expressionIds.length
      || message.parts.some((part, index) => !part || part.expressionId !== message.expressionIds[index]
        || typeof part.text !== 'string' || !part.text.trim() || part.text.length > 6000)
      || message.parts.map(part => part.text).join(' ') !== message.text)) return false;
  if (message.irritation != null && (!Number.isInteger(message.irritation) || message.irritation < 0 || message.irritation > 3)) return false;
  if (message.gender != null && !['masculine','feminine'].includes(message.gender)) return false;
  for (const field of ['continuation','contextUsed','topicFallback','libraryFallback','toneFallback']) if (message[field] != null && typeof message[field] !== 'boolean') return false;
  if (message.situation != null && !['accomplished','promise','offer','stance','clarification','initiative','meta_parent','news'].includes(message.situation)) return false;
  if (message.topic != null && (typeof message.topic !== 'string' || !message.topic.trim())) return false;
  if (message.contextTopic != null && typeof message.contextTopic !== 'string') return false;
  if (message.pendingRequestTopic != null && typeof message.pendingRequestTopic !== 'string') return false;
  if (message.completedTopics != null && !strings(message.completedTopics)) return false;
  return true;
}

function validChatHeader(chat, nextNumber) {
  return chat && identifier(chat.id) && Number.isSafeInteger(chat.number) && chat.number > 0 && chat.number < nextNumber
    && chat.title === `Новый чат ${chat.number}` && timestamp(chat.createdAt) && timestamp(chat.updatedAt)
    && isBackgroundId(chat.backgroundId) && Array.isArray(chat.messages);
}
function validRoot(state) {
  return state && state.schemaVersion === STATE_VERSION && Number.isSafeInteger(state.nextChatNumber)
    && state.nextChatNumber > 0 && state.nextChatNumber < Number.MAX_SAFE_INTEGER && Array.isArray(state.chats);
}

// Read only the current structure. Discard an invalid unit without repairing its contents.
export function readableState(value, options = {}) {
  if (!validRoot(value)) return emptyState();
  const ids = new Set(), numbers = new Set(), chats = [];
  for (const chat of value.chats) {
    if (!validChatHeader(chat, value.nextChatNumber) || ids.has(chat.id) || numbers.has(chat.number)) continue;
    ids.add(chat.id); numbers.add(chat.number);
    const messageIds = new Set();
    let accepted = 0;
    const messages = chat.messages.filter(message => {
      if (!validMessage(message, options) || messageIds.has(message.id) || (message.kind === 'opening' && accepted > 0)) return false;
      messageIds.add(message.id); accepted++;
      return true;
    });
    chats.push({...chat, messages});
  }
  return {schemaVersion: STATE_VERSION, nextChatNumber: value.nextChatNumber,
    selectedChatId: ids.has(value.selectedChatId) ? value.selectedChatId : chats[0]?.id || null, chats};
}

export function validState(state, options = {}) {
  if (!validRoot(state)) return false;
  const clean = readableState(state, options);
  return clean.chats.length === state.chats.length && clean.selectedChatId === state.selectedChatId
    && clean.chats.every((chat, index) => chat.messages.length === state.chats[index].messages.length);
}
