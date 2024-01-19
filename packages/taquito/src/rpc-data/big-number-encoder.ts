import BigNumber from 'bignumber.js';
import { TypedRpcDataEncoder } from '@mavrykdynamics/mavryk-domains-core';


export class BigNumberEncoder implements TypedRpcDataEncoder<number, BigNumber> {
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
