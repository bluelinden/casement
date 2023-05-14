export declare class Peer {
    onReady?: () => void;
    onMessage?: {
        name: string;
        callback: (message: any, messageName?: string) => void | Promise<any>;
    }[];
    allowSend: boolean;
    name: string;
    debug: boolean;
    allowedDomain: string;
    iFrame?: HTMLIFrameElement;
    loggy(...args: any[]): void;
    warny(...args: any[]): void;
    private capitalizeFirstLetter;
    sendAgnostic(isInside: boolean, message: any, actionName?: string): void;
    requestAgnostic(isInside: boolean, message: any, actionName?: string): Promise<unknown> | undefined;
    on(messageName: string, handler: (message: any) => void | Promise<any>): void;
    handleIncomingAgnostic(event: MessageEvent, isInside: boolean): void;
    handleReadinessAgnostic(event: MessageEvent, isInside: boolean): void;
    private domainCheck;
}
