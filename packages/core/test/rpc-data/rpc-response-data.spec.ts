import { encoder, RpcResponse, RpcResponseData } from '@mavrykdynamics/mavryk-domains-core';
import { FakeEncoder } from './fake-encoder';

class SomeClass {
    /**
     *
     */
    constructor(public val: number) {}

    method() {
        return -1;
    }
}

@RpcResponse()
class FakeResponse {
    prop1!: string;
    value: SomeClass | null | undefined;
    @encoder(FakeEncoder) prop2!: string;
}

class InvalidFakeResponse {
    @encoder(FakeEncoder) prop!: string;
}

const responseTests = [
    {
        input: {},
        expected: {},
    },
    {
        input: null,
        expected: null,
    },
    {
        input: undefined,
        expected: null,
    },
    {
        input: { prop1: { Some: 'mv1...' } },
        expected: { prop1: 'mv1...' },
    },
    {
        input: { prop1: { Some: 'mv1...' }, value: new SomeClass(12), prop2: 'some-name' },
        expected: { prop1: 'mv1...', value: new SomeClass(12), prop2: 'some-namedecoded' },
    },
    {
        input: { Some: { prop1: { Some: 'mv1...' }, value: null, prop2: { Some: 'some-name' } } },
        expected: { prop1: 'mv1...', value: null, prop2: 'some-namedecoded' },
    },
    {
        input: { Some: { value: { Some: new SomeClass(12) }, prop2: { Some: 'some-name' } } },
        expected: { value: new SomeClass(12), prop2: 'some-namedecoded' },
    },
];

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
        responseTests.forEach(({ input, expected }, index) => {
            it(`should create response data for case: ${index}`, () => {
                const response = new RpcResponseData(input).decode(FakeResponse)!;

                expect(response?.prop1).toEqual(expected?.prop1);
                expect(response?.prop2).toEqual(expected?.prop2);
                expect(response?.value).toEqual(expected?.value);

                if (response?.value) {
                    // eslint-disable-next-line jest/no-conditional-expect
                    expect(response.value.method()).toBe(-1);
                }
            });
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
