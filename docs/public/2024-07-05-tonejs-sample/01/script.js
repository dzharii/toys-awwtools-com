
const synths = {
    universe: new Tone.Synth().toDestination(),
    concentration: new Tone.AMSynth().toDestination(),
    reading: new Tone.FMSynth().toDestination(),
    pleasant: new Tone.MembraneSynth().toDestination(),
    sith: new Tone.Synth().toDestination()
};

const melodies = {
    universe: [
        { time: "0:0", note: "C4", duration: "8n" },
        { time: "0:1", note: "E4", duration: "8n" },
        { time: "0:2", note: "G4", duration: "8n" },
        { time: "0:3", note: "B4", duration: "8n" },
    ],
    concentration: [
        { time: "0:0", note: "A4", duration: "8n" },
        { time: "0:1", note: "C5", duration: "8n" },
        { time: "0:2", note: "E5", duration: "8n" },
        { time: "0:3", note: "G5", duration: "8n" },
    ],
    reading: [
        { time: "0:0", note: "F4", duration: "8n" },
        { time: "0:1", note: "A4", duration: "8n" },
        { time: "0:2", note: "C5", duration: "8n" },
        { time: "0:3", note: "E5", duration: "8n" },
    ],
    pleasant: [
        { time: "0:0", note: "D4", duration: "8n" },
        { time: "0:1", note: "F#4", duration: "8n" },
        { time: "0:2", note: "A4", duration: "8n" },
        { time: "0:3", note: "C#5", duration: "8n" },
    ],
    sith: [
        { time: "0:0", note: "B3", duration: "8n" },
        { time: "0:1", note: "D4", duration: "8n" },
        { time: "0:2", note: "F#4", duration: "8n" },
        { time: "0:3", note: "A4", duration: "8n" },
    ]
};

const parts = {};

Object.keys(melodies).forEach(key => {
    parts[key] = new Tone.Part((time, value) => {
        synths[key].triggerAttackRelease(value.note, value.duration, time);
    }, melodies[key]).start(0);
    parts[key].loop = true;
    parts[key].loopEnd = "1m";
});

let currentPlaying = null;

document.querySelectorAll('button.play').forEach(button => {
    button.addEventListener('click', () => {
        const soundName = button.getAttribute('data-sound');
        if (currentPlaying) {
            currentPlaying.stop();
        }
        Tone.Transport.start();
        parts[soundName].start();
        currentPlaying = parts[soundName];
    });
});

document.querySelectorAll('button.stop').forEach(button => {
    button.addEventListener('click', () => {
        const soundName = button.getAttribute('data-sound');
        parts[soundName].stop();
        if (currentPlaying === parts[soundName]) {
            currentPlaying = null;
            Tone.Transport.stop();
        }
    });
});

