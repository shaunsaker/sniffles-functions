const functions = require("firebase-functions");

/*
 * onRawEvent
 *
 * Converts event from:
 * {probes: [{address, rssi}]}
 * to format: {macAddress, date}
 *
 */
exports.onRawEvent = functions.database
  .ref("/raw/{rawId}")
  .onCreate(snapshot => {
    /*
     * Get the probes
     * E.g. "{\"probes\":[{\"address\":\"8c:eb:c6:d3:1b:2f\",\"rssi\":-91},{\"address\":\"8c:eb:c6:d3:1b:2f\",\"rssi\":-92}]}"
     */
    const rawEventString = snapshot.val();
    const { probes } = JSON.parse(rawEventString);

    /*
     * For each probe, map it to the shape we require
     * And send the event to log
     */
    probes.forEach(async probe => {
      const { address: macAddress } = probe;
      const date = Date.now();
      const event = {
        macAddress,
        date
      };

      await snapshot.ref.parent.parent.child("log").push(event);
    });

    return null;
  });

/*
 * onEvent
 *
 * Save devices {name, macAddress, isOnline, lastUpdated}
 *
 * To be a local device, we need to have seen the device at least X times (1)
 * To be an online device, we need to have seen the device within X minutes ago (5)
 */
exports.onEvent = functions.database
  .ref("/events/{eventId}")
  .onCreate(snapshot => {
    // TODO:
  });
