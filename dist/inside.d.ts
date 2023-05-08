interface InsideOptions {
    name: string;
    allowedDomain: string;
    onReady?: () => void;
    onMessage?: (message: any) => void;
}
export default class Inside {
    name: string;
    allowedDomain: string;
    onReady?: () => void;
    onMessage?: (message: any) => void;
    init(): void;
    send(message: any): Promise<unknown>;
    request(message: any): Promise<unknown>;
    private handleIncoming;
    constructor(config: InsideOptions);
}
export {};
