import type { randomInt as randomIntType } from 'crypto';

export function generateNonce(): number {
    if (typeof process != 'undefined' && typeof process.pid == 'number' && process.versions && process.versions.node) {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const randomInt : typeof randomIntType = require('crypto').randomInt;
        return randomInt(0xFFFFFFFFFFFF);
    } else {
        return window.crypto.getRandomValues(new Uint32Array(1))[0];
    }
}
