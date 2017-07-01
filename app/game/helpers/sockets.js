export default class Socket {
  constructor() {
    this.connection = new WebSocket(`ws://${window.location.hostname}:3010`);
    this.connection.onerror = this.error.bind(this);
  }

  send(message) {
    this.connection.send(JSON.stringify(message));
  }

  error(err) {
    console.log(err);
  }
}
