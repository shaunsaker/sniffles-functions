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
    const { lastSeen, id: deviceId } = device;

    /*
     * Only if it is different
     */
    if (lastSeen !== date) {
      await devicesRef.child(deviceId).update({
        lastSeen
      });

      console.log(`Updated ${macAddress} to date: ${date}`);
    } else {
      console.log(`${macAddress} is up to date.`);
    }
  }
};

module.exports = setLastSeen;
