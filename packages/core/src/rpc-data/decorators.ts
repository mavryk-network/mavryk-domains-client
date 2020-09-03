import { Constructable } from '../utils/types';
import { RpcDataEncoder } from './data-encoder';

const rpcTypes = new Map<unknown, 'request' | 'response'>();
const DATA_STORAGE_PROPERTY = '__data__';

export function RpcRequest(): (target: unknown) => void {
    return function (target: unknown) {
        rpcTypes.set(target, 'request');
    };
}

export function RpcResponse(): (target: unknown) => void {
    return function (target: unknown) {
        rpcTypes.set(target, 'response');
    };
}

function ensureStorage(obj: any) {
    obj[DATA_STORAGE_PROPERTY] = obj[DATA_STORAGE_PROPERTY] || {};
}

export function encoder(encoder: Constructable<RpcDataEncoder>): (target: any, propertyKey: string) => void {
    return function (target: any, propertyKey: string) {
        const encoderInstance = new encoder();
        const getter = function (this: any) {
            ensureStorage(this);
            return this[DATA_STORAGE_PROPERTY][propertyKey];
        };
        const setter = function (this: any, newVal: unknown) {
            ensureStorage(this);

            const type = rpcTypes.get(target.constructor);
            if (!type) {
                throw new Error('In order to use encoder() decorator, the class must be decorated with either RpcRequest() or RpcResponse()');
            }

            this[DATA_STORAGE_PROPERTY][propertyKey] = type === 'request' ? encoderInstance.encode(newVal) : encoderInstance.decode(newVal);
        };

        Object.defineProperty(target, propertyKey, {
            get: getter,
            set: setter,
        });
    };
}
