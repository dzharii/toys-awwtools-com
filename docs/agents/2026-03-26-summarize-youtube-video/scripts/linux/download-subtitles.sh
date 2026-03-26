#!/usr/bin/env bash
set -euo pipefail

SCRIPT_NAME="$(basename "$0")"
. "$(dirname "$0")/common.sh"

usage() {
  cat <<'EOF'
Download subtitles in VTT format without downloading the video.

Usage:
  download-subtitles.sh --url URL --output-dir DIR [--lang PATTERN]
  download-subtitles.sh --help

Required parameters:
  --url URL           YouTube video URL to inspect.
  --output-dir DIR    Directory where subtitle files will be written.

Optional parameters:
  --lang PATTERN      Subtitle language selector passed to yt-dlp.
                      Default: en.*

Examples:
  download-subtitles.sh --url "https://www.youtube.com/watch?v=abc123" --output-dir "artifacts/video/subtitles"
  download-subtitles.sh --url "https://www.youtube.com/watch?v=abc123" --output-dir "artifacts/video/subtitles" --lang "en.*"

Output:
  Writes one or more VTT subtitle files into the output directory.

Failure conditions:
  Exits non-zero if the URL is invalid, yt-dlp is unavailable, subtitle download fails, or no VTT files are produced.
EOF
}

url=""
output_dir=""
language="en.*"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --url)
      [[ $# -ge 2 ]] || die "Missing value for --url"
      url="$2"
      shift 2
      ;;
    --output-dir)
      [[ $# -ge 2 ]] || die "Missing value for --output-dir"
      output_dir="$2"
      shift 2
      ;;
    --lang)
      [[ $# -ge 2 ]] || die "Missing value for --lang"
      language="$2"
      shift 2
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      usage
      die "Unknown argument: $1"
      ;;
  esac
done

[[ -n "$url" ]] || { usage; die "--url is required"; }
[[ -n "$output_dir" ]] || { usage; die "--output-dir is required"; }

validate_video_url "$url"
ensure_yt_dlp
ensure_directory "$output_dir"

log_info "Downloading subtitles into $output_dir"
pushd "$output_dir" >/dev/null
trap 'popd >/dev/null' EXIT

run_logged yt-dlp \
  --skip-download \
  --write-subs \
  --write-auto-subs \
  --sub-langs "$language" \
  --convert-subs vtt \
  --output "%(title).200B.%(ext)s" \
  --restrict-filenames \
  "$url"

mapfile -t vtt_files < <(find . -maxdepth 1 -type f -name '*.vtt' | sort)
[[ ${#vtt_files[@]} -gt 0 ]] || die "No VTT subtitles were downloaded into $output_dir."

log_info "Downloaded ${#vtt_files[@]} subtitle file(s)."
log_debug "First subtitle file: ${vtt_files[0]}"
