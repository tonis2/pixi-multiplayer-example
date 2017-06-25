import KeyListener from "./helpers/keylistener.js";
import Socket from "./helpers/sockets.js";
import { Rocket } from "./models/rocket.js";
import { lerp } from "./helpers/math.js";
const socket = new Socket();
const app = new PIXI.Application(800, 600, { backgroundColor: 0x1099bb });
const Listener = new KeyListener();
let packetsArray = [];

const rocketStats = {
  id: Math.random().toString(36).substring(7),
  x: 100,
  y: 100
};

function createPlayer(playerdata) {
  const rocket = new Rocket(playerdata);
  app.stage.addChild(rocket);
}

function interPolate() {
  if (packetsArray.length < 5) return;
  const past = 100,
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

    const t1Players = packetsArray[0].players,
      t2Players = packetsArray[1].players;

    Object.values(t1Players).forEach(player => {
      const interpX = lerp(t2Players[player.id].x, player.x, 0.5);
      const interpY = lerp(t2Players[player.id].y, player.y, 0.5);
      const cords = { x: interpX, y: interpY };
      if (rocketStats.id !== player.id) editPlayerPosition(player, cords);
    });
    packetsArray.slice();
  }
}

function editPlayerPosition(player, cords) {
  const playerSprite = getCurrentPlayerSprite(player.id);
  playerSprite.x = cords.x;
  playerSprite.y = cords.y;
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
    data: {
      x: currentPlayerStats.x,
      id: rocketStats.id,
      y: currentPlayerStats.y
    }
  });
}

socket.connection.onopen = () => {
  createPlayer(rocketStats);
  sendData();
};

socket.connection.onmessage = signal => {
  const payload = JSON.parse(signal.data);
  console.log(payload);
  packetsArray.unshift(payload);
};

app.ticker.add(delta => {
  interPolate();
  Listener.on("W", () => {
    rocketStats.y -= 4;
  });

  Listener.on("S", () => {
    rocketStats.y += 4;
  });

  Listener.on("A", () => {
    rocketStats.x -= 4;
  });

  Listener.on("D", () => {
    rocketStats.x += 4;
  });

  sendData();
});

document.getElementById("game").appendChild(app.view);
