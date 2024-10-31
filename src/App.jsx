import { useEffect, useRef, useState } from "react";
import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Chat from "./pages/Chat";
import MainPage from "./pages/MainPage";

const router = createBrowserRouter([
    {
        path: "/",
        element: <MainPage />,
    },
    {
        path: "/chat/:username",
        element: <Chat />,
    },
]);

function App() {
    return <RouterProvider router={router} />;
}

export default App;

// let privateKeyAlice = getBigIntFromHex(
//     "dab3449b4f51ec07018e83be22dac11ee84539c64deb71ebc202635236660b4d"
// );
// let privateKeyAlice = getRandomBigInt(bits);
// let prime = getRandomBigInt(bits);
// let publicKeyAlice = getPublicKey(privateKeyAlice, 2, prime);
// console.log(
//     "privateKeyAlice: " + getHexFromBigInt(privateKeyAlice),
//     "publicKeyAlice: " + getHexFromBigInt(publicKeyAlice)
// );
// let privateKeyBob = getBigIntFromHex(
//     "b6639f6c45688d95b2cd1ad77c2c88943e12911a8f90927b6654e93fce412b7d"
// );
// let privateKeyBob = getRandomBigInt(bits);
// console.log(
//     getHexFromBigInt(privateKeyAlice),
//     "\n",
//     getHexFromBigInt(privateKeyBob)
// );
// let publicKeyBob = getPublicKey(privateKeyBob, 2, prime);
// console.log(
//     "privateKeyBob: " + getHexFromBigInt(privateKeyBob),
//     "publicKeyBob: " + getHexFromBigInt(publicKeyBob)
// );

// console.log(
//     "AB: " +
//         getHexFromBigInt(getSharedKey(publicKeyBob, privateKeyAlice, prime))
// );
// console.log(
//     "BA: " +
//         getHexFromBigInt(getSharedKey(publicKeyAlice, privateKeyBob, prime))
// );

// sendFriendRequest("alice", "bob", privateKeyAlice, bits);

// acceptFriendRequest("alice", "bob", privateKeyBob, bits).then(
//     (sharedKey) => {
//         console.log("shared key: " + getHexFromBigInt(sharedKey));
//     }
// );

// createFriendship("alice", "bob", privateKeyAlice, bits).then(
//     (sharedKey) => {
//         console.log("shared key: " + getHexFromBigInt(sharedKey));
//     }
// );
