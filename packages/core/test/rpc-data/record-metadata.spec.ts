import { RecordMetadata, JsonBytesEncoder, StandardRecordMetadataKey } from '@tezos-domains/core';

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

    describe('setJson', () => {
        it('should set value', () => {
            metadata.setJson(StandardRecordMetadataKey.TTL, 1);

            expect(metadata.getJson(StandardRecordMetadataKey.TTL)).toBe(1);
            expect(metadata.raw()[StandardRecordMetadataKey.TTL]).toBe('31');
        });
    });
});
