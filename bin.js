#!/usr/bin/env node
var util = require('util')

function write () {
    process.stdout.write(
        util.format.apply(util, arguments)
    )
}

var argv = require('yargs')
    .usage('$0 <variable> [args]')
    .option('env', {
        alias: 'e',
        demand: true,
        describe: 'environment',
        type: 'string'
    })
    .option('name', {
        alias: 'n',
        demand: false,
        describe: 'app name (default: .name property of closest package.json)',
        type: 'string'
    })
    .help()
    .argv

var conf = require('./index')(null, argv.env, argv.name)
var varPath = argv._[0]

if (!varPath) {
    write(JSON.stringify(conf))
} else {
    var current
    varPath = varPath.split('.')

    for (var i = 0, len = varPath.length; i < len; i += 1) {
        current = conf[varPath[i]]
    }

    write(current)
}
