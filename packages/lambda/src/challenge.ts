import { Client } from "@textile/hub";
import { generateChallenge } from "./utils";
require('dotenv').config()

exports.handler = async function(event) {
    const publicKey: string = event.queryStringParameters.public_key;

    const challenge = Buffer.from(generateChallenge(publicKey));
    return {
        statusCode: 200,
        body: JSON.stringify({ challenge: challenge })
    }
}