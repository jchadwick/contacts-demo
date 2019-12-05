/* eslint-disable */

class UIMessagingChannel {
  _handlers = [];

  constructor() {
    addEventListener("message", event =>
      this._handlers.forEach(handler => handler(event))
    );
  }

  subscribe(messageHandler) {
    _handlers.push(messageHandler);
  }

  publish(type, message) {
    clients.matchAll().then(clients => {
      for (const client of clients) {
        client.postMessage({ type, ...message });
      }
    });
  }
}
