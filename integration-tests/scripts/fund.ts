import { TezosToolkit } from '@mavrykdynamics/taquito';
import { importKey } from '@mavrykdynamics/taquito-signer';

import { CONFIG, TEST_WALLETS } from '../data';
import BigNumber from 'bignumber.js';

const fundWallet = {
    pkh: 'mv1K3nxPsiCdNAbKi95LZGsUgdCUsbDRJbp9',
    mnemonic: ['wage', 'refuse', 'lucky', 'trigger', 'hunt', 'gold', 'trash', 'relax', 'limb', 'sunny', 'inject', 'modify', 'property', 'swear', 'tip'],
    email: 'zefklflt.wtnzugmr@teztnets.xyz',
    password: 's9iPRlkruo',
    amount: '13230302906',
    activation_code: '759f51485da86bfe72c4b28a57409eed7ba2e3a4',
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

        TEST_WALLETS.forEach(w => batch.withTransfer({ to: w.pkh, amount: share, mumav: true }));

        const op = await batch.send();

        await op.confirmation();

        console.log(`Transferred ${share / 1e6} XTZ to each of the ${TEST_WALLETS.length} bot addresses.`);
    } catch (err) {
        console.error(err);
    }
}

void run();
