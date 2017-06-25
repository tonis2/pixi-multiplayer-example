import KeyListener from "./helpers/keylistener.js";
import Socket from "./helpers/sockets.js";
import { Rocket } from "./models/rocket.js";
const socket = new Socket();
const app = new PIXI.Application(800, 600, { backgroundColor: 0x1099bb });

const Listener = new KeyListener();
document.getElementById("game").appendChild(app.view);

const rocketStats = {
  id: Math.random().toString(36).substring(7),
  x: app.renderer.width / 2,
  y: app.renderer.height / 2
},
  createPlayer = playerdata => {
    const rocket = new Rocket(playerdata);
    app.stage.addChild(rocket);
  },
  editPlayerPosition = playerdata => {},
  getCurrentPlayerSprite = id => {
    return app.stage.children.filter(children => children.id === id)[0];
  },
  sendData = () => {
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
  };

socket.connection.onopen = () => {
  createPlayer(rocketStats);
  sendData();
};

socket.connection.onmessage = signal => {
  const payload = JSON.parse(signal.data);
  Object.values(payload.players).forEach(player => {
    const playerSprite = getCurrentPlayerSprite(player.id);
    if (!playerSprite) {
      createPlayer(player);
    } else {
      playerSprite.x = player.x;
      playerSprite.y = player.y;
    }
  });
};

app.ticker.add(delta => {
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
