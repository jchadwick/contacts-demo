/* eslint-disable */
console.info("Loaded service worker!");

const publishMessage = async message => {
  const clients = await this.clients.matchAll();
  clients.forEach(client => client.postMessage(message));
};

const updateOnlineStatus = () =>
  publishMessage({ type: "online_status", isOnline: navigator.onLine });

(function listenForOffline() {
  addEventListener("online", updateOnlineStatus);
  addEventListener("offline", updateOnlineStatus);
})();

const DefaultRetryCount = 5;

function DefaultRetryDelay(attempt) {
  if (!navigator.onLine) {
    console.debug(
      `No network connection detected -- waiting an hour to try again`
    );
    return 60 * 60 * 1000; // 1 hr
  }

  const delay = attempt == 1 ? 0 : Math.pow(2, attempt) * 500;
  console.debug(`Retry Delay: ${delay}`);
  return delay;
}

addEventListener("fetch", event => {
  const { request } = event;
  const { retryCount, retryDelay } = request;

  event.respondWith(
    fetchWithRetry({
      request,
      retryCount: retryCount || DefaultRetryCount,
      retryDelay: retryDelay || DefaultRetryDelay
    })
  );
});

function fetchWithRetry({
  request,
  retryAttempt = 1,
  retryCount,
  retryDelay,
  url
}) {
  publishMessage("[POSTMESSAGE] Retrying!");

  return new Promise((resolve, reject) => {
    console.debug("Executing with retry");

    const retryRequest = (resolve, reject) => {
      console.warn("Request Failed!");

      console.debug(
        `Retry attempt ${retryAttempt}; Retry Count: ${retryCount}`
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
            retryCount,
            retryDelay
          })
            .then(resolve)
            .catch(reject),
        retryDelay(retryAttempt)
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
