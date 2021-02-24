import { BuiltInAddresses } from '../address-book/built-in-addresses';

export type SupportedNetworkType = 'edonet';

// TODO: dont filter mainnet when the contracts are deployed
const SUPPORTED_NETWORKS = Object.keys(BuiltInAddresses).filter(n => n !== 'mainnet' && n !== 'custom');

/**
 * Can be used for feature toggles.
 */
export function isTezosDomainsSupportedNetwork(network: string): network is SupportedNetworkType {
    return SUPPORTED_NETWORKS.includes(network);
}
