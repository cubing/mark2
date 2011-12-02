#!/bin/bash

mkdir build
mkdir build/inc

SCRAMBLE_ALL_FILE_NAME="build/inc/scramble_all.js"

cat \
	scramblers/scramble_222.js \
	scramblers/scramble_333.js \
	scramblers/scramble_NNN.js \
	scramblers/scramble_pyram.js \
	scramblers/scramble_minx.js \
	scramblers/scramble_sq1.js \
	scramblers/scramble_clock.js \
	inc/web_worker_manager.js \
> "${SCRAMBLE_ALL_FILE_NAME}"

insert_code()
{
while read; do
    if echo $REPLY | grep -q '<!--JAVASCRIPT_BUILD-->'; then
		echo "<script id=\"scramble_all\">"
        cat "${SCRAMBLE_ALL_FILE_NAME}"
        echo "</script>"
    else
    	echo $REPLY
    fi
done
} 

insert_code < "scramble.html" > "build/scramble_build.html"

for file in "mersennetwister.js" "raphael-min.js" "scramble.css" "scramble.js" "wca_logo.svg"
do
	cp "inc/$file" build/inc
done