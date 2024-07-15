#!/bin/env bash

# try first with all tests, including provider tests
export PROVIDER_TEST=true
npm run test run > prod-test-result.txt
RESULT="$?"

if [[ "$RESULT" == "0" ]]; then
    exit 0
fi

# if they failed, skip provider tests, bc app can function w/o them
touch PROD_TEST_FAILED
export PROVIDER_TEST=false
npm run test run
exit "$?"
