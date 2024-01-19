# Mavryk Domains Client

Library for resolving and managing mavryk domains. Can be used with [Taquito](https://tezostaquito.io/) or [ConseilJS](https://cryptonomic.github.io/ConseilJS/#/).

_WARNING: This project is in beta. We welcome users and feedback, please be aware that this project is a work in progress._

## Using the library with Taquito

### 1) Install `@mavrykdynamics/mavryk-domains-taquito-client` package

```
yarn add @mavrykdynamics/mavryk-domains-taquito-client @mavrykdynamics/mavryk-domains-core @mavrykdynamics/taquito @mavrykdynamics/taquito-rpc @mavrykdynamics/taquito-tzip16
--or--
npm install @mavrykdynamics/mavryk-domains-taquito-client @mavrykdynamics/mavryk-domains-core @mavrykdynamics/taquito @mavrykdynamics/taquito-rpc @mavrykdynamics/taquito-tzip16
```

### 2a) Use `resolver` to resolve names and addresses

Example of resolving and address from domain name:

```ts
import { TezosToolkit } from '@mavrykdynamics/taquito';
import { TaquitoMavrykDomainsClient } from '@mavrykdynamics/mavryk-domains-taquito-client';
import { Tzip16Module } from '@mavrykdynamics/taquito-tzip16';

async function main() {
    const tezos = new TezosToolkit('https://ghostnet.smartpy.io');
    tezos.addExtension(new Tzip16Module());
    const client = new TaquitoMavrykDomainsClient({ tezos, network: 'ghostnet', caching: { enabled: true } });

    const address = await client.resolver.resolveNameToAddress('bob.flo');

    console.log(address);
}
```

### 2b) Use `manager` to register and manage domains

Example of registering a domain:

**NOTE**: registering a domain uses [commitment scheme](https://en.wikipedia.org/wiki/Commitment_scheme).

**NOTE**: Installing a signer is necessary for sending transactions.

```
yarn add @mavrykdynamics/taquito-signer
--or--
npm install @mavrykdynamics/taquito-signer
```

```ts
import { InMemorySigner } from '@mavrykdynamics/taquito-signer';
import { TezosToolkit } from '@mavrykdynamics/taquito';
import { Tzip16Module } from '@mavrykdynamics/taquito-tzip16';
import { TaquitoMavrykDomainsClient } from '@mavrykdynamics/mavryk-domains-taquito-client';
import { getTld, getLabel, DomainNameValidationResult, RecordMetadata, generateNonce } from '@mavrykdynamics/mavryk-domains-core';

async function main() {
    const tezos = new TezosToolkit('https://ghostnet.smartpy.io');
    tezos.addExtension(new Tzip16Module());
    tezos.setSignerProvider(new InMemorySigner('<your signing key>'));
    const client = new TaquitoMavrykDomainsClient({ tezos, network: 'ghostnet' });

    const name = 'foobar.flo';

    // Validate the domain name syntax
    if (client.validator.validateDomainName(name) !== DomainNameValidationResult.VALID) {
        throw new Error('Domain name not valid');
    }

    // Check if the name is not taken already
    const existing = await client.resolver.resolveDomainRecord(name);
    if (existing) {
        throw new Error('Domain name taken.');
    }

    // Use utility function to parse and get parts of a domain name
    const tld = getTld(name);
    const label = getLabel(name);
    const nonce = generateNonce();

    const params = {
        label,
        owner: 'mv1UGYk3B88eN9AJYtomdLxAtKhFARGp8K8L',
        nonce
    };

    // First step of registering a domain - create a commitment for
    const commitOperation = await client.manager.commit(tld, params);
    await commitOperation.confirmation();

    // Wait until commitment is usable (usually time between blocks)
    const commitment = await client.manager.getCommitment(tld, params);
    await commitment.waitUntilUsable();

    // Final step - reveal and confirm the registration for specified duration in days
    const buyOperation = await client.manager.buy(tld, {
        ...params,
        duration: 365,
        address: 'mv1UGYk3B88eN9AJYtomdLxAtKhFARGp8K8L',
        data: new RecordMetadata(),
    });
    await buyOperation.confirmation();

    console.log(`Domain ${name} has been registered.`);
}
```

## Using the library with ConseilJS

### 1) Install `@mavrykdynamics/mavryk-domains-conseil-client` package

```
yarn add @mavrykdynamics/mavryk-domains-conseil-client @mavrykdynamics/mavryk-domains-core conseiljs node-fetch loglevel @types/node-fetch @types/loglevel
--or--
npm install @mavrykdynamics/mavryk-domains-conseil-client @mavrykdynamics/mavryk-domains-core conseiljs node-fetch loglevel @types/node-fetch @types/loglevel
```

### 2) Use `resolver` to resolve names and addresses

Example of resolving and address from domain name:

```ts
import fetch from 'node-fetch';
import * as log from 'loglevel';
import { registerFetch, registerLogger } from 'conseiljs';
import { ConseilMavrykDomainsClient } from '@mavrykdynamics/mavryk-domains-conseil-client';

async function main() {
    const logger = log.getLogger('conseiljs');
    logger.setLevel('silent', false);
    registerLogger(logger);
    registerFetch(fetch);

    const client = new ConseilMavrykDomainsClient({
        conseil: { server: 'https://ghostnet.smartpy.io' },
        network: 'ghostnet',
        caching: { enabled: true },
    });

    const address = await client.resolver.resolveNameToAddress('bob.flo');

    console.log(address);
}
```

## Options

The client takes options that can customize it's behavior.

`network` (default: `'mainnet'`)

-   Specifies which contracts addresses to use. There are built in ones specified for `mainnet` and `ghostnet`. For `custom` you need to also specify `contractAddresses`.

`contractAddresses` (default: `undefined`)

-   Which mavryk domains contracts to connect to to get data. Must be specified if network is `custom`. Uses built in addresses otherwise.

`tlds` (default: `undefined`)

-   Which top level domains are supported and the validator function to use to validate domain names of each tld. Must be specified if network is `custom`. Uses built in tlds otherwise.

`tracing` (default: `false`)

-   Whether to output debugging information.

`caching` (default `{ enabled: false, defaultRecordTtl: 600, defaultReverseRecordTtl: 600 }`)

-   Specifies how to handle caching of name and address resolution.

### Taquito client specific

`tezos` (required)

-   Specifies an instance of [TezosToolkit](https://tezostaquito.io/typedoc/classes/_taquito_taquito.tezostoolkit.html) to use to make rpc requests.

### Conseil client specific

`conseil` (required)

-   `server` Specifies tezos rpc url to make requests to.

## Developping and building locally
This project requires [Yarn](https://yarnpkg.com/).

### Building
```
yarn build
```

### Running tests
```
yarn test
```