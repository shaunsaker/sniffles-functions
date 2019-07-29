const setLastSeen = async ({ logs, devices, devicesRef }) => {
  /*
   * For each device in logs
   * Save the lastSeen date as that date to the devices ref
   */
  const logIds = Object.keys(logs);

  for (const logId of logIds) {
    const { macAddress, date } = logs[logId];

    /*
     * Find the corresponding device in devices
     */
    let lastSeenDate;
    const deviceId = Object.keys(devices).filter(deviceId => {
      const { macAddress: deviceMacAddress, lastSeen } = devices[deviceId];
      lastSeenDate = lastSeen;

      return deviceMacAddress === macAddress;
    })[0];

    /*
     * Only if it is different
     */
    if (lastSeenDate !== date) {
      await devicesRef.child(deviceId).update({
        lastSeen: date
      });

      console.log(`Updated last seen date of ${macAddress} to ${date}`);
    } else {
      console.log(`${macAddress} is up to date.`);
    }
  }
};

module.exports = setLastSeen;
