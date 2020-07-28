import { Constructable } from "../utils/types";
import { RpcDataEncoder } from "./data-encoder";

const rpcTypes = new Map<unknown, 'request' | 'response'>();

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

export function encoder(encoder: Constructable<RpcDataEncoder>): (target: any, propertyKey: string) => void {
    return function (target: any, propertyKey: string) {
        let value: unknown;
        const encoderInstance = new encoder();
        const getter = function () {
            return value;
        };
        const setter = function (newVal: unknown) {
            const type = rpcTypes.get(target.constructor);
            if (!type) {
                throw new Error('In order to use encoder() decorator, the class must be decorated with either RpcRequest() or RpcResponse()');
            }

            value = type === 'request' ? encoderInstance.encode(newVal) : encoderInstance.decode(newVal);
        };

        Object.defineProperty(target, propertyKey, {
            get: getter,
            set: setter,
        });
    };
}