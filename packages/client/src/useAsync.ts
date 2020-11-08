import React from "react";
import { useSafeDispatch } from "./useSafeDispatch";

interface State {
    status: "idle" | "pending" | "resolved" | "rejected",
    data: any | null,
    error: Error | null
}
interface Action {
    type: "requestStarted" | "requestResolved" | "requestRejected" | "reset" | "dataSet";
    payload?: any;
}

function stateReducer(state: State, action: Action): State {
    switch (action.type) {
        case "requestStarted":
            return {
                data: null,
                error: null,
                status: "pending"
            };
        case "requestResolved":
            return {
                data: action.payload,
                error: null,
                status: "resolved"
            };
        case "requestRejected":
            return {
                data: null,
                error: action.payload,
                status: "rejected"
            };
        case "reset":
            return {
                data: null,
                error: null,
                status: "idle"
            };
        case "dataSet":
            return {
                ...state,
                data: action.payload(state.data),
            };
        default:
            throw new Error("Unknown action type");
    }
}

const defaultState: State = {
    data: null,
    error: null,
    status: "idle"
};

export default function useAsync(
    initialState: Partial<State> = defaultState,
    deriveInitialState: (...args: any[]) => State = initialState => initialState
) {
    const [state, unsafeDispatch] = React.useReducer(stateReducer, { ...defaultState, ...initialState, }, deriveInitialState);
    const dispatch = useSafeDispatch(unsafeDispatch);

    const run = React.useCallback((promise: Promise<any>): any => {
        if (!promise) return;
        dispatch({ type: "requestStarted" });
        return promise.then(
            r => {
                dispatch({ type: "requestResolved", payload: r });
                return r;
            },
            e => {
                console.error("Error: ", e)
                dispatch({ type: "requestRejected", payload: e });
            }
        );
    }, [dispatch]);

    const setData = React.useCallback(
        (setter: (currentData: any) => any) => {
            dispatch({ type: "dataSet", payload: setter });
    }, [dispatch]);

    return {
        ...state,
        setData,
        run
    };
}