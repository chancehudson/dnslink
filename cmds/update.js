const digitalocean = require('digitalocean');
const client = digitalocean.client(process.env.DIGITAL_OCEAN_TOKEN);

module.exports = async (domainArg, cidArg) => {
  const domainParts = domainArg.split('.');
  if (domainParts.length < 2) {
    console.log('Invalid domain name supplied:', domainArg);
    process.exit(1);
  }

  const rootDomain = domainParts.slice(-2).join('.');
  const subdomain = domainParts.slice(0, -2).join('.') || '@';

  // The record name
  const name = (subdomain !== '@' && !subdomain.startsWith('_dnslink.')) ? `_dnslink.${subdomain}` : subdomain;

  const records = await listAllRecords(rootDomain);
  const dnslinkRecord = records.find(record => {
    if (record.type !== 'TXT') return false;
    if (record.data.indexOf('dnslink=') === -1) return false;
    if (record.name !== name) return false;
    return record;
  });
  const recordData = `dnslink=${cidArg}`;
  if (!dnslinkRecord) {
    console.log('Unable to find dnslink record, creating a new one');
    await client.domains.createRecord(rootDomain, {
      type: 'TXT',
      name,
      data: recordData,
      ttl: 360
    });
  } else {
    console.log('Found dnslink record, updating');
    await client.domains.updateRecord(rootDomain, dnslinkRecord.id, {
      data: recordData
    });
  }
  console.log('DNS record updated')
};

/**
 * Loads all pages of domain records from digitalocean
 **/
async function listAllRecords(domain) {
  const records = [];
  let loadedRecords = [];
  let page = 0;
  do {
    loadedRecords = await client.domains.listRecords(domain, page++);
    records.push(...loadedRecords);
  } while (loadedRecords.length !== 0);
  return records;
}
