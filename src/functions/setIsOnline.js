const convertObjectToArray = require("./convertObjectToArray");

const setIsOnline = async ({ logs, devices, devicesRef }) => {
  /*
   * If the device is in logs, it is online
   * Else it is offline
   */
  const deviceIds = Object.keys(devices);
  const logsArray = convertObjectToArray(logs);

  for (deviceId of deviceIds) {
    const { macAddress, isOnline } = devices[deviceId];
    const log = logsArray.filter(item => {
      return item.macAddress === macAddress;
    })[0];

    if (log && !isOnline) {
      await devicesRef.child(deviceId).update({
        isOnline: true
      });

      console.log(`${macAddress} went online.`);
    } else if (!log && isOnline) {
      await devicesRef.child(deviceId).update({
        isOnline: false
      });

      console.log(`${macAddress} went offline.`);
    }
  }
};

module.exports = setIsOnline;
