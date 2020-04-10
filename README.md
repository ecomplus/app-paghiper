# App PagHiper

E-Com Plus app to integrate PagHiper

## Environment variables sample

Variable              | Value
---                   | ---
`LOGGER_OUTPUT`       | `~/app/log/logger.out`
`LOGGER_ERRORS`       | `~/app/log/logger.err`
`LOGGER_FATAL_ERRORS` | `~/app/log/_stderr`
`PORT`                | `3000`
`APP_BASE_URI`        | `https://paghiper.ecomplus.biz`
`DB_PATH`             | `~/app/db.sqlite`
`ECOM_AUTH_DB`        | `~/app/db.sqlite`
`ECOM_AUTH_UPDATE`    | `enabled`
`PAGHIPER_PARTNER_ID` | `1234567`

## Production server

Published at https://paghiper.ecomplus.biz

### Continuous deployment

When app version is **production ready**,
[create a new release](https://github.com/ecomclub/app-paghiper/releases)
to run automatic deploy from `master` branch.
