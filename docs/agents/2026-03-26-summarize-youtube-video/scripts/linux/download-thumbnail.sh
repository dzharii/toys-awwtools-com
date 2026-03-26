#!/usr/bin/env bash
set -euo pipefail

SCRIPT_NAME="$(basename "$0")"
. "$(dirname "$0")/common.sh"

usage() {
  cat <<'EOF'
Download a thumbnail preview without downloading the video.

Usage:
  download-thumbnail.sh --url URL --output-dir DIR
  download-thumbnail.sh --help

Required parameters:
  --url URL           YouTube video URL to inspect.
  --output-dir DIR    Directory where the thumbnail will be written.

Examples:
  download-thumbnail.sh --url "https://www.youtube.com/watch?v=abc123" --output-dir "artifacts/video/thumbnails"

Output:
  Writes one thumbnail image into the output directory, preferring WebP when yt-dlp can convert it.

Failure conditions:
  Exits non-zero if the URL is invalid, yt-dlp is unavailable, thumbnail download fails, or no image file is produced.
EOF
}

url=""
output_dir=""

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

log_info "Downloading thumbnail into $output_dir"
pushd "$output_dir" >/dev/null
trap 'popd >/dev/null' EXIT

run_logged yt-dlp \
  --skip-download \
  --write-thumbnail \
  --convert-thumbnails webp \
  --output "%(title).200B.%(ext)s" \
  --restrict-filenames \
  "$url"

mapfile -t thumb_files < <(find . -maxdepth 1 -type f \( -name '*.webp' -o -name '*.jpg' -o -name '*.jpeg' -o -name '*.png' \) | sort)
[[ ${#thumb_files[@]} -gt 0 ]] || die "No thumbnail image was downloaded into $output_dir."

log_info "Downloaded ${#thumb_files[@]} thumbnail file(s)."
log_debug "First thumbnail file: ${thumb_files[0]}"
