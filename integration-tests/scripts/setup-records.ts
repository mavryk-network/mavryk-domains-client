import { TezosToolkit } from '@taquito/taquito';
import { InMemorySigner, importKey } from '@taquito/signer';
import { getLabel, getTld, RecordMetadata, StandardRecordMetadataKey } from '@tezos-domains/core';
import { TezosDomainsClient } from '@tezos-domains/client';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';

import { FaucetWallet, CONFIG, DATA } from '../data';

/**
 * Setup integration test data on specified network
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

    client = new TezosDomainsClient({ tezos, network: CONFIG.network });
}

export async function createRecord(name: string, owner: string, address: string | null, expiry: Date | null, data?: RecordMetadata): Promise<void> {
    const operation = await client.manager.setChildRecord({
        address,
        data: data || new RecordMetadata(),
        label: getLabel(name),
        owner,
        parent: getTld(name),
        expiry,
    });

    await operation.confirmation();

    console.info(chalk.green(`Set record ${name}`));
}

export async function createReverseRecord(address: string, name: string | null, data?: RecordMetadata): Promise<void> {
    const operation = await client.manager.claimReverseRecord({
        name,
        owner: address,
        data: data || new RecordMetadata(),
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
    okMetadata.setJson(StandardRecordMetadataKey.TTL, 420);
    await createRecord(DATA.ok.name, DATA.ok.address, DATA.ok.address, new Date(2100, 1, 1), okMetadata);

    await setTezos(DATA.ok.wallet);

    const okReverseMetadata = new RecordMetadata();
    okReverseMetadata.setJson(StandardRecordMetadataKey.TTL, 69);
    await createReverseRecord(DATA.ok.address, DATA.ok.name, okReverseMetadata);

    await setTezos('admin');
    await commit(`commit.${client.validator.supportedTLDs[0]}`, CONFIG.adminAddress);
    const commitment = await client.manager.getCommitment(client.validator.supportedTLDs[0], { label: 'commit', owner: CONFIG.adminAddress });
    await writeData('commitment', commitment);

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

async function writeData(section: string, data: any) {
    const dataFile = path.join(__dirname, '../test/data.json');
    let db: any = {};
    if (fs.existsSync(dataFile)) {
        db = await fs.readJSON(dataFile);
    }

    if (!db[CONFIG.network]) {
        db[CONFIG.network] = {};
    }

    db[CONFIG.network][section] = data;

    await fs.writeJSON(dataFile, db);
}

void run().catch(err => {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    console.error(chalk.red(`ERROR ${err.message} ${JSON.stringify(err)}`));
    process.exit(1);
});
