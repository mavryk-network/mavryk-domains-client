import { MichelsonMap } from '@taquito/taquito';

import { isTezosAddress, isTimestamp } from './check';

export function encodeString(str: string) {
    var result = '';
    var encoded = new TextEncoder().encode(str);
    for (let i = 0; i < encoded.length; i++) {
        let hexchar = encoded[i].toString(16);
        result += hexchar.length == 2 ? hexchar : '0' + hexchar;
    }
    return result;
}

export function decodeString(hexString: string) {
    return new TextDecoder().decode(hexToArray(hexString));
}

export function hexToArray(hexString: string) {
    return new Uint8Array(hexString.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
}

export function toRpcData(parameters: any) {
    if (!parameters) {
        return null;
    } else if (typeof parameters === 'object') {
        return Object.keys(parameters).reduce((a, k) => {
            if (parameters.hasOwnProperty(k)) {
                a[k] = toRpcParameter(parameters[k]);
            }

            return a;
        }, {} as { [key: string]: any });
    } else {
        return toRpcParameter(parameters);
    }
}

function toRpcParameter(parameter: any) {
    switch (typeof parameter) {
        case 'string':
            if (isTezosAddress(parameter)) {
                return parameter;
            }

            return encodeString(parameter);
        case 'object':
            if (parameter === null) {
                return null;
            }

            const map = new MichelsonMap();
            Object.keys(parameter).forEach(k => map.set(k, toRpcParameter(parameter[k])));

            return map;
    }

    return parameter || null;
}

export function fromRpcData(parameter: any) {
    switch (typeof parameter) {
        case 'string':
            if (isTezosAddress(parameter)) {
                return parameter;
            }

            if (isTimestamp(parameter)) {
                return new Date(parameter);
            }

            return decodeString(parameter);
        case 'object':
            if (parameter === null) {
                return null;
            }

            return parameter;
    }

    return parameter || null;
}
