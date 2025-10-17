#!/bin/sh
set -e

echo "--- Starting ci_pre_xcodebuild.sh ---"

cd "$CI_PRIMARY_REPOSITORY_PATH"
echo "Repository root: $(pwd)"

# Install Node dependencies
echo "Installing Node dependencies..."
yarn install --immutable

# Sync Capacitor
echo "Syncing Capacitor iOS..."
npx cap sync ios --deployment

# Install CocoaPods
echo "Installing CocoaPods..."
cd ios/App/App
pod install

echo "--- ci_pre_xcodebuild.sh Complete ---"
