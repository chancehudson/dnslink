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

  try {
    const domains = await client.domains.list();
    const records = await client.domains.listRecords(rootDomain);
    const dnslinkRecord = records.find(record => {
      if (record.type !== 'TXT') return false;
      if (record.data.indexOf('dnslink=') === -1) return false;
      if (record.name !== subdomain) return false;
      return record;
    });
    const recordData = `dnslink=${cidArg}`;
    if (!dnslinkRecord) {
      console.log('Unable to find dnslink record, creating a new one');
      await client.domains.createRecord(rootDomain, {
        type: 'TXT',
        name: subdomain,
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
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};
