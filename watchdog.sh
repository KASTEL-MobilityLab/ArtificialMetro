#!/bin/env bash

# give up after 10 tries
for i in {1..10}
do
    $1
done
