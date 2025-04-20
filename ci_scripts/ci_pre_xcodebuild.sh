#!/bin/sh

# Exit immediately if a command exits with a non-zero status.
set -e

echo "--- Starting ci_pre_xcodebuild.sh ---"

# Ensure we are in the repository root
# Xcode Cloud sets CI_PRIMARY_REPOSITORY_PATH to the repo root
if [ -z "$CI_PRIMARY_REPOSITORY_PATH" ]; then
  echo "Error: CI_PRIMARY_REPOSITORY_PATH is not set. Cannot determine repository root."
  exit 1
fi

echo "Changing directory to Repository Root ($CI_PRIMARY_REPOSITORY_PATH)..."
cd "$CI_PRIMARY_REPOSITORY_PATH"
echo "Current directory: $(pwd)"

# Check if package.json exists
if [ ! -f "package.json" ]; then
  echo "Error: package.json not found at repository root: $CI_PRIMARY_REPOSITORY_PATH"
  exit 1
fi

# Sync Capacitor iOS project
# Assumes node_modules were installed by Podfile post_install hook
echo "Syncing Capacitor iOS project (npx cap sync ios --deployment)..."
npx cap sync ios --deployment

echo "--- ci_pre_xcodebuild.sh Finished ---"

exit 0
