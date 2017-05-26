'use strict';

var fs = require('fs');
var path = require('path');
var YML = require('js-yaml');
var osHomedir = require('os-homedir');
var deepExtend = require('deep-extend');
var deepFreeze = require('deep-freeze');
var NODE_ENV = process.env.NODE_ENV;

/**
 * Utils
 */
function findClosestSync (cwd, fileName) {
    var configFile;
    var currentDir = path.resolve(cwd);

    for (;;) {
        try {
            configFile = path.join(currentDir, fileName);

            if (fs.statSync(configFile).isFile()) {
                break;
            }
        } catch (_) {
            configFile = undefined;
        }

        configFile = undefined;
        currentDir = path.resolve(currentDir, '..');

        if (currentDir === '/') {
            break;
        }
    }

    return configFile;
}

function parseFileSync (filePath) {
    try {
        var data = fs.readFileSync(filePath, 'utf8');
        return YML.safeLoad(data);
    }
    catch (err) {
        throw new Error(
            'apprc could not parse file "' + filePath + '":' + err.message
        );
    }
}

function fileExistsSync (path) {
    try {
        fs.statSync(path).isFile();
        return true;
    } catch (_) { /* ignore error */}
    return false;
}

/**
 * Main
 */
module.exports = function apprc (_extraVars, _envKey, _appName, _locations) {
    var cwd = process.cwd();
    var pkg = parseFileSync(findClosestSync(cwd, 'package.json'));

    var defaults = _extraVars || {};
    var envKey = _envKey ? _envKey : NODE_ENV || 'development';
    var appName = _appName || pkg.name;

    if (!appName) {
        throw new Error(
            'apprc could not detect "appName". ' +
            'Please make sure there is a package.json with a name property ' +
            'or provide it manually.'
        );
    }

    var locations = _locations || [
        findClosestSync(cwd, '.' + appName + 'rc'),
        findClosestSync(cwd, '.' + appName + 'rc.yml'),
        findClosestSync(cwd, '.' + appName + 'rc.json'),
        path.join(osHomedir(), '.' + appName + 'rc'),
        path.join(osHomedir(), appName, '/config'),
        path.join(osHomedir(), '.' + appName, '/config'),
        path.join(osHomedir(), '/.config/', appName),
        path.join(osHomedir(), '/.config/', appName, '/config'),
        path.join('/etc/', appName + 'rc'),
        path.join('/etc/', appName, '/config')
    ].filter(Boolean);

    var locationsFound = locations.reduce(function (found, nextLoc) {
        if (fileExistsSync(nextLoc))
            found.push(nextLoc);
        else if (fileExistsSync(nextLoc + '.yml'))
            found.push(nextLoc + '.yml');
        else if (fileExistsSync(nextLoc + '.json'))
            found.push(nextLoc + '.json');
        else if (fileExistsSync(nextLoc + '.yaml'))
            found.push(nextLoc + '.yaml');

        return found;
    }, []);

    var allConfigs = locationsFound.map(parseFileSync);

    var merged = deepExtend.apply(null, allConfigs);

    var finalConfig = deepExtend(
        defaults,
        envKey
            ? deepExtend(merged.defaults || {}, merged[envKey] || {})
            : merged
        ,
        {
            appName: appName,
            configs: locationsFound
        }
    );

    return deepFreeze(finalConfig);
};
