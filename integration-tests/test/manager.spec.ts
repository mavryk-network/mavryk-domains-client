import { TezosToolkit } from '@taquito/taquito';
import { DomainNameValidationResult } from '@tezos-domains/core/src/core';
import { DomainAcquisitionState } from '@tezos-domains/manager';
import { TaquitoTezosDomainsClient } from '@tezos-domains/taquito-client';
import fs from 'fs-extra';
import path from 'path';
import { CONFIG } from '../data';


const db = fs.readJSONSync(path.join(__dirname, './data.json'));

describe('manager', () => {
    let client: TaquitoTezosDomainsClient;

    beforeAll(() => {
        jest.setTimeout(30 * 60 * 1000);
        const tezos = new TezosToolkit(CONFIG.rpcUrl);

        client = new TaquitoTezosDomainsClient({ network: CONFIG.network, tezos });
    });

    describe('getCommitment()', () => {
        it('should get existing commitment and return info', async () => {
            const commitment = await client.manager.getCommitment(client.validator.supportedTLDs[0], { label: 'commit', owner: CONFIG.adminAddress, nonce: 1 });
            const expectedCommitment = db[CONFIG.network]['commitment'];

            expect(commitment).not.toBeNull();
            expect(commitment!.created.toISOString()).toBe(expectedCommitment.created);
            expect(commitment!.usableFrom.toISOString()).toBe(expectedCommitment.usableFrom);
            expect(commitment!.usableUntil.toISOString()).toBe(expectedCommitment.usableUntil);
        });

        it('should return null if commitment doesnt exist', async () => {
            const commitment = await client.manager.getCommitment(client.validator.supportedTLDs[0], { label: 'bleh', owner: CONFIG.adminAddress, nonce: 1 });

            expect(commitment).toBeNull();
        });
    });

    describe('getAcquisitionInfo()', () => {
        it('should get price for unowned domain', async () => {
            const info = await client.manager.getAcquisitionInfo(`integration-test-new${Date.now().toString()}.${client.validator.supportedTLDs[0]}`);

            expect(info.acquisitionState).toBe(DomainAcquisitionState.CanBeBought);
            expect(info.buyOrRenewDetails.pricePerMinDuration).toBe(db[CONFIG.network].price);
            expect(info.buyOrRenewDetails.minDuration).toBe(365);
            expect(info.calculatePrice(365)).toBe(db[CONFIG.network].price);
        });

        it('should get price for renewing owned domain', async () => {
            const info = await client.manager.getAcquisitionInfo(`alice.${client.validator.supportedTLDs[0]}`);

            expect(info.acquisitionState).toBe(DomainAcquisitionState.Taken);
            expect(info.buyOrRenewDetails.pricePerMinDuration).toBe(1e6);
            expect(info.buyOrRenewDetails.minDuration).toBe(365);
            expect(info.calculatePrice(365)).toBe(1e6);
        });

        it('should throw error for claimable domain', async () => {
            const tezos = new TezosToolkit(CONFIG.rpcUrl);
            client = new TaquitoTezosDomainsClient({
                network: CONFIG.network,
                claimableTlds: [{ name: 'com', validator: () => DomainNameValidationResult.VALID }],
                tezos,
            });

            await expect(client.manager.getAcquisitionInfo(`alice.com}`)).rejects.toThrow();
        });
    });

    describe('getTokenId()', () => {
        it('should get existing commitment and return info', async () => {
            const tokenId = await client.manager.getTokenId(`alice.${client.validator.supportedTLDs[0]}`);
            const expectedTokenId = db[CONFIG.network]['aliceTokenId'];

            expect(tokenId).toBe(expectedTokenId);
        });

        it('should return null if domain doesnt exist', async () => {
            const tokenId = await client.manager.getTokenId(`integration-test-new${Date.now().toString()}.${client.validator.supportedTLDs[0]}`);

            expect(tokenId).toBeNull();
        });
    });
});
