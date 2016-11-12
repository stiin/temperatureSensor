var pg = require('pg');

var host = 'default';
var port = 'default';
var dbName = 'default';

var connectionString = 'postgres://default:default@' + host + ':' + port + '/' + dbName;

// Export the connection string for usage by the API
module.exports = connectionString;

var client = new pg.Client(connectionString);
