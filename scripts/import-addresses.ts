import * as fs from 'fs-extra';
import * as path from 'path';
import minimist from 'minimist';
import { camelCase, snakeCase } from 'lodash';

async function run() {
    const args = minimist(process.argv.slice(2), {
        alias: {
            network: ['n'],
            file: ['f'],
        },
    });

    const network = args['network'];
    const inputFile = args['file'];
    const addressesFile = path.join(__dirname, '../packages/core/src/address-book/built-in-addresses.ts');
    const addresses = require(addressesFile).BuiltInAddresses;

    const json = await fs.readJSON(inputFile);

    addresses[network] = {};

    Object.keys(json).forEach(key => {
        const pk = key.match(/(\w+)\.(\w+):?(\w+)?/);
        if (!pk) {
            throw new Error();
        }

        const contract = camelCase(pk[1]);
        const endpoint = snakeCase(pk[2]);
        const tld = pk[3];
        const address = json[key];

        if (endpoint === 'check_address') {
            addresses[network]['nameRegistry'] = { address, resolveProxyContract: true };
        } else {
            addresses[network][`${contract}${tld ? `:${tld}` : ''}:${endpoint}`] = { address };

            if (endpoint === 'commit') {
                addresses[network][`tldRegistrar:${tld}`] = { address, resolveProxyContract: true };
            }
        }
    });

    await fs.writeFile(addressesFile, `export const BuiltInAddresses = ${JSON.stringify(addresses, null, 4)}`);
}

void run();
