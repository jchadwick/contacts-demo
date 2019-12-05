/* eslint-disable */
console.debug("Initializing Durable Request Worker...");

importScripts(
  "ServerStatus.js",
  "OfflineRequestQueue.js",
  "DurableRequest.js",
  "UIMessagingChannel.js"
);

const messaging = new UIMessagingChannel();

const apiStatus = new ServerStatus(DefaulServerStatusEndpoint, {
  onStatusChanged: status => messaging.publish("online_status", status)
});

const executeDurableRequest = request =>
  new DurableRequest({
    request: request,
    isOnline: () => apiStatus.isOnline,
    queueOfflineRequest: offlineRequestQueue.queueRequest
  }).execute();

const offlineRequestQueue = new OfflineRequestQueue({
  requestExecutor: executeDurableRequest,
  isOnline: () => apiStatus.isOnline
});

const excludedUrls = [/\/status/];

addEventListener("fetch", event => {
  if (excludedUrls.some(url => url.test(event.request.url))) return;
  event.respondWith(executeDurableRequest(event.request));
});

addEventListener("activate", () =>
  console.log("Durable Request Worker activated")
);

console.debug("Durable Request Worker loaded");
