rm -rf ./npm
mkdir ./npm
cp features/support/apickli.js ./npm/apickli.js
cp LICENSE ./npm/LICENSE
cp README.md ./npm/README.md
cp package.json ./npm/package.json

cd ./npm
npm publish
