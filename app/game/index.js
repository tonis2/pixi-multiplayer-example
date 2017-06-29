import KeyListener from "./helpers/keylistener.js";
import Socket from "./helpers/sockets.js";
import { Rocket } from "./models/rocket.js";
import { lerp } from "./helpers/math.js";
const socket = new Socket();
const app = new PIXI.Application(800, 600, { backgroundColor: 0x1099bb });
const Listener = new KeyListener();
let packetsArray = [];

let rocketStats = null;

function createPlayer(playerdata) {
  const rocket = new Rocket(playerdata);
  app.stage.addChild(rocket);
}

function interPolate() {
  if (packetsArray.length < 5) return;
  const past = 140,
    now = Date.now(),
    renderTime = now - past;

  const t1 = packetsArray[1].timestamp,
    t2 = packetsArray[0].timestamp;

  if (renderTime <= t2 && renderTime >= t1) {
    // total time from t1 to t2
    const total = t2 - t1,
      // how far between t1 and t2 this entity is as of 'renderTime'
      portion = renderTime - t1,
      // fractional distance between t1 and t2
      ratio = portion / total;

    const t1Players = packetsArray[0].data,
      t2Players = packetsArray[1].data;
    t1Players.forEach(player => {
      const t2Player = t2Players.filter(item => player.id === item.id)[0];
      if (!t2Player) return;

      const interpX = lerp(t2Player.x, player.x, ratio);
      const interpY = lerp(t2Player.y, player.y, ratio);
      const cords = { x: interpX, y: interpY };
      if (rocketStats.id !== player.id) {
        editPlayerPosition(player, cords);
      }
    });
    packetsArray.slice();
  }
}
function editPlayerPosition(player, cords) {
  const playerSprite = getCurrentPlayerSprite(player.id);
  if (!playerSprite) {
    createPlayer(player);
    const newPlayerSprite = getCurrentPlayerSprite(player.id);
    newPlayerSprite.x = cords.x;
    newPlayerSprite.y = cords.y;
  } else {
    playerSprite.x = cords.x;
    playerSprite.y = cords.y;
  }
}

function getCurrentPlayerSprite(id) {
  return app.stage.children.filter(children => children.id === id)[0];
}

function sendData() {
  const currentPlayerStats = getCurrentPlayerSprite(rocketStats.id);
  currentPlayerStats.x = rocketStats.x;
  currentPlayerStats.y = rocketStats.y;
  socket.send({
    type: "input",
    data: rocketStats
  });
}

socket.connection.onmessage = signal => {
  const payload = JSON.parse(signal.data);
  switch (payload.type) {
    case "init":
      rocketStats = payload.data;
      createPlayer(payload.data);
      break;
    case "update":
      packetsArray.unshift(payload);
      break;
  }
};

app.ticker.add(delta => {
  if (rocketStats) {
    interPolate();
  }
  Listener.on("W", () => {
    rocketStats.y -= 4;
    sendData();
  });

  Listener.on("S", () => {
    rocketStats.y += 4;
    sendData();
  });

  Listener.on("A", () => {
    rocketStats.x -= 4;
    sendData();
  });

  Listener.on("D", () => {
    rocketStats.x += 4;
    sendData();
  });
});

document.getElementById("game").appendChild(app.view);
