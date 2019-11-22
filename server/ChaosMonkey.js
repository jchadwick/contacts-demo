let requestQueue = {};

module.exports = function ChaosMonkey(req, res, next) {
  const requestKey = `${req.method} ${req.originalUrl}`;
  const requestedStatusCode = Number(req.query.chaos);

  // trigger chaos if this is the first request to this URL
  // or the user asked for it (via querystring)
  const introduceALittleAnarchy =
    requestQueue[requestKey] == null || requestedStatusCode;

  if (introduceALittleAnarchy) {
    // Track chaos so we don't trigger it next time
    requestQueue[requestKey] = true;

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
    delete requestQueue[requestKey];

    // introduce a delay to all requests to mimic network latency
    setTimeout(next, 200);
  }
};
