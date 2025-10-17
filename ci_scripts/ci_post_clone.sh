#!/bin/sh
set -e

echo "--- Starting ci_post_clone.sh ---"

# Xcode Cloud has Homebrew pre-installed
echo "Updating Homebrew..."
brew update

# Install Node.js
echo "Installing Node.js..."
brew install node

echo "Node installed at: $(which node)"
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"

echo "--- ci_post_clone.sh Complete ---"
