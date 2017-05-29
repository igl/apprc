'use strict';

var fs = require('fs');
var path = require('path');
var YML = require('js-yaml');
var osHomedir = require('os-homedir');
var deepExtend = require('deep-extend');
var deepFreeze = require('deep-freeze');
var NODE_ENV = process.env.NODE_ENV;


/**
 * legacy isArray
 * @arg { any }
 * @returns { bool }
 */

var isArray = Array.isArray || function (arr) {
    return Object.prototype.toString.call(arr) === '[object Array]';
};


/**
 * findFile
 * returns the first filename found in directory
 * @arg { string } dirPath
 * @arg { string[] } filenames
 * @return { string? } filename
 */
function findFile (dirPath, filenames) {
    try {
        var ls = fs.readdirSync(dirPath);
        for (var i = 0, listLen = ls.length; i < listLen; i++) {
            for (var ii = 0, fileLen = filenames.length; ii < fileLen; ii++) {
                if (ls[i] === filenames[ii]) return path.join(dirPath, filenames[ii]);
            }
        }
    } catch (_) { /* ignore error */ }
    // return undefined;
}


/**
 * findClosestFile
 * returns the first filename found in any parent directory until "/" (root)
 * @arg { string } dirPath
 * @arg { string[] } filenames
 * @return { string? } filename
 */
function findClosestFile (dirPath, filenames) {
    var found;
    var currentDir = path.resolve(dirPath);

    for (;;) {
        found = findFile(currentDir, filenames);

        if (found || currentDir === '/') {
            break;
        }

        currentDir = path.resolve(currentDir, '..');
    }

    return found;
}


/**
 * loadFile
 * read and parses a yml files content (nice side effect: JSON is valid yaml syntax)
 *
 * @arg { string } filePath
 * @return { Object } config file contents
 */
function loadFile (filePath) {
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


/**
 * getDefaultLocations
 * returns a list of lookup paths
 *
 * @arg { string } appName
 * @return { string[] } lookup paths
 */
function getDefaultLocations (appName) {
    return [
        findClosestFile(process.cwd(), [
            '.' + appName + 'rc',
            '.' + appName + 'rc.yml',
            '.' + appName + 'rc.json'
        ]),
        path.join(osHomedir(), '.' + appName + 'rc'),
        path.join(osHomedir(), appName, '/config'),
        path.join(osHomedir(), '.' + appName, '/config'),
        path.join(osHomedir(), '/.config/', appName),
        path.join(osHomedir(), '/.config/', appName, '/config'),
        path.join('/etc/', appName + 'rc'),
        path.join('/etc/', appName, '/config')
    ];
}


/**
 * apprc
 * @arg { Object? } defaults
 * @arg { string? } envKey name of environment-variable switch
 * @arg { string? } appName name of app
 * @arg { string? | string[]? } locations overwrite lookup-paths
 */
module.exports = function apprc (_extraVars, _envKey, _appName, _locations) {
    // parse arguments
    var pkg = loadFile(findClosestFile(process.cwd(), ['package.json']));

    var defaults = _extraVars || {};
    var envKey = _envKey != null ? _envKey : NODE_ENV || 'development';
    var appName = _appName || pkg.name;

    if (!appName) {
        throw new Error(
            'apprc could not detect "appName". ' +
            'Please make sure there is a package.json with a name property ' +
            'or provide it manually.'
        );
    }

    // list of all locations that may contain config files
    var locations;

    if (typeof _locations === 'string') {
        locations = _locations.split(';');
    }
    else if (isArray(_locations)) {
        locations = _locations;
    }

    if (!locations) {
        locations = getDefaultLocations(appName);
    }

    // validate and dedupe list
    locations = locations.reduce(function (results, nextLoc) {
        if (!nextLoc) return results; // findClosestFile() may return undefined

        // find existing files
        var filePath = path.dirname(nextLoc);
        var fileName = path.basename(nextLoc);
        var found = findFile(filePath, [ fileName, fileName + '.yml', fileName + '.json' ]);
        if (found && results.indexOf(found) === -1) results.push(nextLoc);

        return results;
    }, []);

    // load all and deep-merge
    var merged = deepExtend.apply(null, locations.map(loadFile));

    // compose returned config
    var finalConfig = deepExtend(
        defaults,
        envKey
            ? deepExtend(merged.defaults || {}, merged[envKey] || {})
            : merged
        ,
        {
            appName: appName,
            configs: locations
        }
    );

    // freeze it!
    return deepFreeze(finalConfig);
};
