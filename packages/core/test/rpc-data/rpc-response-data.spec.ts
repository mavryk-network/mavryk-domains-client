import { encoder, RpcResponse, RpcResponseData } from '@tezos-domains/core';

import { FakeEncoder } from './fake-encoder';

@RpcResponse()
export class FakeResponse {
    prop1!: string;
    @encoder(FakeEncoder) prop2!: string;
}

export class InvalidFakeResponse {
    @encoder(FakeEncoder) prop!: string;
}

describe('RpcRequestData', () => {
    describe('scalar()', () => {
        it('should get data from response', () => {
            expect(new RpcResponseData('1').scalar()).toBe('1');
        });

        it('should decode data with specified encoder', () => {
            expect(new RpcResponseData('1').scalar(FakeEncoder)).toBe('1decoded');
        });
    });

    describe('decode()', () => {
        it('should create request data', () => {
            const response = new RpcResponseData({ prop1: 'a', prop2: 'b' }).decode(FakeResponse)!;

            expect(response.prop1).toBe('a');
            expect(response.prop2).toBe('bdecoded');
        });

        it('should return null if data is null', () => {
            const response = new RpcResponseData(null).decode(FakeResponse);

            expect(response).toBeNull();
        });

        it('should throw if class does not have RpcRequest decorator', () => {
            expect(() => new RpcResponseData({ prop: 'a' }).decode(InvalidFakeResponse)).toThrowError();
        });
    });
});
