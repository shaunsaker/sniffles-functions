const convertObjectToArray = require("./convertObjectToArray");

const createDevices = async ({ logRef, devicesRef, timeElapsed }) => {
  /*
       * Create new devices from the logs (if not already present)
       *
       * Get the logs from the past X minutes (if any)
       * 
       * { '-LkwTfB-uwJsCohBHUh0': { date: 1564382769518, macAddress: '8c:eb:c6:d3:1b:2f' },
       '-LkwTfI5cFDF2s6-i1sI': { date: 1564382770379, macAddress: '8c:eb:c6:d3:1b:2f' } }
       */
  let logs;
  const now = Date.now();
  const elapsedTime = timeElapsed * 60 * 1000; // elapsed time in ms, e.g. X min * 60 sec * 1000 ms
  const startAt = now - elapsedTime;

  await logRef
    .orderByChild("date")
    .startAt(startAt)
    .once("value", logsSnapshot => {
      logs = logsSnapshot.val();
    });

  /*
       * Get the devices
       *
       * { '12345678': 
        { isOnline: true,
          lastSeen: 1564380413000,
          macAddress: '8c:eb:c6:d3:1b:2f',
          name: 'SAKERS Wifi' } }
       */
  let devices;

  await devicesRef.once("value", devicesSnapshot => {
    devices = devicesSnapshot.val() || {};
  });

  /*
   * Iterate through the logs
   * For each device that is not in devices
   * Save it to devices
   */
  if (logs) {
    /*
     * Get the latest, unique logs
     */
    const latestUniqueLogs = {};
    const uniqueMacAddresses = [];
    const logsArray = convertObjectToArray(logs);

    /*
     * Collect the unique mac addresses
     */
    logsArray.forEach(({ macAddress }) => {
      if (!uniqueMacAddresses.includes(macAddress)) {
        uniqueMacAddresses.push(macAddress);
      }
    });

    /*
     * The latest unique log is the last one to match the appropriate mac address
     */
    uniqueMacAddresses.forEach(macAddress => {
      const latestLog = logsArray
        .filter(log => {
          return log.macAddress === macAddress;
        })
        .reverse()[0];

      latestUniqueLogs[latestLog.id] = latestLog;
    });

    logs = latestUniqueLogs;

    const logIds = Object.keys(logs);

    for (const logId of logIds) {
      const { macAddress } = logs[logId];
      const isPresent = Object.keys(devices).filter(deviceId => {
        const { macAddress: deviceMacAddress } = devices[deviceId];

        return deviceMacAddress === macAddress;
      }).length
        ? true
        : false;

      if (!isPresent) {
        /*
         * If it's not present
         * Save it to devices
         */
        const now = Date.now();
        const device = {
          isOnline: true,
          lastSeen: now,
          macAddress,
          name: "",
          dateCreated: now,
          timesSeen: 1
        };

        await devicesRef.push(device);

        console.log(`Saved device: ${macAddress}.`);
      } else {
        console.log(`Device ${macAddress} is already present.`);
      }
    }
  }

  return { logs, devices };
};

module.exports = createDevices;
