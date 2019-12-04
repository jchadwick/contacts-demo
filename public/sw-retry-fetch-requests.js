/* eslint-disable */
console.info("Loading service worker...");

const DefaultRetryCount = 5;

function getRetryDelay(retryAttempt) {
  return retryAttempt == 1 ? 0 : Math.pow(2, retryAttempt) * 500;
}

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
  if (url === DefaultServerStatusEndpoint) return fetch(url, request);

  return new Promise((resolve, reject) => {
    const retryRequest = () => {
      console.warn("Request Failed!");

      pollForOnline();

      if (onlineStatus === "offline") {
        console.debug("Server is OFFLINE - putting request in offline queue");

        queueOfflineRequest(request)
          .then(resolve)
          .catch(reject);

        return;
      } else {
        console.debug("Server is online - proceeding with retry");
      }

      // exponentially increase delay
      const retryDelay = getRetryDelay(retryAttempt);

      console.debug(
        `Retry attempt ${retryAttempt}; Retry Count: ${retryCount}; Delay: ${retryDelay}`
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
      .catch(() =>
        queueOfflineRequest(request)
          .then(resolve)
          .catch(reject)
      );
  });
}

const DefaultServerStatusEndpoint = "http://localhost:8080/status";

async function getServerStatus(statusEndpoint = DefaultServerStatusEndpoint) {
  try {
    const { status } = await fetch(statusEndpoint, { method: "POST" });
    console.log(`Server status: ${status}`);
    return status >= 400 ? "offline" : "online";
  } catch {
    return "offline";
  }
}

let onlineStatus = navigator.onLine ? "online" : "offline";
let isPolling = false;

const pollForOnline = async (retryAttempt = 0) => {
  if (isPolling && retryAttempt === 0) {
    return;
  }

  isPolling = true;

  console.debug("Requesting server status...");
  onlineStatus = await getOnlineStatus();
  console.debug(`Status: ${onlineStatus}`);

  if (onlineStatus === "offline") {
    const pollDelay = getRetryDelay(retryAttempt);
    console.debug(`Server is still offline - waiting ${pollDelay}`);
    setTimeout(() => pollForOnline(retryAttempt + 1), pollDelay);
  } else {
    console.debug("Server is online - done polling");
    isPolling = false;
  }
};

(() => {
  addEventListener("online", () => {
    console.log("Network is online");
  });

  addEventListener("offline", () => {
    onlineStatus = "offline";
    console.debug(`Network connection is offline.`);
    pollForOnline();
  });

  console.debug("Listening for online/offline events");
})();

const getOnlineStatus = async () => {
  if (!navigator.onLine) return "offline";
  return await getServerStatus();
};

let offlineRequestQueue = [];

const queueOfflineRequest = request =>
  new Promise((resolve, reject) => {
    offlineRequestQueue.push({ request, resolve, reject });
    console.info(
      `[Offline:${offlineRequestQueue.length}] ${request.method} ${request.url}`
    );
  });

const executeQueuedOfflineRequests = async () => {
  if (onlineStatus === "online" && offlineRequestQueue.length) {
    console.debug(
      `Executing ${offlineRequestQueue.length} offline requests...`
    );

    while (offlineRequestQueue.length) {
      const { request, resolve, reject } = offlineRequestQueue.shift();

      await fetchWithRetry({ request })
        .then(resolve)
        .catch(reject);
    }
  }

  setTimeout(() => executeQueuedOfflineRequests(), 500);
};

executeQueuedOfflineRequests();

// const publishMessage = async message => {
//   const clients = await this.clients.matchAll();
//   clients.forEach(client => client.postMessage(message));
// };

console.info("Loaded service worker!");
