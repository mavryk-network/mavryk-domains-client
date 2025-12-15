import { BuiltInAddresses } from '../address-book/built-in-addresses';

export type SupportedNetworkType = 'mainnet' | 'basenet';

const SUPPORTED_NETWORKS = Object.keys(BuiltInAddresses).filter(n => n !== 'custom');

/**
 * Can be used for feature toggles.
 */
export function isMavrykDomainsSupportedNetwork(network: string): network is SupportedNetworkType {
    return SUPPORTED_NETWORKS.includes(network);
}
