/**
 * This module contains the configuration manager and the configuration instance. At runtime the instance is a singleton that hides the manager from the consumer,
 * but exposes the public management methods to load the configuration and control what can be interpreted. The Config class is the instance and wraps up the
 * features for consumption.
 *

 */

/** declarations */
import * as yargs        from "yargs";
import * as yml          from "yamljs";
import { existsSync }    from "fs";
import { extname, join } from "path";
import { IOption }       from "./IOption";
import {
	isEmpty,
	isString,
	set,
	each,
	isFunction,
	isArray,
	isUndefined
}                        from "lodash";

/**
 * This class maintains the option references and controls that make the config model work. It is the controller for the config.
 */
class Configure {

	constructor( private configInstance: Config ) {

	}

	[ index: string ]: any

	/**
	 * Flag to indicate whether or not configuration has been loaded
	 */
	private loaded: boolean = false;

	/**
	 * Yargs instance
	 */
	private cli = yargs;

	/**
	 * Determines what config files are looked for and in what order defaults to:
	 * - `<main module path>/config.yaml`
	 * - `<main module path>/config/config.yaml`
	 * - `./config/index.yaml`
	 * - `<lib path>/config.yaml`
	 * - `<lib path>/config/config.yaml`
	 * - `<lib path>/config/index.yaml`
	 */
	public configFiles: string[] = [
		join( process.cwd(), "./config.yaml" ),
		join( process.cwd(), "./config.json" ),
		join( process.cwd(), "./config/config.yaml" ),
		join( process.cwd(), "./config/config.json" )
	];

	/**
	 * The environment variables that were defined
	 */
	private envMap             = new Map();
	/**
	 * The CLI flags that were set
	 */
	private flagsMap           = new Map();
	/**
	 * The options the system is maintaining
	 */
	private options: IOption[] = [];

	/**
	 * Add an option to the mix
	 */
	public option( o: IOption ) {
		o.path = o.path || "";
		if ( !isEmpty( o.envFlag ) && isString( o.envFlag ) ) {
			this.envMap.set( o.envFlag, o );
		}
		if ( !isEmpty( o.flag ) && isString( o.flag ) ) {
			this.flagsMap.set( o.flag, o );
			this.defineCliOption( o );
		}

		this.options.push( o );

	}

	/**
	 * Load and resolve the configuration
	 */
	public load() {
		if ( this.loaded ) {
			throw new Error( "Configuration has already been loaded." );
		}
		this.ensurePaths();
		this.parseFiles();
		this.parseEnv();
		this.parseCli();
		this.loaded = true;
	}

	/** Reset the configuration and start over */
	public reset() {
		this.loaded = false;

		for ( let item of Object.keys( this.configInstance ) ) {
			if ( !isFunction( this.configInstance[ item ] ) && item !== "__cmgr" ) {
				delete this.configInstance[ item ];
			}
		}
	}

	/**
	 * Sets a single value at a particular path on the instance
	 * @param o The option to set a value on
	 * @param value The value to set on the option
	 */
	private setValue( o: IOption, value: any ) {
		if ( isEmpty( o.path ) ) {
			this.configInstance[ o.name ] = value;
		} else {
			set( this.configInstance, [ o.path, o.name ].join( "." ), value );
		}
	}

	/**
	 * Parses the environment, looking for flags set by the definition
	 */
	private parseEnv() {
		for ( let [ key, value ] of this.envMap ) {
			if ( key in process.env ) {
				if ( !isUndefined(process.env[ key ] ) ) {
					this.setValue( value, process.env[ key ] );
				}

			}
		}
	}

	/**
	 * Parses the CLI output
	 */
	private parseCli() {
		this.defineCli();
		each( this.cli.argv, ( v, k ) => {
			if ( !isUndefined( v ) && this.flagsMap.has( k ) ) {
				const flag = this.flagsMap.get( k );
				this.setValue( flag, v );
			}
		} );
	}

	/**
	 * Parse the files array and produce a single object with the contents
	 */
	private parseFiles() {
		let out = {};
		for ( let item of this.configFiles ) {
			if ( existsSync( item ) ) {
				if ( extname( item ).toLowerCase() === ".yml" || extname( item ).toLowerCase() === ".yaml" ) {
					const me = yml.load( item );
					out      = { ...out, ...me };
				} else if ( extname( item ).toLowerCase() === ".json" || extname( item ).toLowerCase() === ".js" ) {
					const me = require( item );
					out      = { ...out, ...me };
				} else {
					throw new Error( `Unknown configuration file type ${item}` );
				}
			}
		}

		Object.assign( this.configInstance, out );
		// this.configInstance = { ...this.configInstance, ...out };
	}

	/**
	 * Makes sure all of the options appear at the correct place in the configuration object
	 */
	private ensurePaths() {
		each( this.options, ( o ) => {
			this.setValue( o, o.default );
		} );
	}

	/**
	 * Sets the CLI option for a single option as it was created
	 * @param cliOption
	 */
	private defineCliOption( cliOption: any ) {
		let cl: any = {};
		if ( !isEmpty( cliOption.shortFlag ) ) {
			cl.alias = cliOption.shortFlag;
		}
		if ( !isEmpty( cliOption.description ) ) {
			cl.describe = cliOption.description;
		}
		if ( cliOption.required === true ) {
			cl.requiresArg = true;
		}
		if ( !isEmpty( cliOption.type ) ) {
			cl.type = cliOption.type.toString();
		}
		if ( !isEmpty( cliOption.default ) ) {
			cl.default = cliOption.default;
		}
		if ( !isEmpty( cliOption.choices ) ) {
			cl.choices = cliOption.choices;
		}

		this.cli.options( cliOption.flag, cl );
	}

	/**
	 * Populates yargs with cli definitions
	 */
	private defineCli() {
		for ( let [  key, value ] of this.flagsMap ) {
			this.defineCliOption( value );
		}
	}
}

/**
 * The configuration class exposes the runtime configuration and the controlling methods for dealing with the configuration lifetime.
 */
export class Config {
	constructor() {
		this.__cmgr = new Configure( this );
	}

	[ index: string ]: any;

	/** The instance of the configuration manager*/
	private __cmgr: Configure;

	/**
	 * Load the configuration. This configuration must be loaded before you can get any values from it.
	 */
	public load() {
		this.__cmgr.load();
	}

	/**
	 * Set a single option for configuration. See [[IOption]] for details on what you can decorate an option with.
	 * @param o The option to set.
	 */
	public option( o: IOption ) {
		this.__cmgr.option( o );
	}

	// noinspection JSUnusedGlobalSymbols
	/**
	 * Set multiple options at once. See [[IOption]] for details on what you can decorate an option with.
	 * @param os The options to set
	 */
	public options( os: IOption[] ) {
		if ( !isArray( os ) ) {
			return this.option( os );
		} else {
			each( os, ( v ) => {
				this.option( v );
			} );
		}
	}

	// noinspection JSUnusedGlobalSymbols
	/**
	 * This will return the list of files that are searched when configuration is loaded.
	 */
	public configFiles(): string[] {
		return this.__cmgr.configFiles;
	}

	/**
	 * If you want to control what config files to load, you can set the config files here. This will completely overwrite the the config files definition.
	 */
	public setConfigFiles( files: string[] ) {
		if ( !isArray( files ) ) {
			this.__cmgr.configFiles = [ files ];
		} else {
			this.__cmgr.configFiles = files;
		}
	}

	// noinspection JSUnusedGlobalSymbols
	/**
	 * This completely resets the configuration. You will need to [[load]] it again afterwards. But if you pick up late options, this will allow you to
	 * start over.
	 */
	public reset() {
		this.__cmgr.reset();
	}
}


