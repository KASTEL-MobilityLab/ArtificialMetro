#!/bin/env bash

# directory of Metro install
INSTALL_DIR="."


# ensure network connection
./check-network.sh

# check for update
./auto-upate.sh

# launch server
pushd "$INSTALL_DIR"

    ./watchdog.sh "npm run prod" &

popd

# entertain the user while server starts
for i in {1..100}
do
    echo "$i"
    sleep 1
done | zenity --progress --auto-close --title="Metro" --text="Starting server..."

# launch UI
chromium-browser --kiosk --start-fullscreen "http://localhost:3000"
