import { TezosToolkit } from '@taquito/taquito';
import { importKey } from '@taquito/signer';

import { CONFIG, TEST_WALLETS } from '../data';
import BigNumber from 'bignumber.js';

const fundWallet = {
    pkh: 'tz1YS1HsjdxcbZLfaf4zqPsoTGDBy581WUWo',
    mnemonic: [
        'notable',
        'creek',
        'announce',
        'holiday',
        'pact',
        'blush',
        'broccoli',
        'car',
        'debris',
        'setup',
        'lyrics',
        'powder',
        'liquid',
        'expand',
        'clip',
    ],
    email: 'rdofsats.zuofcjym@teztnets.xyz',
    password: '5O9UbsOaxC',
    amount: '3596748010',
    activation_code: 'd66e24dd4ba64902db6c9755fb70a5bc1b1f8ef0',
}; // Paste faucet json here

async function run() {
    try {
        const tezos = new TezosToolkit(CONFIG.rpcUrl);

        for (const wallet of TEST_WALLETS) {
            await importKey(tezos, wallet.email, wallet.password, wallet.mnemonic.join(' '), wallet.secret);

            const balance = (await tezos.tz.getBalance(wallet.pkh)).toNumber();

            console.log(wallet.pkh, balance);
        }

        await importKey(tezos, fundWallet.email, fundWallet.password, fundWallet.mnemonic.join(' '), fundWallet.activation_code);

        const balance = await tezos.rpc.getBalance(fundWallet.pkh);

        const share = balance.minus(500000).dividedBy(TEST_WALLETS.length).decimalPlaces(0, BigNumber.ROUND_FLOOR).toNumber();

        const batch = tezos.contract.batch();

        TEST_WALLETS.forEach(w => batch.withTransfer({ to: w.pkh, amount: share, mutez: true }));

        const op = await batch.send();

        await op.confirmation();

        console.log(`Transferred ${share / 1e6} XTZ to each of the ${TEST_WALLETS.length} bot addresses.`);
    } catch (err) {
        console.error(err);
    }
}

void run();
