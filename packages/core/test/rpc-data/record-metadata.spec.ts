import { RecordMetadata, JsonBytesEncoder } from '@tezos-domains/core';

describe('RecordMetadata', () => {
    let metadata: RecordMetadata;

    beforeEach(() => {
        metadata = new RecordMetadata();
    });

    it('should create metadata from existing data', () => {
        const newMetadata = new RecordMetadata({
            a: '2276616c22',
        });

        expect(newMetadata.get('a', JsonBytesEncoder)).toBe('val');
    });

    describe('ttl', () => {
        it('should set ttl', () => {
            metadata.ttl = 1;

            expect(metadata.ttl).toBe(1);
            expect(metadata.raw()['ttl']).toBe('31');
        });
    });
});
