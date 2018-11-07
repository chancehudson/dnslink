const dns = require('dns');

const DNSLINK_REGEX = /^dnslink=.+$/;

/**
 * Return the string path that is dnslinked in the txt records.
 **/
module.exports = function dnslink(_domain) {
  return new Promise((rs, rj) => {
    const domainParts = _domain.split('.');
    // We've got a subdomain, add _dnslink subdomain prefix
    if (domainParts.length > 2) {
      domainParts.unshift('_dnslink');
    }
    const domain = domainParts.join('.');
    dns.resolveTxt(domain, (err, records) => {
      if (err) return rj(err);
      const flatRecords = [].concat(...records);
      const dnslinks = flatRecords.filter(item => {
        return DNSLINK_REGEX.test(item);
      });
      if (dnslinks.length > 1) {
        rj(`Found multiple dnslink entries for ${domain}. Rejecting as there should only be 1.`);
        return;
      } else if (dnslinks.length === 0) {
        rj(`Unable to find dnslink TXT record for domain ${domain}`);
        return;
      }
      rs(dnslinks[0].slice('dnslink='.length));
    });
  });
}
