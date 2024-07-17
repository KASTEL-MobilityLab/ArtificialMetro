#!/bin/env bash

CAPTIVE_DETECTOR="detectportal.firefox.com"
EXPECTED_ANSWER="success"

ANSWER=`curl -s "$CAPTIVE_DETECTOR"`
RESULT="$?"

if [[ "$RESULT" == "0" ]]; then
    if [[ "$ANSWER" == "$EXPECTED_ANSWER" ]]; then 
        exit 0
    fi  
fi

# network is down or we have a captive portal
# inform the user and wait for them to hopefully connect
for i in {1..20}
do
    echo $((100-$i*5))
    sleep 5
done | zenity --progress --auto-close --title="Metro" --text="No network connection detected. Please connect to a network"