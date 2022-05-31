import { ConstantsResponse } from '@taquito/rpc';
import { MichelsonMap, TransactionWalletOperation, WalletTransferParams } from '@taquito/taquito';
import {
    AdditionalOperationParams,
    AddressBook,
    BytesEncoder,
    DomainNameValidationResult,
    DomainNameValidator,
    Exact,
    RecordMetadata,
    SmartContractType,
    Tracer,
} from '@tezos-domains/core';
import {
    CommitmentGenerator,
    CommitmentRequest,
    DomainAcquisitionInfo,
    DomainAcquisitionState,
    TaquitoManagerDataProvider,
    TaquitoTezosDomainsOperationFactory,
} from '@tezos-domains/manager';
import { TaquitoClient } from '@tezos-domains/taquito';
import BigNumber from 'bignumber.js';
import MockDate from 'mockdate';
import { anyOfClass, anyString, anything, capture, deepEqual, instance, mock, verify, when } from 'ts-mockito';
import { DEFAULT_STORAGE_LIMITS, TLDConfiguration } from '../../src/manager/model';

const e = (s: string) => new BytesEncoder().encode(s)!;

describe('TaquitoTezosDomainsOperationFactory', () => {
    let operationFactory: TaquitoTezosDomainsOperationFactory;
    let taquitoClientMock: TaquitoClient;
    let addressBookMock: AddressBook;
    let tracerMock: Tracer;
    let commitmentGeneratorMock: CommitmentGenerator;
    let dataProviderMock: TaquitoManagerDataProvider;
    let validatorMock: DomainNameValidator;
    let operation: TransactionWalletOperation;
    let params: WalletTransferParams;
    let additionalParams: AdditionalOperationParams;
    let constants: ConstantsResponse;

    beforeEach(() => {
        taquitoClientMock = mock(TaquitoClient);
        addressBookMock = mock(AddressBook);
        tracerMock = mock<Tracer>();
        commitmentGeneratorMock = mock(CommitmentGenerator);
        dataProviderMock = mock(TaquitoManagerDataProvider);
        validatorMock = mock<DomainNameValidator>();
        operation = mock(TransactionWalletOperation);

        params = { amount: 0, to: 'tz1xxx' };
        constants = { time_between_blocks: [new BigNumber('30')] } as any;
        additionalParams = { gasLimit: 420 };

        when(tracerMock.trace(anything(), anything(), anything()));

        when(validatorMock.validateDomainName(anyString())).thenCall(name => {
            if (name === 'invalid.tez') {
                return DomainNameValidationResult.INVALID_NAME;
            }

            return DomainNameValidationResult.VALID;
        });
        when(validatorMock.supportedTLDs).thenReturn(['tez']);

        when(addressBookMock.lookup(anything())).thenCall(type => Promise.resolve(`${type}addr`));
        when(addressBookMock.lookup(anything(), anything())).thenCall((type, p1) => Promise.resolve(`${type}addr${p1 || ''}`));
        when(addressBookMock.lookup(anything(), anything(), anything())).thenCall((type, p1, p2) => Promise.resolve(`${type}addr${p1 || ''}${p2 || ''}`));

        when(taquitoClientMock.params(anyString(), anyString(), anything())).thenResolve(params);
        when(taquitoClientMock.params(anyString(), anyString(), anything(), anything())).thenResolve(params);
        when(taquitoClientMock.getConstants()).thenResolve(constants);

        when(operation.opHash).thenReturn('op_hash');

        operationFactory = new TaquitoTezosDomainsOperationFactory(
            instance(taquitoClientMock),
            instance(addressBookMock),
            instance(tracerMock),
            instance(commitmentGeneratorMock),
            instance(dataProviderMock),
            instance(validatorMock)
        );
    });

    afterEach(() => {
        MockDate.reset();
    });

    describe('setChildRecord()', () => {
        it('should call smart contract', async () => {
            const p = await operationFactory.setChildRecord(
                {
                    label: 'necroskillz',
                    parent: 'tez',
                    data: new RecordMetadata({ ttl: '31' }),
                    owner: 'tz1xxx',
                    address: 'tz1yyy',
                    expiry: new Date(new Date(2021, 10, 11, 8).getTime() - new Date(2021, 10, 11).getTimezoneOffset() * 60000),
                },
                additionalParams
            );

            verify(
                taquitoClientMock.params(
                    `${SmartContractType.NameRegistry}addrset_child_record`,
                    'set_child_record',
                    deepEqual([e('necroskillz'), e('tez'), 'tz1yyy', 'tz1xxx', anyOfClass(MichelsonMap), '2021-11-11T08:00:00.000Z']),
                    deepEqual({ storageLimit: DEFAULT_STORAGE_LIMITS['set_child_record'], ...additionalParams })
                )
            ).called();

            expect(capture(taquitoClientMock.params).last()[2][4].get('ttl')).toBe('31');

            expect(p).toEqual(params);
        });

        it('should throw if domain name is invalid', async () => {
            await expect(() =>
                operationFactory.setChildRecord({
                    label: 'invalid',
                    parent: 'tez',
                    data: new RecordMetadata(),
                    owner: 'tz1xxx',
                    address: 'tz1yyy',
                    expiry: null,
                })
            ).rejects.toThrowError("'invalid.tez' is not a valid domain name.");
        });
    });

    describe('updateRecord()', () => {
        it('should call smart contract', async () => {
            const p = await operationFactory.updateRecord(
                {
                    name: 'necroskillz.tez',
                    data: new RecordMetadata({ ttl: '31' }),
                    owner: 'tz1xxx',
                    address: 'tz1yyy',
                },
                additionalParams
            );

            verify(
                taquitoClientMock.params(
                    `${SmartContractType.NameRegistry}addrupdate_record`,
                    'update_record',
                    deepEqual([e('necroskillz.tez'), 'tz1yyy', 'tz1xxx', anyOfClass(MichelsonMap)]),
                    deepEqual({ storageLimit: DEFAULT_STORAGE_LIMITS['update_record'], ...additionalParams })
                )
            ).called();
            expect(capture(taquitoClientMock.params).last()[2][3].get('ttl')).toBe('31');

            expect(p).toEqual(params);
        });

        it('should throw if domain name is invalid', async () => {
            await expect(() =>
                operationFactory.updateRecord({
                    name: 'invalid.tez',
                    data: new RecordMetadata(),
                    owner: 'tz1xxx',
                    address: 'tz1yyy',
                })
            ).rejects.toThrowError("'invalid.tez' is not a valid domain name.");
        });
    });

    describe('commit()', () => {
        it('should call smart contract', async () => {
            const request: Exact<CommitmentRequest> = { label: 'necroskillz', owner: 'tz1xxx', nonce: 1 };

            when(commitmentGeneratorMock.generate(deepEqual(request))).thenReturn('commitment');

            const p = await operationFactory.commit('tez', request, additionalParams);

            verify(
                taquitoClientMock.params(
                    `${SmartContractType.TLDRegistrar}addrtezcommit`,
                    'commit',
                    deepEqual(['commitment']),
                    deepEqual({ storageLimit: DEFAULT_STORAGE_LIMITS['commit'], ...additionalParams })
                )
            ).called();

            expect(p).toEqual(params);
        });

        it('should throw if domain name is invalid', async () => {
            await expect(() => operationFactory.commit('tez', { label: 'invalid', owner: 'tz1xxx', nonce: 1 })).rejects.toThrowError(
                "'invalid.tez' is not a valid domain name."
            );
        });
    });

    describe('buy()', () => {
        it('should call smart contract with price', async () => {
            when(dataProviderMock.getAcquisitionInfo('alice.tez')).thenResolve(
                DomainAcquisitionInfo.createBuyOrRenew(DomainAcquisitionState.CanBeBought, {
                    minDuration: 1,
                    pricePerMinDuration: 1e6,
                })
            );

            const p = await operationFactory.buy(
                'tez',
                {
                    duration: 365,
                    label: 'alice',
                    owner: 'tz1xxx',
                    address: 'tz1yyy',
                    data: new RecordMetadata({ ttl: '31' }),
                    nonce: 1,
                },
                additionalParams
            );

            verify(
                taquitoClientMock.params(
                    `${SmartContractType.TLDRegistrar}addrtezbuy`,
                    'buy',
                    deepEqual([e('alice'), 365, 'tz1xxx', 'tz1yyy', anyOfClass(MichelsonMap), 1]),
                    deepEqual({ amount: 1e6 * 365, storageLimit: DEFAULT_STORAGE_LIMITS['buy'], ...additionalParams })
                )
            ).called();

            expect(capture(taquitoClientMock.params).last()[2][4].get('ttl')).toBe('31');

            expect(p).toEqual(params);
        });

        it('should throw if domain name is invalid', async () => {
            await expect(() =>
                operationFactory.buy('tez', {
                    duration: 365,
                    label: 'invalid',
                    owner: 'tz1xxx',
                    address: 'tz1yyy',
                    data: new RecordMetadata(),
                    nonce: 1,
                })
            ).rejects.toThrowError("'invalid.tez' is not a valid domain name.");
        });
    });

    describe('renew()', () => {
        it('should call smart contract with price', async () => {
            when(dataProviderMock.getAcquisitionInfo('necroskillz2.tez')).thenResolve(
                DomainAcquisitionInfo.createBuyOrRenew(DomainAcquisitionState.Taken, {
                    minDuration: 1,
                    pricePerMinDuration: 1e6,
                })
            );

            const p = await operationFactory.renew(
                'tez',
                {
                    duration: 365,
                    label: 'necroskillz2',
                },
                additionalParams
            );

            verify(
                taquitoClientMock.params(
                    `${SmartContractType.TLDRegistrar}addrtezrenew`,
                    'renew',
                    deepEqual([e('necroskillz2'), 365]),
                    deepEqual({ amount: 365 * 1e6, ...additionalParams })
                )
            ).called();

            expect(p).toEqual(params);
        });

        it('should throw if domain name is invalid', async () => {
            await expect(() =>
                operationFactory.renew('tez', {
                    duration: 365,
                    label: 'invalid',
                })
            ).rejects.toThrowError("'invalid.tez' is not a valid domain name.");
        });
    });

    describe('claimReverseRecord()', () => {
        it('should call smart contract', async () => {
            const p = await operationFactory.claimReverseRecord(
                {
                    name: 'necroskillz.tez',
                    owner: 'tz1xxx',
                },
                additionalParams
            );

            verify(
                taquitoClientMock.params(
                    `${SmartContractType.NameRegistry}addrclaim_reverse_record`,
                    'claim_reverse_record',
                    deepEqual([e('necroskillz.tez'), 'tz1xxx']),
                    deepEqual({ storageLimit: DEFAULT_STORAGE_LIMITS['claim_reverse_record'], ...additionalParams })
                )
            ).called();

            expect(p).toEqual(params);
        });

        it('should throw if domain name is invalid', async () => {
            await expect(() =>
                operationFactory.claimReverseRecord({
                    name: 'invalid.tez',
                    owner: 'tz1xxx',
                })
            ).rejects.toThrowError("'invalid.tez' is not a valid domain name.");
        });

        it('should not throw if domain name is null', async () => {
            const p = await operationFactory.claimReverseRecord({
                name: null,
                owner: 'tz1xxx',
            });

            expect(p).toEqual(params);
        });
    });

    describe('updateReverseRecord()', () => {
        it('should call smart contract', async () => {
            const p = await operationFactory.updateReverseRecord(
                {
                    address: 'tz1xxx',
                    name: 'necroskillz.tez',
                    owner: 'tz1yyy',
                },
                additionalParams
            );

            verify(
                taquitoClientMock.params(
                    `${SmartContractType.NameRegistry}addrupdate_reverse_record`,
                    'update_reverse_record',
                    deepEqual(['tz1xxx', e('necroskillz.tez'), 'tz1yyy']),
                    deepEqual({ storageLimit: DEFAULT_STORAGE_LIMITS['update_reverse_record'], ...additionalParams })
                )
            ).called();

            expect(p).toEqual(params);
        });

        it('should throw if domain name is invalid', async () => {
            await expect(() =>
                operationFactory.updateReverseRecord({
                    address: 'tz1xxx',
                    name: 'invalid.tez',
                    owner: 'tz1yyy',
                })
            ).rejects.toThrowError("'invalid.tez' is not a valid domain name.");
        });

        it('should not throw if domain name is null', async () => {
            const p = await operationFactory.updateReverseRecord({
                address: 'tz1xxx',
                name: null,
                owner: 'tz1yyy',
            });

            expect(p).toEqual(params);
        });
    });

    describe('bid()', () => {
        beforeEach(() => {
            when(dataProviderMock.getBidderBalance('tez', 'tz1Q4vimV3wsfp21o7Annt64X7Hs6MXg9Wix')).thenResolve(2e6);
        });

        it('should call smart contract with bid amount', async () => {
            const p = await operationFactory.bid(
                'tez',
                {
                    label: 'necroskillz',
                    bid: 5e6,
                },
                additionalParams
            );

            verify(
                taquitoClientMock.params(
                    `${SmartContractType.TLDRegistrar}addrtezbid`,
                    'bid',
                    deepEqual([e('necroskillz'), 5e6]),
                    deepEqual({ storageLimit: DEFAULT_STORAGE_LIMITS['bid'], amount: 5e6, ...additionalParams })
                )
            ).called();

            expect(p).toEqual(params);
        });

        it('should call smart contract bid with subtracted bidder balance', async () => {
            when(taquitoClientMock.getPkh()).thenResolve('tz1Q4vimV3wsfp21o7Annt64X7Hs6MXg9Wix');

            const p = await operationFactory.bid('tez', {
                label: 'necroskillz',
                bid: 5e6,
            });

            verify(
                taquitoClientMock.params(
                    `${SmartContractType.TLDRegistrar}addrtezbid`,
                    'bid',
                    deepEqual([e('necroskillz'), 5e6]),
                    deepEqual({ storageLimit: DEFAULT_STORAGE_LIMITS['bid'], amount: 3e6 })
                )
            ).called();

            expect(p).toEqual(params);
        });

        it('should call smart contract with 0 amount if bidder balance is more than the bid', async () => {
            when(taquitoClientMock.getPkh()).thenResolve('tz1Q4vimV3wsfp21o7Annt64X7Hs6MXg9Wix');

            const p = await operationFactory.bid('tez', {
                label: 'necroskillz',
                bid: 1e6,
            });

            verify(
                taquitoClientMock.params(
                    `${SmartContractType.TLDRegistrar}addrtezbid`,
                    'bid',
                    deepEqual([e('necroskillz'), 1e6]),
                    deepEqual({ storageLimit: DEFAULT_STORAGE_LIMITS['bid'], amount: 0 })
                )
            ).called();

            expect(p).toEqual(params);
        });

        it('should throw if domain name is invalid', async () => {
            await expect(() =>
                operationFactory.bid('tez', {
                    label: 'invalid',
                    bid: 1e6,
                })
            ).rejects.toThrowError("'invalid.tez' is not a valid domain name.");
        });
    });

    describe('settle()', () => {
        it('should call smart contract', async () => {
            const p = await operationFactory.settle(
                'tez',
                {
                    label: 'necroskillz',
                    owner: 'tz1xxx',
                    address: 'tz1yyy',
                    data: new RecordMetadata({ ttl: '31' }),
                },
                additionalParams
            );

            verify(
                taquitoClientMock.params(
                    `${SmartContractType.TLDRegistrar}addrtezsettle`,
                    'settle',
                    deepEqual([e('necroskillz'), 'tz1xxx', 'tz1yyy', anyOfClass(MichelsonMap)]),
                    deepEqual({ storageLimit: DEFAULT_STORAGE_LIMITS['settle'], ...additionalParams })
                )
            ).called();

            expect(capture(taquitoClientMock.params).last()[2][3].get('ttl')).toBe('31');

            expect(p).toEqual(params);
        });

        it('should throw if domain name is invalid', async () => {
            await expect(() =>
                operationFactory.settle('tez', {
                    label: 'invalid',
                    owner: 'tz1xxx',
                    address: 'tz1yyy',
                    data: new RecordMetadata(),
                })
            ).rejects.toThrowError("'invalid.tez' is not a valid domain name.");
        });
    });

    describe('withdraw()', () => {
        it('should call smart contract', async () => {
            const p = await operationFactory.withdraw('tez', 'tz1Q4vimV3wsfp21o7Annt64X7Hs6MXg9Wix', additionalParams);

            verify(
                taquitoClientMock.params(
                    `${SmartContractType.TLDRegistrar}addrtezwithdraw`,
                    'withdraw',
                    deepEqual(['tz1Q4vimV3wsfp21o7Annt64X7Hs6MXg9Wix']),
                    deepEqual(additionalParams)
                )
            ).called();

            expect(p).toEqual(params);
        });

        it('should throw if tld is not supported', async () => {
            await expect(() => operationFactory.withdraw('ble', 'tz1VBLpuDKMoJuHRLZ4HrCgRuiLpEr7zZx2E')).rejects.toThrowError("TLD 'ble' is not supported.");
        });
    });

    describe('transfer()', () => {
        it('should call smart contract', async () => {
            when(dataProviderMock.getDomainRecord('alice.tez')).thenResolve({
                owner: 'tz1Old',
                tzip12_token_id: 1,
                address: null,
                data: new RecordMetadata({ ttl: '31' }),
                expiry_key: null,
            });

            const p = await operationFactory.transfer('alice.tez', 'tz1New', additionalParams);

            verify(taquitoClientMock.params(`${SmartContractType.NameRegistry}addr`, 'transfer', anything(), deepEqual(additionalParams))).called();

            const request = capture(taquitoClientMock.params).first()[2][0];
            expect(request).toEqual([{ from_: 'tz1Old', txs: [{ to_: 'tz1New', token_id: 1, amount: 1 }] }]);

            expect(p).toEqual(params);
        });

        it('should throw if token id is null', async () => {
            await expect(() => operationFactory.transfer('bob.tez', 'tz1VBLpuDKMoJuHRLZ4HrCgRuiLpEr7zZx2E')).rejects.toThrowError();
        });
    });

    describe('claim()', () => {
        it('should call smart contract with parameters', async () => {
            when(validatorMock.validateDomainName('so-valid.com')).thenCall(() => DomainNameValidationResult.VALID);
            when(dataProviderMock.getTldConfiguration('com')).thenResolve(<TLDConfiguration>{ claimPrice: new BigNumber(1_500_000) });

            const timestamp = new Date().toISOString();
            const p = await operationFactory.claim(
                'signature',
                {
                    label: 'so-valid',
                    tld: 'com',
                    owner: 'tz1xxx',
                    timestamp,
                },
                additionalParams
            );

            verify(
                taquitoClientMock.params(
                    `${SmartContractType.OracleRegistrar}addr`,
                    'claim',
                    deepEqual([e('so-valid'), e('com'), 'tz1xxx', timestamp, 'signature']),
                    deepEqual({ ...additionalParams, amount: 1_500_000 })
                )
            ).called();

            expect(p).toEqual(params);
        });

        it('should throw if domain name is invalid', async () => {
            await expect(() =>
                operationFactory.claim('signature', {
                    label: 'invalid',
                    tld: 'tez',
                    owner: 'tz1xxx',
                    timestamp: new Date().toISOString(),
                })
            ).rejects.toThrowError("'invalid.tez' is not a valid domain name.");
        });
    });
});
