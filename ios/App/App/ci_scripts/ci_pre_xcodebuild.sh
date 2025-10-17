#!/bin/sh
set -ex

echo "--- Starting ci_pre_xcodebuild.sh ---"
echo "Environment:"
env | sort

cd "$CI_PRIMARY_REPOSITORY_PATH"

# Install Node if not present
if ! command -v node >/dev/null 2>&1; then
  echo "Installing Node.js..."
  export HOMEBREW_NO_AUTO_UPDATE=1
  brew install node
fi

# Add to PATH
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

echo "Node: $(which node)"
echo "NPM: $(which npm)"

# Setup FontAwesome
echo "Setting up FontAwesome..."
./fontawesome-npmrc.sh

# Install dependencies
echo "Installing dependencies..."
npm install --legacy-peer-deps

# Build web assets
echo "Building web assets..."
npm run build

# Sync Capacitor (without deployment flag to allow pod updates)
echo "Syncing Capacitor..."
npx cap sync ios

# Install Pods
echo "Installing CocoaPods..."
cd ios/App/App
pod install

# Fix permissions on pod scripts
chmod +x Pods/Target\ Support\ Files/Pods-App/*.sh 2>/dev/null || true

echo "Verifying public folder..."
ls -la App/public/ || echo "WARNING: public folder missing or empty"

echo "--- Complete ---"
