import { TezosToolkit } from '@taquito/taquito';
import { Schema } from '@taquito/michelson-encoder';
import { sha512 } from 'sha.js';

import { CommitmentRequest } from './model';
import { RpcRequestData, Exact, hexToArray } from '@tezos-domains/core';

const commitmentSchemaExpression = {
    prim: 'pair',
    args: [
        {
            prim: 'bytes',
            annots: ['%label'],
        },
        {
            prim: 'address',
            annots: ['%owner'],
        },
    ],
};

export class CommitmentGenerator {
    private commitmentSchema = new Schema(commitmentSchemaExpression);

    constructor(private tezos: TezosToolkit) {}

    async generate(paramenters: Exact<CommitmentRequest>): Promise<string> {
        const encodedRequest = RpcRequestData.fromObject(CommitmentRequest, paramenters).encode();
        const data = this.commitmentSchema.Encode(encodedRequest);

        const packed = await this.tezos.rpc.packData({ data, type: commitmentSchemaExpression });

        return new sha512().update(hexToArray(packed.packed)).digest('hex');
    }
}
