import argparse
import json
import os
from pathlib import Path
import xml.etree.ElementTree as ET

import azure.cognitiveservices.speech as speechsdk

parser = argparse.ArgumentParser()
parser.add_argument("script", type=Path)
parser.add_argument("--output", type=Path, default=Path("narration.wav"))
args = parser.parse_args()
ssml = args.script.read_text(encoding="utf-8")
if "<!DOCTYPE" in ssml.upper() or "<!ENTITY" in ssml.upper():
    raise SystemExit("DTD and entity declarations are not allowed.")
root = ET.fromstring(ssml)
if root.tag != "{http://www.w3.org/2001/10/synthesis}speak":
    raise SystemExit("Expected an SSML speak root.")

config = speechsdk.SpeechConfig(
    subscription=os.environ["SPEECH_KEY"],
    region=os.environ["SPEECH_REGION"],
)
config.set_speech_synthesis_output_format(
    speechsdk.SpeechSynthesisOutputFormat.Riff24Khz16BitMonoPcm
)
audio = speechsdk.audio.AudioOutputConfig(filename=str(args.output))
synth = speechsdk.SpeechSynthesizer(speech_config=config, audio_config=audio)
markers = []
synth.bookmark_reached.connect(lambda event: markers.append({
    "mark": event.text,
    "seconds": event.audio_offset / 10_000_000,
}))
result = synth.speak_ssml_async(ssml).get()
if result.reason != speechsdk.ResultReason.SynthesizingAudioCompleted:
    raise SystemExit(f"Synthesis failed: {result.cancellation_details}")
args.output.with_suffix(".timing.json").write_text(
    json.dumps(markers, indent=2), encoding="utf-8"
)
print(f"Saved {args.output} and bookmark timings.")
