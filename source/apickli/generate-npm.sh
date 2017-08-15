#!/bin/sh
rm -rf ./npm
mkdir ./npm

cp ./apickli.js ./npm/apickli.js
cp ./apickli-gherkin.js ./npm/apickli-gherkin.js
cp ../package.json ./npm/package.json
cp ../../LICENSE ./npm/LICENSE
cp ../../README.md ./npm/README.md

cd ./npm
npm publish

rm -rf ../npm
