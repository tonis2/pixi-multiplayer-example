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

//Holds the players inputs
const playersData = {
  players: {}
};

// Broadcast to all connections.
wss.broadcast = data => {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
};

function getPlayersData() {
  return JSON.stringify({
    type: "update",
    timestamp: Date.now(),
    data: Array.from(Object.values(playersData.players))
  });
}

function createPlayer() {
  const player = {
    id: Math.random().toString(36).substring(7),
    x: 100,
    y: 100
  };
  playersData.players[player.id] = player;
  return player;
}

setInterval(() => {
  wss.broadcast(getPlayersData());
}, 100);

wss.on("connection", ws => {
  const player = createPlayer();
  ws.id = player.id;
  ws.send(JSON.stringify({
    type: "init",
    timestamp: Date.now(),
    data: player
  }));
  ws.on("message", data => {
    const message = JSON.parse(data);
    switch (message.type) {
      case "input":
        playersData.players[message.data.id] = message.data;
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
