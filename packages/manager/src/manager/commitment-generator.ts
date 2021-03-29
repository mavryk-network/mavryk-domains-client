import { RpcRequestData, Exact, hexToArray } from '@tezos-domains/core';
import { Schema } from '@taquito/michelson-encoder';
import { MichelsonType, packDataBytes } from '@taquito/michel-codec';
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

    generate(parameters: Exact<CommitmentRequest>): string {
        const encodedRequest = RpcRequestData.fromObject(CommitmentRequest, parameters).encode();
        const data = this.commitmentSchema.Encode(encodedRequest);

        const packed = packDataBytes(data, commitmentSchemaExpression as MichelsonType).bytes;

        return new sha512().update(hexToArray(packed)).digest('hex');
    }
}
