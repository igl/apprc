/* eslint-env node, es6 */
'use strict'

import test from 'ava'
import apprc from './index'
import deepFreeze from 'deep-freeze'
import YML from 'js-yaml'
import { readFileSync } from 'fs'
import { execSync } from 'child_process'

const expected = deepFreeze(
    YML.safeLoad(
        readFileSync('.apprcrc', 'utf8')
    )
)

function run (args = '') {
    return execSync(`node bin.js ${ args }`, { stdio: 'pipe' }).toString()
}

test('loads development config by default', (t) => {
    const cfg = apprc()
    t.is(cfg.default, expected.defaults.default)
    t.is(cfg.key, expected.development.key)
})

test('has hardcoded defaults', (t) => {
    const cfg = apprc({ yellow: 'world' })
    t.is(cfg.yellow, 'world')
    t.is(cfg.default, expected.defaults.default)
})

test('has and respects appName argument', (t) => {
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
    t.deepEqual(cfgDev.nested, { ...expected.defaults.nested, ...expected.development.nested })
    const cfgProd = apprc(null, 'production')
    t.deepEqual(cfgProd.nested, { ...expected.defaults.nested, ...expected.production.nested })
})

test('loads development config', (t) => {
    const cfg = apprc(null, 'development')
    t.is(cfg.default, expected.defaults.default)
    t.is(cfg.key, expected.development.key)
})

test('loads production config', (t) => {
    const cfg = apprc(null, 'production')
    t.is(cfg.default, expected.defaults.default)
    t.is(cfg.key, expected.production.key)
})

test('loads custom appName', (t) => {
    const cfg = apprc(null, 'production', 'myapp')
    t.is(cfg.default, 'defaultValue')
    t.is(cfg.key, 'prodValue')
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
    t.is(cfg.default, expected.defaults.default)
    t.is(cfg.key, expected.development.key)
})

test('cli loads production config', (t) => {
    const cfg = JSON.parse(
        run('--env production')
    )
    t.is(cfg.default, expected.defaults.default)
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
    const errorMessage = 'apprc could not find "this.is.definitly.missing". Please make sure'
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
    let val
    try {
        val = run('this.is.definitly.missing --env development --undefined foobar')
    } catch (e) {
        throw new Error('should NOT exit with error code when key is "undefined"')
    }
    t.is(val, 'foobar')
})

test('cli: --delimiter in path', (t) => {
    const val = run('nested/even/deeper --env development --delimiter "/"')
    t.is(val, expected.defaults.nested.even.deeper)
})

test('cli: can also lookup values using brackets in path', (t) => {
    const val = run('nested[even]@yolo@value --env development --delimiter "@"')
    t.is(val, expected.defaults.nested.even.yolo.value)
})

test('cli: can also lookup values inside arrays', (t) => {
    const val1 = run('nested.array.0 --env development')
    const val2 = run('nested[array]@1 --env development --delimiter "@"')
    const val3 = run('nested[array][2] --env development --delimiter "@"')
    t.is(val1, expected.defaults.nested.array[0])
    t.is(val2, expected.defaults.nested.array[1])
    t.is(val3, expected.defaults.nested.array[2])
})
