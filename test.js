/* eslint-env node, es6 */
'use strict'

import test from 'ava'
import apprc from './index'
import deepFreeze from 'deep-freeze'
import { execSync } from 'child_process'

const expected = deepFreeze({
    defaults: {
        default: 'defaultValue',
        key: 'defaultValue',
        nested: {
            default: 'defaultValue',
            value: 'defaultValue'
        }
    },
    development: {
        default: 'defaultValue',
        key: 'devValue',
        nested: {
            default: 'defaultValue',
            value: 'devValue'
        }
    },
    production: {
        default: 'defaultValue',
        key: 'prodValue',
        nested: {
            default: 'defaultValue',
            value: 'prodValue'
        }
    }
})

test('loads development config by default', (t) => {
    const cfg = apprc()
    t.is(cfg.default, expected.development.default)
    t.is(cfg.key, expected.development.key)
})

test('gets hardcoded defaults', (t) => {
    const cfg = apprc({ yellow: 'world' })
    t.is(cfg.yellow, 'world')
    t.is(cfg.key, expected.development.key)
})

test('has .appName', (t) => {
    const cfg = apprc(null)
    t.is(cfg.appName, 'apprc')
    const cfg2 = apprc(null, null, 'myapp')
    t.is(cfg2.appName, 'myapp')
})

test('has .configs[]', (t) => {
    const cfg = apprc(null)
    t.true(Array.isArray(cfg.configs))
    t.true(cfg.configs.length > 0)
})

test('correctly deep extends configs', (t) => {
    const cfgDev = apprc(null, 'development')
    t.deepEqual(cfgDev.nested, expected.development.nested)
    const cfgProd = apprc(null, 'production')
    t.deepEqual(cfgProd.nested, expected.production.nested)
})

test('loads development config', (t) => {
    const cfg = apprc(null, 'development')
    t.is(cfg.default, expected.development.default)
    t.is(cfg.key, expected.development.key)
})

test('loads production config', (t) => {
    const cfg = apprc(null, 'production')
    t.is(cfg.default, expected.production.default)
    t.is(cfg.key, expected.production.key)
})

test('loads custom appName', (t) => {
    const cfg = apprc(null, 'production', 'myapp')
    t.is(cfg.default, expected.production.default)
    t.is(cfg.key, expected.production.key)
    t.is(cfg.other, true)
})

test('returns frozen config', (t) => {
    const cfg = apprc()
    t.throws(() => {
        cfg.key = 'foo'
    })
    t.is(cfg.key, expected.development.key)
})

/**
 * CLI Tests
 */
test('cli loads development config', (t) => {
    const cfg = JSON.parse(
        execSync('node bin.js --env development').toString()
    )
    t.is(cfg.default, expected.development.default)
    t.is(cfg.key, expected.development.key)
})

test('cli loads production config', (t) => {
    const cfg = JSON.parse(
        execSync('node bin.js --env production').toString()
    )
    t.is(cfg.default, expected.production.default)
    t.is(cfg.key, expected.production.key)
})

test('cli returns a single value', (t) => {
    const key = execSync('node bin.js key --env production').toString()
    t.is(key, expected.production.key)

    const nestedVal = execSync('node bin.js key --env production').toString()
    t.is(nestedVal, expected.production.nested.value)
})
