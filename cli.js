#!/usr/bin/env node

const resolve = require('./cmds/resolve');
const update = require('./cmds/update');

require('yargs')
  .command('update <domain> <cid>', 'Update a dnslink binding', yargs => {
    yargs.positional('domain', {
      describe: 'The domain to be updated',
      type: 'string'
    });
    yargs.positional('cid', {
      describe: 'The content ID to be bound to the domain name',
      type: 'string'
    });
  }, async argv => await update(argv.domain, argv.cid))
  .command('resolve <domain>', 'Get the cid currently bound to domain using DNS', yargs => {
    yargs.positional('domain', {
      describe: 'The domain that should be resolved'
    });
  }, async argv => console.log(await resolve(argv.domain)))
  .argv;

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at:', p, 'reason:', reason);
  process.exit(1);
});
