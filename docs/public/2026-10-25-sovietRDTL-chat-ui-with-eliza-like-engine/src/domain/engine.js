import {mediaReply} from './media-event.js';
import {MEDIA_TYPES} from '../config/media.js';
import {isClosing, isSocial, eventReply} from './events.js';
import {analyze, selectTopic, normalize} from './analyzer.js';
import {choices, weighted, repetitionWeight} from './selector.js';
import {isImmediateDanger} from './safety.js';
import {contextualOpening, sentences} from './composer.js';

export function createEngine({expressions, topics, rules}) {
  const byId = new Map(expressions.map(expression => [expression.id, expression]));
  const contextPatterns = new Map(expressions.filter(e => e.contextPattern).map(e => [e.id, new RegExp(e.contextPattern, 'iu')]));
  const normal = expressions.filter(e => !e.isTemplate && e.roles.includes('standalone') && (!e.scenarios || e.scenarios.includes('normal')));
  return {
    opening({history = [], random = Math.random} = {}) {
      return eventReply({expressions, kind: 'opening', history, random});
    },
    generate({input, history = [], random = Math.random, attachmentType}) {
      if (typeof input !== 'string' || (!input.trim() && !attachmentType) || input.length > 6000 || (attachmentType && !MEDIA_TYPES.includes(attachmentType))) throw Error('Некорректное сообщение');
      if (isImmediateDanger(input)) return {kind: 'silence', text: '(молчит)', expressionIds: [], familyIds: []};
      if (attachmentType) return mediaReply({expressions,type:attachmentType,history,random});
      if (isClosing(input)) return eventReply({expressions, kind: 'closing', history, random, input});
      const analysis = analyze(input, topics, history);
      const social = isSocial(input);
      if (social) {
        analysis.topics = [topics.find(t => t.id === 'social_imitation'), ...analyze(input, topics, []).topics.filter(t => !['social_imitation','comparison'].includes(t.id))];
        analysis.continuation = false;
        analysis.situation = null;
      }
      const requestedTopic = selectTopic(analysis, random);
      let topic = requestedTopic;
      const frame = analysis.topics.find(t => ['food','sleep','fear','pets','care','repair','travel','curiosity','thirst','clothing'].includes(t.id))?.id;
      if (['thirst','clothing','fear'].includes(frame) && topic !== 'social_imitation') topic = frame;
      if (frame && ['desire','help','explanation','prohibition','failure'].includes(topic)) topic = frame;
      const requested = choices(random);
      const pick = {...requested};
      const matchedTopics = new Set(analysis.topics.map(t => t.id));
      // Only carry lexical details when the current message explicitly continues that topic.
      const context = normalize(input + (analysis.contextUsed ? ' ' + history.filter(m => m.role === 'user').slice(-2).map(m => m.text).join(' ') : ''));
      const eligible = normal.filter(e => (!e.requiresTopics || e.requiresTopics.some(t => matchedTopics.has(t)))
        && (!e.pendingTopics || !e.pendingTopics.some(t => analysis.completedTopics.includes(t)))
        && (!contextPatterns.has(e.id) || contextPatterns.get(e.id).test(context))
        && (analysis.situation ? e.situations?.includes(analysis.situation) : !e.situations));
      // Keep the semantic pool when its curated tones do not include the requested tone.
      const topical = eligible.filter(e => (e.topics.includes(topic) || (social && e.topics.includes('social_imitation'))) && sentences(e.canonical) <= pick.length);
      const relevant = topical.length ? topical : analysis.situation ? eligible.filter(e => e.topics.includes('universal') && sentences(e.canonical) <= pick.length) : [];
      if (relevant.length && !relevant.some(e => e.tones.includes(pick.tone))) {
        const available = [...new Set(relevant.flatMap(e => e.tones))];
        pick.tone = available[Math.min(available.length - 1, Math.floor(random() * available.length))];
      }
      const fits = e => e.tones.includes(pick.tone) && sentences(e.canonical) <= pick.length;
      let candidates = eligible.filter(e => (social ? e.topics.includes('social_imitation') : e.topics.includes(topic)) && fits(e));
      // A single failed attempt is not repeated bargaining. Escalate only after another request.
      if (analysis.continuation && analysis.irritation > 1 && !social && !analysis.situation) {
        const escalated = eligible.filter(e => e.topics.includes('repetition') && fits(e));
        if (escalated.length) candidates = escalated;
      }
      if (!candidates.length && analysis.situation) candidates = eligible.filter(e => e.topics.includes('universal') && fits(e));
      if (!candidates.length) candidates = eligible.filter(e => e.topics.includes('universal') && fits(e));
      let inLibrary = candidates.filter(e => e.library === pick.library);
      const library = inLibrary.length ? pick.library : candidates[0]?.library;
      if (inLibrary.length) candidates = inLibrary;
      else candidates = candidates.filter(e => e.library === library);
      const lastIds = history.filter(m => m.role === 'assistant').slice(-3).flatMap(m => m.expressionIds || []);
      const fresh = candidates.filter(e => !lastIds.includes(e.id));
      if (fresh.length) candidates = fresh;
      const preferred = candidates.filter(e => e.tier === pick.tier);
      if (preferred.length) candidates = preferred;
      const primary = weighted(candidates, random, e => e.weight * repetitionWeight(e, history));
      if (!primary) throw Error('Каталог не содержит допустимой реплики');
      const used = [primary];
      // Pick a complete prepared grammatical form once for this message.
      const gender = primary.forms ? (random() < .5 ? 'masculine' : 'feminine') : null;
      const fragments = [gender ? primary.forms[gender] : primary.canonical];
      let ruleId = 'standalone';
      const compatible = rules.filter(r => r.library === library && r.topic === topic && r.tones.includes(pick.tone));
      const opening = !social && !analysis.situation && pick.length > 1 && random() < .65 ? contextualOpening(input, compatible, random) : null;
      if (opening && sentences(opening.text) === 1 && sentences(primary.canonical) === 1) {
        fragments.unshift(opening.text);
        used.unshift(byId.get(opening.expressionId));
        ruleId = opening.ruleId;
      }
      // Only edited appendices are composable. A complete unrelated reply is never an appendix.
      if (!social && !analysis.situation && !['universal','clarify','greeting','fear'].includes(topic)
          && fragments.reduce((n, text) => n + sentences(text), 0) < pick.length) {
        const endings = eligible.filter(e => e.appendable && e.library === library && e.topics.includes(topic)
          && e.tones.includes(pick.tone) && !used.some(u => u.familyId === e.familyId) && sentences(e.canonical) === 1);
        if (endings.length) {
          const next = weighted(endings, random, e => e.weight * repetitionWeight(e, history));
          used.push(next);
          fragments.push(next.canonical);
        }
      }
      return {
        kind: social ? 'social_imitation' : ['universal','clarify'].includes(topic) ? 'fallback' : 'reply',
        text: fragments.join(' '), parts: used.map((e, i) => ({expressionId: e.id, text: fragments[i]})), topic, tone: pick.tone, sourceLibrary: library, tier: primary.tier,
        expressionIds: used.map(e => e.id), familyIds: used.map(e => e.familyId), ruleId,
        irritation: analysis.irritation, continuation: analysis.continuation, contextUsed: analysis.contextUsed, contextTopic: analysis.contextTopic, pendingRequestTopic: analysis.pendingRequestTopic,
        situation: analysis.situation, completedTopics: analysis.completedTopics, gender, candidateTopic: primary.topics.includes(topic) ? topic : primary.topics[0], topicFallback: !primary.topics.includes(topic), requestedTopic, requested, toneFallback: pick.tone !== requested.tone, length: sentences(fragments.join(' ')), libraryFallback: library !== pick.library
      };
    }
  };
}
