import isPlainObject from 'lodash.isplainobject';

/**
 * Transforms responses like:
 *
 * {Some: {address:{Some: 'tz1...'}}} => {address: 'tz1...'}
 *
 * Avoids any class like object in order to avoid chainging BigNumber, MichelsonMap, etc...
 *
 * @return {*}  {unknown}
 */
export function cleanupResponse(input: any): unknown {
    if (!input || !isPlainObject(input)) {
        return input;
    }

    if ('Some' in input) {
        return cleanupResponse(input['Some']);
    }

    const output: any = {};

    for (const key of Object.keys(input)) {
        const value = input[key];
        output[key] = cleanupResponse(value);
    }

    return output;
}
