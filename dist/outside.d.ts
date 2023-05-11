import { Peer } from './peer.js';
interface OutsideOptions {
    name: string;
    pageUrl?: string;
    onReady?: () => void;
    handlers: ((message: any, messageName?: any) => void | any)[];
    container?: HTMLElement;
    iFrame?: HTMLIFrameElement;
}
export default class Outside extends Peer {
    pageUrl: string;
    allowedDomain: string;
    onKill?: () => void;
    container?: HTMLElement;
    iFrame?: HTMLIFrameElement;
    allowSend: boolean;
    init(): void;
    send(message: any, actionName?: string): void;
    on(messageName: string, handler: (message: any) => void | Promise<any>): void;
    request(message: any, actionName?: string): Promise<unknown> | undefined;
    private handleIncoming;
    kill(force?: boolean): void;
    constructor(config: OutsideOptions);
}
export {};
