import React from "react";
import { PrivateKey } from "@textile/hub";
// Services
import MessageBucketClient, { Index } from "../hubClient";
// Hooks
import useAsync from "../useAsync";
import { useMetamaskIdentity } from "../useMetamasIdentity";
// Components
import MessagesBox from "../MessagesBox";
import MessageInput from "../MessageInput";
// Styles
import './HubViewer.css';

async function setup(identity: PrivateKey): Promise<Index> {
    const index = await MessageBucketClient.init(identity);
    return index;
}

function useHubSynchronisation() {
    const { data: identity } = useMetamaskIdentity();
    const { run, data, status, setData } = useAsync({ status: "pending" });

    React.useEffect(() => {
        if (identity) {
            run(setup(identity));
        }
    }, [run, identity]);

    const addPathToIndex = (path: string) => {
        setData(currentIndex => {
            const updatedIndex: Index = {
                ...currentIndex,
                data: [...currentIndex.data, path]
            };
            return updatedIndex;
        });
    };

    return {
        index: data as Index | null,
        status,
        addPathToIndex
    }
}

export default function HubViewer() {

    const { index, status, addPathToIndex } = useHubSynchronisation();

    if (status === "pending") {
        return (
            <div>
                Synchronisation ongoing...
            </div>
        );
    }

    if (status === "rejected") {
        return (
            <div>
                Oh no, it's broken :(
            </div>
        );
    }

    if (status === "resolved") {
        return (
            <div className="HubViewer-container">
                <MessageInput addPathToIndex={addPathToIndex} />
                <MessagesBox index={index as Index} />
            </div>
        );
    }

    throw new Error("It should be unreachable :(")

}