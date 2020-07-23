import { NetworkType, ContractConfig } from "../model";

export const BuiltInProxyAddresses: { [network in NetworkType]: ContractConfig | null } = {
    mainnet: { nameRegistry: 'TODO' },
    carthagenet: { nameRegistry: 'KT1JLkXGT6q4YkyHQNvGKtJA41KVHysZ1ctU' },
    custom: null,
};
