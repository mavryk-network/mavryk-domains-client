# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

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
