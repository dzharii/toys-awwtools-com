// Normalize for matching only. The original user message is never rewritten.
export const normalize = text => text.normalize('NFC').toLowerCase().replaceAll('ё', 'е')
  .replace(/(^|[^\p{L}])(?:пожалуста|пожалуйсто)(?=$|[^\p{L}])/gu, '$1пожалуйста')
  .replace(/(^|[^\p{L}])хачу(?=$|[^\p{L}])/gu, '$1хочу')
  .replace(/(^|[^\p{L}])пачему(?=$|[^\p{L}])/gu, '$1почему')
  .replace(/\s+/gu, ' ').trim();
export const boundary = source => new RegExp('(?:^|[^\\p{L}\\p{N}])(?:' + source + ')(?=$|[^\\p{L}\\p{N}])', 'iu');
const generic = new Set(['help', 'failure', 'desire', 'explanation', 'prohibition', 'repetition', 'dispute']);
const useful = m => m.role === 'assistant' && m.kind !== 'closing' && m.topic && !['unknown', 'clarify', 'universal', 'greeting', 'social_imitation', 'comparison'].includes(m.topic);

export function analyze(input, topics, history = []) {
  const text = normalize(input);
  let matched = topics.filter(t => boundary(t.pattern).test(text.replace(/пока я в школе/gu, '')))
    .map(t => ({...t, priority: t.priority + (t.boostPattern && boundary(t.boostPattern).test(text) ? t.boost : 0)}))
    .sort((a, b) => b.priority - a.priority);
  if (boundary('я возьму ключи').test(text)) matched = matched.filter(t => t.id !== 'money');
  if (boundary('(?:я еду|мы едем) (?:в|на|к)').test(text)) matched = matched.filter(t => t.id !== 'food');
  if (boundary('не (?:спрашиваю |говорю )?(?:про|о) ед[уе]').test(text)) matched = matched.filter(t => t.id !== 'food');
  const recent = history.slice(-8);
  const lastClosing = recent.findLastIndex(m => m.role === 'assistant' && m.kind === 'closing');
  const episode = recent.slice(lastClosing + 1);
  const lastAssistant = [...episode].reverse().find(m => m.role === 'assistant');
  const previous = lastAssistant && useful(lastAssistant) ? lastAssistant : lastAssistant?.topic === 'social_imitation' ? [...episode].reverse().find(useful) : null;
  const pendingRequestTopic = matched.find(t => ['outing','screen','purchase','pets'].includes(t.id) && boundary('можно|хочу|купи').test(text))?.id || lastAssistant?.pendingRequestTopic || null;
  if (lastAssistant?.situation === 'accomplished' && pendingRequestTopic && /^(?:а потом|можно теперь)[?! .]*$/u.test(text)) matched = [topics.find(t => t.id === pendingRequestTopic)];
  const lastUser = [...episode].reverse().find(m => m.role === 'user');
  const repeated = !!lastUser && normalize(lastUser.text) === text;
  const explicit = boundary('ну пожалуйста|ну помоги|я уже (?:пробовал|пробовала|пытался|пыталась)|не помогло|еще раз|все равно|хоть немного|ну и что').test(text);
  const elliptical = /^(?:да|нет|ага|угу|конечно|уже|а потом|а сколько еще надо|а если там тоже непонятно|только во двор|всего на полчаса|нет я не понял)[.!? ,]*$/u.test(text)
    || boundary('она невкусная|он медленный|старый уже маленький|я нечаянно|я буду беречь|я вовремя вернусь|я вернусь вовремя|я уже помыл|я уже помыла|а сколько ты добавишь|а до скольки можно|можно теперь|еще пять минут|еще одну серию|я уже спрашивал|объясни попроще|объясни нормально|не понимаю|не понял|не поняла').test(text);
  const referring = text.length < 100 && boundary('а если|а сколько|а когда|а кто|а куклу куда|а потом|а мне|а почему|а до скольки|можно теперь|можно я сам|она|он|я уже большой|я уже спрашивал|сам не умею|покажи хотя бы|если дождь').test(text);
  const contextUsed = !!previous && (repeated || explicit || elliptical || referring)
    && (!matched.length || matched.every(t => generic.has(t.id)));
  if (boundary('нет уроков|не спрашиваю про уроки').test(text)) matched = matched.filter(t => t.id !== 'study');
  if (contextUsed) matched = [topics.find(t => t.id === (previous.contextTopic || previous.topic))].filter(Boolean);
  const continuation = !!previous && (repeated || explicit) && contextUsed && previous.kind !== 'opening';
  const irritation = continuation ? Math.min(3, (previous.irritation || 0) + 1) : Math.max(0, (previous?.irritation || 0) - 1);
  let situation = null;
  if (boundary('почему ты[^.!?]{0,45}(?:спрашиваешь|напоминаешь)[^.!?]{0,35}(?:уроки|учеб)|зачем ты[^.!?]{0,35}(?:спрашиваешь|напоминаешь)').test(text)) situation = 'meta_parent';
  if (!situation && boundary('(?:я )?(?:сам|сама) (?:посмотрю|попробую|почитаю|разберусь)|попробую по-другому').test(text)) situation = 'initiative';
  if (!situation && boundary('объясни (?:попроще|нормально|почему)|покажи (?:хотя бы )?один раз|я уже спрашивал[^.!?]{0,45}не объясняешь|(?:нет[, ]+)?я не понял|я не поняла').test(text)) situation = 'clarification';
  if (!situation && boundary('(?:мой|моя) (?:друг|подруга|товарищ) (?:поехал|поехала|уехал|уехала)').test(text) && !boundary('хочу|можно|почему|тоже|нельзя').test(text)) situation = 'news';
  const completed = '(?:сделал|сделала|убрал|убрала|помыл|помыла|выполнил|выполнила|прочитал|прочитала|поел|поела|съел|съела|наелся|наелась)';
  if (!situation && !boundary('если|когда|завтра').test(text) && !/[?？]/u.test(text) && !boundary('не '+completed).test(text)
      && ((boundary('я (?:уже |все )?'+completed).test(text) || new RegExp('^(?:(?:ну|да|но)[, ]+)?(?:(?:уроки|посуду|комнату|все уроки|все дела) )?(?:уже |все )?'+completed+'(?=$|[^\\p{L}])', 'u').test(text)) || /^(?:все,? )?в комнате порядок[.!]*$/u.test(text))) situation = 'accomplished';
  if (!situation && boundary('обещаю|буду беречь|буду кормить|буду ухаживать|сам буду|сама буду|я вернусь вовремя|я вовремя вернусь').test(text)) situation = 'promise';
  if (!situation && /^(?:да|ага|угу|уже)[.!]*$/u.test(text) && previous?.situation === 'accomplished') situation = 'accomplished';
  if (!situation && previous?.kind === 'opening' && /^(?:да|ага|угу|сделал|сделала|уже)[.!]*$/u.test(text)) situation = 'accomplished';
  if (!situation && boundary('я хочу сам заработать|я хочу сама заработать|я могу сам накопить|я могу сама накопить|не буду больше тратить').test(text)) situation = 'promise';
  if (!situation && boundary('сама за себя отвечаю|сам за себя отвечаю|я сама помою|я сам помою|я буду кормить').test(text)) situation = 'promise';
  if (!situation && boundary('(?:можно )?(?:я )?(?:помогу|помочь) (?:готовить|с посудой)').test(text)) situation = 'offer';
  if (!situation && boundary('не (?:хочу|собираюсь) (?:больше )?(?:спорить|покупать)|не нужна готовая подсказка|друг не просит|не собираюсь прыгать|своя голова есть').test(text)) situation = 'stance';
  if (!situation && contextUsed && previous?.contextTopic === 'outing' && boundary('если дождь[^.!?]{0,40}я (?:приду|вернусь)').test(text)) situation = 'promise';
  const specific = matched.find(t => !generic.has(t.id) && !['social_imitation','comparison','clarify','universal','greeting'].includes(t.id));
  const contextTopic = specific?.id || lastAssistant?.contextTopic || null;
  if (situation && !matched.length) matched = [topics.find(t => t.id === 'universal')];
  return {text, topics: matched, continuation, irritation, contextUsed, contextTopic, pendingRequestTopic, situation, completedTopics: [...new Set([...(lastAssistant?.completedTopics || []), ...(situation === 'accomplished' ? matched.map(t => t.id).filter(t => ['study','duties','food'].includes(t)) : [])])], meaningful: /\p{L}{2}/u.test(text)};
}

export function selectTopic(analysis, random) {
  const ids = [...new Set(analysis.topics.map(t => t.id))];
  if (!ids.length) return analysis.meaningful ? (random() < .5 ? 'universal' : 'clarify') : 'clarify';
  return ids.length === 1 || random() < .7 ? ids[0] : ids[1 + Math.floor(random() * (ids.length - 1))];
}
