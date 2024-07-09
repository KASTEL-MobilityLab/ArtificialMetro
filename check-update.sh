#!/bin/env bash

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