# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [1.0.0-beta.33](https://gitlab.com/tezos-domains/client/compare/v1.0.0-beta.32...v1.0.0-beta.33) (2021-01-19)


### Bug Fixes

* **core:** correctly export `TezosDomainsResolverDataProvider` ([da9336b](https://gitlab.com/tezos-domains/client/commit/da9336b48dc0eb1e8886d6da674e38c51e1ccca1))





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


### Features

* **resolver:** add domain info to reverse record instead of name ([6c67e48](https://gitlab.com/tezos-domains/client/commit/6c67e482b206d1e759d7e659d070309679cbb5b9))
* remove carthagenet support ([df020dc](https://gitlab.com/tezos-domains/client/commit/df020dcac5f5ec0741865797a7a8637db12039e2))


### BREAKING CHANGES

* **resolver:** property `name` was removed from `ReverseRecordInfo`. Use `domain.name` instead





# [1.0.0-beta.29](https://gitlab.com/tezos-domains/client/compare/v1.0.0-beta.28...v1.0.0-beta.29) (2020-12-03)

**Note:** Version bump only for package @tezos-domains/core





# [1.0.0-beta.28](https://gitlab.com/tezos-domains/client/compare/v1.0.0-beta.27...v1.0.0-beta.28) (2020-12-01)


### Features

* **core:** add helper for generating nonce `generateNonce()` ([9e56c7c](https://gitlab.com/tezos-domains/client/commit/9e56c7c0b0e50a68e4fb0c12a617755f6ea2a68e))





# [1.0.0-beta.27](https://gitlab.com/tezos-domains/client/compare/v1.0.0-beta.26...v1.0.0-beta.27) (2020-11-28)


### Features

* **core:** update deplhi tld buy address ([7f4a378](https://gitlab.com/tezos-domains/client/commit/7f4a37880ba2664d1e6f3c7a002f3dc495023fa8))





# [1.0.0-beta.26](https://gitlab.com/tezos-domains/client/compare/v1.0.0-beta.25...v1.0.0-beta.26) (2020-11-27)


### Features

* **manager:** add nonce for commit and buy ([4108f03](https://gitlab.com/tezos-domains/client/commit/4108f0318d37b792116b41bfa189c1e39997d146))





# [1.0.0-beta.25](https://gitlab.com/tezos-domains/client/compare/v1.0.0-beta.24...v1.0.0-beta.25) (2020-11-26)

**Note:** Version bump only for package @tezos-domains/core






# [1.0.0-beta.24](https://gitlab.com/tezos-domains/client/compare/v1.0.0-beta.23...v1.0.0-beta.24) (2020-11-16)


### Features

* normalize domain name in validator and manager, validate domain name in manager methods ([7eba607](https://gitlab.com/tezos-domains/client/commit/7eba60708006c7cbb9a94cd6ab476d57089a377d))


### BREAKING CHANGES

*  - Removed `DomainNameValidationResult` `INVALID_LAST_CHARACTER` and `INVALID_FIRST_CHARACTER`
   and added `INVALID_NAME` and `TOO_SHORT`





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





# [1.0.0-beta.21](https://gitlab.com/tezos-domains/client/compare/v1.0.0-beta.20...v1.0.0-beta.21) (2020-11-06)

**Note:** Version bump only for package @tezos-domains/core





# [1.0.0-beta.20](https://gitlab.com/tezos-domains/client/compare/v1.0.0-beta.19...v1.0.0-beta.20) (2020-11-06)


### Bug Fixes

* **core:** remove custom from supported networks (its a special case) ([6385bc4](https://gitlab.com/tezos-domains/client/commit/6385bc4eb517da10c2a4a3c38beac4c9df9f7ada))





# [1.0.0-beta.19](https://gitlab.com/tezos-domains/client/compare/v1.0.0-beta.18...v1.0.0-beta.19) (2020-11-06)


### Features

* add "unsupported" implementations of validator and manager, add TezosDomainsClient.Unsupported, add isTezosDomainsSupportedNetwork function ([c9aebdb](https://gitlab.com/tezos-domains/client/commit/c9aebdb2a6bfa50e603fe6b03233ecfa9c70d3d8))






# [1.0.0-beta.18](https://gitlab.com/tezos-domains/client/compare/v1.0.0-beta.17...v1.0.0-beta.18) (2020-11-03)


### Bug Fixes

* remove max cache items from storage cache ([d1d0347](https://gitlab.com/tezos-domains/client/commit/d1d03478813167dddb111d49220f1fa5a4ef0ed7))





# [1.0.0-beta.17](https://gitlab.com/tezos-domains/client/compare/v1.0.0-beta.16...v1.0.0-beta.17) (2020-11-03)

**Note:** Version bump only for package @tezos-domains/core





# [1.0.0-beta.16](https://gitlab.com/tezos-domains/client/compare/v1.0.0-beta.15...v1.0.0-beta.16) (2020-11-03)


### Features

* update to taquito 7.0.0-beta.0 ([23ecea9](https://gitlab.com/tezos-domains/client/commit/23ecea94b3ed7fcd8ab06be589e9e76952822134))





# [1.0.0-beta.15](https://gitlab.com/tezos-domains/client/compare/v1.0.0-beta.14...v1.0.0-beta.15) (2020-10-30)

**Note:** Version bump only for package @tezos-domains/core





# [1.0.0-beta.14](https://gitlab.com/tezos-domains/client/compare/v1.0.0-beta.13...v1.0.0-beta.14) (2020-10-30)


### Features

* update to taquito 7 ([33c7d59](https://gitlab.com/tezos-domains/client/commit/33c7d596cf2cad71b7eb5099c833c3f20a72bc68))
* **manager:** add auction methods ([70ee802](https://gitlab.com/tezos-domains/client/commit/70ee8027f2da589cf074b09be10951252ea71fcf))
* **resolver:** add name normalization before resolving a domain name ([e583bcb](https://gitlab.com/tezos-domains/client/commit/e583bcbf02c00d60a2bc05e8008de4e5efcb296a)), closes [#1](https://gitlab.com/tezos-domains/client/issues/1)


### Reverts

* add back carthagenet addresses, since resolver still works ([f661ed5](https://gitlab.com/tezos-domains/client/commit/f661ed5e69f0d9c52bf5884271edf872b2b077ca))


### BREAKING CHANGES

* `tezos` parameter is now required (instance `Tezos` was removed from taquito)
* **manager:** - `getPrice()` method was removed from the `manager`, use `getAcquisitionInfo` instead.
- `carthagenet` network is currently not supported
- all TEZ amounts are now in mutez





# [1.0.0-beta.13](https://gitlab.com/tezos-domains/client/compare/v1.0.0-beta.12...v1.0.0-beta.13) (2020-10-06)

**Note:** Version bump only for package @tezos-domains/core





# [1.0.0-beta.12](https://gitlab.com/tezos-domains/client/compare/v1.0.0-beta.11...v1.0.0-beta.12) (2020-10-06)


### Bug Fixes

* **resolver:** handle case where expiry_key is null ([5672c1b](https://gitlab.com/tezos-domains/client/commit/5672c1bc4fa75a20242f8b1dada4b2648e4da6ea))


### Features

* **core:** add support for different tlds on different networks ([6878933](https://gitlab.com/tezos-domains/client/commit/687893380e92f35c53513a35e9d55b4242d1f0c7))
* **core:** support delphinet ([66f516c](https://gitlab.com/tezos-domains/client/commit/66f516cf18518db3ac0e7e082a69786bcfe48e33))
* **core:** update contract addresses, set new TLD names for delphi ([fc90406](https://gitlab.com/tezos-domains/client/commit/fc904068933789836767a0a3b119994c9276d949))
* **resolver:** add expiration date to resolve ([ed0e844](https://gitlab.com/tezos-domains/client/commit/ed0e84475667d55318bdf23d63bfcd76f0783db9))


### BREAKING CHANGES

* **core:** `validateDomainName` function was removed, use
`client.validator.validateDomainName` instead.
`AlphanumericWithHypenDomainNameValidator` was renamed to `LatinDomainNameValidator`.





# [1.0.0-beta.11](https://gitlab.com/tezos-domains/client/compare/v1.0.0-beta.10...v1.0.0-beta.11) (2020-09-17)


### Features

* **core:** add keys() method to RecordMetadata ([f0f637f](https://gitlab.com/tezos-domains/client/commit/f0f637f70b63866832c773476728cde47a6a555b))





# [1.0.0-beta.10](https://gitlab.com/tezos-domains/client/compare/v1.0.0-beta.9...v1.0.0-beta.10) (2020-09-16)


### Bug Fixes

* **core:** correctly fail validation for '.tez' (empty domain part) ([b60f4eb](https://gitlab.com/tezos-domains/client/commit/b60f4ebc75fee7f9c527a718dcdc7692de9f2c38))


### Code Refactoring

* **core:** remove ttl from record metadata and add setJson/getJson ([d9bb7ba](https://gitlab.com/tezos-domains/client/commit/d9bb7ba3254bb29298e2a854f38da3be42fb7719))


### Reverts

* Revert "release: cut the v1.0.0-beta.10 release" ([f46fc11](https://gitlab.com/tezos-domains/client/commit/f46fc11fdde05b128ddc84a6a30336d267f45053))


### BREAKING CHANGES

* **core:** ttl property was removed from RecordMetadata, replace with
getJson(StandardRecordMetadataKey.TTL)






# [1.0.0-beta.9](https://gitlab.com/tezos-domains/client/compare/v1.0.0-beta.8...v1.0.0-beta.9) (2020-09-03)


### Bug Fixes

* **core:** data gets incorrectly deserialized when running multiple requests at once ([021ab49](https://gitlab.com/tezos-domains/client/commit/021ab49969af7b285390c8e6e51a9f59a73114ec))





# [1.0.0-beta.8](https://gitlab.com/tezos-domains/client/compare/v1.0.0-beta.7...v1.0.0-beta.8) (2020-09-03)

**Note:** Version bump only for package @tezos-domains/core





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


### Features

* **core:** add TOO_LONG error to domain validation ([20f4ef1](https://gitlab.com/tezos-domains/client/commit/20f4ef197f945d0e8eb805adb153554cb50d54f2))


### Reverts

* add tldRegistrar field to contract config ([f29c679](https://gitlab.com/tezos-domains/client/commit/f29c679b635a17f65bb4c92e36944fce787d09e9))





# [1.0.0-beta.5](https://gitlab.com/tezos-domains/client/compare/v1.0.0-beta.4...v1.0.0-beta.5) (2020-08-11)


### Features

* **core:** update to new contract addresses ([1008bdc](https://gitlab.com/tezos-domains/client/commit/1008bdcbcd0f7482cc8aba1f0100e9347d7ee419))





# [1.0.0-beta.4](https://gitlab.com/tezos-domains/client/compare/v1.0.0-beta.3...v1.0.0-beta.4) (2020-08-10)


### Features

* **manager:** add manager package that provides domain management functions ([1028f16](https://gitlab.com/tezos-domains/client/commit/1028f1661d0a61ac5a354c7cc89a0839d9e121cd))






# [1.0.0-beta.3](https://gitlab.com/tezos-domains/client/compare/v1.0.0-beta.2...v1.0.0-beta.3) (2020-08-04)


### Bug Fixes

* use console.debug instead of console.trace ([e8faa2a](https://gitlab.com/tezos-domains/client/commit/e8faa2ab5200aef8e9da57012354cf10ade6182a))


### Features

* switch to new contracts ([e6a85c4](https://gitlab.com/tezos-domains/client/commit/e6a85c4a2bf9982b314aad6c7a62a34588abb4d6))


### BREAKING CHANGES

* Proxy address resolution related functionality was removed.





# [1.0.0-beta.2](https://gitlab.com/tezos-domains/client/compare/v1.0.0-beta.1...v1.0.0-beta.2) (2020-08-03)


### Bug Fixes

* **core:** expose BigNumberEncoder ([57b7636](https://gitlab.com/tezos-domains/client/commit/57b7636b8669b9b538757ac1361dd7cb12bf26ed))


### Features

* **core:** add domain name validation utils ([582fc51](https://gitlab.com/tezos-domains/client/commit/582fc519ce3690dfcae742b140bb66af18ccd2fb))
* **resolver:** add NullNameResolver (always returns null) for when resolution should be skipped ([c5baf2d](https://gitlab.com/tezos-domains/client/commit/c5baf2d88536294c145c2b009a1f6e2aa7381595))
* **resolver:** add optional caching with configurable ttl ([59fe4ac](https://gitlab.com/tezos-domains/client/commit/59fe4ac65fca3e0295ecdc92111dcb29a2cd7f71))






# [1.0.0-beta.1](https://gitlab.com/tezos-domains/client/compare/v1.0.0-beta.0...v1.0.0-beta.1) (2020-07-31)


### Features

* **core:** add BigNumberEncoder and more domain properties ([b8b2c77](https://gitlab.com/tezos-domains/client/commit/b8b2c77d39364c2e325b77bbf2be8a3be27f3a1e))






# [1.0.0-beta.0](https://gitlab.com/tezos-domains/client/compare/v0.0.1-alpha.1...v1.0.0-beta.0) (2020-07-30)


### chore

* use dependencies rather than peerDependencie ([9419f90](https://gitlab.com/tezos-domains/client/commit/9419f90f5ad3c4b5380406103bcaaca3669b421c))


### Features

* add tracing ([e2434c0](https://gitlab.com/tezos-domains/client/commit/e2434c0742d2d660b186a335aaabd420d952f6f5))


### BREAKING CHANGES

* peerDeps change





## [0.0.1-alpha.1](https://gitlab.com/tezos-domains/client/compare/v0.0.1-alpha.0...v0.0.1-alpha.1) (2020-07-28)

**Note:** Version bump only for package @tezos-domains/core
