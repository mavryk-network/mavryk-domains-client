import { RecordMetadata, JsonBytesEncoder, StandardRecordMetadataKey } from '@mavrykdynamics/mavryk-domains-core';

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

    describe('setJson()', () => {
        it('should set value', () => {
            metadata.setJson(StandardRecordMetadataKey.TTL, 1);

            expect(metadata.getJson(StandardRecordMetadataKey.TTL)).toBe(1);
            expect(metadata.raw()[StandardRecordMetadataKey.TTL]).toBe('31');
        });
    });

    describe('delete()', () => {
        it('should delete value', () => {
            metadata.setJson(StandardRecordMetadataKey.TTL, 1);

            expect(metadata.getJson(StandardRecordMetadataKey.TTL)).toBe(1);

            metadata.delete(StandardRecordMetadataKey.TTL);

            expect(metadata.getJson(StandardRecordMetadataKey.TTL)).toBeNull();
        });
    });

    describe('set()', () => {
        it('should delete when value is null', () => {
            metadata.setJson(StandardRecordMetadataKey.TTL, 1);

            expect(metadata.getJson(StandardRecordMetadataKey.TTL)).toBe(1);

            metadata.set(StandardRecordMetadataKey.TTL, null);

            expect(metadata.getJson(StandardRecordMetadataKey.TTL)).toBeNull();
        });
    });

    describe('keys()', () => {
        it('should return all keys', () => {
            metadata.setJson(StandardRecordMetadataKey.TTL, 1);
            metadata.set('someKey', 'hello');

            expect(metadata.keys()).toEqual([StandardRecordMetadataKey.TTL, 'someKey']);
        });
    });
});
