const dns = require('dns');

const DNSLINK_REGEX = /^dnslink=.+$/;

/**
 * Return the string path that is dnslinked in the txt records.
 **/
module.exports = async function dnslink(domain) {
  /**
   * domain is the raw input
   * We need to check domain.com and _dnslink.domain.com
   **/
  try {
    return await getDnslinkValue(domain);
  } catch (err) {
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
  const records = await resolveTxt(domain);
  const flatRecords = [].concat(...records);
  const dnslinks = flatRecords.filter(item => {
    return DNSLINK_REGEX.test(item);
  });
  if (dnslinks.length > 1) {
    throw new Error(`Found multiple dnslink entries for ${domain}. Rejecting as there should only be 1.`);
  } else if (dnslinks.length === 0) {
    throw new Error(`Unable to find dnslink TXT record for domain ${domain}`);
  }
  return dnslinks[0].slice('dnslink='.length);
}

function resolveTxt(domain) {
  return new Promise((rs, rj) => {
    dns.resolveTxt(domain, (err, records) => {
      if (err) return rj(err);
      rs(records);
    });
  });
}
