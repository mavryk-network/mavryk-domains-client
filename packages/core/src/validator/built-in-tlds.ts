import { LatinDomainNameValidator } from './validators';

export const BuiltInTLDs = {
    mainnet: [{ name: 'tez', validator: LatinDomainNameValidator }],
    hangzhounet: [
        { name: 'han', validator: LatinDomainNameValidator },
        { name: 'a1', validator: LatinDomainNameValidator },
        { name: 'a2', validator: LatinDomainNameValidator },
        { name: 'a3', validator: LatinDomainNameValidator },
    ],
    ithacanet: [
        { name: 'ith', validator: LatinDomainNameValidator },
        { name: 'a1', validator: LatinDomainNameValidator },
        { name: 'a2', validator: LatinDomainNameValidator },
        { name: 'a3', validator: LatinDomainNameValidator },
    ],
    custom: null,
};
