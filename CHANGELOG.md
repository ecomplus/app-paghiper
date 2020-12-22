# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [1.3.0](https://github.com/ecomplus/app-paghiper/compare/v1.2.0...v1.3.0) (2020-12-22)


### Features

* **admin-settings:** add 'min_amount' config option ([#5](https://github.com/ecomplus/app-paghiper/issues/5)) ([70b2381](https://github.com/ecomplus/app-paghiper/commit/70b2381755fbfb1711b4e1c9b6d29d296ed615c8))

## [1.2.0](https://github.com/ecomplus/app-paghiper/compare/v1.1.1...v1.2.0) (2020-12-22)


### Features

* **pix:** setup config options and create pix transaction ([5070df1](https://github.com/ecomplus/app-paghiper/commit/5070df1c153fbacbe930f744f4e9c864752e1c9f))
* **pix:** setup paghiper pix notification handler ([93094ee](https://github.com/ecomplus/app-paghiper/commit/93094eed0f6ec4150d30af7245ef2615dc9ae061))

### [1.1.1](https://github.com/ecomplus/app-paghiper/compare/v1.1.0...v1.1.1) (2020-09-17)


### Bug Fixes

* **admin-settings:** fix 'cumulative_discount' property ([dba14cb](https://github.com/ecomplus/app-paghiper/commit/dba14cb2f7fb63fcb5c28bcd91bde6d9cfbfa040))

## [1.1.0](https://github.com/ecomplus/app-paghiper/compare/v1.0.7...v1.1.0) (2020-09-15)


### Features

* **list-payments:** optionally set discount non-cumulative ([#3](https://github.com/ecomplus/app-paghiper/issues/3)) ([cdb2799](https://github.com/ecomplus/app-paghiper/commit/cdb27993873264c7809237403d96bf7dee2adf21))

### [1.0.7](https://github.com/ecomplus/app-paghiper/compare/v1.0.6...v1.0.7) (2020-07-01)


### Bug Fixes

* importing @ecomplus/application-sdk ([cc211c3](https://github.com/ecomplus/app-paghiper/commit/cc211c3716ea327e758b6170db973eeb4bcd19ae))
* **deps:** update deps, migrate to @ecomplus/application-sdk ([d417a14](https://github.com/ecomplus/app-paghiper/commit/d417a1413b988f643c51c9addda76da3205cf71d))

### [1.0.6](https://github.com/ecomplus/app-paghiper/compare/v1.0.5...v1.0.6) (2020-05-10)


### Bug Fixes

* **create-transaction:** return paghiper error reponse message if any ([6f99c87](https://github.com/ecomplus/app-paghiper/commit/6f99c87dae1792a0a0bdd34346a4b2997ada0d43))

### [1.0.5](https://github.com/ecomplus/app-paghiper/compare/v1.0.4...v1.0.5) (2020-05-06)

### [1.0.4](https://github.com/ecomplus/app-paghiper/compare/v1.0.3...v1.0.4) (2020-05-06)


### Bug Fixes

* **notification:** handle retry and list orders before fetching paghiper notification ([e193473](https://github.com/ecomplus/app-paghiper/commit/e1934730aa3e4433eb16acbf253386447ce22011))

### [1.0.3](https://github.com/ecomplus/app-paghiper/compare/v1.0.2...v1.0.3) (2020-05-04)

### [1.0.2](https://github.com/ecomplus/app-paghiper/compare/v1.0.1...v1.0.2) (2020-04-10)

### [1.0.1](https://github.com/ecomplus/app-paghiper/compare/v1.0.0...v1.0.1) (2020-03-26)


### Bug Fixes

* **error-handling:** prevent returning 500 status, debug with details ([c8b71b5](https://github.com/ecomplus/app-paghiper/commit/c8b71b5b81a1035b7be24235836d86b6ed740cd0))

## [1.0.0](https://github.com/ecomplus/app-paghiper/compare/v0.7.6...v1.0.0) (2020-03-26)

### [0.7.6](https://github.com/ecomplus/app-paghiper/compare/v0.7.5...v0.7.6) (2020-03-26)


### Bug Fixes

* **notification-debug:** fix logging unhandled notifications ([af02260](https://github.com/ecomplus/app-paghiper/commit/af02260186a03fac410c5cc8f37230e9d23ad026))

### [0.7.5](https://github.com/ecomplus/app-paghiper/compare/v0.7.4...v0.7.5) (2020-03-06)


### Bug Fixes

* **notification:** stop setting paid on completed to prevent duplication ([59bc9ec](https://github.com/ecomplus/app-paghiper/commit/59bc9ec87d39d6c77b9a5a14a082d7dbe0a6dd4e))

### [0.7.4](https://github.com/ecomclub/app-paghiper/compare/v0.7.3...v0.7.4) (2019-12-19)


### Bug Fixes

* **list-payments:** check for discount.value before applying ([165fde6](https://github.com/ecomclub/app-paghiper/commit/165fde6))

### [0.7.3](https://github.com/ecomclub/app-paghiper/compare/v0.7.2...v0.7.3) (2019-09-03)

### [0.7.2](https://github.com/ecomclub/app-paghiper/compare/v0.7.1...v0.7.2) (2019-09-03)


### Features

* **discount:** optionally handle min amount for discount ([895a991](https://github.com/ecomclub/app-paghiper/commit/895a991))
