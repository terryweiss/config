/**
 * @module config
 */
import { Config } from "./Configure";

// this will create a true singleton so that all modules get the same instance
// see https://derickbailey.com/2016/03/09/creating-a-true-singleton-in-node-js-with-es6-symbols/
const configMemoryToken = Symbol.for( "terryweiss.config" );
const globalSymbols     = Object.getOwnPropertySymbols( global );
const hasToken          = globalSymbols.indexOf( configMemoryToken ) > -1;
if ( !hasToken ) {
	( <any>global )[ configMemoryToken ] = new Config();
}
/**
 * The configuration manager contains the active configuration store and utilities to manage it
 */
const instance: Config = ( <any>global )[ configMemoryToken ];

export default instance;
