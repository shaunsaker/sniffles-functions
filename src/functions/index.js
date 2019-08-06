const functions = require("firebase-functions");

const convertObjectToArray = require("./convertObjectToArray");

exports.onRawEvent = functions.database
  .ref("/raw/{rawId}")
  .onCreate(async snapshot => {
    /*
     * Create the logs from the probes
     */
    const rawEvent = snapshot.val();

    /*
     * Get the probes
     * E.g. "{\"probes\":[{\"address\":\"8c:eb:c6:d3:1b:2f\",\"rssi\":-91},{\"address\":\"8c:eb:c6:d3:1b:2f\",\"rssi\":-92}]}"
     */
    const { probes } = JSON.parse(rawEvent);

    /*
     * Get the unique addresses
     */
    const logs = [];
    const ignoredAddresses = [];
    const probesArray = convertObjectToArray(probes);

    /*
     * Collect the unique mac addresses
     * If it's not an ignored address
     */
    probesArray.forEach(({ address, rssi }) => {
      const isIgnoredAddress = ignoredAddresses.filter(
        item => address.indexOf(item) > -1
      )[0]
        ? true
        : false;

      if (!isIgnoredAddress) {
        logs.push({
          macAddress: address,
          rssi
        });
      }
    });

    /*
     * For each address, send a new log event
     */
    for (const log of logs) {
      const { macAddress, rssi } = log;
      const date = Date.now();
      const event = {
        macAddress,
        rssi,
        date
      };

      await snapshot.ref.parent.parent.child("log").push(event);

      console.log(`Saved log from ${macAddress}`);
    }

    let devices;
    const devicesRef = snapshot.ref.parent.parent.child("devices");

    await devicesRef.once("value", devicesSnapshot => {
      devices = devicesSnapshot.val() || {};
    });

    for (const log of logs) {
      const { macAddress } = log;
      let lastSeen;
      const isPresent = Object.keys(devices).filter(deviceId => {
        const device = devices[deviceId];
        lastSeen = device.lastSeen; // eslint-disable-line

        return device.macAddress === macAddress;
      }).length
        ? true
        : false;
      const now = Date.now();

      if (!isPresent) {
        /*
         * If it's not present
         * Save it to devices
         */

        const device = {
          macAddress,
          name: "",
          dateCreated: now,
          lastSeen: now
        };

        await devicesRef.child(macAddress).set(device);

        console.log(`Saved device: ${macAddress}.`);
      } else {
        /*
         * Save isRecurring flag
         * = is present and the log is greater than one minute apart from lastSeen
         */
        const difference = now - lastSeen;
        const isRecurring = difference > 1000 * 60; // ms * sec
        const data = { lastSeen: now };

        if (isRecurring) {
          data.isRecurring = true;
        }

        await devicesRef.child(macAddress).update(data);

        console.log(
          `Updated device: ${macAddress} ${isRecurring ? "is recurring" : ""}`
        );
      }
    }

    return "";
  });
