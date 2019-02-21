const fs = require('fs');
const https = require('https');
const options = {
  key: fs.readFileSync('certs/server-key.pem'),
  cert: fs.readFileSync('certs/server-crt.pem'),
  ca: fs.readFileSync('certs/ca-crt.pem'),
  requestCert: true,
  rejectUnauthorized: true,
};
https.createServer(options, function(req, res) {
  res.writeHead(200);
  res.end('hello world\n');
}).listen(443);
