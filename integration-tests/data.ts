import dotenv from 'dotenv';

export interface FaucetWallet {
    mnemonic: string[];
    secret: string;
    amount: string;
    pkh: string;
    password: string;
    email: string;
}

export class RecordTestData<TName extends string | null, TWallet extends FaucetWallet | null> {
    address: TWallet extends FaucetWallet ? string : null;

    constructor(public name: TName, public wallet: TWallet) {
        if (this.wallet) {
            this.address = this.wallet.pkh as any;
        } else {
            this.address = null as any;
        }
    }
}

export const TEST_WALLETS: FaucetWallet[] = [
    {
        mnemonic: ['amount', 'long', 'remind', 'abuse', 'elbow', 'spin', 'axis', 'true', 'occur', 'easy', 'machine', 'volume', 'pink', 'book', 'knife'],
        secret: 'dd178e9ef56fef55959f8a17ef8cb46e17bde03c',
        amount: '59293551316',
        pkh: 'tz1goJEvA7TNvFUcHUtnWdfM72QmuwbLsuxM',
        password: '4Qs51YJ41I',
        email: 'qrmiytsy.wbhqvxmd@tezos.example.org',
    },
    {
        mnemonic: [
            'happy',
            'jacket',
            'patient',
            'husband',
            'cabin',
            'follow',
            'table',
            'three',
            'pony',
            'cheese',
            'series',
            'eternal',
            'near',
            'snack',
            'february',
        ],
        secret: '6e5668e8f4096e276d6d55490d28ec9eeb575603',
        amount: '6471476519',
        pkh: 'tz1ZJY5PSH6kTMvjmfbXB2DwYcaU8X8rJtKx',
        password: 'jnDchqqy7y',
        email: 'kjhtygrx.ntsapxnq@tezos.example.org',
    },
    {
        mnemonic: ['donor', 'festival', 'reward', 'number', 'west', 'diet', 'major', 'video', 'sign', 'human', 'like', 'gain', 'amateur', 'student', 'long'],
        secret: '8fc462568cff70539467dcb23bc2303f06876eec',
        amount: '78836144240',
        pkh: 'tz1R3iboWc7PWQsHvo9WMaJjKcp2a3wX6TjP',
        password: 'yM2wmm58CS',
        email: 'ubzjiwko.slrqcrxv@tezos.example.org',
    },
    {
        mnemonic: [
            'affair',
            'fuel',
            'ahead',
            'cluster',
            'three',
            'auto',
            'quarter',
            'visa',
            'rent',
            'universe',
            'legend',
            'mechanic',
            'hat',
            'blue',
            'problem',
        ],
        secret: 'd007653bc5d2a5b773001906b9a65e48b2858d2a',
        amount: '6944503090',
        pkh: 'tz1a1qfkPhNnaUGb1mNfDsUKJi23ADet7h62',
        password: 'r5rqpsqcdb',
        email: 'dviuzcub.iufnxkko@tezos.example.org',
    },
];

dotenv.config();

export const CONFIG = {
    adminAddress: 'tz1VBLpuDKMoJuHRLZ4HrCgRuiLpEr7zZx2E',
    adminKey: process.env.TD_ADMIN_SIGN_KEY!,
    rpcUrl: process.env.TD_RPC_URL!,
    network: process.env.TD_NETWORK! as any
};

export const DATA = {
    ok: new RecordTestData('ok.test', TEST_WALLETS[0]),
    expired: new RecordTestData('expired.test', TEST_WALLETS[1]),
    noExpiration: new RecordTestData('no-expiration.test', TEST_WALLETS[2]),
    emptyAddress: new RecordTestData('empty-address.test', null),
    emptyReverseRecord: new RecordTestData(null, TEST_WALLETS[3]),
};
