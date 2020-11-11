import React from "react";
import { useSafeDispatch } from "../useSafeDispatch";

type WindowInstanceWithEthereum = Window & typeof globalThis & { ethereum?: any };

interface MetamaskState {
    selectedAddress: string | null;
    status: "unavailable" | "available" | "unlocked" | "enabled" | "loading";
}

interface Action {
    type: "enabled" | "reset" | "loading" | "accountsChanged";
    payload?: string | string[];
}

interface IMetamaskContext extends MetamaskState {
    dispatch: React.Dispatch<Action>;
    enable: () => Promise<void>;
    ethereum: any;
}

const MetamaskContext = React.createContext<IMetamaskContext | undefined>(undefined);

const defaultMetamaskState: MetamaskState = {
    status: "unavailable",
    selectedAddress: null
};

function deriveCurrentState(defaultState = defaultMetamaskState): MetamaskState {
    const ethereum = (window as WindowInstanceWithEthereum).ethereum;
    if (!ethereum || !ethereum.isMetaMask) return defaultState;

    const isUnlocked = ethereum._state.isUnlocked;
    
    if (!isUnlocked) {
        return {
            status: "available",
            selectedAddress: null
        };
    }

    const selectedAddress: string | null = ethereum.selectedAddress;

    if (!selectedAddress) {
        return {
            status: "unlocked",
            selectedAddress
        }
    }

    return {
        status: "enabled",
        selectedAddress
    };
}

function reducer(state: MetamaskState, action: Action): MetamaskState {
    switch (action.type) {
        case "enabled":
            return {
                selectedAddress: action.payload as string,
                status: "enabled"
            };
        case "loading":
            return {
                status: "loading",
                selectedAddress: null
            };
        case "accountsChanged":
            if (state.status === "loading") return state;
            const newState = deriveCurrentState();
            return newState;
        case "reset":
            return defaultMetamaskState;
        default:
            throw new Error("Unreachable case in MetamaskProvider reducer");
    }
}

export function MetamaskProvider(props: any) {
    const [state, unsafeDispatch] = React.useReducer(reducer, defaultMetamaskState, deriveCurrentState);
    const dispatch = useSafeDispatch(unsafeDispatch);

    const enable = async () => {
        const ethereum = (window as WindowInstanceWithEthereum).ethereum;
        if (!ethereum || !ethereum.isMetaMask) dispatch({ type: "reset" });
        dispatch({ type: "loading" });
        const [address] = await ethereum.enable();
        dispatch({ type: "enabled", payload: address})
    }

    React.useEffect(() => {
        const onAccountsChanged = (accounts: string[]) => dispatch({ type: "accountsChanged", payload: accounts });
        const ethereum = (window as WindowInstanceWithEthereum).ethereum;
        if (ethereum) {
            ethereum?.on("accountsChanged", onAccountsChanged)
        }
        return () => {
            ethereum?.removeListener("accountsChanged", onAccountsChanged);
        }
    }, [dispatch]);

    console.log("MetamaskContext: ", state);

    const value = {
        ...state,
        dispatch,
        enable,
        ethereum: (window as WindowInstanceWithEthereum).ethereum
    };

    return <MetamaskContext.Provider value={value} {...props} />
}


export function useMetamask() {
    const context = React.useContext(MetamaskContext);

    if (!context) {
        throw new Error("useMetamask should be used within a MetamaskProvider");
    }

    return context;
}