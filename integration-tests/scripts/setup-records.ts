import { TezosToolkit, MichelsonMap } from '@taquito/taquito';
import { InMemorySigner, importKey } from '@taquito/signer';
import { Schema } from '@taquito/michelson-encoder';
import { BytesEncoder, getLabel, getTld, AddressBook, SmartContractType } from '@tezos-domains/core';
import chalk from 'chalk';

import { DATA, FaucetWallet, CONFIG } from '../data';

/**
 * Setup integration test data on carthagenet
 */
const addressBook = new AddressBook({ network: 'carthagenet' });
let tezos: TezosToolkit;

async function setTezos(wallet: FaucetWallet | 'admin') {
    tezos = new TezosToolkit();
    tezos.setRpcProvider(CONFIG.rpcUrl);

    if (wallet === 'admin') {
        tezos.setSignerProvider(await InMemorySigner.fromSecretKey(CONFIG.adminKey));
    } else {
        await importKey(tezos, wallet.email, wallet.password, wallet.mnemonic.join(' '), wallet.secret);
    }
}

function encodeString(s: string | null) {
    return new BytesEncoder().encode(s);
}

async function call(endpoint: string, parameters: any) {
    try {
        const address = addressBook.lookup(SmartContractType.NameRegistry, endpoint);
        const entrypoints = await tezos.rpc.getEntrypoints(address);
        const schema = new Schema(entrypoints.entrypoints[endpoint]);
        const value = schema.Encode(parameters);

        const op = await tezos.contract.transfer({
            to: address,
            amount: 0,
            parameter: {
                entrypoint: endpoint,
                value,
            },
        });

        await op.confirmation();
    } catch (err) {
        console.error(chalk.red(`Call to ${endpoint} with ${JSON.stringify(parameters)} failed with ${JSON.stringify(err)}`));
        process.exit(1);
    }
}

export async function createRecord(name: string, owner: string, address: string | null, validity: Date | null): Promise<void> {
    await call('set_child_record', {
        address,
        data: new MichelsonMap(),
        label: encodeString(getLabel(name)),
        owner,
        parent: encodeString(getTld(name)),
        validity: validity ? validity.toISOString() : null,
    });

    console.info(chalk.green(`Set record ${name}`));
}

export async function createReverseRecord(address: string, name: string | null): Promise<void> {
    await call('claim_reverse_record', {
        name: encodeString(name),
        owner: address,
    });

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

void run();
