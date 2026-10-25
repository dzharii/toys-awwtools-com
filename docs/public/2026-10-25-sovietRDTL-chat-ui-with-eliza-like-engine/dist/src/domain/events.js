import {normalize, boundary} from './analyzer.js';
import {choices, weighted, repetitionWeight} from './selector.js';

export function isClosing(input) {
  const text = normalize(input).replace(/[.!?,;:—-]+/gu, ' ').replace(/\s+/gu, ' ').trim();
  // Consume the whole message. A new request or an unresolved question keeps it open.
  return /^(?:(?:ну|ладно|хорошо|все|большое|огромное|тебе|вам|за совет|за помощь|за ответ|теперь|точно|на сегодня|все понятно|понятно|я все понял|я все поняла|я понял|я поняла|понял|поняла|на этом все|спасибо|спс|благодарю|пока|до свидания|до завтра|до встречи|спокойной ночи|я пошел|я пошла|я пойду|я ухожу|я поехал|я поехала|мне пора|доеду и позвоню)\s*)+$/u.test(text)
    && boundary('спасибо|спс|благодарю|пока|до свидания|до завтра|до встречи|спокойной ночи|понял|поняла|все понятно|на этом все|я пошел|я пошла|я поехал|я поехала|мне пора|я ухожу|доеду и позвоню').test(text);
}

export function isSocial(input) {
  const text = normalize(input);
  // Reported illness, achievements and a negated wish do not justify imitation.
  if (boundary('не хочу (?:так|тоже|как|повторять)|не (?:надо|нужно) (?:так|повторять)').test(text)) return false;
  if (boundary('если все с крыши прыгнут|почему нельзя повторять за друзьями').test(text)) return true;
  return boundary('а вот (?:маше|васе|пете) (?:мама|папа) помогает|он уже[^.!?]{0,70}и я тоже хочу|у (?:моего |моей )?(?:друга|подруги|товарища)[^.!?]{0,50}(?:такой же|и я тоже хочу)|у (?:васи|пети|маши) родители разрешают|у всех(?: моих)?(?: друзей| подруг| знакомых| одноклассников)? (?:есть|нов[а-я]*|уже)|все мои (?:друзья|подруги|одноклассники) (?:так|уже|ложатся|ходят|играют)|(?:мой|моя) (?:друг|подруга|товарищ)[^.!?]{0,90}(?:так делает|так поступает|тоже никогда не|и я тоже хочу)|почему (?:ему|ей|сестре|брату) можно[^.!?]{0,25}мне нельзя|(?:а вот |но )?(?:васе|пете|маше|моему другу|моей подруге) (?:родители )?разрешают|а у (?:пети|васи|маши) можно|я тоже хочу[^.!?]{0,30}как|все уже[^.!?]{0,60}а я').test(text);
}

export function eventReply({expressions, kind, history = [], random = Math.random, input = ''}) {
  const pick = choices(random);
  let pool = expressions.filter(e => e.scenarios?.includes(kind) && e.tones.includes(pick.tone));
  if (kind === 'closing' && !boundary('пошел|пошла|ухожу|поехал|поехала|доеду|еду').test(normalize(input))) pool = pool.filter(e => e.closingContext !== 'departure');
  if (kind === 'closing' && !boundary('спокойной ночи').test(normalize(input))) pool = pool.filter(e => e.closingContext !== 'bedtime');
  if (kind === 'closing' && boundary('спокойной ночи').test(normalize(input))) {
    const quiet = pool.filter(e => e.closingContext === 'bedtime');
    if (quiet.length) pool = quiet;
  }
  const previous = history.filter(m => m.role === 'assistant').at(-1);
  if (kind === 'closing' && previous?.kind === 'closing') {
    const brief = pool.filter(e => e.repeatClosing);
    if (brief.length) pool = brief;
  }
  let candidates = pool.filter(e => e.library === pick.library);
  if (!candidates.length) candidates = pool;
  const tier = candidates.filter(e => e.tier === pick.tier);
  if (tier.length) candidates = tier;
  const expression = weighted(candidates, random, e => e.weight * repetitionWeight(e, history));
  if (!expression) throw Error('Нет выражений сценария ' + kind);
  const gender = expression.forms ? (random() < .5 ? 'masculine' : 'feminine') : null;
  return {kind, text: gender ? expression.forms[gender] : expression.canonical,
    topic: expression.topics.find(t => !['universal','explanation'].includes(t)) || expression.topics[0],
    tone: pick.tone, sourceLibrary: expression.library, tier: expression.tier,
    expressionIds: [expression.id], familyIds: [expression.familyId], gender, irritation: 0};
}
