const config = require( "../dist" ).default;

config.option({name: "names", flag:"names", isArray:true});

config.load();

console.info(config.names);
