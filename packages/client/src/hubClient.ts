import { Buckets, Identity, PrivateKey, UserAuth } from "@textile/hub";

const messageBucketName = "io.textile.dropzone";

export interface Index {
    author: string;
    date: number;
    data: string[];
}

class MessageBucketClass {
    public identity?: PrivateKey;
    public buckets?: Buckets;
    public bucketKey?: string;

    async init(identity: PrivateKey): Promise<Index> {
        this.identity = identity;
        await this.setupBucket();
        const index = await this.getOrCreateIndex();
        return index;
    }

    async loginWithChallenge(): Promise<UserAuth> {
        const identity = this.identity as PrivateKey;
        const publicKey = identity.public.toString();
        const challengeResponse = await fetch(`/.netlify/functions/challenge?public_key=${publicKey}`);
        const { challenge } = await challengeResponse.json();
        const buf = Buffer.from(challenge);
        const signature = await identity.sign(buf);

        const publicKeyUint8Array = identity.public.pubKey;
        const tokenResponse = await fetch("/.netlify/functions/token", {
            method: "POST",
            body: JSON.stringify({
                publicKey: publicKeyUint8Array,
                signature: Buffer.from(signature).toJSON()
            })
        });
        const userAuth: UserAuth = await tokenResponse.json();
        return userAuth;
    }

    async setupBucket() {
        const buckets = await Buckets.withUserAuth(this.loginWithChallenge.bind(this));
        await buckets.getToken(this.identity as Identity);

        const result = await buckets.getOrCreate(messageBucketName);

        if (!result.root) {
            throw new Error("Oh no, it's broken :(")
        }

        this.buckets = buckets;
        this.bucketKey = result.root.key;
    }

    async getOrCreateIndex(): Promise<Index> {
        try {
            const index = await this.pullObject("index.json") as Index;
            return index;
        } catch (err) {
            const index = await this.pushData([], "index.json") as Index;
            return index;
        }
    }

    async pushData(data: any, path: string): Promise<Record<string, any>> {
        const object = {
            author: (this.identity as Identity).public.toString(),
            date: (new Date()).getTime(),
            data
        }
        const buf = Buffer.from(JSON.stringify(object, null, 2));
        await (this.buckets as Buckets).pushPath(this.bucketKey as string, path, buf);
        return object;
    }

    async pushMessage(message: string, path: string): Promise<Record<string, any>> {
        const result = await this.pushData(message, path);
        const index = await this.pullObject("index.json") as Index;
        // Will erase index of others, need thread DB
        await this.pushData([...index.data, path], "index.json") as Index;
        return result;
    }

    async pullObject(path: string): Promise<Record<string, any>> {
        const metadata = await (this.buckets as Buckets).pullPath(this.bucketKey as string, path);
        const { value } = await metadata.next();
        let str = "";
        for (var i = 0; i < value.length; i++) {
            str += String.fromCharCode(parseInt(value[i]));
        }
        const result = JSON.parse(str);

        return result;
    }
}

export default new MessageBucketClass()