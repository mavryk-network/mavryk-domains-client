import { TezosToolkit } from '@taquito/taquito';
import { RpcClient } from '@taquito/rpc';
import { CommitmentGenerator } from '@tezos-domains/manager';
import { mock, instance, when, anything, verify, deepEqual } from 'ts-mockito';

describe('CommitmentGenerator', () => {
    let generator: CommitmentGenerator;
    let tezosToolkitMock: TezosToolkit;
    let rpcClientMock: RpcClient;

    beforeEach(() => {
        tezosToolkitMock = mock(TezosToolkit);
        rpcClientMock = mock<RpcClient>();

        when(tezosToolkitMock.rpc).thenReturn(instance(rpcClientMock));
        when(rpcClientMock.packData(anything())).thenResolve({ packed: 'packed' } as any);

        generator = new CommitmentGenerator(instance(tezosToolkitMock));
    });

    describe('generate()', () => {
        it('generate commitment hash', async () => {
            const commitment = await generator.generate({ label: 'necroskillz', owner: 'tz1Q4vimV3wsfp21o7Annt64X7Hs6MXg9Wix', nonce: 1 });

            verify(
                rpcClientMock.packData(
                    deepEqual({
                        data: {
                            prim: 'Pair',
                            args: [
                                {
                                    prim: 'Pair',
                                    args: [{ bytes: '6e6563726f736b696c6c7a' }, { string: 'tz1Q4vimV3wsfp21o7Annt64X7Hs6MXg9Wix' }],
                                },
                                { int: '1' },
                            ],
                        } as any,
                        type: {
                            prim: 'pair',
                            args: [
                                {
                                    prim: 'pair',
                                    args: [
                                        {
                                            annots: ['%label'],
                                            prim: 'bytes',
                                        },
                                        {
                                            annots: ['%owner'],
                                            prim: 'address',
                                        },
                                    ],
                                },
                                {
                                    annots: ['%nonce'],
                                    prim: 'nat',
                                },
                            ],
                        } as any,
                    })
                )
            ).called();

            expect(commitment).toBe(
                '9b31726e38c385c9c72a8ddb4158c6e5c08190df5e21b43b68d5595cebe6ed9ecd2530c3b795470db267627f939ee1cc5515679bebcc3b2318f56f709cfa5031'
            );
        });
    });
});
