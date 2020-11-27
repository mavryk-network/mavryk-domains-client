import { RpcRequestData, Exact, hexToArray } from '@tezos-domains/core';
import { TezosToolkit } from '@taquito/taquito';
import { Schema } from '@taquito/michelson-encoder';
import { sha512 } from 'sha.js';

import { CommitmentRequest } from './model';

const commitmentSchemaExpression = {
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
        }
    ],
};

export class CommitmentGenerator {
    private commitmentSchema = new Schema(commitmentSchemaExpression);

    constructor(private tezos: TezosToolkit) {}

    async generate(parameters: Exact<CommitmentRequest>): Promise<string> {
        const encodedRequest = RpcRequestData.fromObject(CommitmentRequest, parameters).encode();
        const data = this.commitmentSchema.Encode(encodedRequest);

        const packed = await this.tezos.rpc.packData({ data, type: commitmentSchemaExpression });

        return new sha512().update(hexToArray(packed.packed)).digest('hex');
    }
}
