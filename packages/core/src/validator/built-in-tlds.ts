import { LatinDomainNameValidator } from './validators';

export const BuiltInTLDs = {
    mainnet: [
        { name: 'tez', validator: LatinDomainNameValidator }
    ],
    carthagenet: [
        { name: 'tez', validator: LatinDomainNameValidator }
    ],
    delphinet: [
        { name: 'tez', validator: LatinDomainNameValidator }
    ],
    custom: null,
};
