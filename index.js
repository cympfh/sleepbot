const child_process = require('child_process');
const express = require('express');
const fs = require('fs');
const http = require('http');
const morgan = require('morgan');

function usage() {
  console.log("Usage: node index.js <port>");
  process.exit();
}

if (process.argv.length != 3) {
  usage();
}
const port = process.argv[2] | 0;

function doit(dirname) {
  // run all scripts under the directory
  fs.readdir(dirname, (err, files) => {
    files.forEach(file => {
      const filepath = `${dirname}/${file}`;
      child_process.execFile(filepath, [], (err, stdout, stderr) => {
        if (err) {
          console.warn(`File \`${filepath}\` exited with an error: ${err}`);
        }
        else {
          console.warn(`File \`${filepath}\` exited successfully
stdout:
  ${stdout}
stderr:
  ${stderr}`);
        }
      });
    });
  });
}

var app = express();
app.use(morgan((tokens, req, res) =>
    [
        tokens.method(req, res),
        decodeURIComponent(tokens.url(req, res)),
        tokens.status(req, res),
        tokens.res(req, res, 'content-length'), '-',
        tokens['response-time'](req, res), 'ms'
    ].join(' ')));

app.get('/sleep/in', (req, res) => {
  res.end('Good night');
  doit('./scripts/in');
});

app.get('/sleep/out', (req, res) => {
  res.end('Good morning');
  doit('./scripts/out');
});

app.listen(port, () => {
  console.log(`Listen on port ${port}`);
});
