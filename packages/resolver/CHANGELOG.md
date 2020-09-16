# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [1.0.0-beta.9](https://gitlab.com/tezos-domains/client/compare/v1.0.0-beta.8...v1.0.0-beta.9) (2020-09-03)

**Note:** Version bump only for package @tezos-domains/resolver





# [1.0.0-beta.8](https://gitlab.com/tezos-domains/client/compare/v1.0.0-beta.7...v1.0.0-beta.8) (2020-09-03)


### Features

* **resolver:** add clearCache api ([bd4d83b](https://gitlab.com/tezos-domains/client/commit/bd4d83b57b0a54166960b32a528354efc08c5927))






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

**Note:** Version bump only for package @tezos-domains/resolver





# [1.0.0-beta.5](https://gitlab.com/tezos-domains/client/compare/v1.0.0-beta.4...v1.0.0-beta.5) (2020-08-11)

**Note:** Version bump only for package @tezos-domains/resolver





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

* **resolver:** add NullNameResolver (always returns null) for when resolution should be skipped ([c5baf2d](https://gitlab.com/tezos-domains/client/commit/c5baf2d88536294c145c2b009a1f6e2aa7381595))
* **resolver:** add optional caching with configurable ttl ([59fe4ac](https://gitlab.com/tezos-domains/client/commit/59fe4ac65fca3e0295ecdc92111dcb29a2cd7f71))
* **resolver:** throw when name or address parameters are invalid ([b9dfb56](https://gitlab.com/tezos-domains/client/commit/b9dfb562face96f936bd5e8156c0b8100261730d))






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

**Note:** Version bump only for package @tezos-domains/resolver
