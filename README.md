[![npm version](https://badge.fury.io/js/%40tezos-domains%2Fcore.svg)](https://www.npmjs.com/package/@tezos-domains/core)

# Tezos Domains Client

Library for resolving and managing tezos domains built on top of [taquito](https://tezostaquito.io/).

## Resolver

### Getting started

#### 1) Install `@tezos-domains/resolver` package
```
yarn add @tezos-domains/resolver
--or--
npm install @tezos-domains/resolver
```

#### 2) Use `TezosDomainsResolver` to resolve names and addresses

```
import { TezosDomainsResolver } from '@tezos-domains/resolver';

async function main() {
    const resolver = new TezosDomainsResolver();

    const address = await resolver.resolve('alice.tez');

    console.log(address);
}

```

The above example would use the default taquito instance `Tezos` to execute requests against `mainnet` Tezos Domains contracts.

### Options
`TezosDomainsResolver` takes options that can customize it's behavior.

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
