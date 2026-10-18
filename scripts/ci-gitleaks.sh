#!/usr/bin/env bash
set -euo pipefail

# Pinned official Gitleaks release and GitHub-reported asset digest.
expected='551f6fc83ea457d62a0d98237cbad105af8d557003051f41f3e7ca7b3f2470eb'
url='https://github.com/gitleaks/gitleaks/releases/download/v8.30.1/gitleaks_8.30.1_linux_x64.tar.gz'
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
curl --fail --location --silent --show-error --retry 3 --proto '=https' --tlsv1.2 "$url" -o "$tmp/gitleaks.tar.gz"
printf '%s  %s\n' "$expected" "$tmp/gitleaks.tar.gz" | sha256sum --check --
tar -xzf "$tmp/gitleaks.tar.gz" -C "$tmp" gitleaks
chmod 700 "$tmp/gitleaks"
"$tmp/gitleaks" dir . --no-banner --redact --exit-code 1
