#!/usr/bin/env node

'use strict'

const { TRANSACTIONS_TABLE, DEFAULT_DB_PATH } = require('./../lib/constants')
// SQLite3 database client
// https://github.com/mapbox/node-sqlite3
const sqlite = require('sqlite3').verbose()
// log to files
const logger = require('console-files')

// setup table to reference PagHiper transaction to respective store
const dbFilename = process.env.DB_PATH || process.env.ECOM_AUTH_DB || DEFAULT_DB_PATH
const db = new sqlite.Database(dbFilename, err => {
  if (err) {
    // debug and destroy Node process
    logger.error(err)
    process.exit(1)
  } else {
    // try to run first query creating table
    db.run(`CREATE TABLE IF NOT EXISTS ${TRANSACTIONS_TABLE} (
      paghiper_transaction_id     VARCHAR   NOT NULL  PRIMARY KEY,
      store_id                    INTEGER   NOT NULL
    );`)
  }
})
