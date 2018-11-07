const dns = require('dns');

const DNSLINK_REGEX = /^dnslink=.+/;

/**
 * Return the string path that is dnslinked in the txt records.
 **/
module.exports = function dnslink(domain) {
  return new Promise((rs, rj) => {
    dns.resolveTxt(domain, (err, records) => {
      if (err) return rj(err);
      const flatRecords = [].concat(...records);
      const dnslink = flatRecords.find((item: string) => {
        return DNSLINK_REGEX.test(item);
      });
      if (!dnslink) {
        rj('Unable to find dnslink TXT record for domain');
        return;
      }
      rs(dnslink.slice('dnslink='.length));
    });
  });
}
