const functions = require("firebase-functions");

const createLogs = require("./createLogs");
const createDevices = require("./createDevices");
const setLastSeen = require("./setLastSeen");
const timeElapsed = 1; // in minutes (arduino updates every 30 seconds)

exports.onRawEvent = functions.database
  .ref("/raw/{rawId}")
  .onCreate(async snapshot => {
    const logRef = snapshot.ref.parent.parent.child("log");
    const devicesRef = snapshot.ref.parent.parent.child("devices");

    /*
     * Create the logs from the probes
     */
    const rawEvent = snapshot.val();
    createLogs({ rawEvent, logRef });

    /*
     * If there is a new device in the logs, create it in devices
     */
    const { logs, devices } = await createDevices({
      logRef,
      devicesRef,
      timeElapsed
    });

    /*
     *  Set the lastSeen date of all devices in new logs
     */
    if (logs) {
      await setLastSeen({ logs, devices, devicesRef });
    }

    return "";
  });
