import { SupportedTLDs, DomainNameValidators, AlphanumericWithHyphenDomainNameValidator } from '@tezos-domains/core';
import { TezosDomainsClient } from '@tezos-domains/client';
import { TezosToolkit } from '@taquito/taquito';
import fs from 'fs-extra';
import path from 'path';

import { CONFIG } from '../data';

const db = fs.readJSONSync(path.join(__dirname, './data.json'));

describe('manager', () => {
    let client: TezosDomainsClient;

    beforeAll(() => {
        jest.setTimeout(30 * 60 * 1000);
        const tezos = new TezosToolkit();
        tezos.setRpcProvider(CONFIG.rpcUrl);

        SupportedTLDs.push('test');
        DomainNameValidators['test'] = AlphanumericWithHyphenDomainNameValidator;

        client = new TezosDomainsClient({ network: CONFIG.network, tezos });
    });

    describe('getCommitment()', () => {
        it('should get existing commitment and return info', async () => {
            const commitment = await client.manager.getCommitment('tez', { label: 'commit', owner: CONFIG.adminAddress });
            const expectedCommitment = db[CONFIG.network]['commitment'];

            expect(commitment).not.toBeNull();
            expect(commitment!.created.toISOString()).toBe(expectedCommitment.created);
            expect(commitment!.usableFrom.toISOString()).toBe(expectedCommitment.usableFrom);
            expect(commitment!.usableUntil.toISOString()).toBe(expectedCommitment.usableUntil);
        });

        it('should return null if commitment doesnt exist', async () => {
            const commitment = await client.manager.getCommitment('tez', { label: 'bleh', owner: CONFIG.adminAddress });

            expect(commitment).toBeNull();
        });
    });

    describe('getPrice()', () => {
        it('should get price for unowned domain', async () => {
            const price = await client.manager.getPrice(`integration_test_new${Date.now().toString()}.tez`, 365);

            expect(price).toBe(db[CONFIG.network].price);
        });
    });
});
