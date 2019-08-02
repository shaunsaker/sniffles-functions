const admin = require("firebase-admin");

const serviceAccount = require("../../serviceAccount.json");
const convertObjectToArray = require("../functions/convertObjectToArray");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://sniffles-b62a5.firebaseio.com/"
});

const db = admin.database();

const doAsync = async () => {
  let probes;

  console.log("Fetching probes");

  await db.ref("raw").once("value", snapshot => {
    probes = snapshot.val() || {};
  });

  console.log("Fetched probes");

  const logs = [];

  Object.keys(probes).forEach(probeId => {
    const probe = JSON.parse(probes[probeId]).probes;

    probe.forEach(item => {
      const { address: macAddress, rssi } = item;

      logs.push({
        macAddress,
        rssi
      });
    });
  });

  let devices;
  const devicesRef = db.ref("devices");

  console.log("Fetching devices");

  await devicesRef.once("value", snapshot => {
    devices = snapshot.val() || {};
  });

  console.log("Fetched devices");

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
      console.log(`Device already present: ${macAddress}`);
    }
  }
};

doAsync();
