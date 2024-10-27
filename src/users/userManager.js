import {
    getHexFromBigInt,
    getRandomBigInt,
    getPublicKey,
    getSharedKey,
    getBigIntFromHex,
    encryptMessage,
    decryptMessage,
    uint8ArrayToHex,
    hexToUint8Array,
} from "../encryption/encryptionManager";
import {
    getElementFromRef,
    pushElementInRef,
    setElementInRef,
} from "../firebase/databaseManager";

export function sendFriendRequest(from, to, fromPrivateKey) {
    return new Promise((resolve) => {
        getElementFromRef("friendRequests", (friendRequests, err) => {
            if (err) {
                console.log(err);
                return;
            }
            for (let i = 0; i < friendRequests.length; i++) {
                if (
                    friendRequests[i].from === from &&
                    friendRequests[i].to === to
                ) {
                    console.log(
                        "friend request already sent from " + from + " to " + to
                    );
                    return;
                }
            }

            console.log("sending friend request from " + from + " to " + to);
            let prime = getRandomBigInt(256);
            let publicKey = getPublicKey(fromPrivateKey, 2, prime);
            let friendRequest = {
                from,
                to,
                fromPublicKey: getHexFromBigInt(publicKey),
                prime: getHexFromBigInt(prime),
                generator: 2,
                toPublicKey: "",
            };
            // console.log(friendRequest);
            pushElementInRef("friendRequests", friendRequest, () => {
                resolve(publicKey);
            });
        });
    });
}

export function acceptFriendRequest(from, to, toPrivateKey) {
    return new Promise((resolve) => {
        getElementFromRef("friendRequests", (friendRequests, err) => {
            if (err) {
                console.log(err);
                return;
            }
            for (let i = 0; i < friendRequests.length; i++) {
                if (
                    friendRequests[i].from === from &&
                    friendRequests[i].to === to
                ) {
                    let friendRequest = friendRequests[i];
                    let prime = getBigIntFromHex(friendRequest.prime);
                    let generator = friendRequest.generator;
                    let otherPublicKey = getBigIntFromHex(
                        friendRequest.fromPublicKey
                    );
                    let thisPublicKey = getPublicKey(
                        toPrivateKey,
                        generator,
                        prime
                    );

                    let sharedKey = getSharedKey(
                        otherPublicKey,
                        toPrivateKey,
                        prime
                    );
                    setElementInRef(
                        `friendRequests/${i}/toPublicKey`,
                        getHexFromBigInt(thisPublicKey),
                        () => {
                            resolve(sharedKey);
                        }
                    );
                }
            }
        });
    });
}

export function createFriendship(from, to, fromPrivateKey) {
    return new Promise((resolve) => {
        getElementFromRef("friendRequests", (friendRequests, err) => {
            if (err) {
                console.log(err);
                return;
            }
            for (let i = 0; i < friendRequests.length; i++) {
                if (
                    friendRequests[i].from === from &&
                    friendRequests[i].to === to
                ) {
                    let friendRequest = friendRequests[i];
                    let prime = getBigIntFromHex(friendRequest.prime);
                    let otherPublicKey = getBigIntFromHex(
                        friendRequest.toPublicKey
                    );
                    let thisPublicKey = getBigIntFromHex(
                        friendRequest.fromPublicKey
                    );

                    let sharedKey = getSharedKey(
                        otherPublicKey,
                        fromPrivateKey,
                        prime
                    );

                    let friendship = {
                        messages: ["initialMessage"],
                        temp: "something",
                    };
                    friendship[`${from}Key`] = getHexFromBigInt(thisPublicKey);

                    friendship[`${to}Key`] = getHexFromBigInt(otherPublicKey);
                    friendship[`prime`] = getHexFromBigInt(prime);

                    setElementInRef(
                        `friendships/${from}|${to}`,
                        friendship,
                        () => {
                            // setElementInRef(
                            //     `friendRequests`,
                            //     friendRequests.filter(
                            //         (_, index) => index !== i
                            //     ),
                            //     () => {
                            //         resolve(sharedKey);
                            //     }
                            // );
                            resolve(sharedKey);
                        }
                    );
                }
            }
        });
    });
}

export function getSharedKeyFromFriendship(
    from,
    to,
    privateKey,
    privateKeyIsFrom = true
) {
    return new Promise((resolve) =>
        getElementFromRef(`friendships/${from}|${to}`, (friendship, err) => {
            if (err) {
                getElementFromRef(
                    `friendships/${to}|${from}`,
                    (friendship, err) => {
                        if (err) {
                            console.log(err);
                            return;
                        }
                        let otherPublicKey = getBigIntFromHex(
                            privateKeyIsFrom
                                ? friendship[`${to}Key`]
                                : friendship[`${from}Key`]
                        );
                        resolve(
                            getSharedKey(
                                otherPublicKey,
                                privateKey,
                                friendship.prime
                            )
                        );
                    }
                );
                return;
            }
            let otherPublicKey = getBigIntFromHex(
                privateKeyIsFrom
                    ? friendship[`${to}Key`]
                    : friendship[`${from}Key`]
            );
            resolve(getSharedKey(otherPublicKey, privateKey, friendship.prime));
        })
    );
}

export async function sendMessage(from, to, message, sharedKey) {
    let date = new Date();
    console.log(sharedKey);
    let encryptedMessage = await encryptMessage(
        message,
        getHexFromBigInt(sharedKey)
    );
    console.log(encryptedMessage);
    return new Promise((resolve) => {
        getElementFromRef(`friendships/${from}|${to}`, (friendship, err) => {
            if (err) {
                getElementFromRef(
                    `friendships/${to}|${from}`,
                    (friendship, err) => {
                        if (err) {
                            console.log(err);
                            return;
                        }
                        let messages = friendship.messages;
                        messages.push(
                            from +
                                "|" +
                                uint8ArrayToHex(encryptedMessage.ciphertext) +
                                "|" +
                                uint8ArrayToHex(encryptedMessage.iv) +
                                `|${("" + date.getHours()).padStart(2, "0")}:${(
                                    "" + date.getMinutes()
                                ).padStart(2, "0")}`
                        );
                        console.log(encryptedMessage);
                        setElementInRef(
                            `friendships/${to}|${from}/messages`,
                            messages,
                            () => {
                                resolve();
                            }
                        );
                    }
                );

                return;
            }
            let messages = friendship.messages;
            messages.push(
                from +
                    "|" +
                    uint8ArrayToHex(encryptedMessage.ciphertext) +
                    "|" +
                    uint8ArrayToHex(encryptedMessage.iv) +
                    `|${("" + date.getHours()).padStart(2, "0")}:${(
                        "" + date.getMinutes()
                    ).padStart(2, "0")}`
            );
            setElementInRef(
                `friendships/${from}|${to}/messages`,
                messages,
                () => {
                    resolve();
                }
            );
        });
    });
}

export async function loadMessages(from, to, sharedKey) {
    return new Promise((resolve) => {
        getElementFromRef(
            `friendships/${from}|${to}`,
            async (friendship, err) => {
                if (err) {
                    console.log("first error: ", err);
                    getElementFromRef(
                        `friendships/${to}|${from}`,
                        async (friendship, err) => {
                            if (err) {
                                console.log(err);
                                return;
                            }
                            let encryptedMessages = friendship.messages;
                            let decryptedMessages = [];
                            for (let i = 1; i < encryptedMessages.length; i++) {
                                let encryptedMessage = encryptedMessages[i];
                                let message = await decryptMessage(
                                    hexToUint8Array(
                                        encryptedMessage.split("|")[1]
                                    ),
                                    hexToUint8Array(
                                        encryptedMessage.split("|")[2]
                                    ),
                                    getHexFromBigInt(sharedKey)
                                );
                                message =
                                    encryptedMessage.split("|")[0] +
                                    "|" +
                                    message +
                                    "|" +
                                    encryptedMessage.split("|")[3];
                                decryptedMessages.push(message);
                            }
                            resolve(decryptedMessages);
                        }
                    );
                    return;
                }
                let encryptedMessages = friendship.messages;
                let decryptedMessages = [];
                for (let i = 1; i < encryptedMessages.length; i++) {
                    let encryptedMessage = encryptedMessages[i];
                    let message = await decryptMessage(
                        hexToUint8Array(encryptedMessage.split("|")[1]),
                        hexToUint8Array(encryptedMessage.split("|")[2]),
                        getHexFromBigInt(sharedKey)
                    );
                    message =
                        encryptedMessage.split("|")[0] +
                        "|" +
                        message +
                        "|" +
                        encryptedMessage.split("|")[3];
                    decryptedMessages.push(message);
                }
                resolve(decryptedMessages);
            }
        );
    });
}
