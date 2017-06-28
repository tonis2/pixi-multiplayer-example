export default class Socket {
  constructor() {
    this.connection = new WebSocket("ws://85.184.249.97:3010");
    this.connection.onerror = this.error.bind(this);
  }

  send(message) {
    this.connection.send(JSON.stringify(message));
  }

  error(err) {
    console.log(err);
  }
}
