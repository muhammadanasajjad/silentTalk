import React, { useEffect, useRef, useState } from "react";
import { useSpring, animated } from "react-spring";
import { useDrag } from "react-use-gesture";

const Message = ({
    username,
    otherUserData,
    index,
    from,
    actualMessage,
    time,
    reply,
    onReplyClick = () => {},
    style = {},
    onReply = () => {},
    id,
}) => {
    const [{ x, y, opacity }, set] = useSpring(() => ({
        x: 0,
        y: 0,
        opacity: 0,
        config: { tension: 500 },
    }));

    const bind = useDrag(
        ({ down, movement: [mx, my] }) => {
            const maxMove = 50;
            set({
                x: down && mx > 0 ? Math.min(mx, maxMove) : 0,
                y: 0,
                opacity: down ? mx / maxMove : 0,
            });
            if (mx >= maxMove) onReply(index);
        },
        {
            filterTaps: true,
            enabled: true,
            useTouch: true,
        }
    );

    return (
        <animated.div
            className={
                "message-container" + (from == username ? " me" : " other")
            }
            style={{ x, y }}
            id={id}
            {...bind()}
        >
            {reply != "" && (
                <div
                    className="reply-message"
                    onClick={() => {
                        onReplyClick();
                    }}
                >
                    <p>
                        <p
                            style={{
                                marginBottom: "10px",
                                color: "var(--main-color)",
                                fontWeight: "bold",
                            }}
                        >
                            {reply.split("|")[0] == username
                                ? "You"
                                : otherUserData.name}
                        </p>
                        {reply.split("|")[1]}
                    </p>
                    <div>
                        <div>{reply.split("|")[2]}</div>
                    </div>
                </div>
            )}
            <animated.div className="reply-icon" style={{ opacity }}>
                <ion-icon name="arrow-redo"></ion-icon>
            </animated.div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div className="message-text">{actualMessage}</div>
                <div className="message-time">{time}</div>
            </div>
        </animated.div>
    );
};

export default Message;
