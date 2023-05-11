import { Peer } from './peer.js';
interface InsideOptions {
    name: string;
    allowedDomain: string;
    onReady?: () => void;
}
export default class Inside extends Peer {
    allowedDomain: string;
    onKill?: () => void;
    container?: HTMLElement;
    allowSend: boolean;
    init(): void;
    send(message: any, actionName?: string): void;
    on(messageName: string, handler: (message: any) => void | Promise<any>): void;
    request(message: any, actionName?: string): Promise<unknown> | undefined;
    private handleIncoming;
    kill(force?: boolean): void;
    constructor(config: InsideOptions);
}
export {};
