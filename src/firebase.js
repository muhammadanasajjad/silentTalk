import { initializeApp } from "firebase/app";
import { connectDatabaseEmulator, getDatabase } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyAGBYxrMjSVrO_Mm83hU_5STEVeJHt0Tfk",
    authDomain: "silenttalk-9b776.firebaseapp.com",
    databaseURL:
        "https://silenttalk-9b776-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "silenttalk-9b776",
    storageBucket: "silenttalk-9b776.appspot.com",
    messagingSenderId: "966030168690",
    appId: "1:966030168690:web:f7d17333591d5b808928eb",
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

if (window.location.hostname === "localhost") {
    connectDatabaseEmulator(database, "localhost", 9000); // Port 9000 is the default
}

export { database };
