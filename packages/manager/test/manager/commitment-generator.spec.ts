import { TezosToolkit } from '@taquito/taquito';
import { RpcClient } from '@taquito/rpc';
import { CommitmentGenerator } from '@tezos-domains/manager';
import { mock, instance, when, anything } from 'ts-mockito';

describe('CommitmentGenerator', () => {
    let generator: CommitmentGenerator;
    let tezosToolkitMock: TezosToolkit;
    let rpcClientMock: RpcClient;

    beforeEach(() => {
        tezosToolkitMock = mock(TezosToolkit);
        rpcClientMock = mock<RpcClient>();

        when(tezosToolkitMock.rpc).thenReturn(instance(rpcClientMock));
        when(rpcClientMock.packData(anything())).thenResolve({ packed: 'packed' } as any);

        generator = new CommitmentGenerator();
    });

    describe('generate()', () => {
        it('generate commitment hash', () => {
            const commitment = generator.generate({ label: 'commit', owner: 'tz1VxMudmADssPp6FPDGRsvJXE41DD6i9g6n', nonce: 491919002 });

            expect(commitment).toBe(
                '7b90cd2abd2ca06e4349e63e1913f7f25351cc1ac432cafc24033941fbfb88f40c91386b2449e33aac7a3b99e9be37da70270138cb06db702a92243874324913'
            );
        });
    });
});
