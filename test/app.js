const config = require( "../dist" ).default;

// config.options( [
// 	{
// 		name: "logLevel",
// 		flag: "log-level",
// 		shortFlag: "l",
// 		description: "The logging level",
// 		choices:["warn", "error", "info", "blob"]
// 	},
// 	{
// 		name: "logLevel2",
// 		flag: "v",
// 		// shortFlag: "v",
// 		description: "The logging level",
// 		type: "count"
// 	},
// ] );

config.option( {
	name   : "myOption",
	flag: "myOption",
	description: "I am a test option",
	shortFlag: "m"
} );

config.load();

console.info(config);
