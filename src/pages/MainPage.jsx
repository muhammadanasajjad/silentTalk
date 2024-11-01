import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { deleteUserData, getUserData, saveUserData } from "../indexedDB";
import {
    getElementFromRef,
    setElementInRef,
} from "../firebase/databaseManager";
import { getDownloadURL, ref } from "firebase/storage";
import { storage } from "../firebase";

import "../css/MainPage.css";
import SignUp from "../components/SignUp";

const MainPage = () => {
    const [savedUserData, setSavedUserData] = useState();
    const [userInfo, setUserInfo] = useState();
    const [refresh, setRefresh] = useState(true);

    useEffect(() => {
        getUserData().then((data) => {
            if (data.username != null) {
                setSavedUserData(data);
                getDownloadURL(
                    ref(storage, `userPFPs/${data.username}.png`)
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

    useEffect(() => {
        if (savedUserData != "Not found" && savedUserData != undefined) {
            getElementFromRef(
                "users/" + savedUserData.username,
                (user, err) => {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    for (let i = 1; i < user.friends.length; i++) {
                        user.friends[i] = { id: user.friends[i] };
                    }
                    setUserInfo(user);
                    for (let i = 1; i < user.friends.length; i++) {
                        getElementFromRef(
                            "users/" + user.friends[i].id + "/name",
                            (otherName, err) => {
                                if (err) {
                                    console.log(err);
                                    return;
                                }
                                user.friends[i].name = otherName;
                                setUserInfo(user);
                                setRefresh(!refresh);
                            }
                        );

                        getDownloadURL(
                            ref(storage, `userPFPs/${user.friends[i].id}.png`)
                        )
                            .then((url) => {
                                user.friends[i].pfp = url;
                                document.getElementById(
                                    user.friends[i].id + "UserPFP"
                                ).style.backgroundImage = `url(${url})`;
                                setUserInfo(user);
                                setRefresh(!refresh);
                            })
                            .catch(() => {});
                    }
                }
            );
        }
    }, [savedUserData]);

    useEffect(() => {
        // console.log(userInfo);
    }, [userInfo]);

    const navigate = useNavigate();

    return (
        <div className="App">
            {savedUserData != "Not found" && (
                <>
                    <div className="header-container">
                        <div className="header-left">
                            <div className="logo-img"></div>
                            <div>SilentTalk</div>
                        </div>
                        <div className="header-right">
                            <div onClick={() => navigate("/addFriend")}>
                                <ion-icon name="person-add"></ion-icon>
                            </div>
                            <div
                                className="sign-out"
                                onClick={() => {
                                    deleteUserData();
                                    setSavedUserData("Not found");
                                    setUserInfo({});
                                }}
                            >
                                Sign out
                            </div>
                            <div
                                onClick={() => navigate("/settings")}
                                className="your-pfp"
                            ></div>
                        </div>
                    </div>
                    {userInfo &&
                        userInfo.friends &&
                        userInfo.friends.map((user, i) => {
                            if (i > 0) {
                                return (
                                    <Link
                                        to={
                                            "/chat/" +
                                            (user.id ? user.id : user)
                                        }
                                    >
                                        <div className="friend-container">
                                            <div
                                                id={
                                                    (user.id ? user.id : user) +
                                                    "UserPFP"
                                                }
                                                className="friend-pfp"
                                                // style={{
                                                //     width: "50px",
                                                //     height: "50px",
                                                //     backgroundImage: `url("../img/pfp-default.png")`,
                                                // }}
                                            ></div>
                                            {user.name != null
                                                ? user.name
                                                : "@" + user.id}
                                        </div>
                                    </Link>
                                );
                            }
                        })}
                </>
            )}
            {savedUserData == "Not found" && (
                <SignUp
                    onSignUp={(name, id, key) => {
                        setElementInRef("users/" + id, {
                            friends: ["no one"],
                            name: name,
                        });
                        saveUserData(key, id);
                        setSavedUserData({ username: id, privateKey: key });
                    }}
                    onSignIn={(id, key) => {
                        saveUserData(key, id);
                        setSavedUserData({ username: id, privateKey: key });
                    }}
                />
            )}
        </div>
    );
};

export default MainPage;
