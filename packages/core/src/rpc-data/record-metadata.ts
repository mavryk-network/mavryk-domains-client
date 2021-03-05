import { TypedRpcDataEncoder } from './data-encoder';
import { Constructable } from '../utils/types';
import { RpcResponseData } from './rpc-response-data';
import { RpcRequestScalarData } from './rpc-request-data';
import { JsonBytesEncoder } from './encoders/json-bytes-encoder';

export enum StandardRecordMetadataKey {
    TTL = 'td:ttl',
    GRAVATAR_HASH = 'gravatar:hash',
    OPENID_SUB = 'openid:sub',
    OPENID_NAME = 'openid:name',
    OPENID_GIVEN_NAME = 'openid:given_name',
    OPENID_FAMILY_NAME = 'openid:family_name',
    OPENID_MIDDLE_NAME = 'openid:middle_name',
    OPENID_NICKNAME = 'openid:nickname',
    OPENID_PREFERRED_USERNAME = 'openid:preferred_username',
    OPENID_PROFILE = 'openid:profile',
    OPENID_PICTURE = 'openid:picture',
    OPENID_WEBSITE = 'openid:website',
    OPENID_EMAIL = 'openid:email',
    OPENID_EMAIL_VERIFIED = 'openid:email_verified',
    OPENID_GENDER = 'openid:gender',
    OPENID_BIRTHDATE = 'openid:birthdate',
    OPENID_ZONEINFO = 'openid:zoneinfo',
    OPENID_LOCALE = 'openid:locale',
    OPENID_PHONE_NUMBER = 'openid:phone_number',
    OPENID_PHONE_NUMBER_VERIFIED = 'openid:phone_number_verified',
    OPENID_ADDRESS = 'openid:address',
    TWITTER = 'twitter:handle',
    INSTAGRAM = 'instagram:handle',
    GITHUB_PROFILE = 'github:username',
    GITLAB_PROFILE = 'gitlab:username',
    REPOSITORY_URL = 'project:repository_url',
}

export class RecordMetadata {
    private data: Record<string, string>;

    constructor(data?: Record<string, string>) {
        this.data = data || {};
    }

    raw(): Record<string, string> {
        return this.data;
    }

    get<T>(key: string, encoder?: Constructable<TypedRpcDataEncoder<T, unknown>>): T | null {
        return new RpcResponseData(this.data[key]).scalar(encoder);
    }

    getJson<T>(key: string): T | null {
        return this.get(key, JsonBytesEncoder);
    }

    set<T>(key: string, value: T, encoder?: Constructable<TypedRpcDataEncoder<T, string>>): void {
        const encodedValue = RpcRequestScalarData.fromValue(value, encoder).encode();
        if (encodedValue) {
            this.data[key] = encodedValue;
        } else {
            this.delete(key);
        }
    }

    delete(key: string): void {
        delete this.data[key];
    }

    setJson<T>(key: string, value: T): void {
        this.set(key, value, JsonBytesEncoder);
    }

    keys(): string[] {
        return Object.keys(this.data);
    }
}
