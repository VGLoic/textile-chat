import React from "react";
import { PrivateKey } from "@textile/hub";
import useAsync from "./useAsync";

async function generateIdentity(): Promise<PrivateKey> {
    const identity = await PrivateKey.fromRandom()
    return identity;
}

function getIdentityFromCache(): PrivateKey | null {
    const cachedIdentityString = localStorage.getItem("@textile-app/identity");
    if (!cachedIdentityString) return null;
    return PrivateKey.fromString(cachedIdentityString);
}

function deriveInitialState(defaultState: any) {
    const identityFromCache = getIdentityFromCache();
    if (identityFromCache) {
        return {
            data: identityFromCache,
            error: null,
            status: "resolved"
        };
    }
    return defaultState;
}

async function generateAndCacheIdentity(): Promise<PrivateKey> {
    try {
        const newIdentity = await generateIdentity();
        localStorage.setItem("@textile-app/identity", newIdentity.toString());
        return newIdentity;
    } catch (err) {
        localStorage.removeItem("@textile-app/identity");
        throw err;
    }
}

export default function useIdentity() {
    const { run, data, status } = useAsync({ status: "pending" }, deriveInitialState);

    React.useEffect(() => {
        if (!data) {
            run(generateAndCacheIdentity());
        }
    }, [data, run]);


    return {
        identity: data as PrivateKey | null,
        status
    };
}