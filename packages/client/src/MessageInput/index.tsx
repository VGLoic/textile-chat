import React from "react";
import './MessageInput.css';
// Services
import MessageBucketClient from "../hubClient";
// Hooks
import useAsync from "../useAsync";

async function submitMessage(message: string) {
    if (!message) return;
    const messagePath = `message-${Math.floor(Math.random() * 10000)}`;
    await MessageBucketClient.pushMessage(message, messagePath);
    return messagePath;
}

interface MessageInputProps {
    addPathToIndex: (path: string) => void
}
export default function MessageInput({ addPathToIndex }: MessageInputProps) {
    const { run, status } = useAsync();

    async function handleSubmit(event: any) {
        event.preventDefault();
        const message = event.target.elements["message"].value;
        if (!message) return;
        const messagePath = await run(submitMessage(message));
        addPathToIndex(messagePath);
        event.target.reset()
    }

    return (
        <div className="MessageInput-container">
            <h1>Add a message</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="message">Message</label>
                </div>
                <div>
                    <input name="message" />
                </div>
                <input type="submit" value="Submit" disabled={status === "pending"} />
                <div>
                    {status === "pending" && "Loading..."}
                </div>
            </form>
        </div>
    )
}