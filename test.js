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
    t.deepEqual(cfg, expected.development)
})

test('loads development config', (t) => {
    const cfg = apprc('development')
    t.deepEqual(cfg, expected.development)
})

test('loads production config', (t) => {
    const cfg = apprc('production')
    t.deepEqual(cfg, expected.production)
})

test('loads custom appName', (t) => {
    const cfg = apprc('production', 'myapp')
    t.deepEqual(cfg, { ...expected.production, name: 'myapp' })
})

test('freezes config', (t) => {
    const cfg = apprc()
    t.throws(() => {
        cfg.key = 'foo'
    })
    t.deepEqual(cfg, expected.development)
})
