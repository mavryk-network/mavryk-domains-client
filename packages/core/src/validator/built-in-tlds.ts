import { LatinDomainNameValidator } from './validators';

export const BuiltInTLDs = {
    mainnet: [{ name: 'mav', validator: LatinDomainNameValidator }],
    basenet: [
        { name: 'bas', validator: LatinDomainNameValidator },
        { name: 'a1', validator: LatinDomainNameValidator },
        { name: 'a2', validator: LatinDomainNameValidator },
        { name: 'a3', validator: LatinDomainNameValidator },
    ],
    custom: null,
};
