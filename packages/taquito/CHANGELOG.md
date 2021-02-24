# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [1.0.0-beta.39](https://gitlab.com/tezos-domains/client/compare/v1.0.0-beta.38...v1.0.0-beta.39) (2021-02-24)


### Features

* add edo contracts, use default price for renew ([905349b](https://gitlab.com/tezos-domains/client/commit/905349b72eb13cc2d94a9a762bcc16287f02cd5b)), closes [#17](https://gitlab.com/tezos-domains/client/issues/17) [#18](https://gitlab.com/tezos-domains/client/issues/18)





# [1.0.0-beta.38](https://gitlab.com/tezos-domains/client/compare/v1.0.0-beta.37...v1.0.0-beta.38) (2021-02-23)


### Features

* use wallet API for batch ([a844b39](https://gitlab.com/tezos-domains/client/commit/a844b39f1ead64f88af742873c8421bc1cb11f6a))





# [1.0.0-beta.37](https://gitlab.com/tezos-domains/client/compare/v1.0.0-beta.36...v1.0.0-beta.37) (2021-02-17)


### Features

* update to taquito 8.0.2, update peer dependency ranges ([7f338eb](https://gitlab.com/tezos-domains/client/commit/7f338ebaebb45a396947af9600cd61cb7a2562be))





# [1.0.0-beta.36](https://gitlab.com/tezos-domains/client/compare/v1.0.0-beta.34...v1.0.0-beta.36) (2021-01-21)


### Features

* **manager:** add batch method for running multiple tezos domains transactions in a batch ([9a0fd77](https://gitlab.com/tezos-domains/client/commit/9a0fd77cadb6c6b7f555c74c3615297e9f0faa31))





# [1.0.0-beta.35](https://gitlab.com/tezos-domains/client/compare/v1.0.0-beta.34...v1.0.0-beta.35) (2021-01-21)


### Features

* **manager:** add batch method for running multiple tezos domains transactions in a batch ([9a0fd77](https://gitlab.com/tezos-domains/client/commit/9a0fd77cadb6c6b7f555c74c3615297e9f0faa31))





# [1.0.0-beta.34](https://gitlab.com/tezos-domains/client/compare/v1.0.0-beta.33...v1.0.0-beta.34) (2021-01-19)


### Features

* **taquito:** cache metadata views ([ec33891](https://gitlab.com/tezos-domains/client/commit/ec3389190a6b91f5b767c52f733fe760f039f4ab))





# [1.0.0-beta.33](https://gitlab.com/tezos-domains/client/compare/v1.0.0-beta.32...v1.0.0-beta.33) (2021-01-19)

**Note:** Version bump only for package @tezos-domains/taquito





# [1.0.0-beta.32](https://gitlab.com/tezos-domains/client/compare/v1.0.0-beta.31...v1.0.0-beta.32) (2021-01-19)


### Features

* **resolver:** resolve records and reverse records using tzip16 views ([79cf356](https://gitlab.com/tezos-domains/client/commit/79cf356621bb0e204bac18d4232b1757d6087f09)), closes [#16](https://gitlab.com/tezos-domains/client/issues/16)


### BREAKING CHANGES

* **resolver:** taquito peer dependencies were updated to 7.2.0-beta.2 and @taquito/tzip16 packages
was added as a dependency to @tezos-domains/taquito.





# [1.0.0-beta.31](https://gitlab.com/tezos-domains/client/compare/v1.0.0-beta.30...v1.0.0-beta.31) (2021-01-18)


### Features

* remove data from reverse record, update to delphinet [#2](https://gitlab.com/tezos-domains/client/issues/2) contracts ([f19dab4](https://gitlab.com/tezos-domains/client/commit/f19dab4c80016ea9848da6b130f96c3ff7405d7a)), closes [#15](https://gitlab.com/tezos-domains/client/issues/15)


### BREAKING CHANGES

* resolveReverseRecord now returns domain info directly. data has been removed from
`claimReverseRecord` and `updateReverseRecord` requests.






# [1.0.0-beta.30](https://gitlab.com/tezos-domains/client/compare/v1.0.0-beta.29...v1.0.0-beta.30) (2020-12-16)

**Note:** Version bump only for package @tezos-domains/taquito





# [1.0.0-beta.29](https://gitlab.com/tezos-domains/client/compare/v1.0.0-beta.28...v1.0.0-beta.29) (2020-12-03)


### Features

* **manager:** subtract time between blocks from commitment usableFrom ([f6b4a05](https://gitlab.com/tezos-domains/client/commit/f6b4a05e381a9da57f4bf223af61d099dec4df79))





# [1.0.0-beta.28](https://gitlab.com/tezos-domains/client/compare/v1.0.0-beta.27...v1.0.0-beta.28) (2020-12-01)

**Note:** Version bump only for package @tezos-domains/taquito





# [1.0.0-beta.27](https://gitlab.com/tezos-domains/client/compare/v1.0.0-beta.26...v1.0.0-beta.27) (2020-11-28)

**Note:** Version bump only for package @tezos-domains/taquito





# [1.0.0-beta.26](https://gitlab.com/tezos-domains/client/compare/v1.0.0-beta.25...v1.0.0-beta.26) (2020-11-27)

**Note:** Version bump only for package @tezos-domains/taquito





# [1.0.0-beta.25](https://gitlab.com/tezos-domains/client/compare/v1.0.0-beta.24...v1.0.0-beta.25) (2020-11-26)

**Note:** Version bump only for package @tezos-domains/taquito






# [1.0.0-beta.24](https://gitlab.com/tezos-domains/client/compare/v1.0.0-beta.23...v1.0.0-beta.24) (2020-11-16)


### Features

* **conseil-client:** add conseiljs client with resolver/validator ([7754153](https://gitlab.com/tezos-domains/client/commit/77541530910421fc0d910c39747ab8a4a07a8def))





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
