import { TezosToolkit } from '@taquito/taquito';
import { importKey } from '@taquito/signer';

import { CONFIG, TEST_WALLETS } from '../data';
import BigNumber from 'bignumber.js';

const fundWallet = {
    pkh: 'tz1Uio2cVPWdyByZ3RUyTJ4Fm8fvo6RXLNxN',
    mnemonic: [
        'member',
        'noise',
        'myself',
        'muscle',
        'garden',
        'normal',
        'air',
        'stick',
        'yellow',
        'midnight',
        'sport',
        'throw',
        'coconut',
        'remind',
        'private',
    ],
    email: 'axlctyoj.cgccmcmp@teztnets.xyz',
    password: 'GFVHLrWHwc',
    amount: '94431585355',
    activation_code: '821e53695e1b9b34840c7aaf9b768516e75bf474',
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
