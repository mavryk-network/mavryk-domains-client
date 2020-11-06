import { BuiltInAddresses } from '../address-book/built-in-addresses';

export type SupportedNetworkType = 'carthagenet' | 'delphinet' | 'custom';

// TODO: dont filter mainnet when the contracts are deployed
const SUPPORTED_NETWORKS = Object.keys(BuiltInAddresses).filter(n => n !== 'mainnet');

/**
 * Can be used for feature toggles.
 */
export function isTezosDomainsSupportedNetwork(network: string): network is SupportedNetworkType {
    return SUPPORTED_NETWORKS.includes(network);
}
