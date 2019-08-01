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
    const ignoredAddresses = ["da:a1:19"];
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
      const isPresent = Object.keys(devices).filter(deviceId => {
        const device = devices[deviceId];

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
        await devicesRef.child(macAddress).update({ lastSeen: now });

        console.log(`Updated device: ${macAddress}`);
      }
    }

    return "";
  });
