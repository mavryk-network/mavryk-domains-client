import { LatinDomainNameValidator } from './validators';

export const BuiltInTLDs = {
    mainnet: [
        { name: 'tez', validator: LatinDomainNameValidator }
    ],
    delphinet: [
        { name: 'delphi', validator: LatinDomainNameValidator },
        { name: 'a1', validator: LatinDomainNameValidator },
        { name: 'a2', validator: LatinDomainNameValidator },
        { name: 'a3', validator: LatinDomainNameValidator },
    ],
    custom: null,
};
