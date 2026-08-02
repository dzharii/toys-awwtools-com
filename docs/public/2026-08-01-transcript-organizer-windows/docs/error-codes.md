# Error codes

| Code | Meaning | Typical action |
| --- | --- | --- |
| `InvalidRequest` | Request properties conflict or are invalid. | Correct the parameters and create the request again. |
| `UnsupportedRuntime` | Windows x64 or PowerShell 7 requirements failed. | Run 64-bit `pwsh.exe` on Windows 10/11. |
| `FFmpegNotFound` | FFmpeg could not be resolved as an application. | Install a Whisper-enabled build and update `PATH`. |
| `FFprobeNotFound` | FFprobe could not be resolved as an application. | Install it with FFmpeg and update `PATH`. |
| `TranscriptionFilterUnavailable` | The FFmpeg build lacks the Whisper filter or required options. | Verify `ffmpeg -hide_banner -help filter=whisper`. |
| `InputNotFound` | A file input does not exist. | Correct the path. |
| `AudioStreamNotFound` | FFprobe found no readable first audio stream. | Select media containing audio. |
| `RequiredModelNotFound` | The English Whisper model could not be resolved. | Place it in the project root or `models`, or provide `-WhisperModelPath`. |
| `RequiredModelInvalid` | The main model failed size or hash validation. | Replace the incomplete or incorrect file. |
| `VadModelNotFound` | VAD was requested without a compatible model. | Supply a Silero model or disable VAD. |
| `VadModelInvalid` | The selected VAD model failed validation. | Replace the VAD model. |
| `OutputExists` | Overwrite was not authorized. | Choose another path or use `-Overwrite`. |
| `OutputDirectoryUnavailable` | The output directory cannot be created or written. | Choose a writable directory. |
| `GpuUnavailable` | The requested GPU policy cannot be honored. | Allow CPU fallback or use a compatible GPU-enabled build. |
| `RequestCancelled` | Cancellation stopped the process tree. | Retry if the cancellation was accidental. |
| `ProcessTimedOut` | The configured process deadline expired. | Inspect logs; increase the deadline only after confirming expected workload. |
| `FFmpegExecutionFailed` | FFmpeg returned a failure unrelated to output verification. | Use the request ID to inspect the JSON Lines log. |
| `OutputNotCreated` | FFmpeg exited successfully but no nonempty artifact exists. | Inspect the exact arguments and FFmpeg diagnostics in the log. |
