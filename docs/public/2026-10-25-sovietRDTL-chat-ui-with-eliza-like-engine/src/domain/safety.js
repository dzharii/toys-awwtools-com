import {normalize,boundary} from './analyzer.js';
// A conservative rule system; no claim of general intent detection.
export function isImmediateDanger(input) {
 const text=normalize(input);
 // Reported fiction, attributed quotations and idioms are excluded within their clause only.
 const clauses=text.replace(/«[^»]*»|“[^”]*”|"[^"]*"/gu,'').split(/(?:[.!?;,\n]+|\s+(?:но|однако|а)\s+)/u);
 return clauses.some(clause=>{
   if (boundary('в (?:книге|фильме|романе|игре|шахматах)|герой|персонаж|цитата|историк|вчера|прошлом году').test(clause)) return false;
   if (/[«»"“”]/u.test(clause)) return false;
   if (boundary('не (?:хочу|собираюсь|буду|планирую|намерен|намерена)(?: сейчас)? (?:уб[а-я]*|застрел[а-я]*|зарез[а-я]*|порез[а-я]*|поконч[а-я]*|повес[а-я]*|прыг[а-я]*)|никогда не|не стану|не (?:убить|застрелить|зарезать|порезать|покончить|повеситься)').test(clause)) return false;
   const time=boundary('сейчас|сегодня|сегодня ночью|прямо сейчас|через (?:час|минуту|пять минут)|немедленно').test(clause);
   const intent=boundary('я (?:хочу|собираюсь|намерен|намерена|планирую)|(?:я )?(?:сейчас |сегодня )?(?:убью|застрелю|зарежу|порежу|повешусь|покончу)|собираюсь|хочу|планирую').test(clause);
   const action=boundary('убить|застрелить|зарезать|порезать|покончить с собой|повеситься|повешусь|покончу с собой|убью|застрелю|зарежу|порежу').test(clause);
   const target=boundary('себя|собой|его|ее|тебя|соседа|соседку|мужа|жену|человека|брата|сестру|маму|папу|всех|повешусь|повеситься').test(clause);
   const jump=boundary('(?:я )?(?:сейчас )?прыгну|(?:я |он |она )?(?:хочу|хочет|собираюсь|собирается)(?: прямо сейчас| сейчас)? прыгнуть').test(clause)&&boundary('с крыши|на крыше|с моста|на мосту|с девятого этажа|из окна').test(clause)&&!boundary('если|не прыгну|не прыгать').test(clause);
   return time&&(intent&&action&&target||jump);
 });
}
