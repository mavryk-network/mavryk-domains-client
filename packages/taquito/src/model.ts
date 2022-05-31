import { BigMapAbstraction, MichelsonMap } from '@taquito/taquito';
import BigNumber from 'bignumber.js';

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

export interface OracleRegistrarStorage {
    set_child_record: string;
    admin: string;
    max_timestamp_age: number;
    claim_price: BigNumber;
    treasury: string;
}

export interface ProxyStorage {
    contract: string;
}
