import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Settings.css";
import { getUserData } from "../indexedDB";
import {
    getElementFromRef,
    setElementInRef,
} from "../firebase/databaseManager";
import { getDownloadURL, ref } from "firebase/storage";
import { storage } from "../firebase";
import ImageUpload from "../components/ImageUpload";

const Settings = () => {
    const navigate = useNavigate();
    const [savedUserData, setSavedUserData] = useState();
    const [userInfo, setUserInfo] = useState();
    const [usernameOpened, setUsernameOpened] = useState(false);
    const [userPFPopened, setUserPFPopened] = useState(false);

    useEffect(() => {
        getUserData().then((data) => {
            if (data.username != null) {
                setSavedUserData(data);
                getElementFromRef("users/" + data.username, (user, err) => {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    setUserInfo(user);
                });
                getDownloadURL(
                    ref(storage, "userPFPs/" + data.username + ".png")
                ).then((url) => {
                    document.getElementsByClassName(
                        "your-pfp"
                    )[0].style.backgroundImage = `url(${url})`;
                });
            } else {
                setSavedUserData("Not found");
            }
        });
    }, []);

    return (
        <div className="App">
            {userPFPopened && (
                <div className="upload-image-container">
                    <ion-icon
                        name="close"
                        onClick={() => {
                            setUserPFPopened(false);
                            console.log("close");
                        }}
                    ></ion-icon>
                    {savedUserData && (
                        <ImageUpload user={savedUserData.username} />
                    )}
                </div>
            )}
            <div className="your-filler-container">
                <div
                    className="your-pfp"
                    onClick={() => {
                        setUserPFPopened(true);
                    }}
                >
                    <ion-icon name="create"></ion-icon>
                </div>
                <div className="your-name-filler">
                    {usernameOpened ? (
                        <>
                            <input
                                id="user-name"
                                type="text"
                                defaultValue={
                                    userInfo
                                        ? userInfo.name
                                        : savedUserData
                                        ? savedUserData.username
                                        : ""
                                }
                            />
                            <ion-icon
                                onClick={() => {
                                    setElementInRef(
                                        "users/" +
                                            savedUserData.username +
                                            "/name",
                                        document.getElementById("user-name")
                                            .value
                                    );
                                    setUserInfo({
                                        ...userInfo,
                                        name: document.getElementById(
                                            "user-name"
                                        ).value,
                                    });
                                    setUsernameOpened(false);
                                }}
                                name="arrow-forward"
                            ></ion-icon>
                        </>
                    ) : (
                        <>
                            <div>
                                {userInfo
                                    ? userInfo.name
                                    : savedUserData
                                    ? savedUserData.username
                                    : ""}
                            </div>
                            <ion-icon
                                onClick={() => {
                                    setUsernameOpened(true);
                                }}
                                name="create"
                            ></ion-icon>
                        </>
                    )}
                </div>
                <div className="your-actual-name-filler">
                    @{savedUserData ? savedUserData.username : ""}
                </div>
                <div className="your-scroll-indicator">
                    <ion-icon name="key"></ion-icon>
                    {savedUserData
                        ? savedUserData.privateKey.substring(0, 15)
                        : ""}
                    ...
                    <ion-icon
                        name="copy-outline"
                        onClick={() => {
                            navigator.clipboard.writeText(
                                savedUserData.privateKey
                            );
                        }}
                    ></ion-icon>
                    {/* {messages.length > 0 ? (
                        <ion-icon name="arrow-down"></ion-icon>
                    ) : (
                        <ion-icon name="chatbubbles-outline"></ion-icon>
                    )}
                    <div style={sharedKey ? {} : { fontSize: "1rem" }}>
                        {sharedKey
                            ? messages.length > 0
                                ? "Scroll Down For More"
                                : "Say Hi"
                            : `Waiting for @${otherUsername} to create encrypted channel`}
                    </div> */}
                </div>
            </div>
        </div>
    );
};

export default Settings;
