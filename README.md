# apprc

[![build status](https://img.shields.io/travis/igl/prelude.svg?style=flat-square)](https://travis-ci.org/igl/apprc)
[![npm version](https://img.shields.io/npm/v/apprc.svg?style=flat-square)](https://www.npmjs.com/package/apprc)
[![npm downloads](https://img.shields.io/npm/dm/apprc.svg?style=flat-square)](https://www.npmjs.com/package/apprc)

My opinionated and non-configurable configuration loader for lazy people who like yaml.

- 1 file for multible environments
- supports yaml or json
- deep-freezes config object


## Installation

```
npm install --save apprc
```


## Usage

```javascript
const config = require('apprc')(defaults, envKey, appName)
```

arguments default to:

```javascript
defaults = {}
appName = package_json.name
envKey = process.env.NODE_ENV || 'development'
```


apprc will look for config files in the following locations:

- closest `.${appName}rc` by continuously looking in '../' until the hd root '/' is reached
- `$HOME/.${appName}rc`
- `$HOME/${appName}/config`
- `$HOME/.config/${appName}rc`
- `$HOME/.config/${appName}/config`
- `/etc/${appName}rc`
- `/etc/${appName}/config`


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
