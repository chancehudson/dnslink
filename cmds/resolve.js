// Promisify the resolveTxt dns function
// https://nodejs.org/api/dns.html#dns_dns_resolvetxt_hostname_callback
const resolveTxt = promisify(require('dns').resolveTxt);

const ERR_NOT_FOUND = 'Unable to find dnslink TXT record for domain';
const ERR_MULT_FOUND = 'Found multiple dnslink TXT entries, expected one for domain';

/**
 * Return the string path that is dnslinked in the txt records.
 **/
module.exports = async domain => {
  /**
   * domain is the raw input
   * We need to check domain.com and _dnslink.domain.com
   **/
  try {
    return await getDnslinkValue(domain);
  } catch (err) {
    // Only check for _dnslink subdomain if it's a not found error
    if (err.message.indexOf(ERR_NOT_FOUND) === -1) throw err;
    /**
     * The input domain didn't work, let's try _dnslink.domain.com
     * If this doesn't work then the record probably isn't there and we should
     * let the error propagate out from this function
     **/
    const _dnslinkDomain = ['_dnslink', ...domain.split('.')];
    return await getDnslinkValue(_dnslinkDomain);
  }
}

/**
 * Returns the value contents after the = sign in a dnslink TXT entry
 *
 * Throws if no dnslink record is found, or if multiple are found
 **/
async function getDnslinkValue(domain) {
  const DNSLINK_REGEX = /^dnslink=.+$/;
  const records = await resolveTxt(domain);
  const flatRecords = [].concat(...records);
  const dnslinks = flatRecords.filter(item => {
    return DNSLINK_REGEX.test(item);
  });
  if (dnslinks.length > 1) {
    throw new Error(`${ERR_MULT_FOUND} ${domain}`);
  } else if (dnslinks.length === 0) {
    throw new Error(`${ERR_NOT_FOUND} ${domain}`);
  }
  return dnslinks[0].slice('dnslink='.length);
}

function promisify(fn) {
  return (...args) => {
    return new Promise((rs, rj) => {
      fn(...args, (err, ..._args) => {
        if (err) return rj(err);
        rs(..._args);
      });
    });
  };
}
