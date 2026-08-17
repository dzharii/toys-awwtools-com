function bookmarklet_chatgpt_winamp_dictation_deck() {
  'use strict';

  const APP_KEY = '__CHATGPT_WINAMP_DICTATION_V1__';
  const APP_VERSION = '1.1.0';
  const UI_HOST_ID = 'cgpt-winamp-dictation-v1';
  const TRANSCRIBE_ENDPOINT = '/backend-api/transcribe';
  const SESSION_ENDPOINT = '/api/auth/session';
  const REQUEST_TIMEOUT_MS = 120_000;
  const MAX_ATTEMPTS = 4;
  const RETRY_BASE_MS = 1_000;
  const RETRY_CAP_MS = 15_000;
  const MAX_ERROR_BODY_CHARS = 1_000;
  const SUPPORTED_HOSTS = new Set(['chatgpt.com', 'chat.openai.com']);

  if (!SUPPORTED_HOSTS.has(location.hostname)) {
    alert('ChatGPT Dictation Deck only runs on chatgpt.com.');
    return;
  }

  const existing = window[APP_KEY];
  if (existing?.focus) {
    existing.focus();
    return;
  }

  const state = {
    destroyed: false,
    host: null,
    shadow: null,
    windowElement: null,
    refs: {},
    dragCleanup: null,
    beforeUnloadCleanup: null,
    recorder: null,
    stream: null,
    chunks: [],
    mimeType: '',
    fileExtension: 'webm',
    audioBlob: null,
    audioUrl: null,
    durationMs: 0,
    recordingStartedAt: 0,
    pausedStartedAt: 0,
    totalPausedMs: 0,
    timerId: 0,
    audioContext: null,
    sourceNode: null,
    analyser: null,
    visualizer: null,
    transcribing: false,
    requestController: null,
    retryTimer: 0,
    retryReject: null,
    tokenPromise: null,
    transcript: '',
    responseMetadata: null,
    clearArmedUntil: 0,
    statusLevel: 'idle',
    statusText: 'READY',
    logEntries: []
  };

  window[APP_KEY] = {
    version: APP_VERSION,
    focus,
    destroy: () => requestDestroy(false),
    transcribe: () => void transcribeWithRetries(),
    download: () => void downloadAudio()
  };

  void initialize();

  async function initialize() {
    try {
      await waitForBody();
      createUi();
      installWindowDrag();
      bindUi();
      installBeforeUnloadProtection();
      updateUi();
      setStatus('idle', 'READY - AUDIO STAYS LOCAL UNTIL TRANSCRIBE');
      log('info', 'startup', 'ChatGPT Dictation Deck initialized.', {
        version: APP_VERSION,
        page: location.href
      });
    } catch (error) {
      console.error('[ChatGPT Dictation Deck] Initialization failed.', error);
      alert(`ChatGPT Dictation Deck could not start: ${formatError(error)}`);
      destroy('Initialization failed.');
    }
  }

  async function waitForBody() {
    if (document.body) return;
    const startedAt = Date.now();
    while (!document.body && Date.now() - startedAt < 5_000) {
      await delay(50);
    }
    if (!document.body) throw new Error('Document body was not available within 5000ms.');
  }

  function createUi() {
    document.getElementById(UI_HOST_ID)?.remove();
    const host = document.createElement('div');
    host.id = UI_HOST_ID;
    const shadow = host.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <style>
        :host { all: initial; position: fixed; inset: 0; width: 0; height: 0; z-index: 2147483647; }
        *, *::before, *::after { box-sizing: border-box; }
        button, input, textarea { font: inherit; }
        .deck {
          position: fixed;
          top: 68px;
          right: 24px;
          width: 560px;
          min-width: 390px;
          height: 530px;
          min-height: 390px;
          resize: both;
          overflow: hidden;
          display: grid;
          grid-template-rows: 31px 116px auto 1fr 74px 28px;
          z-index: 2147483647;
          border: 2px solid #262626;
          border-radius: 3px;
          background: #121212;
          color: #d8d8c4;
          box-shadow: 0 14px 42px rgba(0, 0, 0, 0.58), inset 0 0 0 1px #6a6a5b;
          font: 12px/1.3 "Lucida Console", Monaco, Consolas, monospace;
          user-select: none;
        }
        .titlebar {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 0 6px;
          border-bottom: 1px solid #050505;
          background: linear-gradient(#4e4e48, #242422 52%, #171716 52%);
          cursor: move;
          color: #f4f4dc;
          text-shadow: 1px 1px #000;
        }
        .mark {
          width: 14px;
          height: 14px;
          border: 1px solid #111;
          background: linear-gradient(135deg, #ffec63 0 35%, #ff7a00 36% 68%, #b20f00 69%);
          box-shadow: inset 0 0 0 1px rgba(255,255,255,.25);
        }
        .title { flex: 1; min-width: 0; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; font-weight: 700; letter-spacing: .4px; }
        .version { color: #9b9b8b; font-size: 10px; }
        .chrome {
          width: 20px;
          height: 18px;
          padding: 0;
          border: 1px solid #0a0a0a;
          background: linear-gradient(#77776d, #33332f);
          color: #e7e7d2;
          cursor: pointer;
          line-height: 15px;
        }
        .chrome:hover { filter: brightness(1.25); }
        .display {
          display: grid;
          grid-template-columns: 160px 1fr;
          gap: 8px;
          min-height: 0;
          padding: 7px;
          border-bottom: 1px solid #33332e;
          background: linear-gradient(90deg, #151510, #202019 40%, #11110e);
        }
        .counter {
          display: grid;
          grid-template-rows: 48px 21px 1fr;
          gap: 4px;
          min-width: 0;
        }
        .time {
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          border: 2px inset #30302a;
          background: #050700;
          color: #8dff3a;
          font: 700 27px/1 "Lucida Console", Monaco, monospace;
          letter-spacing: 1px;
          text-shadow: 0 0 8px rgba(104,255,43,.68);
        }
        .meterline {
          display: flex;
          align-items: center;
          gap: 6px;
          min-width: 0;
          padding: 2px 4px;
          border: 1px inset #30302a;
          background: #080900;
          color: #ffcf42;
          font-size: 10px;
        }
        .meterline span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .lamp { width: 7px; height: 7px; flex: 0 0 7px; border-radius: 50%; background: #5a5a4c; box-shadow: inset 0 0 1px #000; }
        .lamp[data-level="recording"] { background: #ff321c; box-shadow: 0 0 7px #ff321c; }
        .lamp[data-level="paused"] { background: #ffcc1f; box-shadow: 0 0 7px #ffcc1f; }
        .lamp[data-level="working"] { background: #58b8ff; box-shadow: 0 0 7px #58b8ff; }
        .lamp[data-level="success"] { background: #69ff35; box-shadow: 0 0 7px #69ff35; }
        .lamp[data-level="error"] { background: #ff321c; box-shadow: 0 0 7px #ff321c; }
        .stats { color: #a8a890; font-size: 10px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
        .visualizer-wrap {
          position: relative;
          min-width: 0;
          min-height: 0;
          border: 2px inset #30302a;
          background: #000;
          overflow: hidden;
        }
        canvas { display: block; width: 100%; height: 100%; image-rendering: pixelated; }
        .scanlines { position: absolute; inset: 0; pointer-events: none; background: repeating-linear-gradient(to bottom, transparent 0 2px, rgba(0,0,0,.23) 3px); }
        .controls {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 5px;
          padding: 7px;
          border-bottom: 1px solid #33332e;
          background: #282824;
        }
        .btn {
          min-width: 0;
          height: 30px;
          padding: 0 7px;
          border: 1px solid #060606;
          border-radius: 2px;
          background: linear-gradient(#8a8a7d, #494943 48%, #30302d 52%, #55554e);
          color: #f2f2df;
          text-shadow: 1px 1px #000;
          box-shadow: inset 1px 1px rgba(255,255,255,.24), inset -1px -1px rgba(0,0,0,.45);
          cursor: pointer;
          font-weight: 700;
          font-size: 10px;
          letter-spacing: .3px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .btn:hover:not(:disabled) { filter: brightness(1.16); }
        .btn:active:not(:disabled) { transform: translateY(1px); filter: brightness(.9); }
        .btn:disabled { cursor: not-allowed; opacity: .38; }
        .btn.record { color: #ffd4cb; }
        .btn.primary { color: #d9ff9a; }
        .btn.danger { color: #ffc7c0; }
        .options {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 132px 112px;
          gap: 6px;
          padding: 0 7px 7px;
          background: #282824;
          border-bottom: 1px solid #33332e;
        }
        .field {
          min-width: 0;
          height: 25px;
          padding: 3px 6px;
          border: 1px inset #3d3d36;
          background: #090a05;
          color: #caff89;
          outline: none;
          user-select: text;
        }
        .field::placeholder { color: #6e765b; }
        .toggle {
          display: flex;
          align-items: center;
          gap: 5px;
          min-width: 0;
          padding: 0 6px;
          border: 1px inset #3d3d36;
          background: #151611;
          color: #c6c6b2;
          font-size: 10px;
          cursor: pointer;
        }
        .toggle input { margin: 0; accent-color: #76d43d; }
        .transcript-wrap {
          min-height: 0;
          display: grid;
          grid-template-rows: 24px 1fr;
          padding: 7px;
          background: #171713;
        }
        .section-title { display: flex; align-items: center; justify-content: space-between; color: #ffcc3d; font-size: 10px; letter-spacing: .6px; }
        .transcript {
          min-height: 0;
          width: 100%;
          resize: none;
          padding: 8px;
          border: 2px inset #33332c;
          background: #060704;
          color: #dcffd0;
          outline: none;
          font: 12px/1.42 "Lucida Console", Monaco, Consolas, monospace;
          user-select: text;
        }
        .transcript::placeholder { color: #5a6752; }
        .secondary {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 5px;
          padding: 7px;
          border-top: 1px solid #050505;
          background: #282824;
        }
        .statusbar {
          display: flex;
          align-items: center;
          gap: 7px;
          min-width: 0;
          padding: 0 7px;
          border-top: 1px solid #48483f;
          background: #11110f;
          color: #adad98;
          font-size: 10px;
        }
        .status-text { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .statusbar[data-level="error"] { color: #ff7667; }
        .statusbar[data-level="success"] { color: #95ff68; }
        .statusbar[data-level="working"] { color: #7bc5ff; }
        .statusbar[data-level="recording"] { color: #ff8a78; }
        .statusbar[data-level="paused"] { color: #ffd75d; }
        @media (max-width: 650px) {
          .deck { left: 6px !important; right: 6px !important; top: 52px; width: auto; min-width: 0; }
          .display { grid-template-columns: 128px 1fr; }
          .options { grid-template-columns: minmax(0,1fr); }
        }
      </style>
      <section class="deck" role="dialog" aria-label="ChatGPT Winamp Dictation Deck">
        <header class="titlebar">
          <span class="mark" aria-hidden="true"></span>
          <span class="title">CHATGPT DICTATION DECK</span>
          <span class="version">v${APP_VERSION}</span>
          <button class="chrome minimize" type="button" title="Minimize">_</button>
          <button class="chrome close" type="button" title="Close">x</button>
        </header>
        <section class="display">
          <div class="counter">
            <div class="time">00:00.0</div>
            <div class="meterline"><span class="lamp" data-level="idle"></span><span class="mode">IDLE</span></div>
            <div class="stats">NO AUDIO BUFFER</div>
          </div>
          <div class="visualizer-wrap">
            <canvas width="320" height="96" aria-label="Audio fire visualizer"></canvas>
            <div class="scanlines"></div>
          </div>
        </section>
        <section>
          <div class="controls">
            <button class="btn record" data-action="record" type="button">RECORD</button>
            <button class="btn" data-action="pause" type="button">PAUSE</button>
            <button class="btn" data-action="stop" type="button">STOP</button>
            <button class="btn primary" data-action="transcribe" type="button">TRANSCRIBE</button>
            <button class="btn danger" data-action="cancel" type="button">CANCEL</button>
          </div>
          <div class="options">
            <input class="field language" type="text" maxlength="12" spellcheck="false" placeholder="Language hint: auto, en, ru...">
            <label class="toggle" title="Automatically append a successful transcript to the ChatGPT composer without replacing existing text."><input class="auto-insert" type="checkbox">AUTO INSERT</label>
            <label class="toggle" title="Use the session access token when available. Same-origin cookies are always included."><input class="use-token" type="checkbox" checked>USE TOKEN</label>
          </div>
        </section>
        <section class="transcript-wrap">
          <div class="section-title"><span>TRANSCRIPT</span><span class="request-id"></span></div>
          <textarea class="transcript" spellcheck="true" placeholder="The transcript appears here. Existing ChatGPT composer text remains visible and untouched."></textarea>
        </section>
        <section class="secondary">
          <button class="btn" data-action="download" type="button">DOWNLOAD AUDIO</button>
          <button class="btn" data-action="copy" type="button">COPY TEXT</button>
          <button class="btn primary" data-action="insert" type="button">APPEND TO CHAT</button>
          <button class="btn danger" data-action="clear" type="button">CLEAR</button>
        </section>
        <footer class="statusbar" data-level="idle"><span class="lamp" data-level="idle"></span><span class="status-text">READY</span></footer>
      </section>
    `;

    document.body.append(host);
    state.host = host;
    state.shadow = shadow;
    state.windowElement = shadow.querySelector('.deck');
    state.refs = {
      titlebar: shadow.querySelector('.titlebar'),
      minimize: shadow.querySelector('.minimize'),
      close: shadow.querySelector('.close'),
      time: shadow.querySelector('.time'),
      mode: shadow.querySelector('.mode'),
      modeLamp: shadow.querySelector('.meterline .lamp'),
      stats: shadow.querySelector('.stats'),
      canvas: shadow.querySelector('canvas'),
      language: shadow.querySelector('.language'),
      autoInsert: shadow.querySelector('.auto-insert'),
      useToken: shadow.querySelector('.use-token'),
      transcript: shadow.querySelector('.transcript'),
      requestId: shadow.querySelector('.request-id'),
      statusbar: shadow.querySelector('.statusbar'),
      statusLamp: shadow.querySelector('.statusbar .lamp'),
      statusText: shadow.querySelector('.status-text'),
      record: shadow.querySelector('[data-action="record"]'),
      pause: shadow.querySelector('[data-action="pause"]'),
      stop: shadow.querySelector('[data-action="stop"]'),
      transcribe: shadow.querySelector('[data-action="transcribe"]'),
      cancel: shadow.querySelector('[data-action="cancel"]'),
      download: shadow.querySelector('[data-action="download"]'),
      copy: shadow.querySelector('[data-action="copy"]'),
      insert: shadow.querySelector('[data-action="insert"]'),
      clear: shadow.querySelector('[data-action="clear"]')
    };

    state.visualizer = createFireVisualizer(state.refs.canvas);
    state.visualizer.start();
  }

  function installBeforeUnloadProtection() {
    const onBeforeUnload = event => {
      const recording = Boolean(state.recorder && state.recorder.state !== 'inactive');
      const retainedAudio = Boolean(state.audioBlob?.size || state.chunks.length);
      if (!recording && !state.transcribing && !retainedAudio) return;
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    state.beforeUnloadCleanup = () => window.removeEventListener('beforeunload', onBeforeUnload);
  }

  function bindUi() {
    const refs = state.refs;
    refs.close.addEventListener('click', () => requestDestroy(true));
    refs.minimize.addEventListener('click', toggleMinimize);
    refs.record.addEventListener('click', () => void startRecording());
    refs.pause.addEventListener('click', togglePause);
    refs.stop.addEventListener('click', () => void stopRecording());
    refs.transcribe.addEventListener('click', () => void transcribeWithRetries());
    refs.cancel.addEventListener('click', cancelTranscription);
    refs.download.addEventListener('click', () => void downloadAudio());
    refs.copy.addEventListener('click', () => void copyTranscript());
    refs.insert.addEventListener('click', appendTranscriptToComposer);
    refs.clear.addEventListener('click', clearRecordingSafely);
    refs.transcript.addEventListener('input', () => {
      state.transcript = refs.transcript.value;
      updateUi();
    });
  }

  function installWindowDrag() {
    const handle = state.refs.titlebar;
    const windowElement = state.windowElement;
    const onPointerDown = event => {
      if (event.button !== 0 || event.target.closest('button')) return;
      const rect = windowElement.getBoundingClientRect();
      const offsetX = event.clientX - rect.left;
      const offsetY = event.clientY - rect.top;
      windowElement.style.right = 'auto';
      handle.setPointerCapture(event.pointerId);

      const onPointerMove = moveEvent => {
        const maxLeft = Math.max(0, window.innerWidth - windowElement.offsetWidth);
        const maxTop = Math.max(0, window.innerHeight - windowElement.offsetHeight);
        windowElement.style.left = `${Math.min(maxLeft, Math.max(0, moveEvent.clientX - offsetX))}px`;
        windowElement.style.top = `${Math.min(maxTop, Math.max(0, moveEvent.clientY - offsetY))}px`;
      };

      const onPointerUp = upEvent => {
        try { handle.releasePointerCapture(upEvent.pointerId); } catch {}
        handle.removeEventListener('pointermove', onPointerMove);
        handle.removeEventListener('pointerup', onPointerUp);
        handle.removeEventListener('pointercancel', onPointerUp);
      };

      handle.addEventListener('pointermove', onPointerMove);
      handle.addEventListener('pointerup', onPointerUp);
      handle.addEventListener('pointercancel', onPointerUp);
    };
    handle.addEventListener('pointerdown', onPointerDown);
    state.dragCleanup = () => handle.removeEventListener('pointerdown', onPointerDown);
  }

  function toggleMinimize() {
    const deck = state.windowElement;
    const minimized = deck.dataset.minimized === 'true';
    if (minimized) {
      deck.dataset.minimized = 'false';
      deck.style.height = deck.dataset.previousHeight || '530px';
      deck.style.gridTemplateRows = '';
      for (const child of Array.from(deck.children).slice(1)) child.style.display = '';
      state.refs.minimize.textContent = '_';
    } else {
      deck.dataset.previousHeight = `${deck.getBoundingClientRect().height}px`;
      deck.dataset.minimized = 'true';
      deck.style.height = '31px';
      deck.style.gridTemplateRows = '31px';
      for (const child of Array.from(deck.children).slice(1)) child.style.display = 'none';
      state.refs.minimize.textContent = '+';
    }
  }

  async function startRecording() {
    if (state.transcribing) {
      setStatus('error', 'CANCEL TRANSCRIPTION BEFORE RECORDING');
      return;
    }
    if (state.recorder && state.recorder.state !== 'inactive') return;
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setStatus('error', 'THIS BROWSER DOES NOT SUPPORT MEDIARECORDER');
      return;
    }

    const hasPreviousAudio = Boolean(state.audioBlob?.size || state.chunks.length);
    const hasPreviousTranscript = Boolean(state.refs.transcript.value.trim());
    if ((hasPreviousAudio || hasPreviousTranscript) && !confirm('Starting a new recording will replace the retained audio and transcript. Download or copy anything you need first. Continue?')) {
      setStatus('idle', 'NEW RECORDING CANCELLED - PREVIOUS DATA RETAINED');
      return;
    }

    let stream = null;
    let recorder = null;
    try {
      setStatus('working', 'REQUESTING MICROPHONE PERMISSION - PREVIOUS DATA RETAINED');
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1
        },
        video: false
      });
      if (state.destroyed) {
        stream.getTracks().forEach(track => track.stop());
        return;
      }

      const mimeType = chooseRecordingMimeType();
      const options = mimeType ? { mimeType, audioBitsPerSecond: 128_000 } : { audioBitsPerSecond: 128_000 };
      try {
        recorder = new MediaRecorder(stream, options);
      } catch {
        recorder = new MediaRecorder(stream);
      }

      recorder.addEventListener('dataavailable', event => {
        if (event.data?.size) {
          state.chunks.push(event.data);
          updateUi();
        }
      });
      recorder.addEventListener('error', event => {
        setStatus('error', `RECORDER ERROR: ${formatError(event.error || event)}`);
        log('error', 'record', 'MediaRecorder emitted an error.', { error: formatError(event.error || event) });
      });
      recorder.addEventListener('stop', finalizeStoppedRecording, { once: true });

      recorder.start(1_000);

      releaseAudioBlob();
      state.chunks = [];
      state.transcript = '';
      state.responseMetadata = null;
      state.refs.transcript.value = '';
      state.refs.requestId.textContent = '';
      state.durationMs = 0;
      state.totalPausedMs = 0;
      state.pausedStartedAt = 0;
      state.clearArmedUntil = 0;
      state.stream = stream;
      state.recorder = recorder;
      state.mimeType = recorder.mimeType || mimeType || 'audio/webm';
      state.fileExtension = extensionForMime(state.mimeType);
      state.recordingStartedAt = performance.now();

      connectVisualizer(stream);
      startElapsedTimer();
      setStatus('recording', 'RECORDING - AUDIO BUFFERED IN MEMORY');
      log('info', 'record', 'Recording started.', { mimeType: state.mimeType });
      updateUi();
    } catch (error) {
      try {
        if (recorder && recorder.state !== 'inactive') recorder.stop();
      } catch {}
      stream?.getTracks().forEach(track => track.stop());
      if (state.stream === stream) state.stream = null;
      setStatus('error', `MICROPHONE FAILED: ${formatError(error)} - PREVIOUS DATA RETAINED`);
      log('error', 'record', 'Could not start recording.', { error: formatError(error) });
      updateUi();
    }
  }

  function chooseRecordingMimeType() {
    const candidates = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/mp4'
    ];
    return candidates.find(type => MediaRecorder.isTypeSupported(type)) || '';
  }

  function togglePause() {
    const recorder = state.recorder;
    if (!recorder || recorder.state === 'inactive') return;
    if (recorder.state === 'recording') {
      recorder.pause();
      state.pausedStartedAt = performance.now();
      setStatus('paused', 'PAUSED - BUFFER RETAINED');
    } else if (recorder.state === 'paused') {
      recorder.resume();
      if (state.pausedStartedAt) state.totalPausedMs += performance.now() - state.pausedStartedAt;
      state.pausedStartedAt = 0;
      setStatus('recording', 'RECORDING - AUDIO BUFFERED IN MEMORY');
    }
    updateElapsed();
    updateUi();
  }

  async function stopRecording() {
    const recorder = state.recorder;
    if (!recorder || recorder.state === 'inactive') return state.audioBlob;
    setStatus('working', 'FINALIZING AUDIO');
    const stopped = new Promise(resolve => recorder.addEventListener('stop', resolve, { once: true }));
    if (recorder.state === 'paused' && state.pausedStartedAt) {
      state.totalPausedMs += performance.now() - state.pausedStartedAt;
      state.pausedStartedAt = 0;
    }
    updateElapsed();
    recorder.stop();
    await stopped;
    return state.audioBlob;
  }

  function finalizeStoppedRecording() {
    stopElapsedTimer();
    updateElapsed();
    stopMediaTracks();
    disconnectVisualizerInput();
    if (state.destroyed) {
      state.chunks = [];
      return;
    }
    const type = state.mimeType || state.chunks[0]?.type || 'audio/webm';
    const blob = new Blob(state.chunks, { type });
    if (!blob.size) {
      setStatus('error', 'RECORDING PRODUCED AN EMPTY AUDIO FILE');
      state.audioBlob = null;
    } else {
      state.audioBlob = blob;
      replaceAudioUrl(blob);
      setStatus('idle', `AUDIO READY - ${formatBytes(blob.size)}`);
      log('info', 'record', 'Recording finalized.', {
        mimeType: type,
        bytes: blob.size,
        durationMs: Math.round(state.durationMs)
      });
    }
    updateUi();
  }

  function startElapsedTimer() {
    stopElapsedTimer();
    state.timerId = window.setInterval(() => {
      updateElapsed();
      updateUi();
    }, 100);
  }

  function stopElapsedTimer() {
    clearInterval(state.timerId);
    state.timerId = 0;
  }

  function updateElapsed() {
    if (!state.recordingStartedAt) return;
    const recorderState = state.recorder?.state;
    let now = performance.now();
    let paused = state.totalPausedMs;
    if (recorderState === 'paused' && state.pausedStartedAt) paused += now - state.pausedStartedAt;
    state.durationMs = Math.max(0, now - state.recordingStartedAt - paused);
  }

  function connectVisualizer(stream) {
    disconnectVisualizerInput();
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      const context = new AudioContextClass();
      const analyser = context.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.74;
      const source = context.createMediaStreamSource(stream);
      source.connect(analyser);
      state.audioContext = context;
      state.sourceNode = source;
      state.analyser = analyser;
      state.visualizer?.setAnalyser(analyser);
    } catch (error) {
      log('warn', 'visualizer', 'Visualizer input could not be connected.', { error: formatError(error) });
    }
  }

  function disconnectVisualizerInput() {
    state.visualizer?.setAnalyser(null);
    try { state.sourceNode?.disconnect(); } catch {}
    state.sourceNode = null;
    state.analyser = null;
    if (state.audioContext) {
      void state.audioContext.close().catch(() => {});
      state.audioContext = null;
    }
  }

  function stopMediaTracks() {
    state.stream?.getTracks().forEach(track => track.stop());
    state.stream = null;
  }

  async function transcribeWithRetries() {
    if (state.transcribing) return;
    if (state.recorder && state.recorder.state !== 'inactive') await stopRecording();
    if (!state.audioBlob?.size) {
      setStatus('error', 'NO AUDIO TO TRANSCRIBE');
      return;
    }

    state.transcribing = true;
    state.responseMetadata = null;
    state.refs.requestId.textContent = '';
    updateUi();

    let lastError = null;
    let authRefreshUsed = false;
    try {
      for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
        if (!state.transcribing || state.destroyed) throw new CancelledError('Transcription cancelled.');
        try {
          setStatus('working', `TRANSCRIBING - ATTEMPT ${attempt}/${MAX_ATTEMPTS}`);
          const result = await transcribeOnce(attempt);
          state.transcript = result.text;
          state.responseMetadata = result.metadata;
          state.refs.transcript.value = result.text;
          state.refs.requestId.textContent = result.metadata.requestId ? `REQ ${result.metadata.requestId}` : '';
          setStatus('success', `TRANSCRIPTION COMPLETE - ${result.text.length} CHARS`);
          log('info', 'transcribe', 'Transcription succeeded.', {
            attempt,
            chars: result.text.length,
            requestId: result.metadata.requestId || '',
            assetFormat: result.metadata.assetFormat || '',
            assetTtl: result.metadata.assetTtl || ''
          });
          if (state.refs.autoInsert.checked) appendTranscriptToComposer();
          return;
        } catch (error) {
          lastError = error;
          if (error instanceof CancelledError) throw error;

          if (error instanceof HttpError && error.status === 401 && !authRefreshUsed && state.refs.useToken.checked) {
            authRefreshUsed = true;
            state.tokenPromise = null;
            setStatus('working', 'SESSION EXPIRED - REFRESHING TOKEN');
            await getAccessToken(true);
            attempt -= 1;
            continue;
          }

          const decision = classifyRetry(error, attempt);
          log(decision.retry ? 'warn' : 'error', 'transcribe', decision.retry ? 'Transcription attempt failed; retry scheduled.' : 'Transcription failed without automatic retry.', {
            attempt,
            retry: decision.retry,
            delayMs: decision.delayMs,
            error: formatError(error),
            status: error instanceof HttpError ? error.status : '',
            requestId: error instanceof HttpError ? error.requestId : ''
          });

          if (!decision.retry) throw error;
          setStatus('working', `RETRYING IN ${(decision.delayMs / 1_000).toFixed(1)}s - ${decision.reason}`);
          await cancellableDelay(decision.delayMs);
        }
      }
      throw lastError || new Error('Transcription failed after all attempts.');
    } catch (error) {
      if (error instanceof CancelledError) {
        setStatus('idle', 'TRANSCRIPTION CANCELLED - AUDIO RETAINED');
      } else {
        const requestId = error instanceof HttpError && error.requestId ? ` - REQ ${error.requestId}` : '';
        setStatus('error', `${humanizeTranscriptionError(error)}${requestId}`);
      }
    } finally {
      state.transcribing = false;
      state.requestController = null;
      clearTimeout(state.retryTimer);
      state.retryTimer = 0;
      state.retryReject = null;
      updateUi();
    }
  }

  async function transcribeOnce(attempt) {
    const controller = new AbortController();
    state.requestController = controller;
    const timeout = window.setTimeout(() => controller.abort(new DOMException('Transcription request timed out.', 'TimeoutError')), REQUEST_TIMEOUT_MS);

    try {
      const form = new FormData();
      const filename = `whisper.${state.fileExtension || 'webm'}`;
      form.append('file', state.audioBlob, filename);
      form.append('duration_ms', String(Math.max(1, Math.round(state.durationMs))));
      const language = state.refs.language.value.trim();
      if (language && language.toLowerCase() !== 'auto') form.append('language', language);

      const headers = { accept: 'application/json' };
      if (navigator.language) headers['oai-language'] = navigator.language;
      if (state.refs.useToken.checked) {
        const token = await getAccessToken(false);
        if (token) headers.authorization = `Bearer ${token}`;
      }

      const response = await fetch(TRANSCRIBE_ENDPOINT, {
        method: 'POST',
        credentials: 'include',
        headers,
        body: form,
        signal: controller.signal,
        cache: 'no-store'
      });

      const raw = await response.text().catch(() => '');
      const requestId = response.headers.get('x-oai-request-id') || response.headers.get('x-request-id') || '';
      if (!response.ok) {
        throw new HttpError({
          status: response.status,
          statusText: response.statusText,
          body: raw.slice(0, MAX_ERROR_BODY_CHARS),
          requestId,
          retryAfterMs: parseRetryAfter(response.headers.get('retry-after'))
        });
      }

      const parsed = parseTranscriptionResponse(raw, response.headers.get('content-type'));
      if (!parsed.text.trim()) {
        throw new EmptyTranscriptionError('The service returned an empty transcription.', requestId);
      }
      return {
        text: parsed.text.trim(),
        metadata: {
          requestId,
          assetPointer: parsed.data?.asset_pointer || '',
          assetTtl: parsed.data?.asset_ttl || '',
          assetFormat: parsed.data?.asset_format || state.fileExtension || '',
          attempt
        }
      };
    } catch (error) {
      if (controller.signal.aborted && !(error instanceof CancelledError)) {
        if (!state.transcribing) throw new CancelledError('Transcription cancelled.');
        throw new TimeoutTranscriptionError(`Request timed out after ${REQUEST_TIMEOUT_MS}ms.`);
      }
      throw error;
    } finally {
      clearTimeout(timeout);
      if (state.requestController === controller) state.requestController = null;
    }
  }

  function parseTranscriptionResponse(raw, contentType) {
    const trimmed = String(raw || '').trim();
    let data = null;
    const looksJson = /json/i.test(contentType || '') || /^[\[{]/.test(trimmed);
    if (looksJson && trimmed) {
      try { data = JSON.parse(trimmed); } catch {}
    }
    if (data && typeof data === 'object') {
      const text = firstString(data.text, data.transcript, data.output_text, data.result?.text, data.data?.text);
      if (text !== null) return { text, data };
    }
    if (typeof data === 'string') return { text: data, data };
    return { text: trimmed.replace(/^(["'])|(["'])$/g, ''), data };
  }

  function firstString(...values) {
    for (const value of values) if (typeof value === 'string') return value;
    return null;
  }

  function classifyRetry(error, attempt) {
    if (attempt >= MAX_ATTEMPTS) return { retry: false, delayMs: 0, reason: 'attempt limit reached' };
    let retry = false;
    let reason = 'non-recoverable error';
    let minimumMs = 0;

    if (error instanceof TimeoutTranscriptionError) {
      retry = true;
      reason = 'request timeout';
    } else if (error instanceof EmptyTranscriptionError) {
      retry = true;
      reason = 'empty response';
    } else if (error instanceof TypeError) {
      retry = true;
      reason = 'network failure';
    } else if (error instanceof HttpError) {
      if ([408, 425, 429, 500, 502, 503, 504].includes(error.status)) {
        retry = true;
        reason = `HTTP ${error.status}`;
        minimumMs = error.retryAfterMs || 0;
      }
    }

    if (!retry) return { retry: false, delayMs: 0, reason };
    const exponentialCap = Math.min(RETRY_CAP_MS, RETRY_BASE_MS * (2 ** (attempt - 1)));
    const fullJitter = Math.floor(Math.random() * Math.max(1, exponentialCap));
    const retryAfterJitter = minimumMs ? Math.floor(Math.random() * 1_000) : 0;
    return {
      retry: true,
      delayMs: Math.min(60_000, Math.max(fullJitter, minimumMs + retryAfterJitter)),
      reason
    };
  }

  function parseRetryAfter(value) {
    if (!value) return 0;
    const seconds = Number(value);
    if (Number.isFinite(seconds)) return Math.max(0, seconds * 1_000);
    const dateMs = Date.parse(value);
    return Number.isFinite(dateMs) ? Math.max(0, dateMs - Date.now()) : 0;
  }

  async function getAccessToken(forceRefresh) {
    if (forceRefresh) state.tokenPromise = null;
    if (state.tokenPromise) return state.tokenPromise;
    state.tokenPromise = (async () => {
      try {
        const response = await fetch(SESSION_ENDPOINT, {
          credentials: 'include',
          headers: { accept: 'application/json' },
          cache: 'no-store'
        });
        if (!response.ok) return null;
        const session = await response.json();
        return typeof session?.accessToken === 'string' ? session.accessToken : null;
      } catch {
        return null;
      }
    })();
    return state.tokenPromise;
  }

  function cancelTranscription() {
    if (!state.transcribing) return;
    state.transcribing = false;
    state.requestController?.abort(new DOMException('Cancelled by user.', 'AbortError'));
    cancelPendingRetry('Transcription cancelled.');
    setStatus('idle', 'TRANSCRIPTION CANCELLED - AUDIO RETAINED');
    updateUi();
  }

  function cancelPendingRetry(message) {
    const reject = state.retryReject;
    if (!reject) {
      clearTimeout(state.retryTimer);
      state.retryTimer = 0;
      return;
    }
    reject(new CancelledError(message));
  }

  function cancellableDelay(ms) {
    return new Promise((resolve, reject) => {
      if (!state.transcribing) {
        reject(new CancelledError('Transcription cancelled.'));
        return;
      }

      const settle = (callback, value) => {
        clearTimeout(state.retryTimer);
        state.retryTimer = 0;
        state.retryReject = null;
        callback(value);
      };

      state.retryReject = error => settle(reject, error);
      state.retryTimer = window.setTimeout(() => {
        if (state.transcribing) settle(resolve);
        else settle(reject, new CancelledError('Transcription cancelled.'));
      }, ms);
    });
  }

  async function downloadAudio() {
    let blob = state.audioBlob;
    const activeRecorderState = state.recorder && state.recorder.state !== 'inactive' ? state.recorder.state : '';
    if (activeRecorderState) {
      setStatus(activeRecorderState === 'paused' ? 'paused' : 'recording', 'CREATING SAFETY SNAPSHOT');
      blob = await snapshotCurrentRecording();
    }
    if (!blob?.size) {
      setStatus('error', 'NO AUDIO TO DOWNLOAD');
      return;
    }
    const extension = extensionForMime(blob.type || state.mimeType);
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `chatgpt-dictation-${stamp}.${extension}`;
    anchor.style.display = 'none';
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    setStatus(
      activeRecorderState === 'paused' ? 'paused' : activeRecorderState ? 'recording' : 'success',
      `${activeRecorderState ? 'SAFETY SNAPSHOT' : 'AUDIO'} DOWNLOAD STARTED - ${formatBytes(blob.size)}`
    );
  }

  async function snapshotCurrentRecording() {
    const recorder = state.recorder;
    if (!recorder || recorder.state === 'inactive') return state.audioBlob;
    const previousCount = state.chunks.length;
    try { recorder.requestData(); } catch {}
    const started = Date.now();
    while (state.chunks.length === previousCount && Date.now() - started < 750) await delay(25);
    return new Blob(state.chunks, { type: state.mimeType || 'audio/webm' });
  }

  async function copyTranscript() {
    const text = state.refs.transcript.value.trim();
    if (!text) {
      setStatus('error', 'NO TRANSCRIPT TO COPY');
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      setStatus('success', 'TRANSCRIPT COPIED');
    } catch {
      state.refs.transcript.focus();
      state.refs.transcript.select();
      const copied = document.execCommand('copy');
      setStatus(copied ? 'success' : 'error', copied ? 'TRANSCRIPT COPIED' : 'COPY FAILED');
    }
  }

  function appendTranscriptToComposer() {
    const text = state.refs.transcript.value.trim();
    if (!text) {
      setStatus('error', 'NO TRANSCRIPT TO APPEND');
      return;
    }
    const composer = findComposer();
    if (!composer) {
      setStatus('error', 'CHATGPT COMPOSER NOT FOUND - COPY TEXT INSTEAD');
      return;
    }
    try {
      appendTextPreservingExisting(composer, text);
      setStatus('success', 'TRANSCRIPT APPENDED - EXISTING TEXT PRESERVED');
    } catch (error) {
      setStatus('error', `APPEND FAILED: ${formatError(error)}`);
    }
  }

  function findComposer() {
    const selectors = [
      '#prompt-textarea',
      '[data-testid="composer-text-input"]',
      'main form textarea',
      'main form [contenteditable="true"]',
      '[contenteditable="true"][data-lexical-editor="true"]'
    ];
    for (const selector of selectors) {
      const elements = Array.from(document.querySelectorAll(selector));
      const visible = elements.find(element => {
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && !element.closest(`#${UI_HOST_ID}`);
      });
      if (visible) return visible;
    }
    return null;
  }

  function appendTextPreservingExisting(element, text) {
    const isTextControl = element instanceof HTMLTextAreaElement || element instanceof HTMLInputElement;
    if (isTextControl) {
      const existing = element.value;
      const separator = existing && !/[\s\n]$/.test(existing) ? '\n\n' : existing ? '\n' : '';
      const next = `${existing}${separator}${text}`;
      const prototype = element instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
      const setter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;
      if (setter) setter.call(element, next);
      else element.value = next;
      dispatchTextInput(element, `${separator}${text}`);
      element.focus();
      element.setSelectionRange(next.length, next.length);
      return;
    }

    element.focus();
    const existing = (element.innerText || '').trimEnd();
    const insertion = `${existing ? '\n\n' : ''}${text}`;
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(element);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
    let inserted = false;
    try { inserted = document.execCommand('insertText', false, insertion); } catch {}
    if (!inserted) {
      const textNode = document.createTextNode(insertion);
      range.insertNode(textNode);
      range.setStartAfter(textNode);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    }
    dispatchTextInput(element, insertion);
  }

  function dispatchTextInput(element, data) {
    try {
      element.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data }));
    } catch {
      element.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  function clearRecordingSafely() {
    const active = state.recorder && state.recorder.state !== 'inactive';
    if (active || state.transcribing) {
      setStatus('error', 'STOP OR CANCEL BEFORE CLEARING');
      return;
    }
    const now = Date.now();
    if (now > state.clearArmedUntil) {
      state.clearArmedUntil = now + 4_000;
      state.refs.clear.textContent = 'CLICK AGAIN';
      setStatus('error', 'CLEAR ARMED FOR 4 SECONDS');
      return;
    }
    state.clearArmedUntil = 0;
    releaseAudioBlob();
    state.chunks = [];
    state.mimeType = '';
    state.fileExtension = 'webm';
    state.durationMs = 0;
    state.recordingStartedAt = 0;
    state.totalPausedMs = 0;
    state.pausedStartedAt = 0;
    state.transcript = '';
    state.responseMetadata = null;
    state.refs.transcript.value = '';
    state.refs.requestId.textContent = '';
    state.refs.clear.textContent = 'CLEAR';
    state.visualizer?.reset();
    setStatus('idle', 'CLEARED - READY');
    updateUi();
  }

  function releaseAudioBlob() {
    if (state.audioUrl) URL.revokeObjectURL(state.audioUrl);
    state.audioUrl = null;
    state.audioBlob = null;
  }

  function replaceAudioUrl(blob) {
    if (state.audioUrl) URL.revokeObjectURL(state.audioUrl);
    state.audioUrl = URL.createObjectURL(blob);
  }

  function updateUi() {
    if (!state.refs.record) return;
    const recorderState = state.recorder?.state || 'inactive';
    const recording = recorderState === 'recording';
    const paused = recorderState === 'paused';
    const hasAudio = Boolean(state.audioBlob?.size || state.chunks.length);
    const hasTranscript = Boolean(state.refs.transcript.value.trim());

    state.refs.time.textContent = formatDuration(state.durationMs);
    state.refs.mode.textContent = state.transcribing ? 'TRANSCRIBING' : recording ? 'RECORDING' : paused ? 'PAUSED' : hasAudio ? 'AUDIO READY' : 'IDLE';
    state.refs.modeLamp.dataset.level = state.transcribing ? 'working' : recording ? 'recording' : paused ? 'paused' : state.statusLevel;
    const bytes = state.audioBlob?.size || state.chunks.reduce((sum, chunk) => sum + chunk.size, 0);
    state.refs.stats.textContent = hasAudio
      ? `${formatBytes(bytes)}  ${state.mimeType || 'audio'}  MEMORY ONLY`
      : 'NO AUDIO BUFFER';

    state.refs.record.disabled = recording || paused || state.transcribing;
    state.refs.pause.disabled = (!recording && !paused) || state.transcribing;
    state.refs.pause.textContent = paused ? 'RESUME' : 'PAUSE';
    state.refs.stop.disabled = (!recording && !paused) || state.transcribing;
    state.refs.transcribe.disabled = !hasAudio || recording || paused || state.transcribing;
    state.refs.cancel.disabled = !state.transcribing;
    state.refs.download.disabled = !hasAudio;
    state.refs.copy.disabled = !hasTranscript;
    state.refs.insert.disabled = !hasTranscript;
    state.refs.clear.disabled = recording || paused || state.transcribing || (!hasAudio && !hasTranscript);
    if (Date.now() > state.clearArmedUntil) state.refs.clear.textContent = 'CLEAR';
  }

  function setStatus(level, text) {
    state.statusLevel = level;
    state.statusText = text;
    if (!state.refs.statusbar) return;
    state.refs.statusbar.dataset.level = level;
    state.refs.statusLamp.dataset.level = level;
    state.refs.statusText.textContent = text;
  }

  function humanizeTranscriptionError(error) {
    if (error instanceof HttpError) {
      const map = {
        400: 'BAD REQUEST - AUDIO OR MULTIPART CONTRACT REJECTED',
        401: 'NOT AUTHENTICATED - RELOAD CHATGPT AND SIGN IN',
        403: 'ACCESS DENIED - SESSION OR ACCOUNT NOT ELIGIBLE',
        404: 'TRANSCRIBE ENDPOINT NOT FOUND - CONTRACT MAY HAVE CHANGED',
        413: 'AUDIO TOO LARGE - DOWNLOAD AND TRANSCRIBE ELSEWHERE',
        415: 'AUDIO FORMAT NOT SUPPORTED',
        422: 'AUDIO COULD NOT BE PROCESSED',
        429: 'RATE LIMITED - AUDIO RETAINED; RETRY MANUALLY LATER'
      };
      return map[error.status] || `TRANSCRIBE FAILED - HTTP ${error.status}`;
    }
    if (error instanceof TimeoutTranscriptionError) return 'TRANSCRIBE TIMED OUT - AUDIO RETAINED';
    if (error instanceof EmptyTranscriptionError) return 'EMPTY TRANSCRIPTION AFTER RETRIES - AUDIO RETAINED';
    if (error instanceof TypeError) return 'NETWORK FAILURE AFTER RETRIES - AUDIO RETAINED';
    return `TRANSCRIBE FAILED - ${formatError(error)}`;
  }

  function requestDestroy(fromUi) {
    const active = state.recorder && state.recorder.state !== 'inactive';
    const hasTranscript = Boolean(state.refs.transcript?.value.trim());
    if (fromUi && (active || state.transcribing || state.audioBlob?.size || hasTranscript)) {
      const warning = active
        ? 'A recording is active. Closing will discard the in-memory audio. Close anyway?'
        : state.transcribing
          ? 'A transcription is active. Closing will cancel it and discard the in-memory audio. Close anyway?'
          : state.audioBlob?.size
            ? 'Closing will discard the in-memory audio. Download it first if needed. Close anyway?'
            : 'Closing will discard the transcript. Copy or append it first if needed. Close anyway?';
      if (!confirm(warning)) return;
    }
    destroy('Dictation Deck closed.');
  }

  function focus() {
    if (!state.windowElement) return;
    state.windowElement.style.display = 'grid';
    state.windowElement.style.zIndex = '2147483647';
    if (state.windowElement.dataset.minimized === 'true') toggleMinimize();
    state.refs.transcript?.focus({ preventScroll: true });
    setStatus(state.statusLevel, state.statusText);
  }

  function destroy(reason) {
    if (state.destroyed) return;
    state.destroyed = true;
    state.transcribing = false;
    state.requestController?.abort();
    cancelPendingRetry('Dictation Deck closed.');
    clearTimeout(state.retryTimer);
    stopElapsedTimer();
    try {
      if (state.recorder && state.recorder.state !== 'inactive') state.recorder.stop();
    } catch {}
    stopMediaTracks();
    disconnectVisualizerInput();
    state.visualizer?.destroy();
    state.dragCleanup?.();
    state.beforeUnloadCleanup?.();
    releaseAudioBlob();
    state.host?.remove();
    delete window[APP_KEY];
    console.log(`[ChatGPT Dictation Deck] ${reason}`);
  }

  function createFireVisualizer(canvas) {
    const context = canvas.getContext('2d', { alpha: false });
    const width = 160;
    const height = 48;
    const heat = new Uint8Array(width * height);
    const image = context.createImageData(width, height);
    const palette = createFirePalette();
    let analyser = null;
    let frequencies = new Uint8Array(256);
    let raf = 0;
    let running = false;

    function setAnalyser(next) {
      analyser = next;
      frequencies = new Uint8Array(next?.frequencyBinCount || 256);
    }

    function start() {
      if (running) return;
      running = true;
      draw();
    }

    function draw() {
      if (!running) return;
      raf = requestAnimationFrame(draw);
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      if (analyser) analyser.getByteFrequencyData(frequencies);
      seedBottom();
      diffuse();
      render();
    }

    function seedBottom() {
      const bottom = (height - 1) * width;
      for (let x = 0; x < width; x += 1) {
        const bin = Math.min(frequencies.length - 1, Math.floor((x / width) * Math.min(frequencies.length, 96)));
        const audio = analyser ? frequencies[bin] : 15 + Math.sin((Date.now() / 360) + x / 12) * 8;
        const random = Math.random() * 54;
        heat[bottom + x] = Math.max(0, Math.min(255, audio * 1.2 + random));
      }
    }

    function diffuse() {
      for (let y = 0; y < height - 1; y += 1) {
        const below = (y + 1) * width;
        const below2 = Math.min(height - 1, y + 2) * width;
        const row = y * width;
        for (let x = 0; x < width; x += 1) {
          const left = below + ((x - 1 + width) % width);
          const center = below + x;
          const right = below + ((x + 1) % width);
          const deep = below2 + x;
          const cooling = 2 + Math.floor(Math.random() * 4);
          heat[row + x] = Math.max(0, ((heat[left] + heat[center] + heat[right] + heat[deep]) >> 2) - cooling);
        }
      }
    }

    function render() {
      for (let i = 0; i < heat.length; i += 1) {
        const color = palette[heat[i]];
        const offset = i * 4;
        image.data[offset] = color[0];
        image.data[offset + 1] = color[1];
        image.data[offset + 2] = color[2];
        image.data[offset + 3] = 255;
      }
      context.putImageData(image, 0, 0);
      context.fillStyle = 'rgba(175,255,70,.7)';
      const bars = 32;
      const barWidth = width / bars;
      for (let i = 0; i < bars; i += 1) {
        const bin = Math.floor((i / bars) * Math.min(frequencies.length, 96));
        const magnitude = analyser ? frequencies[bin] / 255 : 0.08;
        const barHeight = Math.max(1, Math.floor(magnitude * 18));
        context.fillRect(Math.floor(i * barWidth), height - barHeight, Math.max(1, Math.floor(barWidth - 1)), barHeight);
      }
    }

    function reset() {
      heat.fill(0);
    }

    function destroyVisualizer() {
      running = false;
      cancelAnimationFrame(raf);
      heat.fill(0);
    }

    return { setAnalyser, start, reset, destroy: destroyVisualizer };
  }

  function createFirePalette() {
    const palette = [];
    for (let i = 0; i < 256; i += 1) {
      let red;
      let green;
      let blue;
      if (i < 64) {
        red = i * 3;
        green = 0;
        blue = 0;
      } else if (i < 128) {
        red = 192 + (i - 64);
        green = (i - 64) * 2;
        blue = 0;
      } else if (i < 192) {
        red = 255;
        green = 128 + (i - 128) * 2;
        blue = (i - 128) / 3;
      } else {
        red = 255;
        green = 255;
        blue = Math.min(255, (i - 192) * 4);
      }
      palette.push([Math.min(255, red), Math.min(255, green), Math.min(255, blue)]);
    }
    return palette;
  }

  function extensionForMime(mime) {
    const value = String(mime || '').toLowerCase();
    if (value.includes('ogg')) return 'ogg';
    if (value.includes('mp4') || value.includes('m4a')) return 'm4a';
    if (value.includes('wav')) return 'wav';
    if (value.includes('mpeg') || value.includes('mp3')) return 'mp3';
    return 'webm';
  }

  function formatDuration(ms) {
    const totalTenths = Math.floor(Math.max(0, ms) / 100);
    const tenths = totalTenths % 10;
    const totalSeconds = Math.floor(totalTenths / 10);
    const seconds = totalSeconds % 60;
    const minutes = Math.floor(totalSeconds / 60);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${tenths}`;
  }

  function formatBytes(bytes) {
    if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const index = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
    const value = bytes / (1024 ** index);
    return `${value.toFixed(index === 0 ? 0 : value >= 10 ? 1 : 2)} ${units[index]}`;
  }

  function formatError(error) {
    if (error instanceof HttpError) return `HTTP ${error.status} ${error.statusText}${error.body ? `: ${error.body.slice(0, 180)}` : ''}`;
    if (error instanceof Error) return `${error.name}: ${error.message}`;
    return String(error);
  }

  function log(level, operation, message, context = {}) {
    const safe = {};
    for (const [key, value] of Object.entries(context)) {
      safe[key] = /token|authorization|cookie|secret/i.test(key)
        ? '[redacted]'
        : redactSensitive(String(value));
    }
    const entry = { timestamp: new Date().toISOString(), level, operation, message, context: safe };
    state.logEntries.push(entry);
    if (state.logEntries.length > 200) state.logEntries.shift();
    const method = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log';
    console[method]('[ChatGPT Dictation Deck]', entry);
  }

  function redactSensitive(value) {
    return value
      .replace(/Bearer\s+[A-Za-z0-9._~-]+/gi, 'Bearer [redacted]')
      .replace(/(_puid|oai-did)=([^;\s]+)/gi, '$1=[redacted]');
  }

  function delay(ms) {
    return new Promise(resolve => window.setTimeout(resolve, ms));
  }

  class HttpError extends Error {
    constructor({ status, statusText, body, requestId, retryAfterMs }) {
      super(`HTTP ${status} ${statusText || ''}${body ? `: ${body}` : ''}`.trim());
      this.name = 'HttpError';
      this.status = status;
      this.statusText = statusText || '';
      this.body = body || '';
      this.requestId = requestId || '';
      this.retryAfterMs = retryAfterMs || 0;
    }
  }

  class EmptyTranscriptionError extends Error {
    constructor(message, requestId) {
      super(message);
      this.name = 'EmptyTranscriptionError';
      this.requestId = requestId || '';
    }
  }

  class TimeoutTranscriptionError extends Error {
    constructor(message) {
      super(message);
      this.name = 'TimeoutTranscriptionError';
    }
  }

  class CancelledError extends Error {
    constructor(message) {
      super(message);
      this.name = 'CancelledError';
    }
  }
}

window.bookmarklet_chatgpt_winamp_dictation_deck = bookmarklet_chatgpt_winamp_dictation_deck;
