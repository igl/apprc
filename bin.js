#!/usr/bin/env node
var argv = require('yargs')
    .usage('$0 <variable> [args]')
    .option('env', {
        alias: 'e',
        demand: true,
        describe: 'Environment',
        type: 'string'
    })
    .option('name', {
        alias: 'n',
        demand: false,
        describe: 'Name (default: "name" in package.json)',
        type: 'string'
    })
    .option('force', {
        alias: 'f',
        demand: false,
        describe: 'Don\'t bail on missing value',
        type: 'boolean'
    })
    .option('undefined', {
        alias: 'u',
        demand: false,
        describe: 'Fallback output of missing value',
        type: 'string'
    })
    .option('help', {
        alias: ['h', '?']
    })
    .help()
    .argv;

var config = require('./index')(null, argv.env, argv.name);

function write (value) {
    if (typeof value === 'string') {
        process.stdout.write(value);
    }
    else {
        try {
            process.stdout.write(JSON.stringify(value));
        } catch (e) {
            if (typeof argv.undefined !== 'undefined') {
                process.stdout.write(argv.undefined);
            } else {
                console.error('apprc failed to stringify value:', value); // eslint-disable-line
                process.exit(1);
            }
        }
    }
}

var keyPath = argv._[0] && argv._[0].split('.');

if (!keyPath) {
    write(config);
}
else {
    var value = config;
    for (var i = 0, len = keyPath.length; i < len; i += 1) {
        value = value[keyPath[i]];

        if (typeof value === 'undefined') {
            break;
        }
    }

    write(value);
}
