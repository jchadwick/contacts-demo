/* eslint-disable */

const DefaultRetryCount = 5;

class DurableRequest {
  constructor({ request, isOnline, queueOfflineRequest, retryCount }) {
    this.request = request;
    this.isOnline = isOnline;
    this.queueOfflineRequest = queueOfflineRequest;
    this.retryCount = retryCount || DefaultRetryCount;
  }

  execute() {
    this.retryAttempt = 0;

    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
      this.retryRequest();
    });
  }

  retryRequest = () => {
    const { retryAttempt, retryCount, request, resolve, reject } = this;

    // use an expoentitally increasing delay
    const retryDelay = retryAttempt == 0 ? 0 : Math.pow(2, retryAttempt) * 100;

    if (!this.isOnline()) {
      console.debug(
        `[DurableRequest] ${request.method} ${request.url} | Aborting retry and adding request to offline queue`
      );

      this.queueOfflineRequest(request)
        .then(resolve)
        .catch(reject);

      return;
    }

    if (retryAttempt > retryCount) {
      console.warn(
        `[DurableRequest] ${request.method} ${request.url} | Retry attempts exceeded - abandoning request`
      );
      reject();
      return;
    }

    if (retryAttempt > 0) {
      console.debug(
        `[DurableRequest] ${request.method} ${request.url} | Retrying (attempt ${retryAttempt} / ${retryCount}; delay: ${retryDelay})`
      );
    }

    this.retryAttempt += 1;

    setTimeout(
      () =>
        fetch(request.clone())
          .then(result => {
            if (result.status >= 500) {
              this.retryRequest();
            } else {
              resolve(result);
            }
          })
          .catch(() => this.retryRequest()),
      retryDelay
    );
  };
}
