#!/usr/bin/env bash
set -e

echo "🔧 Running setup.sh..."
echo "📦 Installing dependencies via npm..."
npm install

echo "✅ npm install complete."

if [ -f package.json ]; then
  echo "🧪 Running lint check..."
  npm run lint || echo "⚠️ Linting failed, but continuing..."
fi

echo "🏁 Setup complete."
