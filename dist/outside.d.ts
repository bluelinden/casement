interface OutsideOptions {
    name: string;
    pageUrl?: string;
    onReady?: () => void;
    onMessage: (message: any) => void;
    container?: HTMLElement;
    iFrame?: HTMLIFrameElement;
}
export default class Outside {
    name: string;
    pageUrl: string;
    allowedDomain: string;
    onReady?: () => void;
    onMessage?: (message: any) => void;
    onKill?: () => void;
    container?: HTMLElement;
    iFrame?: HTMLIFrameElement;
    allowSend: boolean;
    init(): void;
    send(message: any): void;
    request(message: any): Promise<unknown> | undefined;
    private handleIncoming;
    kill(force?: boolean): void;
    constructor(config: OutsideOptions);
}
export {};
