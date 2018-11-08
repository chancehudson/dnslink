# dnslink [![Build Status](https://travis-ci.org/common-theory/dnslink.svg?branch=master)](https://travis-ci.org/common-theory/dnslink) [![npm](https://img.shields.io/npm/v/dnslink.svg)](https://www.npmjs.com/package/dnslink) [![npm type definitions](https://img.shields.io/npm/types/dnslink.svg)](https://github.com/common-theory/dnslink)

A javascript [dnslink](https://docs.ipfs.io/guides/concepts/dnslink/) resolution implementation. See [ipfs/go-dnslink](https://github.com/ipfs/go-dnslink) for more information.

## Usage

### `update`

#### Command Line

Create a dnslink binding via digitalocean.

An environment variable called `DIGITAL_OCEAN_TOKEN` should be set.

```sh
$ jsdnslink update commontheory.io /ipfs/QmStyTZJJugmdFub1GBBGhtXpwxghT4EGvBCz8jNSLdBcy
Unable to find dnslink record, creating a new one
DNS record updated
```

#### JS/TS

```ts
import { update } from 'dnslink';

// async/await
await update('commontheory.io', '/ipfs/QmStyTZJJugmdFub1GBBGhtXpwxghT4EGvBCz8jNSLdBcy');

// promises
update('commontheory.io', '/ipfs/QmStyTZJJugmdFub1GBBGhtXpwxghT4EGvBCz8jNSLdBcy')
  .then(() => /* Your logic */);
```

### `resolve`

Get the CID associated with a domain. This evaluates via the DNS, not IPFS.

#### Command Line

```sh
$ jsdnslink resolve commontheory.io
/ipfs/QmStyTZJJugmdFub1GBBGhtXpwxghT4EGvBCz8jNSLdBcy
```

#### JS/TS

```ts
import { resolve } from 'dnslink';

// async/await
const cid = await resolve('commontheory.io');

// promises
resolve('commontheory.io')
  .then(cid => /* Your logic */);
```

## Note

This package is not maintained by, or affiliated with IPFS or Protocol Labs.
