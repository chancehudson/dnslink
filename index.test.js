const assert = require('assert');
const dnslink = require('.');

// Test random subdomain
function random() {
  return Math.random().toString(36).substring(7);
}

assert.rejects(() => dnslink(`${random()}.commontheory.io`));
assert.doesNotReject(() => dnslink(`commontheory.io`));
assert.doesNotReject(() => dnslink(`coverage.commontheory.io`));

console.log('Test passed');
