
//Libraries
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const http = require('http');
const ws = require('ws');
const ip = require("ip");

//constants
const port = process.env.PORT || 8080;
const app = express();
const server = http.createServer(app);
const wss = new ws.Server({ server: server });

//server functions
function messageHandler(message) {
    wss.clients.forEach((client) => {
        if(client.readyState === client.OPEN) {
            try {
                client.send(message);
            } catch (err) {
              // errors are ignored
            }
        }
    });
}

function connectionHandler(ws) {
  console.log("new connection");
  ws.on('message', messageHandler);
}

wss.on('connection', connectionHandler);

app.use(express.static(`${__dirname }/public`));
app.use(express.static(__dirname));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post('/save', (req, res) => {
  try{
    fs.writeFileSync('code.txt', JSON.stringify(req.body));
    res.sendStatus(200);//OK
    console.log("saved");
  } catch (err){
    res.sendStatus(400);//bad request
  }
});

// start the server
server.listen(port, () => {
    console.log('Server started:', `http://${ip.address()}:${port}` )
});
