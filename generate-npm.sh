rm -rf ./npm
mkdir ./npm

cp ./apickli/apickli.js ./npm/apickli.js
cp ./LICENSE ./npm/LICENSE
cp ./README.md ./npm/README.md
cp ./apickli/package.json ./npm/package.json

cd ./npm
npm publish
