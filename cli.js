#!/usr/bin/env node

const digitalocean = require('digitalocean');
const client = digitalocean.client(process.env.DIGITAL_OCEAN_TOKEN);

const USAGE = `
Expected 2 arguments.

Usage: dnslink <domain> <cid>

domain: The domain name  TXT record to update.

cid: The cid that should be set.
`;

const argv = (() => {
  const parsed = {_: []};
  for (let x = 0; x < process.argv.length; x++) {
    const arg = process.argv[x];
    if (arg.indexOf('node') !== -1) continue;
    if (arg.indexOf('dnslink') !== -1) continue;
    if (arg[0] === '-' && arg[1] === '-') {
      parsed[arg.slice(2)] = true;
      continue;
    } else if (arg[0] === '-') {
      parsed[arg.slice(1)] = true;
      continue;
    }
    parsed._.push(arg);
  }
  return parsed;
})();

if (argv.h || argv.help) {
  console.log(USAGE);
  process.exit(0);
}

if (argv._.length < 2) {
  console.log(USAGE);
  process.exit(1);
}

const domainArg = argv._[0];
const cidArg = argv._[1];

const domainParts = domainArg.split('.');
if (domainParts.length < 2) {
  console.log('Invalid domain name supplied:', domainArg);
  process.exit(1);
}

const rootDomain = domainParts.slice(-2).join('.');
const subdomain = domainParts.slice(0, -2).join('.') || '@';

(async () => {
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
  }
})();
