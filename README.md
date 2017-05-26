# apprc

[![build status](https://travis-ci.org/igl/apprc.svg?branch=master)](https://travis-ci.org/igl/apprc)
[![npm version](https://img.shields.io/npm/v/apprc.svg?style=flat)](https://www.npmjs.com/package/apprc)
[![npm downloads](https://img.shields.io/npm/dm/apprc.svg?style=flat)](https://www.npmjs.com/package/apprc)
[![npm dependencies](https://david-dm.org/igl/apprc.svg?style=flat)](https://david-dm.org/igl/apprc)


My opinionated and almost-non-configurable configuration loader for lazy people who like yaml.

- 1 file for multible environments
- supports yaml or json
- deep-freezes   config object


## Installation

```
yarn add apprc
```


## Usage

apprc will look for config files in the following locations:

- closest `.${appName}rc` by continuously looking in '../' until '/' is reached
- `$HOME/.${appName}rc`
- `$HOME/${appName}/config`
- `$HOME/.${appName}/config`
- `$HOME/.config/${appName}rc`
- `$HOME/.config/${appName}/config`
- `/etc/${appName}rc`
- `/etc/${appName}/config`

files can optionally have the `.yml` or `.json` extension in their names

### Module

```javascript
const config = require('apprc')(defaults, envKey, appName)
```

arguments default to:

```javascript
defaults = {}
appName = package_json.name
envKey = process.env.NODE_ENV || 'development'
```

### CLI

```
$ apprc --help

apprc <variable> [args]

Options:
  --env, -e        Environment                               [string] [required]
  --name, -n       Name (default: "name" in package.json)               [string]
  --force, -f      Don't bail on missing value                         [boolean]
  --undefined, -u  Fallback output of missing value                     [string]
  --delimiter, -d  Custom path delimiter (default: ".")  [string] [default: "."]
  --help, -h, -?   Show help                                           [boolean]


$ apprc --env production
{"http":{"port":80}}

$ apprc http --env production
{"port":80}

$ apprc http.port --env production
80

```


## Config Format

Config files must be in the JSON or YAML format:

```yaml
---
defaults:
    view_engine: jade

development:
    http_port: 8080

production:
    http_port: 80
```

loaded with:

```javascript
const config = require('apprc')('development')

```

results in:

```javascript
{
    "view_engine": "jade",
    "http_port": 8080
}
```

## LICENSE

MIT
