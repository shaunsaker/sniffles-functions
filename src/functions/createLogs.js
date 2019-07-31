const convertObjectToArray = require("./convertObjectToArray");

const createLogs = async ({ rawEvent, logRef }) => {
  /*
   * Get the probes
   * E.g. "{\"probes\":[{\"address\":\"8c:eb:c6:d3:1b:2f\",\"rssi\":-91},{\"address\":\"8c:eb:c6:d3:1b:2f\",\"rssi\":-92}]}"
   */
  let { probes } = JSON.parse(rawEvent);
  console.log({ probes });

  /*
   * Get the unique addresses
   */
  const uniqueAddresses = [];
  const probesArray = convertObjectToArray(probes);

  /*
   * Collect the unique mac addresses
   */
  probesArray.forEach(({ address }) => {
    if (!uniqueAddresses.includes(address)) {
      uniqueAddresses.push(address);
    }
  });

  console.log({ uniqueAddresses });

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
