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
          {
            macAddress: '8c:eb:c6:d3:1b:2f',
            name: 'SAKERS Wifi' 
          } 
        }
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
    const logIds = Object.keys(logs);

    for (const logId of logIds) {
      const { macAddress } = logs[logId];
      const isPresent = Object.keys(devices).filter(deviceId => {
        const device = devices[deviceId];

        return device.macAddress === macAddress;
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
          macAddress,
          name: "",
          dateCreated: now
        };

        await devicesRef.push(device);

        console.log(`Saved device: ${macAddress}.`);
      } else {
        console.log(`Device ${macAddress} is already present.`);
      }
    }
  }
};

module.exports = createDevices;
