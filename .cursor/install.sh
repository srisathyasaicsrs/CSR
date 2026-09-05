#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

required_files=(
  index.html
  about-district.html
  login.html
  dashboard.html
  style.css
  main.js
  js/auth-dashboard.js
  js/kv-storage.js
)

for file in "${required_files[@]}"; do
  if [[ ! -f "$file" ]]; then
    echo "Missing required file: $file" >&2
    exit 1
  fi
done

echo "Static CSR portal files verified."
