import { Peer } from './peer.js';
interface OutsideOptions {
    name: string;
    pageUrl?: string;
    onReady?: () => void;
    handlers: ((message: any, messageName?: any) => void | any)[];
    container?: HTMLElement;
    iFrame?: HTMLIFrameElement;
    debug?: boolean;
}
export default class Outside extends Peer {
    pageUrl: string;
    allowedDomain: string;
    container?: HTMLElement;
    iFrame?: HTMLIFrameElement;
    allowSend: boolean;
    debug: boolean;
    init(): void;
    send(message: any, actionName?: string): void;
    request(message: any, actionName?: string): Promise<unknown> | undefined;
    constructor(config: OutsideOptions);
}
export {};
