import { TezosToolkit } from '@taquito/taquito';
import { importKey } from '@taquito/signer';

import { CONFIG, FaucetWallet, TEST_WALLETS } from '../data';

const fundWallet: FaucetWallet = {
    mnemonic: ['census', 'choice', 'rural', 'cement', 'eager', 'trip', 'alcohol', 'sail', 'soccer', 'tag', 'orbit', 'print', 'private', 'point', 'unable'],
    secret: '6d94b01069b92550129262c04a7c620d596eeff8',
    amount: '670522094',
    pkh: 'tz1WEZA1QMAf6K1837DJZns8AN9s8jhqoJ7J',
    password: '33Sqixo3rl',
    email: 'tlcbcoty.srqpgtal@tezos.example.org',
}; // Paste faucet json here

async function run() {
    const tezos = new TezosToolkit(CONFIG.rpcUrl);

    await importKey(tezos, fundWallet.email, fundWallet.password, fundWallet.mnemonic.join(' '), fundWallet.secret);

    const balance = await tezos.rpc.getBalance(fundWallet.pkh);

    const share = balance.minus(500000).dividedBy(TEST_WALLETS.length).toNumber();

    const batch = tezos.batch();

    TEST_WALLETS.forEach(w => batch.withTransfer({ to: w.pkh, amount: share, mutez: true }));

    const op = await batch.send();

    await op.confirmation();

    console.log(`Transferred ${share / 1e6} XTZ to each of the ${TEST_WALLETS.length} bot addresses.`);
}

void run().catch(e => console.error(e));
