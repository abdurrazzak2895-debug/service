#!/usr/bin/env bash
set -Eeuo pipefail

usage() {
  cat <<'USAGE'
Usage: check-vps-status.sh [host] [ssh-user]

Environment:
  SSH_IDENTITY_FILE  Optional SSH private-key path (kept outside this repository).
  VPS_HOST           Default host: 128.140.100.85
  VPS_USER           Default user: vps-deploy

Connects with SSH and runs only:
  sudo -n /usr/local/sbin/vps-status-readonly

The remote helper must be root-owned and installed with a matching narrow sudoers rule.
USAGE
}

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  usage
  exit 0
fi

host=${1:-${VPS_HOST:-128.140.100.85}}
user=${2:-${VPS_USER:-vps-deploy}}

if [[ ! "$host" =~ ^[A-Za-z0-9.-]+$ ]]; then
  echo "error: host must be an IP address or DNS name" >&2
  exit 64
fi
if [[ ! "$user" =~ ^[a-z_][a-z0-9_-]*\$?$ ]]; then
  echo "error: invalid SSH username" >&2
  exit 64
fi

ssh_args=(
  -o BatchMode=yes
  -o ConnectTimeout=10
  -o IdentitiesOnly=yes
  -o PreferredAuthentications=publickey
  -o PasswordAuthentication=no
  -o KbdInteractiveAuthentication=no
  -o StrictHostKeyChecking=yes
)

if [[ -n "${SSH_IDENTITY_FILE:-}" ]]; then
  if [[ ! -f "$SSH_IDENTITY_FILE" ]]; then
    echo "error: SSH_IDENTITY_FILE does not exist" >&2
    exit 66
  fi
  ssh_args+=(-i "$SSH_IDENTITY_FILE")
fi

exec ssh "${ssh_args[@]}" "${user}@${host}" 'sudo -n /usr/local/sbin/vps-status-readonly'
