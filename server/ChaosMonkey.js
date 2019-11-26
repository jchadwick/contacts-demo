let requestHistory = {};

module.exports = function ChaosMonkey(req, res, next) {
  const requestKey = `${req.method} ${req.originalUrl}`;
  const requestedStatusCode = Number(req.query.chaos);

  const requestCount = requestHistory[requestKey];

  // trigger chaos if this is the first request to this URL
  // or the user asked for it (via querystring)
  const introduceALittleAnarchy =
    requestedStatusCode || (requestCount || 0) < 4;

  if (introduceALittleAnarchy) {
    // Track chaos so we don't trigger it next time
    requestHistory[requestKey] = (requestHistory[requestKey] || 0) + 1;

    setTimeout(
      () => {
        console.log(`${requestKey} => CHAOS MONKEY!`);
        res.statusMessage = "CHAOS MONKEY!";
        res.status(requestedStatusCode || 500);
        res.send("CHAOS MONKEY!");
      },
      // delay by 2 seconds
      2000
    );
  } else {
    // Untrack chaos so it can be triggered next time
    delete requestHistory[requestKey];

    // introduce a delay to all requests to mimic network latency
    setTimeout(next, 200);
  }
};
