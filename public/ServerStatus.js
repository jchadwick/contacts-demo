/* eslint-disable */

const DefaulServerStatusEndpoint = "http://localhost:8080/status";

const hasWebSocketSupport = "WebSocket" in self && WebSocket.CLOSING === 2;

class ServerStatus {
  serverStatus = navigator.onLine ? "online" : "offline";

  get onlineStatus() {
    return !navigator.onLine ? "offline" : this.serverStatus;
  }

  get isOnline() {
    return this.onlineStatus === "online";
  }

  constructor(serverStatusEndpoint, opts = {}) {
    this.onStatusChanged = opts.onStatusChanged;
    this.serverStatusEndpoint = serverStatusEndpoint;
    this.pollDelay = opts.pollDelay || 1000;

    addEventListener("online", () => this.setServerStatus("online"));
    addEventListener("offline", () => this.setServerStatus("offline"));
    this.listenForServerStatusUpdates();
  }

  setServerStatus(status) {
    if (status != this.serverStatus) {
      this.serverStatus = status;

      console.debug(`[ServerStatus] Status Changed: ${status}`);

      if (this.onStatusChanged) {
        this.onStatusChanged({
          isOnline: this.isOnline,
          onlineStatus: this.serverStatus
        });
      }
    }
  }

  async listenForServerStatusUpdates() {
    try {
      if (hasWebSocketSupport) {
        console.debug("Connecting to web socket...");
        await this.connectToStatusSocket();
        return;
      } else {
        console.debug("Web sockets NOT supported - falling back to polling");
      }
    } catch {
      console.warn(
        "Failed to connect to status socket - falling back to polling"
      );
    }

    this.pollForServerStatus();
  }

  connectToStatusSocket = () => {
    if (this.socket && this.socket.readyState === this.socket.OPEN) {
      this.socket.close();
    }

    this.socket = null;

    const socket = new WebSocket(
      this.serverStatusEndpoint.replace(/^http/, "ws") + "/ws"
    );
    socket.onopen = () => {
      console.debug("[ServerStatus:WS] Connected");
    };
    socket.onclose = () => {
      console.warn(`[ServerStatus:WS] Socket closed`);
      this.setServerStatus("offline");
      setTimeout(() => this.connectToStatusSocket(), 1000);
    };
    socket.onerror = error => {
      console.error(`[ServerStatus:WS] ${error}`);
      this.setServerStatus("offline");
      socket.close();
    };
    socket.onmessage = message => {
      const status = Number(message.data);
      const serverStatus = status > 400 ? "offline" : "online";
      this.setServerStatus(serverStatus);
    };

    this.socket = socket;
  };

  async pollForServerStatus() {
    // this is a poll, but could just as well be a WebSocket or something similar
    const serverStatus = await fetch(this.serverStatusEndpoint, {
      method: "POST"
    })
      .then(resp => (resp.status < 400 ? "online" : "offline"))
      .catch(() => "offline");

    this.setServerStatus(serverStatus);

    setTimeout(() => this.pollForServerStatus(), this.pollDelay);
  }
}
