import { BigMapAbstraction, MichelsonMap } from "@taquito/taquito";

export interface NameRegistryStorage {
    actions: BigMapAbstraction;
    store: {
        records: BigMapAbstraction;
        reverse_records: BigMapAbstraction;
        expiry_map: BigMapAbstraction;
        owner: string;
        validators: string[];
    };
    trusted_senders: string[];
}

export interface TLDRegistrarStorage {
    store: {
        records: BigMapAbstraction;
        commitments: BigMapAbstraction;
        bidder_balances: BigMapAbstraction;
        auctions: BigMapAbstraction;
        owner: string;
        enabled: boolean;
        config: MichelsonMap<string, any>;
    };
    trusted_senders: string[];
}

export interface ProxyStorage {
    contract: string;
}
