var pg = require('pg');

var host = 'localhost';
var port = '5433';
var dbName = 'temp_sensor';

var connectionString = 'postgres://postgres:terror@' + host + ':' + port + '/' + dbName;

// Export the connection string for usage by the API
module.exports = connectionString;

var client = new pg.Client(connectionString);
