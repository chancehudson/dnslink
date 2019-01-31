// Promisify the resolveTxt dns function
// https://nodejs.org/api/dns.html#dns_dns_resolvetxt_hostname_callback
const dns = require('dns');
const { promisify } = require('@ctheory/promisify');
const resolveTxt = promisify(dns.resolveTxt);

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
    if (err.code !== 'ENOTFOUND' && err.code !== 'ENODATA') throw err;
    // If we're checking a _dnslink domain check the regular
    if (domain.startsWith('_dnslink.')) {
      return await getDnslinkValue(domain.replace('_dnslink.', ''));
    }
    // Otherwise check the _dnslink subdomain
    return await getDnslinkValue(`_dnslink.${domain}`);
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
    const error = new Error(`Found multiple dnslink TXT entries for domain ${domain}`);
    error.code = 'ERR_MULT_FOUND';
    throw error;
  } else if (dnslinks.length === 0) {
    const error = new Error(`Unable to find dnslink TXT record for domain ${domain}`);
    error.code = 'ENOTFOUND';
    throw error;
  }
  return dnslinks[0].slice('dnslink='.length);
}
