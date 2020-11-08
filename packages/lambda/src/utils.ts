import crypto from "crypto";

export function generateChallenge(publicKey: string): string {
    const secret = process.env.API_CHALLENGE_SECRET;

    const hash = crypto.createHash("sha256");
    hash.update(`${publicKey}-${secret}`);
    return hash.digest("hex");
}