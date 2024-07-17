#!/bin/env bash

# directory of Metro install
INSTALL_DIR="."
# update branch. Empty string defaults to trunk
BRANCH=""

# check for update
pushd "$INSTALL_DIR"
    ./update.sh check
    UPDATE_AVAILABLE="$?"
popd
if [[ "$UPDATE_AVAILABLE" == "0" ]]; then
    exit 0
fi

# download update
pushd "$INSTALL_DIR"
    ./update.sh download "$BRANCH" | zenity --progress --pulsate --auto-close --title="Metro Updater" --text="Downloading new version"
    RESULT="$?"
popd
if [[ "$RESULT" != "0" ]]; then
    zenity --error --timeout=20 --title="Metro Updater" --text="Downloading update failed" --ok-label="Close (20s)"
    exit 1
fi


# run production tests
pushd "$INSTALL_DIR"
    ./update.sh test | zenity --progress --pulsate --auto-close --title="Metro Updater" --text="Running production tests"
    RESULT="$?"
    cat prod-test-result.txt | zenity --text-info --width=500 --height=500 --timeout=20 --ok-label="Close (20s)" --title="Test result"
popd
if [[ "$RESULT" != "0" ]]; then
    zenity --error --timeout=20 --title="Metro Updater" --text="Production tests for update failed" --ok-label="Close (20s)"
    exit 2
fi

# apply update
pushd "$INSTALL_DIR"
    ./update.sh apply
    RESULT="$?"
popd
if [[ "$RESULT" != "0" ]]; then
    zenity --error --timeout=20 --title="Metro Updater" --text="Applying update failed" --ok-label="Close (20s)"
    exit 3
fi

exit 0