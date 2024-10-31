import { get, push, ref, set } from "firebase/database";
import { database } from "../firebase";

export function getElementFromRef(refPath, callback = (val, err) => {}) {
    const dbRef = ref(database, refPath);

    get(dbRef)
        .then((snapshot) => {
            if (snapshot.exists()) {
                callback(snapshot.val(), null);
            } else {
                callback(null, "404 Not found"); // Call with error
            }
        })
        .catch((error) => {
            callback(null, "Error retrieving data: " + error.message); // Call with error
        });
}

export function setElementInRef(
    refPath,
    data,
    callback = (success, err) => {}
) {
    const dbRef = ref(database, refPath);

    set(dbRef, data)
        .then(() => {
            callback("Data set successfully!", null); // Call the callback on success
        })
        .catch((error) => {
            callback(null, "Error setting data: " + error.message); // Call with error
        });
}

export function pushElementInRef(refPath, data, callback) {
    const dbRef = ref(database, refPath); // Get a reference to the specified path

    getElementFromRef(refPath, (val, err) => {
        if (err) {
            callback(val, err);
        } else {
            const newData = val ? [...val, data] : [data];
            setElementInRef(refPath, newData, callback);
        }
    });
}
