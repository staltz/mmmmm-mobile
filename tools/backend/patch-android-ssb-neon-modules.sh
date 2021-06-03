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

# All the crates we want to patch
declare -a modules=(
  "ssb-keys-neon/native"
  "ssb-keys-mnemonic-neon/native"
  "ssb-validate2-rsjs/native"
)

# "rustTriple;ndkArch"
declare -a archs=(
  "aarch64-linux-android;arm64-v8a"
  "armv7-linux-androideabi;armeabi-v7a"
  "arm-linux-androideabi;armeabi-v7a"
  "i686-linux-android;x86"
  "x86_64-linux-android;x86_64"
)

# Save absolute path to this repo
projectPath=$(pwd)

for module in "${modules[@]}"
do
  # Go in
  cd $projectPath/nodejs-assets/nodejs-project/node_modules/$module;

  # Create ".cargo/config.toml"
  mkdir -p ./.cargo;
  cd .cargo;
  rm -rf ./config.toml; # just in case it was there before
  cat > config.toml <<EOF
[term]
verbose = true

EOF

  # For every target architecture
  for entry in "${archs[@]}"
  do
    IFS=";" read -r -a arr <<< "${entry}" # entry.split(';')
    rustTriple="${arr[0]}"
    ndkArch="${arr[1]}"

    # Append config.toml with linker paths to libnode.so
    cat >> config.toml <<EOF
[target.${rustTriple}.node]
rustc-link-search = ["${projectPath}/node_modules/nodejs-mobile-react-native/android/libnode/bin/${ndkArch}"]
rustc-link-lib = ["node"]

EOF
  done

  # Go out
  cd $projectPath;
done
