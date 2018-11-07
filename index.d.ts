declare module 'dnslink' {
  export default function dnslink(domain: string): Promise<string>;
}
