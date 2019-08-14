const functions = require("firebase-functions");

exports.onRawEvent = functions.database
  .ref("/raw/{rawId}")
  .onCreate(async snapshot => {
    const rawEventString = snapshot.val();
    const rawEvent = JSON.parse(rawEventString);
    const { macAddress, isOnline } = rawEvent;

    /*
     * Create a new log
     */
    const date = Date.now();
    const event = {
      macAddress,
      isOnline,
      date
    };

    await snapshot.ref.parent.parent.child("log").push(event);

    console.log(`Saved log from ${macAddress}`);

    /*
     * Save the details to the device in devices
     */
    const devicesRef = snapshot.ref.parent.parent.child("devices");

    await devicesRef.child(macAddress).update(event);

    console.log(`Updated device: ${macAddress}`);

    return "";
  });
