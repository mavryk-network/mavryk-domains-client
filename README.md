# Tezos Domains Client

Library for resolving and managing tezos domains built on top of [taquito](https://tezostaquito.io/).

## Getting started

### 1) Install `@tezos-domains/client` package
```
yarn add @tezos-domains/client
--or--
npm install @tezos-domains/client
```

### 2a) Use `resolver` to resolve names and addresses

```
import { TezosDomainsClient } from '@tezos-domains/client';

async function main() {
    const client = new TezosDomainsClient();

    const address = await client.resolver.resolve('alice.tez');

    console.log(address);
}
```

The above example would use the default taquito instance `Tezos` to execute requests against `mainnet` Tezos Domains contracts.

### 2b) Use `manager` to register and manage domains

```
import { TezosDomainsClient } from '@tezos-domains/client';

async function main() {
    const client = new TezosDomainsClient();

    const commitOperation = await client.manager.commit('tez', { label: 'necroskillz', owner: 'tz1VxMudmADssPp6FPDGRsvJXE41DD6i9g6n' });
    await commitOperation.confirmation();

    // wait for min_commitment_age
    await new Promise(resolve => setTimeout(() => resolve(), 60000));

    const buyOperation = await client.manager.buy('tez', { label: 'necroskillz', owner: 'tz1VxMudmADssPp6FPDGRsvJXE41DD6i9g6n', duration: 365 });
    await buyOperation.confirmation();

    console.log('Domain necroskillz.tez has been registered.');
}
```

## Options
`TezosDomainsClient` takes options that can customize it's behavior.

`network` (default: `'mainnet'`)

 - Specifies which contracts addresses to use. There are built in ones specified for `mainnet` and `carthagenet`. For `custom` you need to also specify `contractAddresses`. 

`contractAddresses` (default: `undefined`)

 - Which tezos domains contracts to connect to to get data. Must be specified if network is `custom`. Uses built in addresses otherwise.

`tezos` (default: `Tezos` from `@taquito/taquito`)

 - Specifies an instance of [TezosToolkit](https://tezostaquito.io/typedoc/classes/_taquito_taquito.tezostoolkit.html) to use to make rpc requests.

`tracing` (default: `false`)

 - Whether to output debugging information.

`caching` (default `{ enabled: false, recordTtl: 600, reverseRecordTtl: 600 }`)

 - Specifies how to handle caching of name and address resolution.
