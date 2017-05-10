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
        num: 42,
        bool: true,
        arr: [ 1, 2, 'foo' ],
        json: { key: 'value' },
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

function run (args = '') {
    return execSync(`node bin.js ${ args }`, { stdio: 'pipe' }).toString()
}

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
        run('--env development')
    )
    t.is(cfg.default, expected.development.default)
    t.is(cfg.key, expected.development.key)
})

test('cli loads production config', (t) => {
    const cfg = JSON.parse(
        run('--env production')
    )
    t.is(cfg.default, expected.production.default)
    t.is(cfg.key, expected.production.key)
})

test('cli returns a single value', (t) => {
    const key = run('key --env production')
    t.is(key, expected.production.key)

    const nestedVal = run('key --env production')
    t.is(nestedVal, expected.production.nested.value)
})

test('cli returns nested values', (t) => {
    const key = run('key --env production')
    t.is(key, expected.production.key)

    const nestedVal = run('key --env production')
    t.is(nestedVal, expected.production.nested.value)
})

test('cli returns JSON types properly', (t) => {
    t.is(run('num --env production'), '42')
    t.is(run('zero --env production'), '0')
    t.is(run('truthy --env production'), 'true')
    t.is(run('falsy --env production'), 'false')
    t.is(run('array --env production'), `[1,2,"foo"]`)
    t.is(run('json --env production'), `{"key":"value"}`)
    t.is(run('null --env production'), `null`)
})

test('cli exits with error code when key is "undefined"', (t) => {
    const errorMessage = 'apprc failed to stringify value: undefined'
    try {
        run('this.is.definitly.missing --env development')
    } catch (e) {
        if (!e.message.includes(errorMessage)) {
            throw new Error('should exit with error code when key is "undefined"')
        }
    }
})

test('cli: --undefined does not fail when key is "undefined"', (t) => {
    try {
        run('this.is.definitly.missing --env development --undefined')
    } catch (e) {
        throw new Error('should NOT exit with error code when key is "undefined"')
    }
})

test('cli: --undefined returns the fallback value', (t) => {
    try {
        const key = run('this.is.definitly.missing --env development --undefined foobar')
        t.is(key, 'foobar')
    } catch (e) {
        throw new Error('should NOT exit with error code when key is "undefined"')
    }
})
