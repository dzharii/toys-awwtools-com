#!/usr/bin/env bash
set -euo pipefail

# Shared helpers for the Linux transcript scripts.

SCRIPT_NAME="${SCRIPT_NAME:-$(basename "$0")}"

timestamp() {
  date +"%Y-%m-%dT%H:%M:%S%z"
}

log_info() {
  printf '[%s] INFO %s: %s\n' "$(timestamp)" "$SCRIPT_NAME" "$*" >&2
}

log_debug() {
  printf '[%s] DEBUG %s: %s\n' "$(timestamp)" "$SCRIPT_NAME" "$*" >&2
}

log_error() {
  printf '[%s] ERROR %s: %s\n' "$(timestamp)" "$SCRIPT_NAME" "$*" >&2
}

die() {
  log_error "$*"
  exit 1
}

command_to_string() {
  local rendered=()
  local arg
  for arg in "$@"; do
    rendered+=("$(printf '%q' "$arg")")
  done
  printf '%s' "${rendered[*]}"
}

run_logged() {
  log_debug "Running command: $(command_to_string "$@")"
  if "$@"; then
    return 0
  else
    local exit_code=$?
    die "Command failed with exit code ${exit_code}: $(command_to_string "$@")"
  fi
}

require_cmd() {
  command -v "$1" >/dev/null 2>&1
}

ensure_directory() {
  mkdir -p "$1"
}

ensure_parent_dir() {
  local parent
  parent="$(dirname "$1")"
  mkdir -p "$parent"
}

ensure_file_exists() {
  local path="$1"
  local description="${2:-File}"
  [[ -f "$path" ]] || die "${description} was not created: $path"
}

validate_video_url() {
  local url="$1"
  [[ -n "$url" ]] || die "A video URL is required."
  [[ "$url" =~ ^https?://.+ ]] || die "Invalid video URL: $url"
}

install_yt_dlp_linux() {
  if require_cmd apt-get; then
    run_logged sudo apt-get update
    run_logged sudo apt-get install -y yt-dlp
    return
  fi

  if require_cmd dnf; then
    run_logged sudo dnf install -y yt-dlp
    return
  fi

  if require_cmd pacman; then
    run_logged sudo pacman -Sy --noconfirm yt-dlp
    return
  fi

  if require_cmd zypper; then
    run_logged sudo zypper install -y yt-dlp
    return
  fi

  if require_cmd apk; then
    run_logged sudo apk add yt-dlp
    return
  fi

  if require_cmd python3; then
    run_logged python3 -m pip install --user --upgrade yt-dlp
    export PATH="$HOME/.local/bin:$PATH"
    return
  fi

  die "Unable to install yt-dlp automatically. No supported package manager or python3 fallback is available."
}

ensure_yt_dlp() {
  if require_cmd yt-dlp; then
    log_info "Using yt-dlp $(yt-dlp --version | head -n 1)"
    return
  fi

  log_info "yt-dlp is not installed. Attempting automatic installation."
  install_yt_dlp_linux

  require_cmd yt-dlp || die "yt-dlp installation completed but the command is still unavailable."
  log_info "Installed yt-dlp $(yt-dlp --version | head -n 1)"
}
