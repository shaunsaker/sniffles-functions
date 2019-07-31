const convertObjectToArray = require("./convertObjectToArray");

const createLogs = async ({ rawEvent, logRef }) => {
  /*
   * Get the probes
   * E.g. "{\"probes\":[{\"address\":\"8c:eb:c6:d3:1b:2f\",\"rssi\":-91},{\"address\":\"8c:eb:c6:d3:1b:2f\",\"rssi\":-92}]}"
   */
  let { probes } = JSON.parse(rawEvent);

  /*
   * Get the unique addresses
   */
  const uniqueAddresses = [];
  const ignoredAddresses = ["da:a1:19"];
  const probesArray = convertObjectToArray(probes);

  /*
   * Collect the unique mac addresses
   * If it's not an ignored address
   */
  probesArray.forEach(({ address }) => {
    const isIgnoredAddress = ignoredAddresses.filter(
      item => address.indexOf(item) > -1
    )[0]
      ? true
      : false;

    if (!uniqueAddresses.includes(address) && !isIgnoredAddress) {
      uniqueAddresses.push(address);
    }
  });

  /*
   * For each address, send a new log event
   */
  for (const macAddress of uniqueAddresses) {
    const date = Date.now();
    const event = {
      macAddress,
      date
    };

    await logRef.push(event);

    console.log(`Saved log: ${event.macAddress}`);
  }
};

module.exports = createLogs;
