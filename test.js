'use strict'

import test from 'ava'
import apprc from './index'

const expected = {
    defaults: {
        default: 'defaultValue',
        key: 'defaultValue'
    },
    development: {
        default: 'defaultValue',
        key: 'devValue'
    },
    production: {
        default: 'defaultValue',
        key: 'prodValue'
    }
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

test('freezes config', (t) => {
    const cfg = apprc()
    t.throws(() => {
        cfg.key = 'foo'
    })
    t.is(cfg.key, expected.development.key)
})
