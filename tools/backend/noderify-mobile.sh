#!/bin/bash

# Any copyright is dedicated to the Public Domain.
# http://creativecommons.org/publicdomain/zero/1.0/

set -eEu -o pipefail
shopt -s extdebug
IFS=$'\n\t'
trap 'onFailure $?' ERR

function onFailure() {
  echo "Unhandled script error $1 at ${BASH_SOURCE[0]}:${BASH_LINENO[0]}" >&2
  exit 1
}

cd ./nodejs-assets/nodejs-project;

# Why some packages are filter'd or replaced:
#   bindings: after noderify, the paths to .node files might be different, so
#      we use a special fork of bindings
#   chloride: needs special compilation configs for android, and we'd like to
#      remove unused packages such as sodium-browserify etc
#   leveldown: newer versions of leveldown are intentionally ignoring
#      nodejs-mobile support, so we run an older version
#   node-extend: can't remember why we need to replace it, build seemed to fail
#   ssb-keys: we use ssb-keys-neon for better performance in Rust
#   ssb-keys-mnemonic: we use ssb-keys-mnemonic-neon for better performance
#   non-private-ip: we use a "better" fork of this package
#   multiserver net plugin: we're fixing a corner case bug with error recovery
#   rn-bridge: this is not an npm package, it's just a nodejs-mobile shortcut
#   bl: we didn't use it, and bl@0.8.x has security vulnerabilities
#   bufferutil: because we want nodejs-mobile to load its native bindings
#   supports-color: optional dependency within package `debug`
#   electron: not used on mobile, it's specific to desktop
#   multiserver-electron-ipc: not used on mobile, it's specific to desktop
#   ssb-validate2-rsjs-wasm: not used on mobile, it's specific to browsers
#   utf-8-validate: because we want nodejs-mobile to load its native bindings
$(npm bin)/noderify \
  --replace.bindings=bindings-noderify-nodejs-mobile \
  --replace.chloride=sodium-chloride-native-nodejs-mobile \
  --replace.leveldown=leveldown-nodejs-mobile \
  --replace.ssb-keys=ssb-keys-neon \
  --replace.ssb-keys-mnemonic=ssb-keys-mnemonic-neon \
  --replace.node-extend=xtend \
  --replace.non-private-ip=non-private-ip-android \
  --replace.multiserver/plugins/net=staltz-multiserver/plugins/net \
  --filter=rn-bridge \
  --filter=bl \
  --filter=bufferutil \
  --filter=supports-color \
  --filter=electron \
  --filter=multiserver-electron-ipc \
  --filter=ssb-validate2-rsjs-wasm \
  --filter=utf-8-validate \
  index.js > _index.js;
rm index.js; mv _index.js index.js;

rm restore.js;
rm ssb.js;
rm -rf plugins;

cd ../..;