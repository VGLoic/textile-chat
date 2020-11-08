import React from "react";
// Types
import { Index } from "../hubClient";
// Components
import Message from "../Message";
// Styles
import './MessagesBox.css';

interface MessagesBoxProps {
    index: Index;
}
export default function MessagesBox({ index }: MessagesBoxProps) {
    const { data } = index;
    return (
        <div className="MessagesBox-container">
            <h1>Messages</h1>
            <div className="MessagesBox-messages-container">
                {data.length === 0
                    ? <div>No messages yet</div>
                    : data.map(messagePath => (
                        <Message path={messagePath} key={messagePath} />
                    ))
                }
            </div>
        </div>
    )
}