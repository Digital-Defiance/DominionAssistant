#!/bin/bash
source .env
echo "@fortawesome:registry=https://npm.fontawesome.com/
@awesome.me:registry=https://npm.fontawesome.com/
//npm.fontawesome.com/:_authToken=$FONTAWESOME_KEY" > .npmrc

cat <<EOF > .yarnrc.yml
nodeLinker: node-modules

npmScopes:
  fortawesome:
    npmAlwaysAuth: true
    npmRegistryServer: "https://npm.fontawesome.com/"
    npmAuthToken: "{FONTAWESOME_KEY}"
  awesome.me:
    npmAlwaysAuth: true
    npmRegistryServer: "https://npm.fontawesome.com/"
    npmAuthToken: "{FONTAWESOME_KEY}"
EOF
sed -i "s/{FONTAWESOME_KEY}/$FONTAWESOME_KEY/g" .yarnrc.yml