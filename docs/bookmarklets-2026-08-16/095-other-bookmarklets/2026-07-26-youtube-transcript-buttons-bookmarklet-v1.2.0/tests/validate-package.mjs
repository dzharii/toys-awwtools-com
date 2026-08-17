import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const source = await readFile(new URL('youtube-transcript-buttons.bookmarklet.js', root), 'utf8');
const installer = await readFile(new URL('index.html', root), 'utf8');
const generated = (await readFile(new URL('youtube-transcript-buttons.bookmarklet.txt', root), 'utf8')).trim();

const prohibitedPatterns = [
  [/\.innerHTML\b/, 'innerHTML'],
  [/\binsertAdjacentHTML\b/, 'insertAdjacentHTML'],
  [/\bdocument\.write\b/, 'document.write'],
  [/\beval\s*\(/, 'eval'],
  [/\bnew\s+Function\b/, 'new Function'],
  [/\bimport\s*\(/, 'dynamic import'],
  [/\bfetch\s*\(\s*['"]https?:\/\/(?![^'"]*youtube\.com)/i, 'external absolute fetch'],
  [/\bnew\s+DOMParser\b/, 'DOMParser TrustedHTML sink']
];

for (const [pattern, label] of prohibitedPatterns) {
  assert.equal(pattern.test(source), false, `Source contains prohibited ${label}.`);
}

assert.match(source, /function bookmarklet_youtube_transcript_buttons\s*\(/);
assert.match(source, /attachShadow\(\{ mode: 'open' \}\)/);
assert.match(source, /new MutationObserver\(/);
assert.match(source, /\/youtubei\/v1\/player/);
assert.match(source, /new URL\('\/watch', location\.origin\)/);
assert.match(source, /ytInitialPlayerResponse/);
assert.match(source, /movie_player/);
assert.match(source, /TRANSCRIPT_HOST_ID/);
assert.match(source, /role: 'dialog'/);
assert.match(source, /setPointerCapture/);
assert.match(source, /parseXmlSegments/);
assert.match(source, /requestCaptionThroughWatchFrame/);
assert.match(source, /extractTranscriptPanelFromFrame/);
assert.match(source, /ytd-transcript-segment-renderer/);
assert.match(source, /createNetworkTrace/);
assert.match(source, /responseLength/);
assert.match(source, /emptyBody/);
assert.match(source, /same-origin watch frame resource timing/);
assert.equal(source.split(/\r?\n/).some(line => /^\s*\/\//.test(line)), false, 'Bookmarklet source contains a line-style comment.');
assert.equal(/\bwindow\.open\s*\(/.test(source), false, 'Source must not open a separate browser window.');
assert.equal(/about:blank/i.test(source), false, 'Source must not depend on an about:blank document.');
assert.match(source, /captionTracks/);
assert.match(source, /segmentsToSrt/);
assert.match(source, /segmentsToVtt/);

assert.match(installer, /<a id="install"[^>]*>YouTube Transcript Buttons<\/a>/);
assert.match(installer, /src="\.\/youtube-transcript-buttons\.bookmarklet\.js"/);
assert.match(installer, /window\.bookmarklet_youtube_transcript_buttons/);
assert.equal(/<script[^>]+src=["']https?:\/\//i.test(installer), false, 'Installer contains an external script.');
assert.equal(/\.innerHTML\b|\binsertAdjacentHTML\b|\bdocument\.write\b/.test(installer), false, 'Installer contains prohibited HTML injection.');

const inlineScripts = [...installer.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].map(match => match[1]);
assert.ok(inlineScripts.length >= 1, 'Installer has no inline bootstrap script.');
for (const [index, script] of inlineScripts.entries()) {
  new vm.Script(script, { filename: `installer-inline-${index + 1}.js` });
}


const parserStart = source.indexOf('  function parsePlayerResponseFromHtml(html) {');
const parserEnd = source.indexOf('  function getInnertubeConfig() {');
assert.ok(parserStart >= 0 && parserEnd > parserStart, 'Could not locate watch-page parser functions.');
const parserSource = source.slice(parserStart, parserEnd).replace(/^  /gm, '');
const parserContext = vm.createContext({});
vm.runInContext(parserSource, parserContext, { filename: 'watch-page-parser.js' });

const directPlayerResponse = {
  videoDetails: { videoId: 'dhGVwcL4BTo', title: 'A title with } and escaped \" text' },
  playabilityStatus: { status: 'OK' },
  captions: { playerCaptionsTracklistRenderer: { captionTracks: [] } }
};
const directHtml = `<script>var ytInitialPlayerResponse = ${JSON.stringify(directPlayerResponse)};</script>`;
const directParsed = vm.runInContext(`parsePlayerResponseFromHtml(${JSON.stringify(directHtml)})`, parserContext);
assert.deepEqual(JSON.parse(JSON.stringify(directParsed)), directPlayerResponse, 'Direct ytInitialPlayerResponse parsing failed.');

const serializedPlayerResponse = {
  videoDetails: { videoId: 'abcdefghijk' },
  playabilityStatus: { status: 'OK' }
};
const serializedHtml = `{"playerResponse":${JSON.stringify(JSON.stringify(serializedPlayerResponse))}}`;
const serializedParsed = vm.runInContext(`parsePlayerResponseFromHtml(${JSON.stringify(serializedHtml)})`, parserContext);
assert.deepEqual(JSON.parse(JSON.stringify(serializedParsed)), serializedPlayerResponse, 'Serialized playerResponse parsing failed.');

const xmlParserStart = source.indexOf('  function parseXmlSegments(xmlText) {');
const xmlParserEnd = source.indexOf('  function segmentsToSrt(segments) {');
const cleanCaptionStart = source.indexOf('  function cleanCaptionText(value) {');
const cleanCaptionEnd = source.indexOf('  function cleanSingleLine(value) {');
assert.ok(xmlParserStart >= 0 && xmlParserEnd > xmlParserStart, 'Could not locate XML parser functions.');
assert.ok(cleanCaptionStart >= 0 && cleanCaptionEnd > cleanCaptionStart, 'Could not locate caption text cleaner.');
const xmlParserSource = `${source.slice(cleanCaptionStart, cleanCaptionEnd)}\n${source.slice(xmlParserStart, xmlParserEnd)}`.replace(/^  /gm, '');
const xmlContext = vm.createContext({});
vm.runInContext(xmlParserSource, xmlContext, { filename: 'timed-text-parser.js' });
const legacyXml = '<transcript><text start="0" dur="1.5">Hello &amp; welcome</text><text start="1.5" dur="2">Second line</text></transcript>';
const legacySegments = vm.runInContext(`parseXmlSegments(${JSON.stringify(legacyXml)})`, xmlContext);
assert.equal(legacySegments.length, 2, 'Legacy XML parsing failed.');
assert.equal(legacySegments[0].text, 'Hello & welcome');
assert.equal(legacySegments[0].durationMs, 1500);
const srv3Xml = '<timedtext><body><p t="250" d="900">First &lt;cue&gt;</p><p t="1150" d="1000">Second</p></body></timedtext>';
const srv3Segments = vm.runInContext(`parseXmlSegments(${JSON.stringify(srv3Xml)})`, xmlContext);
assert.equal(srv3Segments.length, 2, 'srv3 XML parsing failed.');
assert.equal(srv3Segments[0].startMs, 250);
assert.equal(srv3Segments[0].text, 'First <cue>');

const context = vm.createContext({});
vm.runInContext(source, context, { filename: 'youtube-transcript-buttons.bookmarklet.js' });
const entryPoint = context.bookmarklet_youtube_transcript_buttons;
assert.equal(typeof entryPoint, 'function');
assert.equal(entryPoint.name, 'bookmarklet_youtube_transcript_buttons');

const reconstructed = `javascript:(${entryPoint.toString()})();`;
assert.equal(generated, reconstructed, 'Generated bookmarklet text does not match the named source function.');
new vm.Script(reconstructed.slice('javascript:'.length), { filename: 'reconstructed-bookmarklet.js' });

const alerts = [];
const guardContext = vm.createContext({
  location: { hostname: 'example.com' },
  alert: message => alerts.push(String(message))
});
vm.runInContext(source, guardContext, { filename: 'youtube-transcript-buttons.bookmarklet.js' });
vm.runInContext('bookmarklet_youtube_transcript_buttons()', guardContext);
assert.equal(alerts.length, 1);
assert.match(alerts[0], /only runs on youtube\.com/i);

assert.ok(reconstructed.length < 130000, `Readable bookmarklet is unexpectedly large: ${reconstructed.length} characters.`);
console.log(`Validated embedded transcript window, watch-page and same-origin iframe fallbacks, network journal, source, installer, generated URL, host guard, and prohibited API policy (${reconstructed.length} characters).`);
