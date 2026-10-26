/**
 * Pure minibuffer command resolution and suggestion helpers.
 */
export type CommandValueMap = Record<string, unknown>;

export type MenuSurface = 'actions' | 'tools';
export type SuggestionMode = 'commands' | 'menuBrowse';

export interface CommandCompletionValue {
    value: string;
    label?: string;
    description?: string;
}

export interface TextExpanderCommandParameter {
    name: string;
    label?: string;
    required?: boolean;
    positional?: boolean;
    consumeRest?: boolean;
    type?: string;
    kind?: string;
    flag?: boolean;
    aliases?: string[];
    valueLabel?: string;
    allowedValues?: Array<string | CommandCompletionValue>;
    completionValues?: Array<string | CommandCompletionValue>;
    suffixInput?: boolean;
    textCompatible?: boolean;
    selectionCompatible?: boolean;
    signatureHidden?: boolean;
    defaultValue?: unknown | (() => unknown);
    description?: string;
    placeholder?: string;
    example?: string;
    promptLabel?: string;
    promptHelp?: string;
    validate?: (value: unknown, param: TextExpanderCommandParameter) => boolean | { ok: boolean; code?: string; message?: string } | ModelError | null | undefined;
}

export interface TextExpanderCommandSignature {
    parameters?: TextExpanderCommandParameter[];
}

export interface TextExpanderSuffixInvocation {
    enabled?: boolean;
    pipeline?: boolean;
    terminal?: boolean;
    inputParameter?: string;
    inputKind?: string;
    outputKind?: string;
}

export interface TextExpanderCommandContextMetadata {
    selectionFallback?: boolean;
}

export interface TextExpanderCommandMenuMetadata {
    menuSurface?: MenuSurface | string;
    groupName?: string;
    groupOrder?: number;
    itemId?: string;
    title?: string;
    description?: string;
    itemOrder?: number;
    keywords?: string[];
}

export interface TextExpanderCommandDefinition {
    id: string;
    name: string;
    title?: string;
    description?: string;
    aliases?: string[];
    keywords?: string[];
    primaryObject?: string;
    category?: string;
    family?: string;
    role?: string;
    outputKind?: string;
    safeGlobal?: boolean;
    opensOverlay?: boolean;
    /**
     * Soft-close (hide) the minibuffer after this command runs successfully.
     *
     * Contract:
     * - Default is `false` / `undefined`: the minibuffer stays open so the user keeps
     *   seeing the command result (for example text output) or can keep issuing commands.
     * - Set to `true` only for commands that hand off to their own UI surface (tool windows,
     *   previews, capture overlays, new tabs) where the minibuffer is no longer useful once the
     *   experience has launched.
     * - The minibuffer is only hidden on success. On any failure the minibuffer always stays
     *   open so the error stays visible to the user, regardless of this flag.
     * - Text-returning commands keep their output visible and are never auto-hidden, even if
     *   this flag is set.
     */
    hideMinibufferOnSuccess?: boolean;
    needsEditableTarget?: boolean;
    rankPriority?: number;
    specialized?: boolean;
    statsKey?: string;
    trigger?: string;
    signature?: TextExpanderCommandSignature;
    suffixInvocation?: TextExpanderSuffixInvocation;
    context?: TextExpanderCommandContextMetadata;
    metadata?: TextExpanderCommandMenuMetadata;
    validateParameters?: (values: CommandValueMap, command: TextExpanderCommandDefinition) => ModelResult;
    run?: (this: TextExpanderCommandDefinition, ctx: TextExpanderCommandRunContext) => unknown;
}

export interface TextExpanderCommandRunContext {
    command?: TextExpanderCommandDefinition;
    params?: CommandValueMap;
    parameterSources?: Record<string, string>;
    source?: string;
    page?: { url?: string; title?: string } | null;
    nowMs?: number;
    invocation?: Record<string, unknown>;
}

export interface ModelError {
    ok: false;
    kind: string;
    code: string;
    message: string;
    parameterName?: string;
    value?: string;
    token?: string;
    command?: TextExpanderCommandDefinition;
    values?: CommandValueMap;
    sources?: Record<string, string>;
    missingRequired?: TextExpanderCommandParameter[];
    [key: string]: unknown;
}

export type ModelResult = { ok: true } | ModelError;

export interface ParsedCommandLine {
    ok: true;
    commandName: string;
    named: CommandValueMap;
    flags: Record<string, boolean>;
    positional: string[];
}

export type ParseCommandLineResult = ParsedCommandLine | ModelError;

export interface SuffixCommandSegment {
    name: string;
    commandLine: string;
    commandLineStart: number;
    commandLineEnd: number;
    incomplete: boolean;
}

export interface SuffixParseResult {
    ok: true;
    mode: 'normal' | 'suffix';
    rawInput: string;
    content?: string;
    commands?: SuffixCommandSegment[];
    activeCommandIndex?: number;
    query?: string;
}

export type ParseSuffixCommandTailResult = SuffixParseResult | ModelError;

export interface CommandInvocationContext {
    selectionText?: string;
    promptValues?: CommandValueMap | null;
    suffixInput?: { value?: string } | null;
}

export interface ResolvedCommandInvocation {
    ok: true;
    command: TextExpanderCommandDefinition;
    values: CommandValueMap;
    sources: Record<string, string>;
}

export type CommandInvocationResult = ResolvedCommandInvocation | ModelError;

export interface MinibufferCompletion {
    kind: string;
    name: string;
    description: string;
    insertText: string;
    command?: TextExpanderCommandDefinition;
    parameter?: TextExpanderCommandParameter | null;
    signature?: string;
}

export interface RankingSettings {
    enableUsageBoost: boolean;
    usageHalfLifeDays: number;
    maxUsageBoost: number;
    toolCommandBoost: number;
    actionCommandBoost: number;
    specializedCommandPenalty: number;
}

export interface UsageSnapshotLike {
    byStatsKey?: Record<string, { decayedUses?: number } | undefined>;
}

export interface RankingOptions {
    settings?: Partial<RankingSettings>;
    usageSnapshot?: UsageSnapshotLike;
}

interface RankingDiagnosticsTopRow {
    commandId: string;
    commandName: string;
    category: string;
    role: string;
    statsKey: string;
    textScore: number;
    usageBoost: number;
    finalScore: number;
}

interface ScoredCommand {
    command: TextExpanderCommandDefinition;
    score: number;
    order: number;
    detail: {
        textScore: number;
        metadata: ReturnType<typeof normalizeCommandRankingMetadata>;
        usageBoost: number;
    };
}

export interface MinibufferBrowseMenuItem {
    id: string;
    command: TextExpanderCommandDefinition;
    title: string;
    description: string;
    itemId: string;
    order: number;
    keywords: string[];
    _firstSeen?: number;
}

export interface MinibufferBrowseMenuGroup {
    id: string;
    title: string;
    order: number;
    items: MinibufferBrowseMenuItem[];
    _firstSeen?: number;
}

export interface MinibufferBrowseMenuRow {
    groupId: string;
    groupTitle: string;
    item: MinibufferBrowseMenuItem;
    command: TextExpanderCommandDefinition | null;
}

function asCommandArray(commands: unknown): TextExpanderCommandDefinition[] {
    return Array.isArray(commands) ? commands.filter(isCommandDefinition) : [];
}

function isCommandDefinition(value: unknown): value is TextExpanderCommandDefinition {
    return !!value && typeof value === 'object'
        && typeof (value as { id?: unknown }).id === 'string'
        && typeof (value as { name?: unknown }).name === 'string';
}

function readCommandMetadata(command: TextExpanderCommandDefinition): TextExpanderCommandMenuMetadata | null {
    return command.metadata && typeof command.metadata === 'object' ? command.metadata : null;
}

/** Trims minibuffer text and accepts either raw command names or colon-prefixed commands. */
export function normalizeMinibufferInput(value: unknown): string {
    let normalized = typeof value === 'string' ? value.trim() : '';
    if (normalized.charAt(0) === ':') {
        normalized = normalized.slice(1).trim();
    }
    return normalized;
}

function tokenizeCommandLine(value: unknown): string[] {
    let normalized = normalizeMinibufferInput(value);
    if (!normalized) {
        return [];
    }
    return normalized.split(/\s+/);
}

function findCommandByName(commands: unknown, name: unknown): TextExpanderCommandDefinition | null {
    let normalized = typeof name === 'string' ? name.trim().toLowerCase() : '';
    if (normalized.charAt(0) === ':') {
        normalized = normalized.slice(1).trim();
    }
    if (!normalized) {
        return null;
    }
    let list = asCommandArray(commands);
    for (let i = 0; i < list.length; i += 1) {
        const command = list[i];
        if (command && command.name.toLowerCase() === normalized) {
            return command;
        }
    }
    for (let i = 0; i < list.length; i += 1) {
        let command = list[i];
        if (!command || !Array.isArray(command.aliases)) {
            continue;
        }
        for (let aliasIndex = 0; aliasIndex < command.aliases.length; aliasIndex += 1) {
            if (String(command.aliases[aliasIndex]).toLowerCase() === normalized) {
                return command;
            }
        }
    }
    return null;
}

export function normalizeParameterName(value: unknown): string {
    let normalized = typeof value === 'string' ? value.trim() : '';
    while (normalized.charAt(0) === '-') {
        normalized = normalized.slice(1);
    }
    return normalized.toLowerCase();
}

export function getCommandParameters(command: TextExpanderCommandDefinition | null | undefined): TextExpanderCommandParameter[] {
    let params = command && command.signature && Array.isArray(command.signature.parameters)
        ? command.signature.parameters
        : [];
    return params.filter(function (param) {
        return param && typeof param.name === 'string' && param.name.trim().length > 0;
    });
}

export function getCommandParameter(command: TextExpanderCommandDefinition | null | undefined, name: unknown): TextExpanderCommandParameter | null {
    let normalized = normalizeParameterName(name);
    if (!normalized) {
        return null;
    }
    let params = getCommandParameters(command);
    for (let i = 0; i < params.length; i += 1) {
        let param = params[i];
        if (!param) {
            continue;
        }
        if (!param) {
            continue;
        }
        if (normalizeParameterName(param.name) === normalized) {
            return param;
        }
        if (Array.isArray(param.aliases)) {
            for (let aliasIndex = 0; aliasIndex < param.aliases.length; aliasIndex += 1) {
                if (normalizeParameterName(param.aliases[aliasIndex]) === normalized) {
                    return param;
                }
            }
        }
    }
    return null;
}

function isFlagParameter(param: TextExpanderCommandParameter | null | undefined): boolean {
    return !!param && (param.flag === true || param.type === 'boolean' || param.kind === 'flag');
}

function paramExpectsValue(param: TextExpanderCommandParameter | null | undefined): boolean {
    return !isFlagParameter(param);
}

function makeModelError(kind: string, code: string, message: string, extra: Partial<ModelError> = {}): ModelError {
    return Object.assign({
        ok: false,
        kind: kind,
        code: code,
        message: message
    }, extra || {});
}

function getParamValueLabel(param: TextExpanderCommandParameter | null | undefined): string {
    if (!param) {
        return 'value';
    }
    if (typeof param.valueLabel === 'string' && param.valueLabel.trim().length > 0) {
        return param.valueLabel.trim();
    }
    if (param.type === 'boolean' || param.kind === 'flag') {
        return 'flag';
    }
    if (param.type === 'enum') {
        return 'name';
    }
    return 'value';
}

function parameterUsage(param: TextExpanderCommandParameter): string {
    let name = '-' + param.name;
    if (isFlagParameter(param)) {
        return name;
    }
    return name + ' <' + getParamValueLabel(param) + '>';
}

/** Builds the human-readable command usage string shown in completions and help text. */
export function buildCommandSignature(command: TextExpanderCommandDefinition | null | undefined): string {
    if (!command || typeof command.name !== 'string') {
        return '';
    }
    let parts = [command.name];
    let params = getCommandParameters(command);
    for (let i = 0; i < params.length; i += 1) {
        let param = params[i];
        if (!param) {
            continue;
        }
        if (param.signatureHidden === true) {
            continue;
        }
        let usage = parameterUsage(param);
        parts.push(param.required === true ? usage : '[' + usage + ']');
    }
    return parts.join(' ');
}

function commandHaystack(command: TextExpanderCommandDefinition): string {
    return [
        command.name,
        command.title,
        command.description,
        Array.isArray(command.aliases) ? command.aliases.join(' ') : '',
        Array.isArray(command.keywords) ? command.keywords.join(' ') : '',
        command.primaryObject,
        buildCommandSignature(command)
    ].join(' ').toLowerCase();
}

export const DEFAULT_MINIBUFFER_RANKING_SETTINGS = Object.freeze({
    enableUsageBoost: true,
    usageHalfLifeDays: 7,
    maxUsageBoost: 12,
    toolCommandBoost: 12,
    actionCommandBoost: 5,
    specializedCommandPenalty: 18
});

let lastRankingDiagnostics = {
    queryLength: 0,
    candidateCount: 0,
    returnedCount: 0,
    top: [] as RankingDiagnosticsTopRow[]
};

function getSuffixMetadata(command: TextExpanderCommandDefinition | null | undefined): TextExpanderSuffixInvocation | null {
    return command && command.suffixInvocation && typeof command.suffixInvocation === 'object'
        ? command.suffixInvocation
        : null;
}

/** Selects which command parameter receives text passed from suffix invocation. */
export function getSuffixInputParameter(command: TextExpanderCommandDefinition | null | undefined): TextExpanderCommandParameter | null {
    let params = getCommandParameters(command);
    let metadata = getSuffixMetadata(command);
    let inputName = metadata && typeof metadata.inputParameter === 'string' ? metadata.inputParameter : '';
    if (inputName) {
        return getCommandParameter(command, inputName);
    }
    for (let i = 0; i < params.length; i += 1) {
        const param = params[i];
        if (param && (param.suffixInput === true || param.textCompatible === true || param.selectionCompatible === true)) {
            return param;
        }
    }
    return null;
}

export function commandSupportsSuffixInvocation(command: TextExpanderCommandDefinition | null | undefined): boolean {
    let metadata = getSuffixMetadata(command);
    return !!metadata
        && metadata.enabled === true
        && metadata.inputKind === 'text'
        && !!getSuffixInputParameter(command);
}

export function commandSupportsPipeline(command: TextExpanderCommandDefinition | null | undefined): boolean {
    let metadata = getSuffixMetadata(command);
    return commandSupportsSuffixInvocation(command)
        && !!metadata
        && metadata.pipeline === true
        && metadata.outputKind === 'text';
}

export function isPipelineTerminalCommand(command: TextExpanderCommandDefinition | null | undefined): boolean {
    let metadata = getSuffixMetadata(command);
    return commandSupportsSuffixInvocation(command) && !!metadata && metadata.terminal === true;
}

function makeSuffixParseError(code: string, message: string): ModelError {
    return makeModelError('suffix-parse', code, message);
}

/** Parses trailing @command suffix syntax without treating ordinary text as a pipeline. */
export function parseSuffixCommandTail(input: unknown, options: { allowIncomplete?: boolean } = {}): ParseSuffixCommandTailResult {
    let raw = typeof input === 'string' ? input : '';
    let allowIncomplete = options.allowIncomplete === true;
    let trimmed = raw.replace(/\s+$/g, '');
    if (!trimmed) {
        return { ok: true, mode: 'normal', rawInput: raw };
    }
    let markerPattern = /\s+@([A-Za-z0-9][A-Za-z0-9_-]*)(?=$|\s)/g;
    let markers: Array<{ markerStart: number; atIndex: number; commandLineStart: number; name: string; incomplete?: boolean }> = [];
    let match: RegExpExecArray | null;
    while ((match = markerPattern.exec(trimmed)) !== null) {
        let whitespace = match[0].slice(0, match[0].indexOf('@'));
        let atIndex = match.index + whitespace.length;
        markers.push({
            markerStart: match.index,
            atIndex: atIndex,
            commandLineStart: atIndex + 1,
            name: match[1] || ''
        });
    }
    if (allowIncomplete) {
        let partial = trimmed.match(/\s+@([A-Za-z0-9][A-Za-z0-9_-]*)?$/);
        if (partial) {
            let whitespace = partial[0].slice(0, partial[0].indexOf('@'));
            let partialIndex = partial.index ?? 0;
            let atIndex = partialIndex + whitespace.length;
            let lastMarker = markers[markers.length - 1];
            let alreadyCaptured = !!lastMarker && lastMarker.atIndex === atIndex;
            if (!alreadyCaptured) {
                markers.push({
                    markerStart: partialIndex,
                    atIndex: atIndex,
                    commandLineStart: atIndex + 1,
                    name: partial[1] || '',
                    incomplete: true
                });
            }
        }
    }
    if (markers.length === 0) {
        if (/\s+@/.test(trimmed) && /\s+@\S*$/.test(trimmed)) {
            return makeSuffixParseError('malformed_suffix_command', 'Suffix commands must look like " @command-name".');
        }
        if (/\s+@$/.test(trimmed)) {
            return makeSuffixParseError('empty_suffix_command', 'Type a command name after "@".');
        }
        return { ok: true, mode: 'normal', rawInput: raw };
    }
    let commands: SuffixCommandSegment[] = [];
    for (let i = 0; i < markers.length; i += 1) {
        let marker = markers[i];
        if (!marker) {
            continue;
        }
        let nextMarker = markers[i + 1];
        let commandLineEnd = nextMarker ? nextMarker.markerStart : trimmed.length;
        let commandLine = trimmed.slice(marker.commandLineStart, commandLineEnd).trim();
        if (!allowIncomplete && !marker.name) {
            return makeSuffixParseError('empty_suffix_command', 'Type a command name after "@".');
        }
        if (marker.name && commandLine && commandLine.split(/\s+/)[0] !== marker.name) {
            return makeSuffixParseError('malformed_suffix_command', 'Suffix commands must look like " @command-name".');
        }
        commands.push({
            name: marker.name,
            commandLine: commandLine,
            commandLineStart: marker.commandLineStart,
            commandLineEnd: commandLineEnd,
            incomplete: marker.incomplete === true
        });
    }
    let firstMarker = markers[0];
    if (!firstMarker) {
        return { ok: true, mode: 'normal', rawInput: raw };
    }
    let content = trimmed.slice(0, firstMarker.markerStart);
    if (content.length === 0) {
        return makeSuffixParseError('missing_suffix_content', 'Type or paste content before the suffix command.');
    }
    return {
        ok: true,
        mode: 'suffix',
        rawInput: raw,
        content: content,
        commands: commands,
        activeCommandIndex: commands.length - 1,
        query: commands[commands.length - 1]?.name || ''
    };
}

function replaceSuffixCommandToken(input: unknown, commandName: string): string {
    let raw = typeof input === 'string' ? input : '';
    let trimmed = raw.replace(/\s+$/g, '');
    let replacement = ' @' + commandName;
    if (/\s+@[A-Za-z0-9][A-Za-z0-9_-]*$/.test(trimmed)) {
        return trimmed.replace(/\s+@[A-Za-z0-9][A-Za-z0-9_-]*$/, replacement);
    }
    if (/\s+@$/.test(trimmed)) {
        return trimmed.replace(/\s+@$/, replacement);
    }
    return trimmed + replacement;
}

function replaceSuffixCommandLine(input: unknown, parsedSuffix: ParseSuffixCommandTailResult, commandLine: string): string {
    let active = parsedSuffix.ok && parsedSuffix.mode === 'suffix' && Array.isArray(parsedSuffix.commands) && typeof parsedSuffix.activeCommandIndex === 'number'
        ? parsedSuffix.commands[parsedSuffix.activeCommandIndex]
        : null;
    if (!active || !Number.isFinite(active.commandLineStart) || !Number.isFinite(active.commandLineEnd)) {
        return typeof input === 'string' ? input : '';
    }
    let raw = typeof input === 'string' ? input : '';
    return raw.slice(0, active.commandLineStart) + commandLine + raw.slice(active.commandLineEnd);
}

function tokenizeRankText(value: unknown): string[] {
    return String(value || '').toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
}

function fieldMatchScore(value: unknown, query: string): number {
    let field = String(value || '').toLowerCase();
    if (!field || !query) {
        return Infinity;
    }
    if (field === query) {
        return 0;
    }
    if (field.indexOf(query) === 0) {
        return 10;
    }
    let boundaryIndex = field.search(new RegExp('(^|[^a-z0-9])' + escapeRegExp(query)));
    if (boundaryIndex !== -1) {
        return 24 + Math.max(0, boundaryIndex);
    }
    let substringIndex = field.indexOf(query);
    if (substringIndex !== -1) {
        return 38 + substringIndex;
    }
    let queryTokens = tokenizeRankText(query);
    if (queryTokens.length <= 1) {
        return Infinity;
    }
    let cursor = 0;
    let matched = 0;
    for (let i = 0; i < queryTokens.length; i += 1) {
        let queryToken = queryTokens[i] || '';
        let index = field.indexOf(queryToken, cursor);
        if (index === -1) {
            continue;
        }
        matched += 1;
        cursor = index + queryToken.length;
    }
    if (matched === queryTokens.length) {
        return 55 + field.length - query.length;
    }
    return Infinity;
}

function escapeRegExp(value: unknown): string {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Fills ranking metadata defaults so command search can score mixed legacy definitions. */
export function normalizeCommandRankingMetadata(command: TextExpanderCommandDefinition | null | undefined): {
    category: string;
    role: string;
    keywords: string[];
    primaryObject: string;
    rankPriority: number;
    specialized: boolean;
    statsKey: string;
} {
    let category = typeof command?.category === 'string' ? command.category : (command?.family === 'tool' ? 'tool' : 'utility');
    let role = typeof command?.role === 'string' ? command.role : (category === 'tool' ? 'primary' : 'utility');
    let keywords = Array.isArray(command?.keywords) ? command.keywords.filter(function (item: unknown): item is string {
        return typeof item === 'string' && item.trim().length > 0;
    }) : [];
    let primaryObject = typeof command?.primaryObject === 'string' ? command.primaryObject : '';
    let rankPriority = Number.isFinite(command?.rankPriority) ? Number(command?.rankPriority) : 0;
    let specialized = command?.specialized === true || role === 'transport-wrapper';
    let statsKey = typeof command?.statsKey === 'string' && command.statsKey.trim().length > 0
        ? command.statsKey.trim()
        : (typeof command?.id === 'string' && command.id.trim().length > 0 ? command.id.trim() : String(command?.name || ''));
    return { category, role, keywords, primaryObject, rankPriority, specialized, statsKey };
}

function scoreCommand(command: TextExpanderCommandDefinition, query: string, options: RankingOptions = {}) {
    let metadata = normalizeCommandRankingMetadata(command);
    let best = fieldMatchScore(command.name, query);
    let aliases = Array.isArray(command.aliases) ? command.aliases : [];
    for (let i = 0; i < aliases.length; i += 1) {
        best = Math.min(best, fieldMatchScore(aliases[i], query) + 12);
    }
    best = Math.min(best, fieldMatchScore(command.title, query) + 18);
    best = Math.min(best, fieldMatchScore(metadata.keywords.join(' '), query) + 20);
    best = Math.min(best, fieldMatchScore(command.description, query) + 58);
    best = Math.min(best, fieldMatchScore(buildCommandSignature(command), query) + 75);
    if (!Number.isFinite(best)) {
        return null;
    }
    let settings: RankingSettings = Object.assign({}, DEFAULT_MINIBUFFER_RANKING_SETTINGS, options.settings || {});
    let score = best - metadata.rankPriority;
    if (metadata.category === 'tool') {
        score -= settings.toolCommandBoost;
    }
    else if (metadata.category === 'action') {
        score -= settings.actionCommandBoost;
    }
    if (metadata.role === 'primary') {
        score -= 4;
    }
    if (metadata.specialized) {
        let specificTerms = tokenizeRankText([
            metadata.primaryObject,
            metadata.keywords.join(' ')
        ].join(' '));
        let queryTokens = tokenizeRankText(query);
        let specificMatch = queryTokens.length > 1 && queryTokens.every(function (token: string) {
            return specificTerms.indexOf(token) !== -1 || String(command.name || '').toLowerCase().indexOf(token) !== -1;
        });
        if (!specificMatch) {
            score += settings.specializedCommandPenalty;
        }
    }
    let usage = options.usageSnapshot && options.usageSnapshot.byStatsKey
        ? options.usageSnapshot.byStatsKey[metadata.statsKey]
        : null;
    let usageBoost = 0;
    const decayedUses = usage && Number.isFinite(usage.decayedUses) ? Number(usage.decayedUses) : 0;
    if (settings.enableUsageBoost !== false && decayedUses > 0) {
        usageBoost = Math.min(settings.maxUsageBoost, Math.log2(decayedUses + 1) * 4);
        score -= usageBoost;
    }
    return {
        score: score,
        textScore: best,
        metadata: metadata,
        usageBoost: usageBoost
    };
}

/** Suggests eligible @commands or their parameters while editing a suffix pipeline. */
export function getSuffixCommandSuggestions(commands: unknown, input: unknown, limit = 8): MinibufferCompletion[] {
    let parsed = parseSuffixCommandTail(input, { allowIncomplete: true });
    if (!parsed.ok || parsed.mode !== 'suffix') {
        return [];
    }
    let max = Math.max(1, Math.floor(limit));
    let query = (parsed.query || '').toLowerCase();
    let parsedCommands = parsed.commands || [];
    let activeIndex = typeof parsed.activeCommandIndex === 'number' ? parsed.activeCommandIndex : -1;
    let active = activeIndex >= 0 ? parsedCommands[activeIndex] : undefined;
    let activeCommand = active && active.name ? findCommandByName(commands, active.name) : null;
    let activeLine = active && typeof active.commandLine === 'string' ? active.commandLine : '';
    if (activeCommand && commandSupportsSuffixInvocation(activeCommand) && /\s/.test(activeLine)) {
        return getMinibufferCompletions(commands, activeLine, max).filter(function (completion) {
            return completion.kind === 'parameter-name' || completion.kind === 'parameter-value';
        }).map(function (completion) {
            return Object.assign({}, completion, {
                insertText: replaceSuffixCommandLine(input, parsed, completion.insertText)
            });
        });
    }
    let isContinuation = parsedCommands.length > 1;
    let list = asCommandArray(commands);
    let eligible: TextExpanderCommandDefinition[] = [];
    for (let i = 0; i < list.length; i += 1) {
        let command = list[i];
        if (!command) {
            continue;
        }
        if (!commandSupportsSuffixInvocation(command)) {
            continue;
        }
        if (isContinuation && !commandSupportsPipeline(command) && !isPipelineTerminalCommand(command)) {
            continue;
        }
        eligible.push(command);
    }
    let suggestions = query ? getCommandSuggestions(eligible, query, max) : eligible.slice(0, max);
    return suggestions.map(function (item) {
        return {
            kind: 'suffix-command',
            name: '@' + item.name,
            description: item.description || buildCommandSignature(item),
            insertText: replaceSuffixCommandToken(input, item.name),
            command: item,
            signature: buildCommandSignature(item)
        };
    });
}

function getScoredCommandSuggestions(commands: unknown, input: unknown, limit = 8, options: RankingOptions = {}): ScoredCommand[] {
    let query = normalizeMinibufferInput(input).toLowerCase();
    if (!query) {
        lastRankingDiagnostics = {
            queryLength: 0,
            candidateCount: Array.isArray(commands) ? commands.length : 0,
            returnedCount: 0,
            top: []
        };
        return [];
    }
    let scored: ScoredCommand[] = [];
    let list = asCommandArray(commands);
    for (let i = 0; i < list.length; i += 1) {
        let command = list[i];
        if (!command || typeof command.name !== 'string') {
            continue;
        }
        let scoredCommand = scoreCommand(command, query, options);
        if (!scoredCommand || !Number.isFinite(scoredCommand.score)) {
            continue;
        }
        scored.push({ command: command, score: scoredCommand.score, order: i, detail: scoredCommand });
    }
    scored.sort(function (a, b) {
        if (a.score !== b.score) {
            return a.score - b.score;
        }
        return a.order - b.order;
    });
    let limited = scored.slice(0, Math.max(1, Math.floor(limit)));
    lastRankingDiagnostics = {
        queryLength: query.length,
        candidateCount: list.length,
        returnedCount: limited.length,
        top: limited.map(function (item) {
            return {
                commandId: item.command.id || '',
                commandName: item.command.name,
                category: item.detail.metadata.category,
                role: item.detail.metadata.role,
                statsKey: item.detail.metadata.statsKey,
                textScore: item.detail.textScore,
                usageBoost: item.detail.usageBoost,
                finalScore: item.score
            };
        })
    };
    return limited;
}

export function getLastRankingDiagnostics() {
    return {
        queryLength: lastRankingDiagnostics.queryLength,
        candidateCount: lastRankingDiagnostics.candidateCount,
        returnedCount: lastRankingDiagnostics.returnedCount,
        top: lastRankingDiagnostics.top.map(function (item) {
            return Object.assign({}, item);
        })
    };
}

export function getCommandSuggestions(commands: unknown, input: unknown, limit = 8, options: RankingOptions = {}): TextExpanderCommandDefinition[] {
    return getScoredCommandSuggestions(commands, input, limit, options).map(function (item) {
        return item.command;
    });
}

export function buildExecutableCommandText(command: TextExpanderCommandDefinition | null | undefined, input: unknown): string {
    let normalized = normalizeMinibufferInput(input);
    if (!command || typeof command.name !== 'string') {
        return normalized;
    }
    if (!normalized) {
        return command.name;
    }
    let firstWhitespace = normalized.search(/\s/);
    if (firstWhitespace === -1) {
        return command.name;
    }
    return command.name + normalized.slice(firstWhitespace);
}

export function resolveExactCommand(commands: unknown, input: unknown): TextExpanderCommandDefinition | null {
    let tokens = tokenizeCommandLine(input);
    if (tokens.length === 0) {
        return null;
    }
    return findCommandByName(commands, tokens[0] || '');
}

export function completeCommandInput(commands: unknown, input: unknown, highlightedIndex: unknown): TextExpanderCommandDefinition | null {
    let suggestions = getCommandSuggestions(commands, input);
    if (suggestions.length === 0) {
        return null;
    }
    let numericIndex = typeof highlightedIndex === 'number' && Number.isInteger(highlightedIndex) ? highlightedIndex : 0;
    let index = numericIndex >= 0 && numericIndex < suggestions.length
        ? numericIndex
        : 0;
    return suggestions[index] || null;
}

/** Parses a minibuffer command line into named values, flags, and positional text. */
export function parseCommandLine(command: TextExpanderCommandDefinition, input: unknown): ParseCommandLineResult {
    let tokens = tokenizeCommandLine(input);
    if (tokens.length === 0) {
        return makeModelError('parse', 'empty_command', 'Type a command name.');
    }
    let commandName = tokens[0] || '';
    let named: CommandValueMap = Object.create(null);
    let flags: Record<string, boolean> = Object.create(null);
    let positional: string[] = [];
    let namedMode = false;
    for (let i = 1; i < tokens.length; i += 1) {
        let token = tokens[i] || '';
        if (token.charAt(0) !== '-') {
            if (namedMode) {
                return makeModelError('parse', 'unexpected_positional_after_named', 'Unexpected value "' + token + '" after named parameters.', {
                    token: token
                });
            }
            positional.push(token);
            continue;
        }
        namedMode = true;
        let rawName = normalizeParameterName(token);
        if (!rawName) {
            return makeModelError('parse', 'empty_parameter_name', 'Type a parameter name after "-".');
        }
        let param = getCommandParameter(command, rawName);
        if (!param) {
            return makeModelError('parse', 'unknown_parameter', 'Unknown parameter "' + token + '" for ' + commandName + '.', {
                parameterName: rawName
            });
        }
        let canonicalName = param.name;
        if (Object.prototype.hasOwnProperty.call(named, canonicalName) || Object.prototype.hasOwnProperty.call(flags, canonicalName)) {
            return makeModelError('parse', 'repeated_parameter', 'Parameter "-' + canonicalName + '" was provided more than once.', {
                parameterName: canonicalName
            });
        }
        if (isFlagParameter(param)) {
            flags[canonicalName] = true;
            continue;
        }
        let next = tokens[i + 1];
        if (typeof next !== 'string' || next.charAt(0) === '-') {
            return makeModelError('parse', 'missing_parameter_value', 'Add a value after "-' + canonicalName + '".', {
                parameterName: canonicalName
            });
        }
        named[canonicalName] = next;
        i += 1;
    }
    return {
        ok: true,
        commandName: commandName,
        named: named,
        flags: flags,
        positional: positional
    };
}

function readCompletionValues(param: TextExpanderCommandParameter | null | undefined): CommandCompletionValue[] {
    if (!param) {
        return [];
    }
    let source: Array<string | CommandCompletionValue> = [];
    if (Array.isArray(param.allowedValues)) {
        source = param.allowedValues;
    }
    else if (Array.isArray(param.completionValues)) {
        source = param.completionValues;
    }
    let values = [];
    for (let i = 0; i < source.length; i += 1) {
        let item = source[i];
        if (typeof item === 'string') {
            values.push({ value: item, label: item, description: '' });
        }
        else if (item && typeof item === 'object' && typeof item.value === 'string') {
            values.push({
                value: item.value,
                label: typeof item.label === 'string' && item.label.length > 0 ? item.label : item.value,
                description: typeof item.description === 'string' ? item.description : ''
            });
        }
    }
    return values;
}

function validateOneParameter(param: TextExpanderCommandParameter | null | undefined, value: unknown): ModelResult {
    if (!param) {
        return { ok: true };
    }
    if (param.required === true && (typeof value === 'undefined' || value === null || String(value).trim().length === 0)) {
        return makeModelError('resolution', 'required_parameter_missing', 'Provide a value for "-' + param.name + '".', {
            parameterName: param.name
        });
    }
    if (typeof value === 'undefined' || value === null || value === '') {
        return { ok: true };
    }
    if (isFlagParameter(param) && value !== true && value !== false) {
        return makeModelError('validation', 'invalid_flag_value', 'Parameter "-' + param.name + '" is a flag.', {
            parameterName: param.name
        });
    }
    if (param.type === 'enum' && Array.isArray(param.allowedValues)) {
        let allowed = readCompletionValues(param).map(function (item) {
            return item.value;
        });
        if (allowed.indexOf(String(value)) === -1) {
            return makeModelError('validation', 'invalid_parameter_value', 'Unknown value "' + String(value) + '" for "-' + param.name + '". Try one of: ' + allowed.join(', ') + '.', {
                parameterName: param.name,
                value: String(value)
            });
        }
    }
    if (typeof param.validate === 'function') {
        let result = param.validate(value, param);
        if (result === false) {
            return makeModelError('validation', 'invalid_parameter_value', 'Invalid value for "-' + param.name + '".', {
                parameterName: param.name,
                value: String(value)
            });
        }
        if (result && typeof result === 'object' && result.ok === false) {
            return makeModelError('validation', result.code || 'invalid_parameter_value', result.message || ('Invalid value for "-' + param.name + '".'), {
                parameterName: param.name,
                value: String(value)
            });
        }
    }
    return { ok: true };
}

/** Runs per-parameter validators before applying any command-level validation hook. */
export function validateCommandParameters(command: TextExpanderCommandDefinition | null | undefined, values: CommandValueMap | null | undefined): ModelResult {
    let params = getCommandParameters(command);
    for (let i = 0; i < params.length; i += 1) {
        let param = params[i];
        if (!param) {
            continue;
        }
        let result = validateOneParameter(param, values ? values[param.name] : undefined);
        if (!result.ok) {
            return result;
        }
    }
    if (command && typeof command.validateParameters === 'function') {
        let result = command.validateParameters(values || {}, command);
        if (result && result.ok === false) {
            return makeModelError('validation', result.code || 'command_validation_failed', result.message || 'Command parameters are invalid.', {
                parameterName: result.parameterName,
                value: result.value
            });
        }
    }
    return { ok: true };
}

/** Merges explicit, suffix, selection, default, and prompted values into an executable command call. */
export function resolveCommandInvocation(command: TextExpanderCommandDefinition | null | undefined, parsed: ParseCommandLineResult | null | undefined, context: CommandInvocationContext = {}): CommandInvocationResult {
    if (!command || !parsed || parsed.ok !== true) {
        return makeModelError('resolution', 'invalid_invocation_state', 'Command input could not be resolved.');
    }
    let params = getCommandParameters(command);
    let values: CommandValueMap = Object.create(null);
    let sources: Record<string, string> = Object.create(null);
    let positionalIndex = 0;
    for (let i = 0; i < params.length; i += 1) {
        let param = params[i];
        if (!param) {
            continue;
        }
        if (Object.prototype.hasOwnProperty.call(parsed.named, param.name)) {
            values[param.name] = parsed.named[param.name];
            sources[param.name] = 'explicit';
            continue;
        }
        if (Object.prototype.hasOwnProperty.call(parsed.flags, param.name)) {
            values[param.name] = true;
            sources[param.name] = 'explicit';
            continue;
        }
        if (param.positional === true && positionalIndex < parsed.positional.length) {
            if (param.consumeRest === true) {
                values[param.name] = parsed.positional.slice(positionalIndex).join(' ');
                sources[param.name] = 'explicit';
                positionalIndex = parsed.positional.length;
                continue;
            }
            values[param.name] = parsed.positional[positionalIndex];
            sources[param.name] = 'explicit';
            positionalIndex += 1;
            continue;
        }
    }
    if (positionalIndex < parsed.positional.length) {
        return makeModelError('parse', 'unexpected_positional_value', 'Unexpected value "' + parsed.positional[positionalIndex] + '".', {
            token: parsed.positional[positionalIndex]
        });
    }
    if (params.length > 0) {
        let firstParam = params[0];
        if (!firstParam) {
            return makeModelError('resolution', 'invalid_invocation_state', 'Command input could not be resolved.');
        }
        let hasFirstValue = Object.prototype.hasOwnProperty.call(values, firstParam.name);
        let suffixInput = context.suffixInput && typeof context.suffixInput === 'object' ? context.suffixInput : null;
        let suffixParam = suffixInput ? getSuffixInputParameter(command) : null;
        if (!hasFirstValue && suffixInput && suffixParam && suffixParam.name === firstParam.name && typeof suffixInput.value === 'string') {
            values[firstParam.name] = suffixInput.value;
            sources[firstParam.name] = 'suffix';
            hasFirstValue = true;
        }
        let selectionText = typeof context.selectionText === 'string' ? context.selectionText.trim() : '';
        let commandAllowsSelection = command.context && command.context.selectionFallback === true;
        if (!hasFirstValue && commandAllowsSelection && firstParam.selectionCompatible === true && selectionText.length > 0) {
            values[firstParam.name] = selectionText;
            sources[firstParam.name] = 'selection';
        }
    }
    for (let i = 0; i < params.length; i += 1) {
        let param = params[i];
        if (!param) {
            continue;
        }
        if (!Object.prototype.hasOwnProperty.call(values, param.name) && Object.prototype.hasOwnProperty.call(param, 'defaultValue')) {
            values[param.name] = typeof param.defaultValue === 'function' ? param.defaultValue() : param.defaultValue;
            sources[param.name] = 'default';
        }
    }
    if (context.promptValues && typeof context.promptValues === 'object') {
        for (let i = 0; i < params.length; i += 1) {
            let param = params[i];
            if (!param) {
                continue;
            }
            if (!Object.prototype.hasOwnProperty.call(values, param.name) && Object.prototype.hasOwnProperty.call(context.promptValues, param.name)) {
                values[param.name] = context.promptValues[param.name];
                sources[param.name] = 'prompt';
            }
        }
    }
    let missingRequired: TextExpanderCommandParameter[] = [];
    for (let i = 0; i < params.length; i += 1) {
        let param = params[i];
        if (!param) {
            continue;
        }
        if (param.required === true && !Object.prototype.hasOwnProperty.call(values, param.name)) {
            missingRequired.push(param);
        }
    }
    if (missingRequired.length > 0) {
        return {
            ok: false,
            kind: 'resolution',
            code: 'missing_required_parameters',
            message: 'Required command input is missing.',
            command: command,
            values: values,
            sources: sources,
            missingRequired: missingRequired
        };
    }
    let validation = validateCommandParameters(command, values);
    if (!validation.ok) {
        return validation;
    }
    return {
        ok: true,
        command: command,
        values: values,
        sources: sources
    };
}

/** Adapts suffix-provided text into the normal command invocation resolver. */
export function resolveSuffixCommandInvocation(command: TextExpanderCommandDefinition | null | undefined, content: unknown, context: CommandInvocationContext = {}): CommandInvocationResult {
    if (!command || !commandSupportsSuffixInvocation(command)) {
        return makeModelError('suffix-validation', 'suffix_command_unsupported', 'This command is not available in suffix mode.');
    }
    let syntheticParsed: ParsedCommandLine = {
        ok: true,
        commandName: command.name,
        named: Object.create(null) as CommandValueMap,
        flags: Object.create(null) as Record<string, boolean>,
        positional: [] as string[]
    };
    let suffixContext = Object.assign({}, context, {
        suffixInput: { value: typeof content === 'string' ? content : '' }
    });
    return resolveCommandInvocation(command, syntheticParsed, suffixContext);
}

function alreadyProvidedParameterNames(command: TextExpanderCommandDefinition, input: unknown): Record<string, boolean> {
    let provided: Record<string, boolean> = Object.create(null);
    let tokens = tokenizeCommandLine(input);
    for (let i = 1; i < tokens.length; i += 1) {
        let token = tokens[i] || '';
        if (token.charAt(0) !== '-') {
            continue;
        }
        let param = getCommandParameter(command, token);
        if (param) {
            provided[param.name] = true;
        }
    }
    return provided;
}

function replaceCurrentToken(input: unknown, replacement: string): string {
    let raw = typeof input === 'string' ? input : '';
    if (/\s$/.test(raw)) {
        return raw + replacement;
    }
    let index = raw.search(/\S+$/);
    if (index === -1) {
        return replacement;
    }
    return raw.slice(0, index) + replacement;
}

function buildParameterCompletionDescription(param: TextExpanderCommandParameter): string {
    let pieces: string[] = [];
    pieces.push(param.required === true ? 'required' : 'optional');
    pieces.push(isFlagParameter(param) ? 'flag' : '<' + getParamValueLabel(param) + '>');
    if (typeof param.description === 'string' && param.description.length > 0) {
        pieces.push(param.description);
    }
    return pieces.join(' · ');
}

function getActiveValueCompletionTarget(command: TextExpanderCommandDefinition, input: unknown): { param: TextExpanderCommandParameter; prefix: string } | null {
    let raw = normalizeMinibufferInput(input);
    let trailingSpace = /\s$/.test(typeof input === 'string' ? input : '');
    let tokens = raw ? raw.split(/\s+/) : [];
    if (tokens.length < 2) {
        return null;
    }
    for (let i = 1; i < tokens.length; i += 1) {
        let token = tokens[i] || '';
        if (token.charAt(0) !== '-') {
            continue;
        }
        let param = getCommandParameter(command, token);
        if (!param || !paramExpectsValue(param)) {
            continue;
        }
        if (i === tokens.length - 1 && trailingSpace) {
            return { param: param, prefix: '' };
        }
        if (trailingSpace) {
            i += 1;
            continue;
        }
        let nextToken = tokens[i + 1] || '';
        if (i + 1 === tokens.length - 1 && nextToken.charAt(0) !== '-') {
            return { param: param, prefix: nextToken };
        }
        i += 1;
    }
    return null;
}

/** Chooses command, parameter-name, parameter-value, or suffix completions for current minibuffer text. */
export function getMinibufferCompletions(commands: unknown, input: unknown, limit = 8, options: RankingOptions = {}): MinibufferCompletion[] {
    let raw = typeof input === 'string' ? input : '';
    let suffixCompletions = getSuffixCommandSuggestions(commands, raw, limit);
    if (suffixCompletions.length > 0) {
        return suffixCompletions;
    }
    let tokens = tokenizeCommandLine(raw);
    let command = tokens.length > 0 ? findCommandByName(commands, tokens[0] || '') : null;
    let max = Math.max(1, Math.floor(limit));
    if (!command) {
        return getScoredCommandSuggestions(commands, raw, max, options).map(function (scoredItem) {
            let item = scoredItem.command;
            let description = item.description || buildCommandSignature(item);
            if (scoredItem.detail.usageBoost > 0) {
                description = description ? description + ' · used locally' : 'used locally';
            }
            return {
                kind: 'command',
                name: item.name,
                description: description,
                insertText: item.name,
                command: item,
                signature: buildCommandSignature(item)
            };
        });
    }
    let valueTarget = getActiveValueCompletionTarget(command, raw);
    if (valueTarget) {
        let prefix = valueTarget.prefix.toLowerCase();
        let values = readCompletionValues(valueTarget.param).filter(function (item) {
            let value = item.value.toLowerCase();
            let label = (item.label || item.value).toLowerCase();
            if (prefix && (value === prefix || label === prefix)) {
                return false;
            }
            return !prefix || value.indexOf(prefix) === 0 || label.indexOf(prefix) === 0;
        });
        return values.slice(0, max).map(function (item) {
            return {
                kind: 'parameter-value',
                name: item.value,
                description: item.description || ('Value for -' + valueTarget.param.name),
                insertText: replaceCurrentToken(raw, item.value),
                command: command,
                parameter: valueTarget.param
            };
        });
    }
    let normalizedRaw = normalizeMinibufferInput(raw);
    let currentToken = /\s$/.test(raw) ? '' : (tokens.length > 0 ? tokens[tokens.length - 1] || '' : '');
    let shouldShowParams = getCommandParameters(command).length > 0 && (
        currentToken.charAt(0) === '-' ||
        /\s$/.test(raw)
    );
    if (!shouldShowParams) {
        return [];
    }
    let prefix = normalizeParameterName(currentToken);
    let provided = alreadyProvidedParameterNames(command, raw);
    let params = getCommandParameters(command).filter(function (param) {
        if (provided[param.name] === true) {
            return false;
        }
        return !prefix || param.name.toLowerCase().indexOf(prefix) === 0;
    });
    params.sort(function (a, b) {
        if (a.required === true && b.required !== true) {
            return -1;
        }
        if (a.required !== true && b.required === true) {
            return 1;
        }
        return a.name.localeCompare(b.name);
    });
    return params.slice(0, max).map(function (param) {
        let insertion = '-' + param.name + (isFlagParameter(param) ? '' : ' ');
        return {
            kind: 'parameter-name',
            name: '-' + param.name,
            description: buildParameterCompletionDescription(param),
            insertText: replaceCurrentToken(raw, insertion),
            command: command,
            parameter: param
        };
    });
}

export function getParameterValueCompletions(param: TextExpanderCommandParameter | null | undefined, input: unknown, limit = 8): MinibufferCompletion[] {
    let prefix = typeof input === 'string' ? input.trim().toLowerCase() : '';
    return readCompletionValues(param).filter(function (item) {
        let value = item.value.toLowerCase();
        let label = (item.label || item.value).toLowerCase();
        if (prefix && (value === prefix || label === prefix)) {
            return false;
        }
        return !prefix || value.indexOf(prefix) === 0 || label.indexOf(prefix) === 0;
    }).slice(0, Math.max(1, Math.floor(limit))).map(function (item) {
        return {
            kind: 'parameter-value',
            name: item.value,
            description: item.description || '',
            insertText: item.value,
            parameter: param
        };
    });
}

function normalizeMenuSurface(surface: unknown): MenuSurface | '' {
    if (surface === 'actions' || surface === 'tools') {
        return surface;
    }
    return '';
}

function resolveMenuMetadata(command: TextExpanderCommandDefinition): TextExpanderCommandMenuMetadata | null {
    return readCommandMetadata(command);
}

function compareNumericOrder(a: number, b: number): number {
    if (a !== b) {
        return a < b ? -1 : 1;
    }
    return 0;
}

/**
 * Build grouped browse-menu data from command records and command metadata.
 * This helper intentionally ignores user query text because browse mode is
 * an explicit full-menu override.
 */
export function buildMinibufferBrowseMenuGroups(commands: unknown, surface: MenuSurface | null): MinibufferBrowseMenuGroup[] {
    const normalizedSurface = normalizeMenuSurface(surface);
    if (!normalizedSurface) {
        return [];
    }
    const sourceCommands = asCommandArray(commands);
    const groupsByKey: Record<string, MinibufferBrowseMenuGroup> = Object.create(null);
    const groups: MinibufferBrowseMenuGroup[] = [];
    for (let i = 0; i < sourceCommands.length; i += 1) {
        const command = sourceCommands[i];
        if (!command) {
            continue;
        }
        const metadata = resolveMenuMetadata(command);
        if (!metadata || metadata.menuSurface !== normalizedSurface) {
            continue;
        }
        const groupName = typeof metadata.groupName === 'string' && metadata.groupName.trim().length > 0
            ? metadata.groupName.trim()
            : 'OTHER';
        let group = groupsByKey[groupName];
        if (!group) {
            group = {
                id: normalizedSurface + ':' + groupName.toLowerCase().replace(/\s+/g, '_'),
                title: groupName,
                order: Number.isFinite(metadata.groupOrder) ? Number(metadata.groupOrder) : 999,
                _firstSeen: i,
                items: []
            };
            groupsByKey[groupName] = group;
            groups.push(group);
        }
        group.items.push({
            id: metadata.itemId || command.id || command.name,
            command: command,
            title: typeof metadata.title === 'string' && metadata.title.length > 0
                ? metadata.title
                : (typeof command.title === 'string' && command.title.length > 0 ? command.title : command.name),
            description: typeof metadata.description === 'string' ? metadata.description : (command.description || ''),
            itemId: typeof metadata.itemId === 'string' ? metadata.itemId : (command.id || command.name),
            order: Number.isFinite(metadata.itemOrder) ? Number(metadata.itemOrder) : 999,
            _firstSeen: i,
            keywords: Array.isArray(metadata.keywords) ? metadata.keywords.filter(function (keyword: unknown): keyword is string {
                return typeof keyword === 'string';
            }) : []
        });
    }
    groups.sort(function (a, b) {
        return compareNumericOrder(a.order, b.order) || compareNumericOrder(a._firstSeen ?? 0, b._firstSeen ?? 0);
    });
    for (let groupIndex = 0; groupIndex < groups.length; groupIndex += 1) {
        let group = groups[groupIndex];
        if (!group) {
            continue;
        }
        let items = group.items;
        items.sort(function (a, b) {
            return compareNumericOrder(a.order, b.order) || compareNumericOrder(a._firstSeen ?? 0, b._firstSeen ?? 0);
        });
        for (let itemIndex = 0; itemIndex < items.length; itemIndex += 1) {
            const item = items[itemIndex];
            if (item) {
                delete item._firstSeen;
            }
        }
        delete group._firstSeen;
    }
    return groups.filter(function (group) {
        return Array.isArray(group.items) && group.items.length > 0;
    });
}

/**
 * Flatten grouped browse menu rows for highlight and keyboard navigation.
 */
export function flattenMinibufferBrowseMenuRows(groups: unknown): MinibufferBrowseMenuRow[] {
    const rows: MinibufferBrowseMenuRow[] = [];
    const sourceGroups = Array.isArray(groups) ? groups.filter(function (group): group is MinibufferBrowseMenuGroup {
        return !!group && typeof group === 'object' && Array.isArray((group as { items?: unknown }).items);
    }) : [];
    for (let groupIndex = 0; groupIndex < sourceGroups.length; groupIndex += 1) {
        const group = sourceGroups[groupIndex];
        if (!group) {
            continue;
        }
        const items = Array.isArray(group?.items) ? group.items : [];
        for (let itemIndex = 0; itemIndex < items.length; itemIndex += 1) {
            const item = items[itemIndex];
            if (!item) {
                continue;
            }
            rows.push({
                groupId: typeof group.id === 'string' ? group.id : '',
                groupTitle: typeof group.title === 'string' ? group.title : '',
                item: item,
                command: item && item.command ? item.command : null
            });
        }
    }
    return rows;
}

/**
 * Resolve the next highlighted menu row index for Arrow Up/Arrow Down.
 */
export function resolveMinibufferBrowseRowHighlight(state: { direction?: number; currentIndex?: number; rowCount?: number } = {}): number {
    const rowCount = Number.isFinite(state.rowCount) ? Math.max(0, Math.floor(Number(state.rowCount))) : 0;
    if (rowCount === 0) {
        return -1;
    }
    const direction = Number.isFinite(state.direction) && Number(state.direction) < 0 ? -1 : 1;
    const currentIndex = Number.isFinite(state.currentIndex) ? Math.floor(Number(state.currentIndex)) : -1;
    if (currentIndex < 0 || currentIndex >= rowCount) {
        return direction > 0 ? 0 : rowCount - 1;
    }
    let nextIndex = currentIndex + direction;
    if (nextIndex < 0) {
        nextIndex = rowCount - 1;
    }
    if (nextIndex >= rowCount) {
        nextIndex = 0;
    }
    return nextIndex;
}

/**
 * Determine whether browse mode should be evicted after input mutation.
 * Composition updates do not evict until composition commits.
 */
export function shouldExitBrowseModeOnInputMutation(state: { previousValue?: string; nextValue?: string; isComposing?: boolean } = {}): boolean {
    if (state.isComposing === true) {
        return false;
    }
    const previousValue = typeof state.previousValue === 'string' ? state.previousValue : '';
    const nextValue = typeof state.nextValue === 'string' ? state.nextValue : '';
    return previousValue !== nextValue;
}

/**
 * Resolve how ACTIONS/TOOLS surface button clicks should affect browse mode.
 */
export function resolveMinibufferBrowseSurfaceToggleAction(state: { suggestionMode?: SuggestionMode; activeMenuSurface?: MenuSurface | null; surface?: MenuSurface } = {}): 'open' | 'switch' | 'close' | 'noop' {
    const surface = state.surface === 'actions' || state.surface === 'tools' ? state.surface : null;
    if (!surface) {
        return 'noop';
    }
    if (state.suggestionMode !== 'menuBrowse') {
        return 'open';
    }
    if (state.activeMenuSurface === surface) {
        return 'close';
    }
    return 'switch';
}

/**
 * Resolve whether an outside pointer event should close browse mode.
 */
export function shouldDismissMinibufferBrowseMenuOnPointer(state: { suggestionMode?: SuggestionMode; pointerInside?: boolean } = {}): boolean {
    return state.suggestionMode === 'menuBrowse' && state.pointerInside !== true;
}

/**
 * Resolve the Alt-X behavior from the minibuffer's independent visibility and focus state.
 */
export function resolveMinibufferAltXAction(state: { visible?: boolean; focused?: boolean } = {}): 'show' | 'focus' | 'hide' {
    if (state.visible !== true) {
        return 'show';
    }
    if (state.focused === true) {
        return 'hide';
    }
    return 'focus';
}

/**
 * Decide whether a suggestion pointer event may update keyboard highlight state.
 * Mouse movement always restores pointer priority; enter/hover without movement must
 * respect keyboard priority so a stale cursor cannot pin the active suggestion.
 */
export function shouldApplySuggestionPointerHighlight(state: { keyboardPriority?: boolean; eventType?: string } = {}): boolean {
    if (state.eventType === 'mousemove' || state.eventType === 'pointermove') {
        return true;
    }
    return state.keyboardPriority !== true;
}

/**
 * Resolve whether suggestions should be visible for the current input.
 */
export function shouldShowMinibufferSuggestions(state: { suggestionsCount?: number; value?: string; dismissedForValue?: string | null } = {}): boolean {
    let count = Number.isFinite(state.suggestionsCount) ? Math.floor(Number(state.suggestionsCount)) : 0;
    if (count <= 0) {
        return false;
    }
    let dismissedForValue = typeof state.dismissedForValue === 'string' ? state.dismissedForValue : null;
    if (dismissedForValue === null) {
        return true;
    }
    let value = typeof state.value === 'string' ? state.value : '';
    return value !== dismissedForValue;
}

/**
 * Resolve how ArrowUp/ArrowDown should behave in minibuffer input state.
 */
export function resolveMinibufferArrowAction(state: { direction?: 'up' | 'down'; suggestionsVisible?: boolean; inputLength?: number; historyTraversalActive?: boolean } = {}): 'suggestion' | 'history' | 'native' | 'noop' {
    let direction = state.direction === 'up' || state.direction === 'down' ? state.direction : 'down';
    if (state.suggestionsVisible === true) {
        return 'suggestion';
    }
    if (state.historyTraversalActive === true) {
        return 'history';
    }
    let inputLength = Number.isFinite(state.inputLength) ? Math.max(0, Math.floor(Number(state.inputLength))) : 0;
    if (inputLength > 0) {
        return 'native';
    }
    if (direction === 'up') {
        return 'history';
    }
    return 'noop';
}

/**
 * Resolve Escape behavior for minibuffer state.
 */
export function resolveMinibufferEscapeAction(state: { suggestionsVisible?: boolean; promptActive?: boolean } = {}): 'dismiss_suggestions' | 'cancel_prompt' | 'noop' {
    if (state.suggestionsVisible === true) {
        return 'dismiss_suggestions';
    }
    if (state.promptActive === true) {
        return 'cancel_prompt';
    }
    return 'noop';
}

/** Produces structured, length-only diagnostics for failed minibuffer command execution. */
export function buildMinibufferCommandErrorContext(command: TextExpanderCommandDefinition | null | undefined, resultOrError: unknown, options: { mode?: string; executableText?: string; visibleText?: string } | null | undefined, extra: Record<string, unknown> = {}) {
    const safeOptions = options && typeof options === 'object' ? options : {};
    const result = resultOrError && typeof resultOrError === 'object' ? resultOrError as { effects?: unknown; outputKind?: unknown; code?: unknown; kind?: unknown } : null;
    const effects = Array.isArray(result?.effects) ? result.effects : [];
    return Object.assign({
        commandId: command?.id || '',
        commandName: command?.name || '',
        mode: typeof safeOptions.mode === 'string' ? safeOptions.mode : 'command',
        outputKind: typeof result?.outputKind === 'string' ? result.outputKind : 'error',
        executableTextLen: typeof safeOptions.executableText === 'string' ? safeOptions.executableText.length : 0,
        visibleTextLen: typeof safeOptions.visibleText === 'string' ? safeOptions.visibleText.length : 0,
        effectKinds: effects.map(function (effect) {
            return effect && typeof effect.kind === 'string' ? effect.kind : 'unknown';
        }),
        effectCount: effects.length,
        errorCode: result && typeof result.code === 'string' ? result.code : 'command_failed',
        errorKind: resultOrError instanceof Error ? resultOrError.name || 'Error' : typeof result?.kind === 'string' ? result.kind : 'result'
    }, extra || {});
}
