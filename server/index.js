/*
 * node.js and socket.io tests
 */

const express = require("express");
const app = express();
const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 3010 });
const path = require("path");

app.get("/", (req, res) => {
  res.sendFile(path.resolve("index.html"));
});

app.use("/static", express.static("app"));
// setup

const PORT = 3000;
const HOST = "127.0.0.1";
const playersData = {
  players: {}
};

// Broadcast to all.
wss.broadcast = data => {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
};

setInterval(() => {
  playersData.timestamp = new Date();
  wss.broadcast(JSON.stringify(playersData));
}, 500);

wss.on("connection", ws => {
  wss.broadcast(JSON.stringify(playersData));
  ws.on("message", data => {
    const message = JSON.parse(data);
    switch (message.type) {
      case "input":
        playersData.players[message.data.id] = message.data;
        if (!ws.id) {
          ws.id = message.data.id;
        }
        break;
    }
  });
  //Player leaves, delete data from list
  ws.on("close", () => {
    delete playersData.players[ws.id];
  });
});

app.listen(PORT);

console.log("Server running at " + HOST + ":" + PORT + "/");
// console.log('Debug: ' + config.main.debug);
