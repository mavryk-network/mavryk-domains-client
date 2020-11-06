# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [1.0.0-beta.21](https://gitlab.com/tezos-domains/client/compare/v1.0.0-beta.20...v1.0.0-beta.21) (2020-11-06)

**Note:** Version bump only for package @tezos-domains/client





# [1.0.0-beta.20](https://gitlab.com/tezos-domains/client/compare/v1.0.0-beta.19...v1.0.0-beta.20) (2020-11-06)


### Bug Fixes

* **core:** remove custom from supported networks (its a special case) ([6385bc4](https://gitlab.com/tezos-domains/client/commit/6385bc4eb517da10c2a4a3c38beac4c9df9f7ada))





# [1.0.0-beta.19](https://gitlab.com/tezos-domains/client/compare/v1.0.0-beta.18...v1.0.0-beta.19) (2020-11-06)


### Features

* add "unsupported" implementations of validator and manager, add TezosDomainsClient.Unsupported, add isTezosDomainsSupportedNetwork function ([c9aebdb](https://gitlab.com/tezos-domains/client/commit/c9aebdb2a6bfa50e603fe6b03233ecfa9c70d3d8))






# [1.0.0-beta.18](https://gitlab.com/tezos-domains/client/compare/v1.0.0-beta.17...v1.0.0-beta.18) (2020-11-03)

**Note:** Version bump only for package @tezos-domains/client





# [1.0.0-beta.17](https://gitlab.com/tezos-domains/client/compare/v1.0.0-beta.16...v1.0.0-beta.17) (2020-11-03)

**Note:** Version bump only for package @tezos-domains/client





# [1.0.0-beta.16](https://gitlab.com/tezos-domains/client/compare/v1.0.0-beta.15...v1.0.0-beta.16) (2020-11-03)


### Features

* update to taquito 7.0.0-beta.0 ([23ecea9](https://gitlab.com/tezos-domains/client/commit/23ecea94b3ed7fcd8ab06be589e9e76952822134))





# [1.0.0-beta.15](https://gitlab.com/tezos-domains/client/compare/v1.0.0-beta.14...v1.0.0-beta.15) (2020-10-30)

**Note:** Version bump only for package @tezos-domains/client





# [1.0.0-beta.14](https://gitlab.com/tezos-domains/client/compare/v1.0.0-beta.13...v1.0.0-beta.14) (2020-10-30)


### Features

* update to taquito 7 ([33c7d59](https://gitlab.com/tezos-domains/client/commit/33c7d596cf2cad71b7eb5099c833c3f20a72bc68))
* **manager:** add auction methods ([70ee802](https://gitlab.com/tezos-domains/client/commit/70ee8027f2da589cf074b09be10951252ea71fcf))
* **resolver:** add name normalization before resolving a domain name ([e583bcb](https://gitlab.com/tezos-domains/client/commit/e583bcbf02c00d60a2bc05e8008de4e5efcb296a)), closes [#1](https://gitlab.com/tezos-domains/client/issues/1)


### BREAKING CHANGES

* `tezos` parameter is now required (instance `Tezos` was removed from taquito)
* **manager:** - `getPrice()` method was removed from the `manager`, use `getAcquisitionInfo` instead.
- `carthagenet` network is currently not supported
- all TEZ amounts are now in mutez





# [1.0.0-beta.13](https://gitlab.com/tezos-domains/client/compare/v1.0.0-beta.12...v1.0.0-beta.13) (2020-10-06)

**Note:** Version bump only for package @tezos-domains/client





# [1.0.0-beta.12](https://gitlab.com/tezos-domains/client/compare/v1.0.0-beta.11...v1.0.0-beta.12) (2020-10-06)


### Features

* **core:** add support for different tlds on different networks ([6878933](https://gitlab.com/tezos-domains/client/commit/687893380e92f35c53513a35e9d55b4242d1f0c7))


### BREAKING CHANGES

* **core:** `validateDomainName` function was removed, use
`client.validator.validateDomainName` instead.
`AlphanumericWithHypenDomainNameValidator` was renamed to `LatinDomainNameValidator`.





# [1.0.0-beta.11](https://gitlab.com/tezos-domains/client/compare/v1.0.0-beta.10...v1.0.0-beta.11) (2020-09-17)

**Note:** Version bump only for package @tezos-domains/client





# [1.0.0-beta.10](https://gitlab.com/tezos-domains/client/compare/v1.0.0-beta.9...v1.0.0-beta.10) (2020-09-16)


### Reverts

* Revert "release: cut the v1.0.0-beta.10 release" ([f46fc11](https://gitlab.com/tezos-domains/client/commit/f46fc11fdde05b128ddc84a6a30336d267f45053))






# [1.0.0-beta.9](https://gitlab.com/tezos-domains/client/compare/v1.0.0-beta.8...v1.0.0-beta.9) (2020-09-03)

**Note:** Version bump only for package @tezos-domains/client





# [1.0.0-beta.8](https://gitlab.com/tezos-domains/client/compare/v1.0.0-beta.7...v1.0.0-beta.8) (2020-09-03)


### Features

* **resolver:** add clearCache api ([bd4d83b](https://gitlab.com/tezos-domains/client/commit/bd4d83b57b0a54166960b32a528354efc08c5927))






# [1.0.0-beta.7](https://gitlab.com/tezos-domains/client/compare/v1.0.0-beta.6...v1.0.0-beta.7) (2020-08-31)


### Features

* add record data handling ([0e9bb22](https://gitlab.com/tezos-domains/client/commit/0e9bb228498eb498ef9ae7d2cef0654cbb772f1d))


### BREAKING CHANGES

* Resolver.resolve and reverseResolve now return respective records. New methods
resolveAddress and reverseResolveName were added that have the previous behavior.





# [1.0.0-beta.6](https://gitlab.com/tezos-domains/client/compare/v1.0.0-beta.5...v1.0.0-beta.6) (2020-08-21)

**Note:** Version bump only for package @tezos-domains/client





# [1.0.0-beta.5](https://gitlab.com/tezos-domains/client/compare/v1.0.0-beta.4...v1.0.0-beta.5) (2020-08-11)


### Features

* **client:** add setConfig method ([bcb73d0](https://gitlab.com/tezos-domains/client/commit/bcb73d0db263e42a17d2c38166ef4904be4faad2))





# [1.0.0-beta.4](https://gitlab.com/tezos-domains/client/compare/v1.0.0-beta.3...v1.0.0-beta.4) (2020-08-10)


### Features

* **client:** add client umbrella package that provides functionality of manager and resolver ([1439238](https://gitlab.com/tezos-domains/client/commit/1439238da6501503297545e826fd95508ae2a425))
