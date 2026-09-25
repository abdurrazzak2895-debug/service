#!/bin/bash
set -u

if [ "$(id -u)" -ne 0 ]; then
  echo "error: this helper must be run as root via the restricted sudo rule" >&2
  exit 77
fi

printf '%s\n' '=== VPS status ==='
printf 'hostname: '; hostname
printf 'uptime: '; uptime -p 2>/dev/null || uptime
if [ -r /etc/os-release ]; then
  . /etc/os-release
  printf 'os: %s %s\n' "${NAME:-unknown}" "${VERSION_ID:-unknown}"
fi

printf '\n%s\n' '=== Running systemd services ==='
if command -v systemctl >/dev/null 2>&1; then
  systemctl list-units --type=service --state=running --no-legend --no-pager || true
  printf '\n%s\n' '=== Failed systemd units ==='
  systemctl --failed --no-legend --no-pager || true
else
  echo 'systemctl: unavailable'
fi

printf '\n%s\n' '=== Docker containers (running) ==='
if command -v docker >/dev/null 2>&1; then
  docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}' 2>&1 || true
  printf '\n%s\n' '=== Docker containers (all states) ==='
  docker ps -a --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}' 2>&1 || true
else
  echo 'docker: not installed'
fi

printf '\n%s\n' '=== Top processes (arguments omitted) ==='
ps -eo pid,user,comm,pcpu,pmem --sort=-pcpu | head -20

printf '\n%s\n' '=== Listening TCP sockets ==='
if command -v ss >/dev/null 2>&1; then
  ss -lntp 2>/dev/null | head -30 || true
else
  echo 'ss: unavailable'
fi

# Deliberately does not inspect process arguments, service environments,
# application .env files, credentials, or systemd unit contents.
