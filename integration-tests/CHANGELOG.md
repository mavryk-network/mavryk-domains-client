# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [1.0.0-beta.17](https://gitlab.com/tezos-domains/client/compare/v1.0.0-beta.16...v1.0.0-beta.17) (2020-11-03)

**Note:** Version bump only for package integration-tests





# [1.0.0-beta.16](https://gitlab.com/tezos-domains/client/compare/v1.0.0-beta.15...v1.0.0-beta.16) (2020-11-03)


### Features

* update to taquito 7.0.0-beta.0 ([23ecea9](https://gitlab.com/tezos-domains/client/commit/23ecea94b3ed7fcd8ab06be589e9e76952822134))





# [1.0.0-beta.15](https://gitlab.com/tezos-domains/client/compare/v1.0.0-beta.14...v1.0.0-beta.15) (2020-10-30)


### Bug Fixes

* **manager:** respect current price for renewal of owned domains in getAcquisitionInfo ([00ee583](https://gitlab.com/tezos-domains/client/commit/00ee5835dd6d40c3311e1e9544fb411daf7ea057))





# [1.0.0-beta.14](https://gitlab.com/tezos-domains/client/compare/v1.0.0-beta.13...v1.0.0-beta.14) (2020-10-30)


### Features

* update to taquito 7 ([33c7d59](https://gitlab.com/tezos-domains/client/commit/33c7d596cf2cad71b7eb5099c833c3f20a72bc68))
* **manager:** add auction methods ([70ee802](https://gitlab.com/tezos-domains/client/commit/70ee8027f2da589cf074b09be10951252ea71fcf))
* **resolver:** rename resolver public api methods so its more clear what they do ([5a28000](https://gitlab.com/tezos-domains/client/commit/5a28000fcbfd15fe50080794e0d81b5eba85a8be))


### Reverts

* add back carthagenet addresses, since resolver still works ([f661ed5](https://gitlab.com/tezos-domains/client/commit/f661ed5e69f0d9c52bf5884271edf872b2b077ca))


### BREAKING CHANGES

* `tezos` parameter is now required (instance `Tezos` was removed from taquito)
* **resolver:** Renamed `resolver` methods:
 - `resolve` => `resolveDomainRecord`
 - `resolveAddress` => `resolveNameToAddress`
 - `reverseResolve` => `resolveReverseRecord`
 - `reverseResolveName` => `resolveAddressToName`
* **manager:** - `getPrice()` method was removed from the `manager`, use `getAcquisitionInfo` instead.
- `carthagenet` network is currently not supported
- all TEZ amounts are now in mutez





# [1.0.0-beta.13](https://gitlab.com/tezos-domains/client/compare/v1.0.0-beta.12...v1.0.0-beta.13) (2020-10-06)

**Note:** Version bump only for package integration-tests





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

**Note:** Version bump only for package integration-tests





# [1.0.0-beta.10](https://gitlab.com/tezos-domains/client/compare/v1.0.0-beta.9...v1.0.0-beta.10) (2020-09-16)


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

**Note:** Version bump only for package integration-tests






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

**Note:** Version bump only for package integration-tests





# [1.0.0-beta.5](https://gitlab.com/tezos-domains/client/compare/v1.0.0-beta.4...v1.0.0-beta.5) (2020-08-11)

**Note:** Version bump only for package integration-tests





# [1.0.0-beta.4](https://gitlab.com/tezos-domains/client/compare/v1.0.0-beta.3...v1.0.0-beta.4) (2020-08-10)


### Features

* **client:** add client umbrella package that provides functionality of manager and resolver ([1439238](https://gitlab.com/tezos-domains/client/commit/1439238da6501503297545e826fd95508ae2a425))
* **manager:** add manager package that provides domain management functions ([1028f16](https://gitlab.com/tezos-domains/client/commit/1028f1661d0a61ac5a354c7cc89a0839d9e121cd))






# [1.0.0-beta.3](https://gitlab.com/tezos-domains/client/compare/v1.0.0-beta.2...v1.0.0-beta.3) (2020-08-04)


### Features

* switch to new contracts ([e6a85c4](https://gitlab.com/tezos-domains/client/commit/e6a85c4a2bf9982b314aad6c7a62a34588abb4d6))


### BREAKING CHANGES

* Proxy address resolution related functionality was removed.





# [1.0.0-beta.2](https://gitlab.com/tezos-domains/client/compare/v1.0.0-beta.1...v1.0.0-beta.2) (2020-08-03)


### Features

* **resolver:** throw when name or address parameters are invalid ([b9dfb56](https://gitlab.com/tezos-domains/client/commit/b9dfb562face96f936bd5e8156c0b8100261730d))






# [1.0.0-beta.1](https://gitlab.com/tezos-domains/client/compare/v1.0.0-beta.0...v1.0.0-beta.1) (2020-07-31)

**Note:** Version bump only for package integration-tests






# [1.0.0-beta.0](https://gitlab.com/tezos-domains/client/compare/v0.0.1-alpha.1...v1.0.0-beta.0) (2020-07-30)


### Features

* add tracing ([e2434c0](https://gitlab.com/tezos-domains/client/commit/e2434c0742d2d660b186a335aaabd420d952f6f5))
