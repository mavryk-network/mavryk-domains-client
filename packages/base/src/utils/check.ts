import { validateAddress, ValidationResult } from '@taquito/utils';

export function isTezosAddress(address: string) {
    const result = validateAddress(address);

    return result === ValidationResult.VALID;
}

export function isTimestamp(str: string) {
    return /\d\d\d\d-\d\d-\d\dT\d\d:\d\d:\d\d.\d\d\dZ/.test(str);
}

