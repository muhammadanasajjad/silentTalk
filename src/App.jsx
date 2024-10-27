import { useEffect, useRef, useState } from "react";
import "./App.css";
import {
    getHexFromBigInt,
    getBigIntFromHex,
    encryptMessage,
    decryptMessage,
    getRandomBigInt,
    getSharedKey,
} from "./encryption/encryptionManager";
import { database } from "./firebase";
import {
    acceptFriendRequest,
    createFriendship,
    getSharedKeyFromFriendship,
    loadMessages,
    sendFriendRequest,
    sendMessage,
} from "./users/userManager";
import { getElementFromRef } from "./firebase/databaseManager";
import { deleteUserData, getUserData, saveUserData } from "./indexedDB";
import { onValue, ref } from "firebase/database";

function App() {
    const bits = 256;
    const [username, setUsername] = useState();
    const [thisPrivateKey, setThisPrivateKey] = useState();
    const [otherUsername, setOtherUsername] = useState();
    const [sharedKey, setSharedKey] = useState();
    const [messages, setMessages] = useState([]);
    const tempThisPrivateKey = getBigIntFromHex(
        "dab3449b4f51ec07018e83be22dac11ee84539c64deb71ebc202635236660b4d"
    );
    const otherPrivateKey = getBigIntFromHex(
        "b6639f6c45688d95b2cd1ad77c2c88943e12911a8f90927b6654e93fce412b7d"
    );

    const handleRefresh = (
        un = username,
        ou = otherUsername,
        sk = sharedKey,
        callback = () => {}
    ) => {
        loadMessages(un, ou, sk).then((messages) => {
            setMessages(messages);
            callback(messages);
        });
    };

    useEffect(() => {
        window.scrollTo(0, document.body.scrollHeight);
    }, [messages]);

    console.log(getHexFromBigInt(getRandomBigInt(bits)));

    // deleteUserData();
    // sendFriendRequest("alice", "bob", tempThisPrivateKey).then((val) =>
    //     console.log(getHexFromBigInt(val))
    // );
    // acceptFriendRequest("alice", "bob", otherPrivateKey).then((val) => {
    //     console.log(getHexFromBigInt(val));
    // });
    // createFriendship("alice", "bob", tempThisPrivateKey).then(async (val) => {
    //     console.log(getHexFromBigInt(val));
    //     let encrypted = await encryptMessage("hello", getHexFromBigInt(val));
    //     console.log("encrypted:", encrypted);
    //     let decrypted = await decryptMessage(
    //         encrypted.ciphertext,
    //         encrypted.iv,
    //         getHexFromBigInt(val)
    //     );
    //     console.log("decrypted:", decrypted);
    //     setSharedKey(val);
    // });

    // console.log(encryptMessage("hello", sharedKey));
    return (
        <div className="App">
            {username ? (
                <>
                    <div>
                        <p>{username}</p>
                        <p>{thisPrivateKey}</p>
                        <p>{otherUsername}</p>
                        <div className="messages-container">
                            {messages.map((message) => {
                                let from = message.split("|")[0];
                                let actualMessage = message.split("|")[1];
                                let time = message.split("|")[2];
                                return (
                                    <div
                                        className={
                                            "message-container" +
                                            (from == username
                                                ? " me"
                                                : " other")
                                        }
                                    >
                                        <div className="message-text">
                                            {actualMessage}
                                        </div>
                                        <div className="message-time">
                                            {time}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="message-input-large-container">
                        <div className="message-input-container">
                            <input
                                placeholder="Enter Message"
                                type="text"
                                id="input-message"
                                onKeyDown={(e) => {
                                    if (e.key == "Enter") {
                                        console.log("something");
                                        sendMessage(
                                            username,
                                            otherUsername,
                                            document.getElementById(
                                                "input-message"
                                            ).value,
                                            sharedKey
                                        ).then(() => {
                                            document.getElementById(
                                                "input-message"
                                            ).value = "";
                                            handleRefresh(
                                                username,
                                                otherUsername,
                                                sharedKey
                                            );
                                        });
                                    }
                                }}
                            />
                            <div
                                onClick={() => {
                                    handleRefresh(
                                        username,
                                        otherUsername,
                                        sharedKey
                                    );
                                }}
                            >
                                <ion-icon name="refresh"></ion-icon>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <>
                    <input
                        placeholder="Enter Username"
                        type="text"
                        id="input-username"
                    />
                    <input
                        placeholder="Enter Private Key"
                        type="text"
                        id="input-privateKey"
                    />
                    <input
                        placeholder="Enter Other User"
                        type="text"
                        id="input-otherUser"
                    />
                    <button
                        id="button-join"
                        onClick={() => {
                            getUserData().then((data) => {
                                if (data.username && data.privateKey) {
                                    const inputOtherUser =
                                        document.getElementById(
                                            "input-otherUser"
                                        ).value;
                                    setUsername(data.username);
                                    setThisPrivateKey(data.privateKey);
                                    setOtherUsername(inputOtherUser);
                                    getSharedKeyFromFriendship(
                                        data.username,
                                        inputOtherUser,
                                        getBigIntFromHex(data.privateKey)
                                    ).then((val) => {
                                        console.log(val);

                                        handleRefresh(
                                            data.username,
                                            inputOtherUser,
                                            val
                                        );
                                        setSharedKey(val);
                                    });
                                } else {
                                    const inputUsername =
                                        document.getElementById(
                                            "input-username"
                                        ).value;
                                    const inputPrivateKey =
                                        document.getElementById(
                                            "input-privateKey"
                                        ).value;
                                    const inputOtherUser =
                                        document.getElementById(
                                            "input-otherUser"
                                        ).value;

                                    saveUserData(
                                        inputPrivateKey,
                                        inputUsername
                                    );

                                    // sendFriendRequest(
                                    //     inputUsername,
                                    //     inputOtherUser,
                                    //     getBigIntFromHex(inputPrivateKey),
                                    //     bits
                                    // ).then((thisPublicKey) => {
                                    //     console.log(
                                    //         getHexFromBigInt(thisPublicKey)
                                    //     );
                                    // });
                                    setUsername(inputUsername);
                                    setThisPrivateKey(inputPrivateKey);
                                    setOtherUsername(inputOtherUser);
                                    console.log(
                                        getSharedKeyFromFriendship(
                                            inputUsername,
                                            inputOtherUser,
                                            getBigIntFromHex(inputPrivateKey)
                                        )
                                    );
                                }
                            });
                        }}
                    >
                        Join
                    </button>
                </>
            )}
        </div>
    );
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
