#!/usr/bin/env bash
# Adaptive Learning App launcher
# Ensures Node and npm in NVM or local paths are properly sourced

# Add NVM node to PATH if not already present
export PATH="$HOME/.nvm/versions/node/v24.22.1/bin:$PATH"

if [ -s "$HOME/.nvm/nvm.sh" ]; then
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
fi

if ! command -v npm &> /dev/null; then
  echo "Error: npm still not found in standard paths."
  echo "Please run: export PATH=\"\$HOME/.nvm/versions/node/v24.22.1/bin:\$PATH\""
  exit 1
fi

npm run dev
