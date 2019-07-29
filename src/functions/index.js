const functions = require("firebase-functions");

/*
 * onRawEvent
 *
 * Converts event from:
 * {probes: [{address, rssi}]}
 * to format: {macAddress, date}
 *
 * Save devices {name, macAddress, isOnline, lastSeen}
 */
exports.onRawEvent = functions.database
  .ref("/raw/{rawId}")
  .onCreate(async snapshot => {
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
    for (const probe of probes) {
      const { address: macAddress } = probe;
      const date = Date.now();
      const event = {
        macAddress,
        date
      };

      await snapshot.ref.parent.parent.child("log").push(event);
    }

    /*
     * Create new devices from the logs (if not already present)
     *
     * Get the logs from the past two minutes (if any)
     */
    let logs;
    const now = Date.now();
    const elapsedMinutes = 2;
    const elapsedTime = elapsedMinutes * 60 * 1000; // elapsed time in ms, e.g. X min * 60 sec * 1000 ms
    const startAt = now - elapsedTime;

    await snapshot.ref.parent.parent
      .child("log")
      .orderByChild("date")
      .startAt(startAt)
      .once("value", logsSnapshot => {
        logs = logsSnapshot.val();
      });

    /*
     * Get the devices
     */
    let devices;

    await snapshot.ref.parent.parent
      .child("devices")
      .once("value", devicesSnapshot => {
        devices = devicesSnapshot.val();
      });

    console.log({ logs, devices });

    /*
     * Set the isOnline status of all devices
     *
     * To be an online device, we need to have seen the device within 5 minutes ago
     */

    return "";
  });
