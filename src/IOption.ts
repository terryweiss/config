/**
 * This is how you define an Option you want to capture. All are optional except `name` which will be used to identify
 * the option. If you do not define a `flag` or `shortFlag`, the option will not be available from the CLI. `envFlag` determines if there the
 * system will look for an environment variable to drive the option
 */
export interface IOption {
	/**
	 * The CLI long flag to look for. You can define a short flag under `shortFlag`
	 */
	flag?: string;
	/**
	 * A single character flag that can be used on the command line
	 */
	shortFlag?: string;
	/**
	 * The name of the option. This will be how you reference it when you need it.
	 */
	name: string;
	/**
	 * The description of the option, it can be displayed on the command line
	 */
	description?: string;
	/**
	 * The name of an environment variable that will be pulled in.
	 */
	envFlag?: string;
	/**
	 * The path to the option after loading. This path will also be used to load configuration files.
	 */
	path?: string;
	/**
	 * Is the option required? If true and the option is not provided, it will result in a thrown error
	 */
	required?: boolean;
	/**
	 * The data type of the option
	 */
	type?: Types;
	/**
	 * The default value for the option
	 */
	default?: any;
	/**
	 * Limit responses to specific values
	 */
	choices?: string[];
	/**
	 * When true, the option will be able to be repeated on the command line to form an array
	 */
	isArray?: boolean;

}

/**
 * The data types the option system recognizes
 */
export enum Types {
	// noinspection JSUnusedGlobalSymbols,JSUnusedGlobalSymbols,JSUnusedGlobalSymbols
	string  = "string",
	array   = "array",
	number  = "number",
	boolean = "boolean",
	count   = "count"
}

