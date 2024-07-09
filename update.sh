#!/bin/env bash

if [ -d ./.git ]; then
  echo "Cannot update. This copy is managed by a git repo"
  exit
fi

OP="$1" # check, download, test, apply, do

if [[ "$OP" == "check" ]]; then
  if [[ ! -f "VERSION" ]]; then
      touch VERSION
  fi

  URL="https://github.com/KASTEL-MobilityLab/ArtificialMetro/archive/refs/heads/trunk.zip"
  LOCAL_VERSION=`cat VERSION`
  REMOTE_VERSION=`curl -IL $URL | grep etag`

  if [[ "$LOCAL_VERSION" == "$REMOTE_VERSION" ]]; then
      exit 0
  else
      exit 1
  fi

elif [[ "$OP" == "download" ]]; then
  SUCCESS=0
  BRANCH="trunk"
  if [[ ! -z "$2" ]]; then
    BRANCH="$2"
  fi
  URL="https://github.com/KASTEL-MobilityLab/ArtificialMetro/archive/refs/heads/$BRANCH.zip"

  echo "Download $BRANCH"
  wget -O update.zip "$URL"
  NEW_VERSION=`curl -IL $URL | grep etag`
  mkdir update
  unzip -u -d update/inner update.zip

  pushd update
    cp -rf inner/*/* .
    rm -r inner
    npm i
    SUCCESS="$?"
    echo "$NEW_VERSION" > "VERSION"
  popd

  rm update.zip
  exit "$SUCCESS"

elif [[ "$OP" == "test" ]]; then
  echo "Test Update"
  RESULT=`./prod-test.sh`
  exit "$RESULT"

elif [[ "$OP" == "apply" ]]; then
  echo "Apply Update"
  cp -rf update/* .
  rm -r update

elif [[ "$OP" == "do" ]]; then
  ./update.sh download "$2"
  if [[ "$?" != "0" ]]; then
    exit 1
  fi

  ./update.sh test
  if [[ "$?" != 0 ]]; then 
    exit 2
  fi

  ./update.sh apply
  if [[ "$?" != 0 ]]; then
    exit 3
  fi

else
  echo "Usage:"
  echo "$0 check                check for update"
  echo "$0 download [BRANCH]    download the current version of BRANCH"
  echo "$0 test                 run some tests to verify a working update"
  echo "$0 apply                apply the previously downloaded update"
  echo "$0 do                   perform the whole update process (download, test, apply)"
fi