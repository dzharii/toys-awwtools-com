export type RuntimeEnvelope<TPayload> = {
    scope: string;
    type: string;
    requestId: string;
    payload: TPayload;
};

export type RuntimeResponseEnvelope<TResult> = {
    ok: boolean;
    requestId: string;
    result?: TResult;
    error?: { code?: string; message?: string; details?: unknown };
};

type RuntimeMessageError = Error & {
    code?: string;
    details?: unknown;
};

/**
 * Create a stable request identifier for runtime messaging.
 */
export function createRequestId(prefix: string = 'lp'): string {
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}
/** Builds a strict runtime envelope with a generated request id when needed. */
export function createRuntimeEnvelope<TPayload>(
    msg: { scope: string; type: string; payload: TPayload },
    opts: { requestId?: string } = {}
): RuntimeEnvelope<TPayload> {
    return {
        scope: msg.scope,
        type: msg.type,
        payload: msg.payload,
        requestId: opts.requestId || createRequestId(msg.scope || 'lp')
    };
}
/** Sends a Chrome runtime message and converts lastError into a rejected promise. */
export function sendChromeMessage<TRequest, TResponse = unknown>(request: TRequest): Promise<TResponse> {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(request, (response) => {
            if (chrome.runtime.lastError) {
                const err: RuntimeMessageError = new Error(chrome.runtime.lastError.message || 'runtime_send_failed');
                err.code = 'runtime_send_failed';
                reject(err);
                return;
            }
            resolve(response);
        });
    });
}
/** Sends a strict envelope message and validates request id and response shape. */
export async function sendRuntimeMessage<TPayload, TResult>(
    msg: { scope: string; type: string; payload: TPayload },
    opts: { requestId?: string } = {}
): Promise<TResult> {
    const envelope = createRuntimeEnvelope(msg, opts);
    const response = await sendChromeMessage<RuntimeEnvelope<TPayload>, RuntimeResponseEnvelope<TResult> | null | undefined>(envelope);
    if (!response || typeof response !== 'object') {
        const err: RuntimeMessageError = new Error('runtime_response_invalid');
        err.code = 'runtime_response_invalid';
        throw err;
    }
    if (response.requestId !== envelope.requestId) {
        const err: RuntimeMessageError = new Error('runtime_response_request_id_mismatch');
        err.code = 'runtime_response_request_id_mismatch';
        throw err;
    }
    if (response.ok) {
        return response.result as TResult;
    }
    const err: RuntimeMessageError = new Error(response.error?.message || 'runtime_response_error');
    err.code = response.error?.code || 'runtime_response_error';
    err.details = response.error?.details || null;
    throw err;
}
