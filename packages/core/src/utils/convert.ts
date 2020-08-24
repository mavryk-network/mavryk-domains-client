export function encodeString(str: string): string {
    let result = '';
    const encoded = new TextEncoder().encode(str);
    for (let i = 0; i < encoded.length; i++) {
        const hexchar = encoded[i].toString(16);
        result += hexchar.length == 2 ? hexchar : '0' + hexchar;
    }
    return result;
}

export function decodeString(hexString: string): string {
    return new TextDecoder().decode(hexToArray(hexString));
}

export function hexToArray(hexString: string): Uint8Array {
    return new Uint8Array(hexString.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []);
}

export function safeJsonParse(jsonString: string): unknown {
    try {
        return JSON.parse(jsonString);
    } catch {
        return null;
    }
}
