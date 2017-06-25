export default class Socket {
  constructor() {
    this.connection = new WebSocket("ws://127.0.0.1:3010");
    this.connection.onerror = this.error.bind(this);
  }

  send(message) {
    this.connection.send(JSON.stringify(message));
  }

  error(err) {
    console.log(err);
  }
}
