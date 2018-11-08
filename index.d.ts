declare module 'dnslink' {
  function resolve(domain: string): Promise<string>;
  function update(domain: string, cid: string): Promise<void>;
}
