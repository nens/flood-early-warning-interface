#!/bin/sh
set +x

DIRECTORY=`pwd`

mkdir -p /tmp/dist
cp -r $DIRECTORY/build/* /tmp/dist/
cd /tmp/dist
mkdir -p $DIRECTORY/dist
zip -r $DIRECTORY/dist/flood-early-warning-interface.zip .
cd /
rm -r /tmp/dist
ls -l $DIRECTORY/dist/flood-early-warning-interface.zip
