import { Peer } from './peer.js';
interface InsideOptions {
    name: string;
    allowedDomain: string;
    onReady?: () => void;
    debug?: boolean;
}
export default class Inside extends Peer {
    allowedDomain: string;
    allowSend: boolean;
    debug: boolean;
    loggy(...args: any[]): void;
    init(): void;
    send(message: any, actionName?: string): void;
    request(message: any, actionName?: string): Promise<unknown> | undefined;
    constructor(config: InsideOptions);
}
export {};
