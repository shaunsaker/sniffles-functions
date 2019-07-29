const createLogs = async ({ rawEvent, logRef }) => {
  /*
   * Get the probes
   * E.g. "{\"probes\":[{\"address\":\"8c:eb:c6:d3:1b:2f\",\"rssi\":-91},{\"address\":\"8c:eb:c6:d3:1b:2f\",\"rssi\":-92}]}"
   */
  const { probes } = JSON.parse(rawEvent);

  /*
   * For each probe, map it to the shape we require
   * And send the event to log
   */
  for (const probe of probes) {
    const { address: macAddress } = probe;
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
