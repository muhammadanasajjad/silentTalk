import React, { useState } from "react";
import "../css/SignUp.css";
import {
    getHexFromBigInt,
    getRandomBigInt,
} from "../encryption/encryptionManager";

const SignUp = ({
    onSignIn = (id, key) => {},
    onSignUp = (name, id, key) => {},
}) => {
    const [privateKey, setPrivateKey] = useState(
        getHexFromBigInt(getRandomBigInt(256))
    );
    const [isSignIn, setIsSignIn] = useState(true);
    const [userId, setUserId] = useState("");
    const [userName, setUserName] = useState("");
    const [signUpConfirmOpened, setSignUpConfirmOpened] = useState(false);

    return (
        <div className="container">
            <div
                className="sign-up-confirm-container"
                style={{ display: signUpConfirmOpened ? "flex" : "none" }}
            >
                <div className="sign-up-confirm">
                    <h1>Confirm Sign Up</h1>
                    <p>
                        Copy the private key and keep it safe it is required for
                        sign in!!!
                    </p>
                    <div className="private-key-container">
                        <p>Private Key: </p>
                        {privateKey.substring(0, 15)}...
                        <ion-icon
                            onClick={() => {
                                navigator.clipboard.writeText(privateKey);
                                onSignUp(userName, userId, privateKey);
                            }}
                            name="copy"
                        ></ion-icon>
                    </div>
                </div>
            </div>
            {isSignIn ? (
                <>
                    <h1>Sign In</h1>
                    <input
                        onChange={(e) =>
                            setUserId(e.target.value.toLowerCase())
                        }
                        type="text"
                        placeholder="User ID"
                    />
                    <input
                        type="text"
                        placeholder="Private Key"
                        onChange={(e) =>
                            setPrivateKey(e.target.value.toLowerCase())
                        }
                    />
                    <button onClick={() => onSignIn(userId, privateKey)}>
                        Sign In
                    </button>
                    <h4 onClick={() => setIsSignIn(false)}>
                        Switch to Sign Up
                    </h4>
                </>
            ) : (
                <>
                    <h1>Sign Up</h1>
                    <input
                        onChange={(e) =>
                            setUserId(e.target.value.toLowerCase())
                        }
                        type="text"
                        placeholder="User ID"
                    />
                    <input
                        onChange={(e) => setUserName(e.target.value)}
                        type="text"
                        placeholder="User Name"
                    />
                    <div className="private-key-container">
                        <p>Private Key: </p>
                        {privateKey.substring(0, 15)}...
                        <ion-icon
                            onClick={() =>
                                setPrivateKey(
                                    getHexFromBigInt(getRandomBigInt(256))
                                )
                            }
                            name="refresh"
                        ></ion-icon>
                    </div>
                    <button
                        onClick={() => {
                            setSignUpConfirmOpened(true);
                        }}
                    >
                        Sign Up
                    </button>
                    <h4 onClick={() => setIsSignIn(true)}>Switch to Sign In</h4>
                </>
            )}
        </div>
    );
};

export default SignUp;
