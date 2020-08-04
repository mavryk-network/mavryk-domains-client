import { RpcRequestData, RpcRequest, encoder } from '@tezos-domains/core';

import { FakeEncoder } from './fake-encoder';

@RpcRequest()
class FakeRequest {
    prop1!: string;
    @encoder(FakeEncoder) prop2!: string;
}

class InvalidFakeRequest {
    @encoder(FakeEncoder) prop!: string;
}

describe('RpcRequestData', () => {
    describe('fromValue()', () => {
        it('should create request data', () => {
            expect(RpcRequestData.fromValue('1').encode()).toBe('1');
        });

        it('should encode data with specified encoder', () => {
            expect(RpcRequestData.fromValue('1', FakeEncoder).encode()).toBe('1encoded');
        });

        it('should have originalValue', () => {
            expect(RpcRequestData.fromValue('1', FakeEncoder).originalValue).toBe('1');
        });
    });

    describe('fromObject()', () => {
        it('should create request data', () => {
            const request = RpcRequestData.fromObject(FakeRequest, {
                prop1: 'a',
                prop2: 'b',
            }).encode();

            expect(request.prop1).toBe('a');
            expect(request.prop2).toBe('bencoded');
        });

        it('should have originalValue', () => {
            expect(RpcRequestData.fromObject(FakeRequest, { prop1: 'a', prop2: 'b' }).originalValue).toEqual({ prop1: 'a', prop2: 'b' });
        });

        it('should throw if class does not have RpcRequest decorator', () => {
            expect(() => RpcRequestData.fromObject(InvalidFakeRequest, { prop: 'a' }).encode()).toThrowError();
        });
    });
});
