import React from "react";
import { PrivateKey } from "@textile/hub";
// Services
import MessageBucketClient, { Index } from "../hubClient";
// Hooks
import useAsync from "../useAsync";
// Components
import MessagesBox from "../MessagesBox";
import MessageInput from "../MessageInput";
// Styles
import './HubViewer.css';

async function setup(identity: PrivateKey): Promise<Index> {
    const index = await MessageBucketClient.init(identity);
    return index;
}

interface UseHubSynchronisationArgs {
    identity: PrivateKey;
}
function useHubSynchronisation({ identity }: UseHubSynchronisationArgs) {
    const { run, data, status, setData } = useAsync({ status: "pending" });

    React.useEffect(() => {
        run(setup(identity));
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

interface HubViewerProps {
    identity: PrivateKey
}
export default function HubViewer({ identity }: HubViewerProps) {

    const { index, status, addPathToIndex } = useHubSynchronisation({ identity });

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