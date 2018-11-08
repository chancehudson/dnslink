const assert = require('assert');
const dnslink = require('.');

// Test random subdomain
function random() {
  return Math.random().toString(36).substring(7);
}

assert.rejects(() => dnslink.resolve(`${random()}.commontheory.io`));
assert.doesNotReject(() => dnslink.resolve(`commontheory.io`));
assert.doesNotReject(() => dnslink.resolve(`coverage.commontheory.io`));

console.log('Tests passed');
