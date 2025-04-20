#!/bin/bash
source .env

# Ensure FONTAWESOME_KEY is set in the environment
if [ -z "$FONTAWESOME_KEY" ]; then
  echo "Error: FONTAWESOME_KEY environment variable is not set."
  exit 1
fi

echo "@fortawesome:registry=https://npm.fontawesome.com/
@awesome.me:registry=https://npm.fontawesome.com/
//npm.fontawesome.com/:_authToken=$FONTAWESOME_KEY" > .npmrc

cat <<EOF > .yarnrc.yml
nodeLinker: node-modules

npmScopes:
  fortawesome:
    npmAlwaysAuth: true
    npmRegistryServer: "https://npm.fontawesome.com/"
    npmAuthToken: "$FONTAWESOME_KEY"
  awesome.me:
    npmAlwaysAuth: true
    npmRegistryServer: "https://npm.fontawesome.com/"
    npmAuthToken: "$FONTAWESOME_KEY"
EOF
