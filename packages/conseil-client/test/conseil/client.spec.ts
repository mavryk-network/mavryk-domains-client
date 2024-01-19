jest.mock('conseiljs');

import { Tracer, RpcRequestData, BytesEncoder } from '@mavrykdynamics/mavryk-domains-core';
import { TezosNodeReader, TezosMessageUtils } from 'conseiljs';
import { mock, instance, when, anything } from 'ts-mockito';
import FakePromise from 'fake-promise';

import { ConseilClient } from '../../src/conseil/client';
import { ConseilConfig } from '../../src/model';

describe('ConseilClient', () => {
    let client: ConseilClient;
    let tracerMock: Tracer;
    let config: ConseilConfig;
    let getContractStorageMock: jest.Mock;
    let getValueForBigMapKeyMock: jest.Mock;
    let writePackedDataMock: jest.Mock;
    let encodeBigMapKeyMock: jest.Mock;
    let bigMapGet: FakePromise<any>;

    let storage: { prim: 'Pair'; args: [] };

    beforeEach(() => {
        tracerMock = mock<Tracer>();
        bigMapGet = new FakePromise();

        config = { server: 'https://rpc.io' };

        when(tracerMock.trace(anything(), anything()));

        getContractStorageMock = TezosNodeReader.getContractStorage as jest.Mock;
        getValueForBigMapKeyMock = TezosNodeReader.getValueForBigMapKey as jest.Mock;
        writePackedDataMock = TezosMessageUtils.writePackedData as jest.Mock;
        encodeBigMapKeyMock = TezosMessageUtils.encodeBigMapKey as jest.Mock;

        getContractStorageMock.mockResolvedValue(storage);
        getValueForBigMapKeyMock.mockReturnValue(bigMapGet);

        writePackedDataMock.mockReturnValue('6262');
        encodeBigMapKeyMock.mockReturnValue('encoded');

        client = new ConseilClient(config, instance(tracerMock));
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('storage()', () => {
        it('should return contract storage', async () => {
            const result = client.storage('KT1xxx');

            expect(getContractStorageMock).toHaveBeenCalledWith('https://rpc.io', 'KT1xxx');

            await expect(result).resolves.toBe(storage);
        });

        it('should get storage from cache', async () => {
            const result1 = await client.storage('KT1xxx');
            const result2 = await client.storage('KT1xxx');

            expect(getContractStorageMock).toHaveBeenCalledTimes(1);

            expect(result1).toBe(result2);
        });

        it('should get fresh storage if parameter is specified', async () => {
            const result1 = await client.storage('KT1xxx');
            const result2 = await client.storage('KT1xxx', true);

            expect(getContractStorageMock).toHaveBeenCalledTimes(2);
            expect(result1).toBe(result2);
        });
    });

    describe('getBigMapValue()', () => {
        it('should get value from bigmap', async () => {
            const promise = client.getBigMapValue(1, RpcRequestData.fromValue('aa', BytesEncoder), 'bytes');

            expect(writePackedDataMock).toHaveBeenCalledWith('6161', 'bytes');
            expect(encodeBigMapKeyMock).toHaveBeenCalledWith(expect.any(Buffer));
            const buffer = encodeBigMapKeyMock.mock.calls[0][0] as Buffer;
            expect(buffer.toString()).toBe('bb');
            expect(getValueForBigMapKeyMock).toHaveBeenCalledWith('https://rpc.io', 1, 'encoded');

            bigMapGet.resolve('value');

            const value = await promise;
            expect(value).toBe('value');
        });
    });
});
