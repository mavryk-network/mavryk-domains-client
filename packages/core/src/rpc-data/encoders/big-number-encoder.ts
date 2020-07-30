import BigNumber from 'bignumber.js';

import { TypedRpcDataEncoder } from '../data-encoder';

export class BigNumberEncoder extends TypedRpcDataEncoder<number, BigNumber> {
    encode(value: number | null): BigNumber | null {
        if (!value) {
            return null;
        }

        return new BigNumber(value);
    }

    decode(value: BigNumber | null): number | null {
        if (!value) {
            return null;
        }

        return value.toNumber();
    }
}
