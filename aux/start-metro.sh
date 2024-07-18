#!/bin/env bash

# directory of Metro install
INSTALL_DIR="."

# let network start up
sleep 10

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
    sleep 0.2
done | zenity --progress --auto-close --title="Metro" --text="Starting server..."

# launch UI
chromium-browser --kiosk --temp-profile --start-fullscreen "http://localhost:3000"

# reboot when chrome failed
zenity --question --timeout=10 --ok-label="Restart" --cancel-label="Keep System running" --title="Metro" --text="Restart Metro?"
RESULT="$?"
if [[ "$RESULT" == "1" ]]; then
    exit
else
    reboot
fi
