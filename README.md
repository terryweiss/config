__**CC Configuration**__



[TOC]


# Intro
This library is designed to standardize the way my libraries deal with configurations in Node releases. This library does not implement or enforce a particular configuration for any system. What it does is standardize where the config is found and how it is populated. It is intended to capture some practices from others, but it does not require you only use those practices. Instead it says if you do it _this_ way, it will make your results predictable.

There are three ways to get configuration: command line, configuration file, and environment. [12 Factor apps](https://12factor.net/) specifies only using the environemnt as a configuration store. This is a handy idea, but doesn't scale to complex configurations (12 Factor says that that means the library is too complex - I doubt they are right). But, but, but for the things that differ from `dev` to `production` and the environments in between, the environment is ideal for configuration as a `docker-compose` file can pull those values in easily. So the only difference from one environment to another is which `docker-compose` file you use.

Configuration files should be used for defaults that rarely change. We prefer YAML files over JSON because they are easier to edit, support comments and are just less idiosyncratic. But we support JSON anyway - your call. Command line (CLI) options should handle things that may change from run to run. They are also handy for quickly and easily changing logging metric options on the fly while debugging.

This library supports all three types, but won't enforce semantic meaning to where you get your configuration from. This is based on the [confab](http://rjz.github.io/confab/) configuration tool's strategy (but it is not used after version 1.x) and [yargs](http://yargs.js.org/) command line interpreter and inspired by [this blog article](https://rjzaworski.com/2016/03/command-line-configuration-with-confab-and-yargs).

The order in which things are loaded are config files -> enviroment variables -> CLI. Subsequent values with the same name are overwritten left to right.

#Installation
```bash
npm install @terryweiss/config
```

#Usage
Each option can be expressed in a config file, an environment variable and command line option. Although
each medium is available, the actual value need only appear in one (or none if you set default values). Each 
option can have these properties set on it (see IOption for implementation details). 

## IOption
| Property| Required? |Description |
|---|---|---|
| `name` | Required |The name of the option. When you load the configuration, this will be the name of the property on the config runtime instance |
| `description`| Optional |The Description will show up when the cli is invoked with `--help` |
| `required` | Optional | When true, the value is demanded on the CLI |
| `flag` | Optional | To make an option available from the command line, profile a flag value with will be the long form (`--`)
| `shortFlag` | Optional | This is a short flag on the command line (`-`)
| `envFlag` | Optional | To make the option available from the environment, provide a name for the variable here
| `path` | Optional | To specify exactly where the option will be valued on the configuration object, you can specify a string. This is provided so that you can match up deeply nested config files with simple CLI or environment values | 
| `type` | Optional | The data type. Can be `string`, `array`, `number`, `boolean`, `count`. As of 2.0, this only only validated on the CLI as the environment always comes in as strings. The `count` type is special and counts he number of times a flag appears. So for instance, -v will value as 1 and -vvvv will value as 4.
| `choices` | Optional | An array of strings that define what values are allowed by the option. |

## config
| Methods | Description |
|---|---|
| `load()` | The configuration is not available until you load it. Get all your options set up and then load it and after that the `config` instance will contain your values. |
| `reset()` | Resets the configuration and removes all options. You must reload it to get values back in |
| `option(IOption)` | Create an option |
| `options(IOption[])` | Create a bunch of options |
| `configFiles()` | Returns the array of paths that will be loaded |
| `setConfigFiles(string[])` | Set the array of paths that will be loaded, they must be yaml or json files |

Regardless of what value you provide for `flag`, 'shortFlag' or `envFlag`, the option will be named by the `name` property of the option. 

#Examples
```js
const config = require( "@terryweiss/config" ).default;

// the simplest definition will just load the config files from "./config.json", "..config.yaml"
config.load();

// we can tell the config where to find our config files.
config.setConfigFiles( [
		join( __dirname, "config/", "config.yaml" ),
		join( __dirname, "config/", "config.json" )
	] );

// We'll create an environment only option
config.option( {
		name   : "inDebt",
		envFlag: "IN_DEBT"
	} );


process.env.IN_DEBT = "Nope";

config.load();
console.into(config.inDebt); // > Nope

// Here's a CLI variable
config.option( {
		name   : "myOption",
		flag: "myOption",
		description: "I am a test option",
		shortFlag: "m"
	} ); 

// When we run the app with --help, we get:
// Options:
//   --help      Show help                                                [boolean]
//   --version   Show version number                                      [boolean]
//   --myOption, -m  I am a test option

// We can have an option that is available as a en environment variable or on the CLI
config.option( {
		name   : "myOption",
		flag: "myOption",
		envFlag: "MY_OPTION",
		description: "I am a test option",
		shortFlag: "m"
	} );
```

#Building
`core.config` is built in Typescript and uses good ol' `make` to build. See BUILD.md for details in this directory

