import {
    MavrykDomainsResolverDataProvider,
    AddressBook,
    Tracer,
    DomainInfo,
    SmartContractType,
    RpcRequestData,
    BytesEncoder,
    ReverseRecordDomainInfo,
} from '@mavrykdynamics/mavryk-domains-core';
import { TaquitoClient } from '@mavrykdynamics/mavryk-domains-taquito';

import { TaquitoDomainInfoResponse } from './model';

export class TaquitoMavrykDomainsResolverDataProvider implements MavrykDomainsResolverDataProvider {
    constructor(private tezos: TaquitoClient, private addressBook: AddressBook, private tracer: Tracer) {}

    async resolveDomainInfo(name: string): Promise<DomainInfo | null> {
        this.tracer.trace(`=> Getting record '${name}'.`);

        const address = await this.addressBook.lookup(SmartContractType.NameRegistry);
        const result = await this.tezos.executeView(address, 'resolve-name', [RpcRequestData.fromValue(name, BytesEncoder).encode()]);

        const record = result.decode(TaquitoDomainInfoResponse);

        this.tracer.trace(`<= Received record.`, record);

        return record;
    }

    async resolveReverseRecordDomainInfo(address: string): Promise<ReverseRecordDomainInfo | null> {
        this.tracer.trace(`=> Getting reverse record '${address}'`);

        const contractAddress = await this.addressBook.lookup(SmartContractType.NameRegistry);
        const result = await this.tezos.executeView(contractAddress, 'resolve-address', [address]);

        const reverseRecordDomain = result.decode(TaquitoDomainInfoResponse);

        this.tracer.trace(`<= Received reverse record.`, reverseRecordDomain);

        if (!reverseRecordDomain) {
            return null;
        }

        return reverseRecordDomain as ReverseRecordDomainInfo;
    }
}
