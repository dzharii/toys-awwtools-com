#!/usr/bin/env bash
set -euo pipefail

SCRIPT_NAME="$(basename "$0")"
. "$(dirname "$0")/common.sh"

usage() {
  cat <<'EOF'
Assemble the final markdown summary document.

Usage:
  write-summary-markdown.sh --video-url URL --video-title TITLE --thumbnail-path PATH --summary-file PATH --output PATH
  write-summary-markdown.sh --help

Required parameters:
  --video-url URL         Canonical or input video URL for the markdown link.
  --video-title TITLE     Human-readable video title.
  --thumbnail-path PATH   Thumbnail path to embed in markdown. Relative paths are checked relative to the output file directory.
  --summary-file PATH     Plain-text summary file to insert verbatim.
  --output PATH           Markdown file to write.

Examples:
  write-summary-markdown.sh \
    --video-url "https://www.youtube.com/watch?v=abc123" \
    --video-title "Example Video" \
    --thumbnail-path "./thumbnails/example.webp" \
    --summary-file "artifacts/video/summary.txt" \
    --output "artifacts/video/2026-03-26 Example Video.md"

Output:
  Writes the final markdown report with the video link, thumbnail blockquote, and plain summary paragraphs.

Failure conditions:
  Exits non-zero if required inputs are missing, the thumbnail path does not resolve to a file, or the output file cannot be written.
EOF
}

video_url=""
video_title=""
thumbnail_path=""
summary_file=""
output=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --video-url)
      [[ $# -ge 2 ]] || die "Missing value for --video-url"
      video_url="$2"
      shift 2
      ;;
    --video-title)
      [[ $# -ge 2 ]] || die "Missing value for --video-title"
      video_title="$2"
      shift 2
      ;;
    --thumbnail-path)
      [[ $# -ge 2 ]] || die "Missing value for --thumbnail-path"
      thumbnail_path="$2"
      shift 2
      ;;
    --summary-file)
      [[ $# -ge 2 ]] || die "Missing value for --summary-file"
      summary_file="$2"
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

[[ -n "$video_url" ]] || { usage; die "--video-url is required"; }
[[ -n "$video_title" ]] || { usage; die "--video-title is required"; }
[[ -n "$thumbnail_path" ]] || { usage; die "--thumbnail-path is required"; }
[[ -n "$summary_file" ]] || { usage; die "--summary-file is required"; }
[[ -n "$output" ]] || { usage; die "--output is required"; }

validate_video_url "$video_url"
[[ -f "$summary_file" ]] || die "Summary file does not exist: $summary_file"

ensure_parent_dir "$output"
output_dir="$(dirname "$output")"
if [[ "$thumbnail_path" = /* ]]; then
  thumbnail_check_path="$thumbnail_path"
else
  thumbnail_check_path="${output_dir}/${thumbnail_path}"
fi
[[ -f "$thumbnail_check_path" ]] || die "Thumbnail path does not resolve to a file: $thumbnail_path"

temp_file="$(mktemp)"
trap 'rm -f "$temp_file"' EXIT

log_info "Writing markdown report to $output"
log_debug "Using summary file $summary_file"
log_debug "Using thumbnail path $thumbnail_path"

printf '[%s](%s)\n\n' "$video_title" "$video_url" >"$temp_file"
printf '> ![Thumbnail](%s)\n\n' "$thumbnail_path" >>"$temp_file"
cat "$summary_file" >>"$temp_file"

mv "$temp_file" "$output"
ensure_file_exists "$output" "Markdown report"
log_info "Markdown report written to $output"
