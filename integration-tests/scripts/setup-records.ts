import { TezosToolkit } from '@taquito/taquito';
import { InMemorySigner, importKey } from '@taquito/signer';
import { getLabel, getTld } from '@tezos-domains/core';
import { TezosDomainsManager } from '@tezos-domains/manager';
import chalk from 'chalk';

import { DATA, FaucetWallet, CONFIG } from '../data';

/**
 * Setup integration test data on carthagenet
 */
let manager: TezosDomainsManager;

async function setTezos(wallet: FaucetWallet | 'admin') {
    const tezos = new TezosToolkit();
    tezos.setRpcProvider(CONFIG.rpcUrl);

    if (wallet === 'admin') {
        tezos.setSignerProvider(await InMemorySigner.fromSecretKey(CONFIG.adminKey));
    } else {
        await importKey(tezos, wallet.email, wallet.password, wallet.mnemonic.join(' '), wallet.secret);
    }

    manager = new TezosDomainsManager({ tezos, network: 'carthagenet' });
}

export async function createRecord(name: string, owner: string, address: string | null, validity: Date | null): Promise<void> {
    const operation = await manager.setChildRecord({
        address,
        data: {},
        label: getLabel(name),
        owner,
        parent: getTld(name),
        validity,
    });

    await operation.confirmation();

    console.info(chalk.green(`Set record ${name}`));
}

export async function createReverseRecord(address: string, name: string | null): Promise<void> {
    const operation = await manager.claimReverseRecord({
        name,
        owner: address,
    });

    await operation.confirmation();

    console.info(chalk.green(`Set reverse record for ${address}`));
}

export async function run(): Promise<void> {
    await setTezos('admin');
    await createRecord(DATA.ok.name, DATA.ok.address, DATA.ok.address, new Date(2100, 1, 1));
    await setTezos(DATA.ok.wallet);
    await createReverseRecord(DATA.ok.address, DATA.ok.name);
    await setTezos('admin');

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
    console.error(chalk.red(`ERROR ${JSON.stringify(err)}`));
    process.exit(1);
});
