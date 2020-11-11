import React from "react";
import { PrivateKey } from "@textile/hub";
import ethers from "ethers";
import { useMetamask } from "./MetamaskContext";
import useAsync from "./useAsync";

const secret = "secret that should be chosen by user - will be later on";


async function generateIdentity(ethereum: any, selectedAddress: string) {
    const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();

        const message = `${selectedAddress}-${secret}`;
        const signedMessage = await signer.signMessage(message);
        
        const hash = ethers.utils.id(signedMessage);

        const array = hash.replace("0x", "").match(/.{2}/g)?.map(
            hexWithoutPrefix => ethers.BigNumber.from("0x" + hexWithoutPrefix).toNumber()
        );

        if (!Array.isArray(array) || array.length !== 32 ) {
            throw new Error("Generated hash is not valid");
        }

        return PrivateKey.fromRawEd25519Seed(Uint8Array.from(array));
}

export function useMetamaskIdentity() {
    const { run, data } = useAsync({ status: "pending" });
    const { ethereum, selectedAddress } = useMetamask();

    React.useEffect(() => {
        run(generateIdentity(ethereum, selectedAddress as string));
    }, [run, ethereum, selectedAddress])

    return { data };
}