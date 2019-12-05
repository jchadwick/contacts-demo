/* eslint-disable */

class OfflineRequestQueue {
  requestQueue = [];

  constructor({ isOnline, requestExecutor: executeRequest, pollDelay }) {
    if (typeof isOnline !== "function")
      throw new Error("isOnline must be a function");

    if (typeof executeRequest !== "function")
      throw new Error("requestExecutor must be a function");

    this.isOnline = isOnline;
    this.pollDelay = pollDelay || 1000;
    this.requestExecutor = executeRequest;

    this.processQueue();

    console.debug("[OfflineQueue] initialized");
  }

  getQueuedRequestInfo = () =>
    this.requestQueue.map(({ request }) => `${request.method} ${request.url}`);

  queueRequest = async request => {
    const queuedRequest = new Promise((resolve, reject) =>
      this.requestQueue.push({ request, resolve, reject })
    );

    console.debug(`[OfflineQueue] Queue(${request.method} ${request.url})`);
    console.log(`[OfflineQueue] ${this.requestQueue.length} queued requests`);

    return queuedRequest;
  };

  processQueue = async () => {
    if (this.isOnline()) {
      if (this.requestQueue.length) {
        console.debug(
          `[OfflineQueue] Connection restored - processing ${this.requestQueue.length} queued requests...`
        );
        await this.executeQueuedRequests();
      }
    }

    setTimeout(() => this.processQueue(), this.pollDelay);
  };

  executeQueuedRequests = async () => {
    if (!this.requestQueue.length) {
      console.debug("[OfflineQueue] No offline requests queued");
      return;
    }

    const { request, resolve, reject } = this.requestQueue.shift();

    console.debug(
      `[OfflineQueue] Executing queued request ${request.method} ${request.url}`
    );

    await this.requestExecutor(request)
      .then(resolve)
      .catch(reject);

    return this.executeQueuedRequests();
  };
}
