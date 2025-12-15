import { TezosToolkit } from '@mavrykdynamics/taquito';
import { RpcClient } from '@mavrykdynamics/taquito-rpc';
import { CommitmentGenerator } from '@mavrykdynamics/mavryk-domains-manager';
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
            const commitment = generator.generate({ label: 'commit', owner: 'mv1UGYk3B88eN9AJYtomdLxAtKhFARGp8K8L', nonce: 491919002 });

            expect(commitment).toBe(
                '150e55611cbceff60400dc86c685246dd8ff05ea707f925a992b66ff5f751759c0a450b9a82f709f9d5642b581c16a2d254fa57a975a9ad01d97ac560875cc97'
            );
        });
    });
});
