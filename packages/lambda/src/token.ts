import { Client, PublicKey, PrivateKey, createAPISig } from "@textile/hub";
import { generateChallenge } from "./utils";
require('dotenv').config()

const challenge = Buffer.from("MY_CHALLENGE");

exports.handler = async function(event) {
    // Fishy
    const identity = PrivateKey.fromString(process.env.API_PRIVATE_KEY)

    const body = JSON.parse(event.body);
    const { publicKey, signature } = body;

    const pk = new PublicKey(new Uint8Array(Object.values(publicKey)))

    const challenge = Buffer.from(generateChallenge(pk.toString()))

    const client = await Client.withKeyInfo({
        key: process.env.USER_API_KEY,
        secret: process.env.USER_API_SECRET
    });

    const signatureIsVerified = await pk.verify(
        bufferToUint8Array(challenge),
        bufferToUint8Array(Buffer.from(signature))
    );

    if (!signatureIsVerified) {
        return {
            statusCode: 403,
            body: JSON.stringify({ message: "Invalid signature" })
        }
    }

    const token = await client.getToken(identity);

    const expiration = new Date(Date.now() + 1000 * 300);
    const apiSig = await createAPISig(process.env.USER_API_SECRET, expiration);

    return {
        statusCode: 200,
        body: JSON.stringify({
            ...apiSig,
            token,
            key: process.env.USER_API_KEY
        })
    }
}


function bufferToUint8Array(buf: Buffer): Uint8Array {
    const result = new Uint8Array(buf.length);
    for (let i = 0; i < buf.length; i++) {
        result[i] = buf[i];
    }
    return result;
}