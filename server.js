const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const fs = require('fs')
var path = require('path');

// viewed at http://localhost:8080
app.use(express.static(__dirname));
app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post('/', (req, res) => {
  console.log(req.body);
  fs.writeFileSync("code.txt",JSON.stringify(req.body)) 
});

const port = 8000;

app.listen(port, () => {
  console.log('Server running on port:' + port);
});
