/* eslint-disable */
console.info("Loaded service worker!");

const DefaultRetryCount = 5;

function retryDelay(attempt) {
  const delay = attempt == 1 ? 0 : Math.pow(2, attempt) * 500;
  console.debug(`Retry Delay: ${delay}`);
  return delay;
}

addEventListener("fetch", event => {
  const { request } = event;
  const { retryCount } = request;

  event.respondWith(
    fetchWithRetry({ request, retryCount: retryCount || DefaultRetryCount })
  );
});

function fetchWithRetry({ request, url, retryAttempt = 1, retryCount }) {
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
            retryCount
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
