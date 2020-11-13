# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [1.0.0-beta.23](https://gitlab.com/tezos-domains/client/compare/v1.0.0-beta.22...v1.0.0-beta.23) (2020-11-13)


### Bug Fixes

* add missing typescript definitions ([917e445](https://gitlab.com/tezos-domains/client/commit/917e4455102b5f1ee05f9df97c6a58f4f0e79ab3))





# [1.0.0-beta.22](https://gitlab.com/tezos-domains/client/compare/v1.0.0-beta.21...v1.0.0-beta.22) (2020-11-13)


### Features

* prepare for supporting multiple tezos base libraries (taquito, conseil) ([eaec94a](https://gitlab.com/tezos-domains/client/commit/eaec94a7483aa3ff1d40d6f57f0197501d1df143))


### BREAKING CHANGES

*  - renamed package `@tezos-domains/client` => `@tezos-domains/taquito-client`
 - renamed `TezosDomainsClient` => `TaquitoTezosDomainsClient`
 - removed `TezosDomainsResolver` and `TezosDomainsManager`, use `TaquitoTezosDomainsClient` instead
 - removed method `client.clearResolverCache()`, use `client.resolver.clearCache()` instead
 - other internal structural/api changes, which shouldn't have an effect on cosnumers
