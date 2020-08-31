import { SupportedTLDs, DomainNameValidators, AlphanumericWithHyphenDomainNameValidator } from '@tezos-domains/core';
import { TezosDomainsClient } from '@tezos-domains/client';
import { TezosToolkit } from '@taquito/taquito';

import { CONFIG } from '../data';

describe('resolver', () => {
    let client: TezosDomainsClient;

    beforeAll(() => {
        const tezos = new TezosToolkit();
        tezos.setRpcProvider(process.env.TD_RPC_URL || 'https://testnet-tezos.giganode.io');

        SupportedTLDs.push('test');
        DomainNameValidators['test'] = AlphanumericWithHyphenDomainNameValidator;

        client = new TezosDomainsClient({ network: 'carthagenet', tezos });
    });

    describe('getCommitment()', () => {
        it('should get existing commitment and return info', async () => {
            const commitment = await client.manager.getCommitment('tez', { label: 'commit', owner: CONFIG.adminAddress });

            expect(commitment).not.toBeNull();
            expect(commitment!.created.toISOString()).toBe('2020-08-31T13:40:04.000Z');
            expect(commitment!.usableFrom.toISOString()).toBe('2020-08-31T13:41:04.000Z');
            expect(commitment!.usableUntil.toISOString()).toBe('2020-09-01T13:40:04.000Z');
        });

        it('should return null if commitment doesnt exist', async () => {
            const commitment = await client.manager.getCommitment('tez', { label: 'bleh', owner: CONFIG.adminAddress });

            expect(commitment).toBeNull();
        });
    });

    describe('getPrice()', () => {
        it('should get price for unowned domain', async () => {
            const price = await client.manager.getPrice(`integration_test_new${Date.now().toString()}.tez`, 365);

            expect(price).toBe(1);
        });
    });
});
