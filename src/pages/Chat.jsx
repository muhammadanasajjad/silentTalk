import { useEffect, useRef, useState } from "react";
import {
    getHexFromBigInt,
    getBigIntFromHex,
    encryptMessage,
    decryptMessage,
    getRandomBigInt,
    getSharedKey,
    getPublicKey,
} from "../encryption/encryptionManager";
import { database, storage } from "../firebase";
import {
    acceptFriendRequest,
    createFriendship,
    getSharedKeyFromFriendship,
    getUser,
    loadMessages,
    onNewMessage,
    sendFriendRequest,
    sendMessage,
} from "../users/userManager";
import { getElementFromRef } from "../firebase/databaseManager";
import { deleteUserData, getUserData, saveUserData } from "../indexedDB";
import { off } from "firebase/database";
import emojiList from "../emoji-list.json";
import { ref, getDownloadURL } from "firebase/storage";
import { useSwipeable } from "react-swipeable";
import Message from "../components/Message";
import { useNavigate, useParams } from "react-router-dom";

import "../css/Chat.css";

function Chat({}) {
    const bits = 256;
    const urlParams = useParams();
    const [username, setUsername] = useState();
    const [thisPrivateKey, setThisPrivateKey] = useState();
    const [otherUsername, setOtherUsername] = useState(urlParams.username);
    const [sharedKey, setSharedKey] = useState();
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState("");
    const lastMessagesLength = useRef(0);
    const [otherUserData, setOtherUserData] = useState();
    const [replyingMessageIndex, setReplyingMessageIndex] = useState(-1);
    const tempThisPrivateKey = getBigIntFromHex(
        "dab3449b4f51ec07018e83be22dac11ee84539c64deb71ebc202635236660b4d"
    );
    const otherPrivateKey = getBigIntFromHex(
        "b6639f6c45688d95b2cd1ad77c2c88943e12911a8f90927b6654e93fce412b7d"
    );
    //  "5e07f3f2ef108a73abe9a76cd0fe3c0a236a638e4ccbe8be2cd705b5e25b3421"

    useEffect(() => {
        getUserData().then((data) => {
            if (data.username && data.privateKey) {
                setUsername(data.username);
                setThisPrivateKey(data.privateKey);
                // setOtherUsername(inputOtherUser);
                getUser(urlParams.username).then((val) => {
                    setOtherUserData(val);
                });
                getSharedKeyFromFriendship(
                    data.username,

                    urlParams.username,
                    getBigIntFromHex(data.privateKey)
                ).then((val) => {
                    handleRefresh(
                        data.username,

                        urlParams.username,
                        val
                    );
                    setSharedKey(val);
                });
            } else {
                navigate("/");
            }
        });
    }, []);

    useEffect(() => {
        if (otherUsername) {
            getDownloadURL(ref(storage, `userPFPs/${otherUsername}.png`))
                .then((url) => {
                    document.getElementsByClassName(
                        "message-pfp"
                    )[0].style.backgroundImage = `url(${url})`;
                    document.getElementsByClassName(
                        "message-pfp"
                    )[1].style.backgroundImage = `url(${url})`;
                })
                .catch(() => {});
        }
    }, [otherUsername]);

    useEffect(() => {
        let messagesContainer = document.getElementsByClassName(
            "messages-large-container"
        )[0];
        if (messagesContainer) {
            messagesContainer.scrollTo(0, messagesContainer.scrollHeight);
        }
    }, [replyingMessageIndex]);

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

    window.addEventListener("close", function (event) {
        // Set a message to trigger the confirmation dialog
        off();
        event.returnValue = ""; // This triggers the confirmation dialog
        return "";
    });

    useEffect(() => {
        if (username && otherUsername && sharedKey)
            onNewMessage(username, otherUsername, sharedKey, setMessages);
    }, [sharedKey]);

    useEffect(() => {
        // console.log("new message", messages[messages.length - 1]);
        if (username && otherUsername && sharedKey) {
            let messagesContainer = document.getElementsByClassName(
                "messages-large-container"
            )[0];
            messagesContainer.scrollTo(0, messagesContainer.scrollHeight);
        }
        setTimeout(() => {
            let messageContainers =
                document.getElementsByClassName("message-container");

            if (messageContainers.length > 0) {
                for (
                    let i = Math.max(0, lastMessagesLength.current);
                    i < messageContainers.length;
                    i++
                ) {
                    messageContainers[i].style.opacity = 1;
                    messageContainers[i].style.transform =
                        "translateY(0px) scale(1)";
                }
                lastMessagesLength.current = messageContainers.length;
            }
        }, 0);
    }, [messages]);

    const handleSend = async () => {
        let tempMessages = [...messages];
        tempMessages.push(
            `${username}|${document.getElementById("input-message").value}|${(
                "" + new Date().getHours()
            ).padStart(2, "0")}:${("" + new Date().getMinutes()).padStart(
                2,
                "0"
            )}|${replyingMessageIndex}`
        );
        let message = document.getElementById("input-message").value;
        document.getElementById("input-message").value = "";
        setReplyingMessageIndex(-1);
        setMessages(tempMessages);
        sendMessage(
            username,
            otherUsername,
            message,
            replyingMessageIndex,
            sharedKey
        ).then(() => {
            document.getElementById("input-message").value = "";
            handleRefresh(username, otherUsername, sharedKey);
        });
    };

    const openEmojiMenu = () => {
        document.getElementById("emojis-list-container").style.display = "flex";
    };

    // console.log(getHexFromBigInt(getRandomBigInt(bits)));
    // console.log(
    //     getElementFromRef("/", (val) => {
    //         console.log(JSON.stringify(val, " ", 2));
    //     })
    // );
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
    const navigate = useNavigate();
    return (
        <div className="App">
            <div id="emojis-list-container">
                <div className="emojis-list">
                    {Object.entries(emojiList).map(([category, emojis]) => (
                        <div key={category} style={{ marginBottom: "20px" }}>
                            <h2>{category}</h2>
                            <ul className="emojis-category">
                                {emojis.map((emoji) => (
                                    <li
                                        key={emoji.no}
                                        onClick={() => {
                                            document.getElementById(
                                                "input-message"
                                            ).value += emoji.emoji;
                                            document.getElementById(
                                                "emojis-list-container"
                                            ).style.display = "none";
                                        }}
                                    >
                                        {emoji.emoji}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
            {username ? (
                <div className="messages-large-container">
                    <div className="messages-container">
                        <div className="message-header">
                            <div className="message-pfp" />
                            <p>
                                {otherUserData
                                    ? otherUserData.name
                                    : otherUsername}
                            </p>
                        </div>
                        <div className="message-filler-container">
                            <div className="message-pfp" />
                            <div className="message-name-filler">
                                {otherUserData
                                    ? otherUserData.name
                                    : otherUsername}
                            </div>
                            <div className="message-actual-name-filler">
                                @{otherUsername}
                            </div>
                            <div className="message-scroll-indicator">
                                {messages.length > 0 ? (
                                    <ion-icon name="arrow-down"></ion-icon>
                                ) : (
                                    <ion-icon name="chatbubbles-outline"></ion-icon>
                                )}
                                <div
                                    style={
                                        sharedKey ? {} : { fontSize: "1rem" }
                                    }
                                >
                                    {sharedKey
                                        ? messages.length > 0
                                            ? "Scroll Down For More"
                                            : "Say Hi"
                                        : `Waiting for @${otherUsername} to create encrypted channel`}
                                </div>
                            </div>
                        </div>
                        {messages.map((message, index) => {
                            let from = message.split("|")[0];
                            let actualMessage = message.split("|")[1];
                            let time = message.split("|")[2];
                            let reply = parseInt(message.split("|")[3]);
                            return (
                                <Message
                                    id={"message-" + index}
                                    reply={reply > -1 ? messages[reply] : ""}
                                    otherUserData={otherUserData}
                                    username={username}
                                    key={index}
                                    index={index}
                                    from={from}
                                    actualMessage={actualMessage}
                                    time={time}
                                    onReply={(i) => {
                                        setReplyingMessageIndex(i);
                                        console.log(i);
                                    }}
                                    onReplyClick={(i) => {
                                        let message = document.getElementById(
                                            "message-" + reply
                                        );
                                        let messagesContainer =
                                            document.getElementsByClassName(
                                                "messages-large-container"
                                            )[0];

                                        message.scrollIntoView({
                                            block: "center",
                                        });
                                        function onScreen() {
                                            var el = document.getElementById(
                                                "message-" + reply
                                            );
                                            return (
                                                el.offsetTop >
                                                messagesContainer.scrollTop
                                            );
                                        }
                                        const animate = () => {
                                            setTimeout(() => {
                                                if (!onScreen()) {
                                                    return animate();
                                                }
                                                message.animate(
                                                    [
                                                        {
                                                            transform:
                                                                "scale(1)",
                                                            filter: "brightness(100%)",
                                                        },
                                                        {
                                                            transform:
                                                                "scale(1.1)",
                                                            filter: "brightness(200%)",
                                                        },
                                                        {
                                                            transform:
                                                                "scale(1)",
                                                            filter: "brightness(100%)",
                                                        },
                                                    ],
                                                    {
                                                        duration: 750,
                                                        easing: "ease-in-out",
                                                    }
                                                );
                                            }, 100);
                                        };
                                        animate();
                                    }}
                                />
                            );
                        })}
                        <div className="message-input-large-container">
                            <div className="message-input-container">
                                {(() => {
                                    const emojiRegex =
                                        /(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)/gu;

                                    const parts = inputText.replace(
                                        emojiRegex,
                                        (match) => {
                                            return `<span class="emoji">${match}</span>`;
                                        }
                                    );
                                    return (
                                        <div className="message-actual-input-container">
                                            {replyingMessageIndex > -1 && (
                                                <div className="reply-message">
                                                    <p>
                                                        <p
                                                            style={{
                                                                marginBottom:
                                                                    "10px",
                                                                color: "var(--main-color)",
                                                                fontWeight:
                                                                    "bold",
                                                            }}
                                                        >
                                                            {messages[
                                                                replyingMessageIndex
                                                            ].split("|")[0] ==
                                                            username
                                                                ? "You"
                                                                : otherUserData.name}
                                                        </p>
                                                        {
                                                            messages[
                                                                replyingMessageIndex
                                                            ].split("|")[1]
                                                        }
                                                    </p>
                                                    <div>
                                                        {
                                                            messages[
                                                                replyingMessageIndex
                                                            ].split("|")[2]
                                                        }
                                                        <ion-icon
                                                            name="close"
                                                            onClick={() =>
                                                                setReplyingMessageIndex(
                                                                    -1
                                                                )
                                                            }
                                                        ></ion-icon>
                                                    </div>
                                                </div>
                                            )}
                                            <input
                                                // value={parts}
                                                placeholder="Enter a message"
                                                type="text"
                                                id="input-message"
                                                onChange={(e) =>
                                                    setInputText(e.target.value)
                                                }
                                                onKeyDown={(e) => {
                                                    if (e.key == "Enter") {
                                                        handleSend();
                                                    }
                                                }}
                                            />
                                        </div>
                                    );
                                })()}
                                <div
                                    onClick={() => {
                                        openEmojiMenu();
                                    }}
                                    onMouseEnter={(e) => {
                                        if (
                                            document.getElementsByClassName(
                                                "emoji-button"
                                            )[0].firstChild.tagName !=
                                            "ION-ICON"
                                        )
                                            return;
                                        let button =
                                            document.getElementsByClassName(
                                                "emoji-button"
                                            )[0];
                                        button.style.color = "#debf2c";
                                        setTimeout(() => {
                                            button.innerHTML = `<span class="emoji">${getRandomSmiley()}</div>`;
                                        }, 200);
                                    }}
                                    onMouseLeave={(e) => {
                                        let button =
                                            document.getElementsByClassName(
                                                "emoji-button"
                                            )[0];
                                        button.innerHTML = `<ion-icon name="happy"></ion-icon>`;
                                        button.style.color =
                                            "var(--text-grey-color)";
                                        setTimeout(() => {
                                            button =
                                                document.getElementsByClassName(
                                                    "emoji-button"
                                                )[0];
                                            button.innerHTML = `<ion-icon name="happy"></ion-icon>`;
                                            button.style.color =
                                                "var(--text-grey-color)";
                                        }, 200);
                                    }}
                                    className="emoji-button button"
                                >
                                    <ion-icon name="happy"></ion-icon>
                                </div>
                                <div
                                    onClick={() => {
                                        handleSend();
                                    }}
                                    onMouseOver={(e) => {
                                        document
                                            .getElementsByClassName(
                                                "send-button"
                                            )[0]
                                            .classList.add(
                                                "send-button-animation"
                                            );
                                    }}
                                    onMouseOut={(e) => {
                                        let button =
                                            document.getElementsByClassName(
                                                "send-button"
                                            )[0];
                                        if (
                                            button.getAnimations().length == 0
                                        ) {
                                            document
                                                .getElementsByClassName(
                                                    "send-button"
                                                )[0]
                                                .classList.remove(
                                                    "send-button-animation"
                                                );
                                        }
                                    }}
                                    className="send-button button"
                                >
                                    <ion-icon name="send"></ion-icon>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    <div>Loading...</div>
                </>
            )}
        </div>
    );
}

function getRandomSmiley() {
    let random = Math.floor(Math.random() * 76) + 1;
    return emojiList["Smileys & People"][random].emoji;
}

export default Chat;

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
