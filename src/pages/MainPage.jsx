import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getUserData } from "../indexedDB";
import { getElementFromRef } from "../firebase/databaseManager";

const MainPage = () => {
    const [savedUserData, setSavedUserData] = useState();
    const [userInfo, setUserInfo] = useState();

    useEffect(() => {
        getUserData().then((data) => {
            if (data.username) {
                setSavedUserData(data);
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
                    setUserInfo(user);
                    for (let i = 1; i < user.friends.length; i++) {
                        getElementFromRef(
                            "users/" + user.friends[i] + "/name",
                            (name, err) => {
                                if (err) {
                                    console.log(err);
                                    return;
                                }
                                user.friends[i] = {
                                    id: user.friends[i],
                                    name: name,
                                };
                                console.log(user);
                                setUserInfo(user);
                            }
                        );
                    }
                }
            );
        }
    }, [savedUserData]);

    useEffect(() => {
        console.log(userInfo);
    }, [userInfo]);

    return <div>{JSON.stringify(userInfo)}</div>;
};

export default MainPage;
