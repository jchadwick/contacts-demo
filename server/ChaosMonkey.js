let requestHistory = {};
let chaosEnabled = true;

module.exports = function ChaosMonkey(req, res, next) {
  if (req.originalUrl.indexOf("chaos") === 1) {
    const { enabled } = req.query;

    // if the querystring was passed, then update the value
    if (enabled != null) {
      chaosEnabled = enabled == "1" || enabled == "true";
      console.log("Chaos monkey: ", chaosEnabled ? "enabled" : "disabled");

      // reset the history
      requestHistory = {};
    }

    res.send({ chaosEnabled });
    return;
  }

  const requestKey = `${req.method} ${req.originalUrl}`;
  const requestedStatusCode = Number(req.query.chaos);

  const requestCount = requestHistory[requestKey];

  // trigger chaos if this is the first request to this URL
  // or the user asked for it (via querystring)
  const introduceALittleAnarchy =
    requestedStatusCode || (requestCount || 0) < 4;

  if (chaosEnabled && introduceALittleAnarchy) {
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
