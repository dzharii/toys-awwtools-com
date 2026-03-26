#!/usr/bin/env bash
set -euo pipefail

SCRIPT_NAME="$(basename "$0")"
. "$(dirname "$0")/common.sh"

usage() {
  cat <<'EOF'
Fetch YouTube metadata without downloading the video.

Usage:
  get-video-metadata.sh --url URL --output PATH
  get-video-metadata.sh --help

Required parameters:
  --url URL         YouTube video URL to inspect.
  --output PATH     File path for the metadata JSON output.

Examples:
  get-video-metadata.sh --url "https://www.youtube.com/watch?v=abc123" --output "artifacts/video/metadata.json"

Output:
  Writes yt-dlp JSON metadata to the requested file.

Failure conditions:
  Exits non-zero if the URL is invalid, yt-dlp is unavailable, metadata lookup fails, or the output file cannot be written.
EOF
}

url=""
output=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --url)
      [[ $# -ge 2 ]] || die "Missing value for --url"
      url="$2"
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

[[ -n "$url" ]] || { usage; die "--url is required"; }
[[ -n "$output" ]] || { usage; die "--output is required"; }

validate_video_url "$url"
ensure_yt_dlp
ensure_parent_dir "$output"

log_info "Writing metadata to $output"
temp_file="$(mktemp)"
trap 'rm -f "$temp_file"' EXIT

log_debug "Running command: $(command_to_string yt-dlp --dump-single-json --no-warn --skip-download "$url") > $(printf '%q' "$temp_file")"
if yt-dlp --dump-single-json --no-warn --skip-download "$url" >"$temp_file"; then
  :
else
  exit_code=$?
  die "Metadata query failed with exit code ${exit_code}."
fi

mv "$temp_file" "$output"
ensure_file_exists "$output" "Metadata JSON"
log_info "Metadata JSON written to $output"
