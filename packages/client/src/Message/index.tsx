import React from "react";
// Services
import MessageBucketClient from "../hubClient";
// Hooks
import useAsync from "../useAsync";
// Styles
import "./Message.css";

interface IMessage {
    author: string;
    date: string;
    data: string;
}

function pullMessage(path: string) {
    return MessageBucketClient.pullObject(path);
}

function useMessage(path: string) {
    const { run, data, status } = useAsync({ status: "pending" });

    React.useEffect(() => {
        run(pullMessage(path));
    }, [path, run]);

    return {
        status,
        message: data as IMessage | null
    }
}

interface MessageProps {
    message: IMessage
};
function Message({ message }: MessageProps) {
    const date = new Date(message.date);
    const dateString = `${date.getHours()}:${date.getSeconds()} - ${date.getDate()}/${date.getMonth()}`
    return (
        <div className="Message-container">
            <div>
                {dateString}
            </div>
            <div>{message.data}</div>
        </div>
    )
}

interface MessageWrapperProps {
    path: string;
}
export default function MessageWrapper({ path }: MessageWrapperProps) {

    const { status, message } = useMessage(path);

    return (
        <div className="MessageWrapper-container">
            {status === "pending"
                ? "Message loading..."
                : status === "rejected"
                ? "Oh no, it's broken :("
                : <Message message={message as IMessage} />
            }
        </div>
    )
}