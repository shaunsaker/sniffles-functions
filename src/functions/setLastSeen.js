const convertObjectToArray = require("./convertObjectToArray");

const setLastSeen = async ({ logs, devices, devicesRef }) => {
  /*
   * For each device in logs
   * Save the lastSeen date as that date to the devices ref
   */
  const logIds = Object.keys(logs);
  const devicesArray = convertObjectToArray(devices);

  for (const logId of logIds) {
    const { macAddress, date } = logs[logId];

    /*
     * Find the corresponding device in devices
     */
    const device = devicesArray.filter(item => {
      return item.macAddress === macAddress;
    })[0];
    const { lastSeen, id: deviceId, timesSeen } = device;

    /*
     * Only if it is different
     */
    if (lastSeen !== date) {
      const newTimesSeen = (timesSeen || 1) + 1;

      await devicesRef.child(deviceId).update({
        lastSeen,
        timesSeen: newTimesSeen
      });

      console.log(
        `Updated ${macAddress} to date: ${date} and timesSeen: ${newTimesSeen}`
      );
    } else {
      console.log(`${macAddress} is up to date.`);
    }
  }
};

module.exports = setLastSeen;
