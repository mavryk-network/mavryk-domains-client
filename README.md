# Tezos Domains Client

Library for resolving and managing tezos domains. Can be used with [taquito](https://tezostaquito.io/) or [conseiljs](https://cryptonomic.github.io/ConseilJS/#/).

_WARNING: This project is in beta. We welcome users and feedback, please be aware that this project is a work in progress._

## Getting started with taquito

### 1) Install `@tezos-domains/taquito-client` package

```
yarn add @tezos-domains/taquito-client @tezos-domains/core @taquito/taquito
--or--
npm install @tezos-domains/taquito-client @tezos-domains/core @taquito/taquito
```

### 2a) Use `resolver` to resolve names and addresses

Example of resolving and address from domain name:

```ts
import { TezosToolkit } from '@taquito/taquito';
import { TaquitoTezosDomainsClient } from '@tezos-domains/taquito-client';

async function main() {
    const tezos = new TezosToolkit('https://delphinet-tezos.giganode.io/');
    const client = new TaquitoTezosDomainsClient({ tezos, network: 'delphinet', caching: { enabled: true } });

    const address = await client.resolver.resolveNameToAddress('bob.tez');

    console.log(address);
}
```

The above example would use the default taquito instance `Tezos` to execute requests against `mainnet` Tezos Domains contracts.

### 2b) Use `manager` to register and manage domains

Example of registering a domain:

**NOTE**: registering a domain uses [commitment scheme](https://en.wikipedia.org/wiki/Commitment_scheme).
**NOTE**: You also need to install `@taquito/signer` npm package for this example.

```ts
import { InMemorySigner } from '@taquito/signer';
import { TezosToolkit } from '@taquito/taquito';
import { TaquitoTezosDomainsClient } from '@tezos-domains/taquito-client';
import { getTld, getLabel, DomainNameValidationResult, RecordMetadata } from '@tezos-domains/core';

async function main() {
    const tezos = new TezosToolkit('https://delphinet-tezos.giganode.io/');
    tezos.setSignerProvider(new InMemorySigner('<your signing key>'));
    const client = new TaquitoTezosDomainsClient({ tezos, network: 'delphinet' });

    const name = 'foobar.tez';

    // Validate the domain name syntax
    if (client.validator.validateDomainName(name) !== DomainNameValidationResult.VALID) {
        throw new Error('Domain name not valid');
    }

    // Check if the name is not taken already
    const existing = await client.resolver.resolve(name);
    if (existing) {
        throw new Error('Domain name taken.');
    }

    // Use utility function to parse and get parts of a domain name
    const tld = getTld(name);
    const label = getLabel(name);

    const params = {
        label,
        owner: 'tz1VxMudmADssPp6FPDGRsvJXE41DD6i9g6n',
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
        address: 'tz1VxMudmADssPp6FPDGRsvJXE41DD6i9g6n',
        data: new RecordMetadata(),
    });
    await buyOperation.confirmation();

    console.log(`Domain ${name} has been registered.`);
}
```

## Getting started with conseiljs

### 1) Install `@tezos-domains/conseil-client` package

```
yarn add @tezos-domains/conseil-client @tezos-domains/core conseiljs node-fetch loglevel @types/node-fetch @types/loglevel
--or--
npm install @tezos-domains/conseil-client @tezos-domains/core conseiljs node-fetch loglevel @types/node-fetch @types/loglevel
```

### 2) Use `resolver` to resolve names and addresses

Example of resolving and address from domain name:

```ts
import fetch from 'node-fetch';
import * as log from 'loglevel';
import { registerFetch, registerLogger } from 'conseiljs';
import { ConseilTezosDomainsClient } from '@tezos-domains/taquito-client';

async function main() {
    const logger = log.getLogger('conseiljs');
    logger.setLevel('silent', false);
    registerLogger(logger);
    registerFetch(fetch);

    const client = new ConseilTezosDomainsClient({
        conseil: { server: 'https://delphinet-tezos.giganode.io/' },
        network: 'delphinet',
        caching: { enabled: true },
    });

    const address = await client.resolver.resolveNameToAddress('bob.tez');

    console.log(address);
}
```

## Options

The client takes options that can customize it's behavior.

`network` (default: `'mainnet'`)

-   Specifies which contracts addresses to use. There are built in ones specified for `mainnet` and `delphinet`. For `custom` you need to also specify `contractAddresses`.

`contractAddresses` (default: `undefined`)

-   Which tezos domains contracts to connect to to get data. Must be specified if network is `custom`. Uses built in addresses otherwise.

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
