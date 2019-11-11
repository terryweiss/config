"use strict";
const { join } = require( "path" );

const tap = require( "tap" );

const config = require( "../dist" ).default;

config.setConfigFiles( [

	join( __dirname, "config/", "config.yaml" ),
	join( __dirname, "config/", "config.json" )
] );

tap.test( "File load", ( t ) => {
	// t.plan( 3 );
	config.load();

	// noinspection JSUnresolvedVariable
	t.equal( config.someValue.obj1[ 0 ], "attr1" );
	// noinspection JSUnresolvedVariable
	t.equal( config.someValue.obj1[ 1 ], "attr2" );
	// noinspection JSUnresolvedVariable
	t.equal( config.someValue.obj1[ 2 ], "attr3" );
	// noinspection JSUnresolvedVariable
	t.equal( config.someValue.obj2.fred, "Flinstone" );

	t.equal( config.getting, "married" );
	t.end();
} );

tap.test( "File does not exist", ( t ) => {
	config.reset();

	config.setConfigFiles( "./xxx/yyy.yml" );

	t.doesNotThrow( config.load() );
	t.end();
} );

tap.test( "environment variables", ( t ) => {
	config.reset();
	config.setConfigFiles( [

		join( __dirname, "config/", "config.yaml" ),
		join( __dirname, "config/", "config.json" )
	] );

	config.option( {
		name   : "inDebt",
		envFlag: "IN_DEBT"
	} );

	config.option( {
		name   : "fred",
		envFlag: "FRED",
		path   : "someValue.obj2"
	} );

	process.env.FRED = "Mertz";
	process.env.IN_DEBT = "ENVOverride";
	config.load();


	t.equal( config.inDebt, "ENVOverride" );
	t.equal( config.someValue.obj2.fred, "Mertz" );

	t.end();
} );

tap.test( "CLI", ( t ) => {
	config.reset();

	config.option({name: "clitest", flag:"ctest", default: "rrrr"});


	config.load();
	t.equal( config.clitest, "rrrr" );

	t.end();
} );

