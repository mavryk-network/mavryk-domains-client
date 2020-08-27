import { TezosToolkit } from '@taquito/taquito';
import { InMemorySigner, importKey } from '@taquito/signer';
import { getLabel, getTld, RecordMetadata } from '@tezos-domains/core';
import { TezosDomainsClient } from '@tezos-domains/client';
import chalk from 'chalk';

import { FaucetWallet, CONFIG, DATA } from '../data';

/**
 * Setup integration test data on carthagenet
 */
let client: TezosDomainsClient;

async function setTezos(wallet: FaucetWallet | 'admin') {
    const tezos = new TezosToolkit();
    tezos.setProvider({
        rpc: CONFIG.rpcUrl,
        config: {
            confirmationPollingIntervalSecond: 5,
        },
    });

    if (wallet === 'admin') {
        tezos.setSignerProvider(await InMemorySigner.fromSecretKey(CONFIG.adminKey));
    } else {
        await importKey(tezos, wallet.email, wallet.password, wallet.mnemonic.join(' '), wallet.secret);
    }

    client = new TezosDomainsClient({ tezos, network: 'carthagenet' });
}

export async function createRecord(name: string, owner: string, address: string | null, validity: Date | null, data?: RecordMetadata): Promise<void> {
    const operation = await client.manager.setChildRecord({
        address,
        data: data || new RecordMetadata(),
        label: getLabel(name),
        owner,
        parent: getTld(name),
        validity,
    });

    await operation.confirmation();

    console.info(chalk.green(`Set record ${name}`));
}

export async function createReverseRecord(address: string, name: string | null): Promise<void> {
    const operation = await client.manager.claimReverseRecord({
        name,
        owner: address,
    });

    await operation.confirmation();

    console.info(chalk.green(`Set reverse record for ${address}`));
}

export async function commit(name: string, owner: string): Promise<void> {
    const operation = await client.manager.commit(getTld(name), { label: getLabel(name), owner });

    await operation.confirmation();

    console.info(chalk.green(`Created commitment for ${name}`));
}

export async function run(): Promise<void> {
    await setTezos('admin');

    const okMetadata = new RecordMetadata();
    okMetadata.ttl = 420;
    await createRecord(DATA.ok.name, DATA.ok.address, DATA.ok.address, new Date(2100, 1, 1), okMetadata);
    await setTezos(DATA.ok.wallet);
    await createReverseRecord(DATA.ok.address, DATA.ok.name);
    await setTezos('admin');
    await commit('commit.tez', CONFIG.adminAddress);

    await createRecord(DATA.expired.name, DATA.expired.address, DATA.expired.address, null);
    await setTezos(DATA.expired.wallet);
    await createReverseRecord(DATA.expired.address, DATA.expired.name);
    await setTezos('admin');
    await createRecord(DATA.expired.name, DATA.expired.address, DATA.expired.address, new Date(2019, 1, 1));

    await createRecord(DATA.noExpiration.name, DATA.noExpiration.address, DATA.noExpiration.address, null);
    await setTezos(DATA.noExpiration.wallet);
    await createReverseRecord(DATA.noExpiration.address, DATA.noExpiration.name);
    await setTezos('admin');

    await createRecord(DATA.emptyAddress.name, CONFIG.adminAddress, DATA.emptyAddress.address, new Date(2100, 1, 1));

    await setTezos(DATA.emptyReverseRecord.wallet);
    await createReverseRecord(DATA.emptyReverseRecord.address, DATA.emptyReverseRecord.name);
}

void run().catch(err => {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    console.error(chalk.red(`ERROR ${err.message} ${JSON.stringify(err)}`));
    process.exit(1);
});
