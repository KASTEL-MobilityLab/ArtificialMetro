#!/bin/env bash

if [ -d ./.git ]; then
  echo "Cannot update. This copy is managed by git directly"
  exit
fi

BRANCH="trunk"
if [[ ! -z "$1" ]]; then
  BRANCH="$1"
fi
URL="https://github.com/KASTEL-MobilityLab/ArtificialMetro/archive/refs/heads/$BRANCH.zip"
wget -O app.zip "$URL"
unzip -u -d update app.zip
cp -rf update/*/* .
rm -r update
rm app.zip
npm i
