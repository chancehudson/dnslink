const dns = require('dns');

const DNSLINK_REGEX = /^dnslink=.+$/;

/**
 * Return the string path that is dnslinked in the txt records.
 **/
module.exports = async function dnslink(_domain) {
  const domainParts = _domain.split('.');
  // We've got a subdomain, add _dnslink subdomain prefix
  if (domainParts.length > 2) {
    domainParts.unshift('_dnslink');
  }
  const domain = domainParts.join('.');

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
