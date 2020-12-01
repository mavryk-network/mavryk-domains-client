import { randomInt } from 'crypto';

export function generateNonce(): number {
    if (typeof process != 'undefined' && typeof process.pid == 'number' && process.versions && process.versions.node) {
        return randomInt(0xFFFFFFFFFFFF);
    } else {
        return window.crypto.getRandomValues(new Uint32Array(1))[0];
    }
}
