#!/usr/bin/env node
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
    .argv;

var conf = require('./index')(null, argv.env, argv.name);
var varPath = argv._[0];

function write (obj) {
    if (typeof obj === 'object') {
        process.stdout.write(JSON.stringify(obj));
    }
    else {
        process.stdout.write(obj);
    }
}

if (!varPath) {
    write(conf);
}
else {
    varPath = varPath.split('.');

    var current = conf;
    for (var i = 0, len = varPath.length; i < len; i += 1) {
        current = current[varPath[i]];

        if (typeof current === 'undefined') {
            current = '';
            break;
        }
    }

    write(current);
}
