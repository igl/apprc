'use strict'

var fs = require('fs');
var path = require('path');
var YML = require('js-yaml');
var osHomedir = require('os-homedir');
var deepExtend = require('deep-extend')
var deepFreeze = require('deep-freeze')

/**
 * Utils
 */
function findClosest (cwd, fileName) {
    var configFile;
    var currentDir = path.resolve(cwd, '.');

    while (true) {
        try {
            configFile = path.join(currentDir, fileName);

            if (fs.statSync(configFile).isFile()) {
                break;
            }
        } catch (_) { /* ignore error */ }

        configFile = undefined;
        currentDir = path.resolve(currentDir, '..');

        if (currentDir === '/') {
            break;
        }
    }

    return configFile;
}

function parseFile (filePath) {
    try {
        var data = fs.readFileSync(filePath, 'utf8');
        return YML.safeLoad(data);
    }
    catch (err) {
        console.error('apprc could not parse file "' + filePath + '":' + err.message);
    }
}

/**
 * Main
 */
module.exports = function apprc (_extraVars, _envKey, _appName) {
    var cwd = process.cwd();
    var pkg = parseFile(findClosest(cwd, 'package.json'));

    var defaults = _extraVars || {}
    var envKey = _envKey || process.env.NODE_ENV || 'development';
    var appName = _appName || pkg.name;

    var locations = [
        findClosest(cwd, '.' + appName + 'rc'),
        path.join(osHomedir(), '.' + appName + 'rc'),
        path.join(osHomedir(), appName, '/config'),
        path.join(osHomedir(), '/.config/', appName),
        path.join(osHomedir(), '/.config/', appName, '/config'),
        path.join('/etc', appName + 'rc'),
        path.join('/etc', appName, '/config')
    ]

    var locationsFound = locations.filter(function (filePath) {
        try {
            if (fs.statSync(filePath).isFile()) { return true; }
        } catch (_) { /* ignore error */ }
        return false;
    })

    var allConfigs = locationsFound.map(parseFile);

    var merged = deepExtend.apply(null, allConfigs);

    var finalConfig = deepExtend(
        defaults,
        (envKey
            ? deepExtend(merged.defaults || {}, merged[envKey] || {})
            : merged
        ),
        {
            appName: appName,
            configs: locationsFound
        }
    );

    return deepFreeze(finalConfig);
}
