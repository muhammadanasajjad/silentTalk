import React, { useEffect, useState } from "react";
import {
    acceptFriendRequest,
    rejectFriendRequest,
    sendFriendRequest,
} from "../users/userManager";
import { useNavigate } from "react-router-dom";
import { getUserData } from "../indexedDB";
import { getElementFromRef } from "../firebase/databaseManager";
import "../css/AddFriend.css";

const AddFriend = () => {
    const [otherUserId, setOtherUserId] = useState("");
    const [thisUserId, setThisUserId] = useState();
    const [thisPrivateKey, setThisPrivateKey] = useState();
    const [friendRequests, setFriendRequests] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        getUserData().then((data) => {
            if (data.username != null) {
                setThisUserId(data.username);
                setThisPrivateKey(data.privateKey);

                getElementFromRef("friendRequests", (friendRequests, err) => {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    let thisFriendRequests = [];
                    for (let i = 0; i < friendRequests.length; i++) {
                        if (friendRequests[i].to == data.username) {
                            thisFriendRequests.push(friendRequests[i]);
                        }
                    }
                    setFriendRequests(thisFriendRequests);
                });
            } else {
                navigate("/");
            }
        });
    }, []);

    return (
        <div className="App">
            {thisUserId && (
                <>
                    <h1>Add Friend</h1>
                    <input
                        type="text"
                        placeholder="User ID"
                        onChange={(e) => {
                            setOtherUserId(e.target.value.toLowerCase());
                        }}
                    />
                    <button
                        onClick={() => {
                            sendFriendRequest(
                                thisUserId,
                                otherUserId,
                                thisPrivateKey
                            );
                        }}
                    >
                        Add
                    </button>
                </>
            )}
            <h1>Your Friend Requests</h1>
            {friendRequests.map((request) => {
                return (
                    <div className="friend-request">
                        <div className="friend-pfp"></div>@{request.from}
                        <div className="friend-request-buttons">
                            <ion-icon
                                onClick={() => {
                                    acceptFriendRequest(
                                        request.from,
                                        request.to,
                                        thisPrivateKey
                                    );
                                    let newFriendRequests =
                                        friendRequests.filter(
                                            (friendRequest) => {
                                                return (
                                                    friendRequest.from !=
                                                        request.from &&
                                                    friendRequest.to !=
                                                        request.to
                                                );
                                            }
                                        );
                                    setFriendRequests(newFriendRequests);
                                }}
                                name="checkmark"
                            ></ion-icon>
                            <ion-icon
                                onClick={() => {
                                    rejectFriendRequest(
                                        request.from,
                                        request.to
                                    );
                                    let newFriendRequests =
                                        friendRequests.filter(
                                            (friendRequest) => {
                                                return (
                                                    friendRequest.from !=
                                                        request.from &&
                                                    friendRequest.to !=
                                                        request.to
                                                );
                                            }
                                        );
                                    setFriendRequests(newFriendRequests);
                                }}
                                name="close-outline"
                            ></ion-icon>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default AddFriend;
