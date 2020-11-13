# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [1.0.0-beta.23](https://gitlab.com/tezos-domains/client/compare/v1.0.0-beta.22...v1.0.0-beta.23) (2020-11-13)

**Note:** Version bump only for package @tezos-domains/manager





# [1.0.0-beta.22](https://gitlab.com/tezos-domains/client/compare/v1.0.0-beta.21...v1.0.0-beta.22) (2020-11-13)


### Features

* prepare for supporting multiple tezos base libraries (taquito, conseil) ([eaec94a](https://gitlab.com/tezos-domains/client/commit/eaec94a7483aa3ff1d40d6f57f0197501d1df143))


### BREAKING CHANGES

*  - renamed package `@tezos-domains/client` => `@tezos-domains/taquito-client`
 - renamed `TezosDomainsClient` => `TaquitoTezosDomainsClient`
 - removed `TezosDomainsResolver` and `TezosDomainsManager`, use `TaquitoTezosDomainsClient` instead
 - removed method `client.clearResolverCache()`, use `client.resolver.clearCache()` instead
 - other internal structural/api changes, which shouldn't have an effect on cosnumers





# [1.0.0-beta.21](https://gitlab.com/tezos-domains/client/compare/v1.0.0-beta.20...v1.0.0-beta.21) (2020-11-06)


### Reverts

* make expiry from setChildRecord optional ([ca24e67](https://gitlab.com/tezos-domains/client/commit/ca24e67d50616f5f1f5adca121db0e11a97d5324))





# [1.0.0-beta.20](https://gitlab.com/tezos-domains/client/compare/v1.0.0-beta.19...v1.0.0-beta.20) (2020-11-06)

**Note:** Version bump only for package @tezos-domains/manager





# [1.0.0-beta.19](https://gitlab.com/tezos-domains/client/compare/v1.0.0-beta.18...v1.0.0-beta.19) (2020-11-06)


### Features

* add "unsupported" implementations of validator and manager, add TezosDomainsClient.Unsupported, add isTezosDomainsSupportedNetwork function ([c9aebdb](https://gitlab.com/tezos-domains/client/commit/c9aebdb2a6bfa50e603fe6b03233ecfa9c70d3d8))






# [1.0.0-beta.18](https://gitlab.com/tezos-domains/client/compare/v1.0.0-beta.17...v1.0.0-beta.18) (2020-11-03)


### Bug Fixes

* remove null from return type of getBidderBalance ([ae8d346](https://gitlab.com/tezos-domains/client/commit/ae8d3464a31d0d24ad5e47dc5cec2a6d4b475581))





# [1.0.0-beta.17](https://gitlab.com/tezos-domains/client/compare/v1.0.0-beta.16...v1.0.0-beta.17) (2020-11-03)

**Note:** Version bump only for package @tezos-domains/manager





# [1.0.0-beta.16](https://gitlab.com/tezos-domains/client/compare/v1.0.0-beta.15...v1.0.0-beta.16) (2020-11-03)


### Bug Fixes

* **manager:** fix a bug that prevents bidding if bidder amount is higher than the bid ([bcb37d1](https://gitlab.com/tezos-domains/client/commit/bcb37d1f472bb0188437faeb0fbc8e7dde52decb))


### Features

* update to taquito 7.0.0-beta.0 ([23ecea9](https://gitlab.com/tezos-domains/client/commit/23ecea94b3ed7fcd8ab06be589e9e76952822134))





# [1.0.0-beta.15](https://gitlab.com/tezos-domains/client/compare/v1.0.0-beta.14...v1.0.0-beta.15) (2020-10-30)


### Bug Fixes

* **manager:** respect current price for renewal of owned domains in getAcquisitionInfo ([00ee583](https://gitlab.com/tezos-domains/client/commit/00ee5835dd6d40c3311e1e9544fb411daf7ea057))





# [1.0.0-beta.14](https://gitlab.com/tezos-domains/client/compare/v1.0.0-beta.13...v1.0.0-beta.14) (2020-10-30)


### Features

* update to taquito 7 ([33c7d59](https://gitlab.com/tezos-domains/client/commit/33c7d596cf2cad71b7eb5099c833c3f20a72bc68))
* **manager:** add auction methods ([70ee802](https://gitlab.com/tezos-domains/client/commit/70ee8027f2da589cf074b09be10951252ea71fcf))
* **manager:** add commitment.waitUntilUsable() ([4b7e0b9](https://gitlab.com/tezos-domains/client/commit/4b7e0b919ef8210b386007fdb6066f4869bf1e4d))


### BREAKING CHANGES

* `tezos` parameter is now required (instance `Tezos` was removed from taquito)
* **manager:** - `getPrice()` method was removed from the `manager`, use `getAcquisitionInfo` instead.
- `carthagenet` network is currently not supported
- all TEZ amounts are now in mutez





# [1.0.0-beta.13](https://gitlab.com/tezos-domains/client/compare/v1.0.0-beta.12...v1.0.0-beta.13) (2020-10-06)

**Note:** Version bump only for package @tezos-domains/manager





# [1.0.0-beta.12](https://gitlab.com/tezos-domains/client/compare/v1.0.0-beta.11...v1.0.0-beta.12) (2020-10-06)


### Features

* **core:** support delphinet ([66f516c](https://gitlab.com/tezos-domains/client/commit/66f516cf18518db3ac0e7e082a69786bcfe48e33))
* **manager:** support new buy (with address and data parameters) ([1ebbdde](https://gitlab.com/tezos-domains/client/commit/1ebbdde0e44258dbf57b875cb86376b7cc284e46))





# [1.0.0-beta.11](https://gitlab.com/tezos-domains/client/compare/v1.0.0-beta.10...v1.0.0-beta.11) (2020-09-17)

**Note:** Version bump only for package @tezos-domains/manager





# [1.0.0-beta.10](https://gitlab.com/tezos-domains/client/compare/v1.0.0-beta.9...v1.0.0-beta.10) (2020-09-16)


### Reverts

* Revert "release: cut the v1.0.0-beta.10 release" ([f46fc11](https://gitlab.com/tezos-domains/client/commit/f46fc11fdde05b128ddc84a6a30336d267f45053))






# [1.0.0-beta.9](https://gitlab.com/tezos-domains/client/compare/v1.0.0-beta.8...v1.0.0-beta.9) (2020-09-03)

**Note:** Version bump only for package @tezos-domains/manager





# [1.0.0-beta.8](https://gitlab.com/tezos-domains/client/compare/v1.0.0-beta.7...v1.0.0-beta.8) (2020-09-03)

**Note:** Version bump only for package @tezos-domains/manager





# [1.0.0-beta.7](https://gitlab.com/tezos-domains/client/compare/v1.0.0-beta.6...v1.0.0-beta.7) (2020-08-31)


### Features

* add record data handling ([0e9bb22](https://gitlab.com/tezos-domains/client/commit/0e9bb228498eb498ef9ae7d2cef0654cbb772f1d))
* update to use August Contracts ([057938e](https://gitlab.com/tezos-domains/client/commit/057938ef241c823ef7a53b73b1e5c8c3d3097029)), closes [#3](https://gitlab.com/tezos-domains/client/issues/3) [#4](https://gitlab.com/tezos-domains/client/issues/4) [#5](https://gitlab.com/tezos-domains/client/issues/5) [#6](https://gitlab.com/tezos-domains/client/issues/6)


### BREAKING CHANGES

* Reverse record now has data, which need to be passed in. validity was renamed to
expiry.
* Resolver.resolve and reverseResolve now return respective records. New methods
resolveAddress and reverseResolveName were added that have the previous behavior.





# [1.0.0-beta.6](https://gitlab.com/tezos-domains/client/compare/v1.0.0-beta.5...v1.0.0-beta.6) (2020-08-21)

**Note:** Version bump only for package @tezos-domains/manager





# [1.0.0-beta.5](https://gitlab.com/tezos-domains/client/compare/v1.0.0-beta.4...v1.0.0-beta.5) (2020-08-11)


### Bug Fixes

* **manager:** add calculated price when calling buy or renew ([03b3ac3](https://gitlab.com/tezos-domains/client/commit/03b3ac36a29728b46a5d8c634393c9d89d357f84))





# [1.0.0-beta.4](https://gitlab.com/tezos-domains/client/compare/v1.0.0-beta.3...v1.0.0-beta.4) (2020-08-10)


### Features

* **client:** add client umbrella package that provides functionality of manager and resolver ([1439238](https://gitlab.com/tezos-domains/client/commit/1439238da6501503297545e826fd95508ae2a425))
* **manager:** add manager package that provides domain management functions ([1028f16](https://gitlab.com/tezos-domains/client/commit/1028f1661d0a61ac5a354c7cc89a0839d9e121cd))
