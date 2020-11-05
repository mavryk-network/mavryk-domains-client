export type SupportedNetworkType = 'carthagenet' | 'delphinet' | 'custom';

const SUPPORTED_NETWORKS = ['carthagenet', 'delphinet', 'custom'];

/**
 * Can be used for feature toggles.
 */
export function isTezosDomainsSupportedNetwork(network: string): network is SupportedNetworkType {
    return SUPPORTED_NETWORKS.includes(network);
}
