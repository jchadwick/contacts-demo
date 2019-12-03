/* eslint-disable */
console.info("Loading service worker...");

const DefaultRetryCount = 5;
const DefaulServerStatusEndpoint = "http://localhost:8080/status";

const postMessage = async message => {
  const allClients = await clients.matchAll();
  for (const client of allClients) {
    client.postMessage(message);
  }
};

const getOnlineStatus = (serverStatusEndpoint => {
  let onlineStatus = "online";

  addEventListener("online", () => (onlineStatus = "online"));
  addEventListener("offline", () => (onlineStatus = "offline"));

  async function getServerStatus() {
    // this is a poll, but could just as well be a WebSocket or something similar
    const serverStatus = await fetch(serverStatusEndpoint, { method: "POST" })
      .then(resp => (resp.status < 400 ? "online" : "offline"))
      .catch(() => "offline");

    if (serverStatus != onlineStatus) {
      onlineStatus = serverStatus;
      postMessage({ type: "online_status", status: onlineStatus });
    }

    setTimeout(() => getServerStatus(), 1000);
  }

  getServerStatus();

  return () => (!navigator.onLine ? "offline" : onlineStatus);
})(DefaulServerStatusEndpoint);

const queueOfflineRequest = (() => {
  let requestQueue = [];

  async function processQueue() {
    const status = getOnlineStatus();

    if (status === "online") {
      await executeQueuedRequests();
    }

    setTimeout(() => processQueue(), 1000);
  }

  async function executeQueuedRequests() {
    if (!requestQueue.length) return;

    const { request, resolve, reject } = requestQueue.pop();

    console.debug(`Executing queued request ${request.method} ${request.url}`);

    await fetchWithRetry({ request })
      .then(resolve)
      .catch(reject);

    return executeQueuedRequests();
  }

  processQueue();

  console.debug("Initialized offline request queue");

  return request => {
    const queuedRequest = new Promise((resolve, reject) =>
      requestQueue.push({ request, resolve, reject })
    );

    console.debug(
      `[OfflineQueue:${requestQueue.length}] ${request.method} ${request.url}`
    );

    return queuedRequest;
  };
})();

addEventListener("fetch", event => {
  const { request } = event;
  event.respondWith(fetchWithRetry({ request }));
});

function fetchWithRetry({
  request,
  retryAttempt = 1,
  retryCount = DefaultRetryCount,
  url
}) {
  // use an expoentitally increasing delay
  const retryDelay = retryAttempt == 1 ? 0 : Math.pow(2, retryAttempt) * 500;

  return new Promise((resolve, reject) => {
    const retryRequest = () => {
      if (getOnlineStatus() === "offline") {
        queueOfflineRequest(request)
          .then(resolve)
          .catch(reject);

        return;
      }

      console.debug(
        `Retrying (attempt ${retryAttempt} / ${retryCount}; delay: ${retryDelay}) ${request.method} ${request.url}`
      );

      if (retryAttempt > retryCount) {
        console.warn("Retry attempts exceeded - abandoning request");
        reject();
        return;
      }

      setTimeout(
        () =>
          fetchWithRetry({
            url: request.url,
            request,
            retryAttempt: retryAttempt + 1,
            retryCount
          })
            .then(resolve)
            .catch(reject),
        retryDelay
      );
    };

    (url != null ? fetch(url, request) : fetch(request))
      .then(function(result) {
        if (result.status >= 500) {
          retryRequest(resolve, reject);
        } else {
          resolve(result);
        }
      })
      .catch(() => retryRequest(resolve, reject));
  });
}

console.info("Service worker loaded");
