export class Peer {
  onReady?: () => void;
  onMessage?: {
    name: string,
    callback: (message: any, messageName?: string) => void | Promise<any>,
  }[];
  name: string = 'default';
  allowedDomain: string = '';
}