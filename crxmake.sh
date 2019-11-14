#!/bin/bash -e
#
# Purpose: Pack a Chromium extension directory into crx format

set -x

if test $# -ne 2; then
  echo "Usage: crxmake.sh <extension dir> <pem path>"
  exit 1
fi

dir=$(realpath $1)
key=$(realpath $2)

echo "dir: $dir"
echo "key: $key"

ps="/" # "\\"

parent_dir=$(echo "${dir%$ps*}")
name=${dir##*$ps}
crx="$name.crx"

win_dir=$(cygpath -w $dir | sed 's#\\#\\\\#g')
win_key=$(cygpath -w $key | sed 's#\\#\\\\#g')
win_parent_dir=$(cygpath -w $parent_dir)

chrome --pack-extension="$win_dir" --pack-extension-key="$win_key"
echo "Pack: chrome --pack-extension=\"$win_dir\" --pack-extension-key=\"$win_key\""

f=$parent_dir$ps$crx
win_f=$(cygpath -w $parent_dir$ps$crx | sed 's#\\#\\\\#g')

if [ -f $f ]; then

  echo "[+] Created at "

  chrome --enable-easy-off-store-extension-install --load-extension="$win_f"
  echo "Install: chrome --enable-easy-off-store-extension-install --load-extension=$win_f"

fi

exit




# dir=$(echo "/$1" | sed -e 's/\\/\//g' -e 's/://')

echo "dir: $1"
echo "key: $2"

dir=$1
parent_dir=$(echo "${dir%\\*}")
key=$2
# name=$(basename "$dir")
name=${dir##*\\}
crx="$name.crx"
pub="$name.pub"
sig="$name.sig"
zip="$name.zip"
trap 'rm -f "$pub" "$sig" "$zip"' EXIT

# zip up the crx dir
cwd=$(pwd -P)
(cd "$dir" && zip -qr -9 -X "$cwd/$zip" .)

# signature
openssl sha1 -sha1 -binary -sign "$key" < "$zip" > "$sig"

# public key
openssl rsa -pubout -outform DER < "$key" > "$pub" 2>/dev/null

byte_swap () {
  # Take "abcdefgh" and return it as "ghefcdab"
  echo "${1:6:2}${1:4:2}${1:2:2}${1:0:2}"
}

crmagic_hex="4372 3234" # Cr24
version_hex="0200 0000" # 2
pub_len_hex=$(byte_swap $(printf '%08x\n' $(ls -l "$pub" | awk '{print $5}')))
sig_len_hex=$(byte_swap $(printf '%08x\n' $(ls -l "$sig" | awk '{print $5}')))
(
  echo "$crmagic_hex $version_hex $pub_len_hex $sig_len_hex" | xxd -r -p
  cat "$pub" "$sig" "$zip"
) > "$crx"
echo "Wrote $crx"

if [ $? -eq 0 ]; then
    chrome --load-extension=$parent_dir\\$crx
    echo "Install in chrome extension: chrome --load-extension=$parent_dir\\$crx"
fi