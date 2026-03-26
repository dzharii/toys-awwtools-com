#!/usr/bin/env bash
set -euo pipefail

SCRIPT_NAME="$(basename "$0")"
. "$(dirname "$0")/common.sh"

usage() {
  cat <<'EOF'
Convert a VTT subtitle file into cleaned plain text.

Usage:
  convert-vtt-to-txt.sh --input PATH [--output PATH]
  convert-vtt-to-txt.sh --help

Required parameters:
  --input PATH        Source VTT file.

Optional parameters:
  --output PATH       Output TXT file. Default: INPUT.txt

Examples:
  convert-vtt-to-txt.sh --input "artifacts/video/subtitles/sample.en.vtt"
  convert-vtt-to-txt.sh --input "artifacts/video/subtitles/sample.en.vtt" --output "artifacts/video/subtitles/sample.en.vtt.txt"

Output:
  Writes cleaned transcript text to the target file.

Failure conditions:
  Exits non-zero if the input file does not exist, the output cannot be written, or transcript cleaning fails.
EOF
}

input=""
output=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --input)
      [[ $# -ge 2 ]] || die "Missing value for --input"
      input="$2"
      shift 2
      ;;
    --output)
      [[ $# -ge 2 ]] || die "Missing value for --output"
      output="$2"
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

[[ -n "$input" ]] || { usage; die "--input is required"; }
[[ -f "$input" ]] || die "Input VTT file does not exist: $input"

if [[ -z "$output" ]]; then
  output="${input}.txt"
fi

ensure_parent_dir "$output"
temp_file="$(mktemp)"
trap 'rm -f "$temp_file"' EXIT

log_info "Cleaning transcript from $input"
log_debug "Writing cleaned transcript to $output"

if awk '
BEGIN { prev = "" }
/^(WEBVTT|Kind:|Language:)/ { next }
/^[[:space:]]*$/ { next }
{
  line = $0
  gsub(/[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3} --> [0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}.*/, "", line)
  gsub(/<[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}>/, "", line)
  gsub(/<[^>]*>/, "", line)
  sub(/^[[:space:]]+/, "", line)
  sub(/[[:space:]]+$/, "", line)
  if (line != "" && line != prev) {
    print line
    prev = line
  }
}
' "$input" >"$temp_file"; then
  :
else
  exit_code=$?
  die "VTT to TXT conversion failed with exit code ${exit_code}."
fi

mv "$temp_file" "$output"
ensure_file_exists "$output" "Cleaned transcript"
log_info "Cleaned transcript written to $output"
