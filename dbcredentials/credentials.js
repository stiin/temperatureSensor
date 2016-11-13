var pg = require('pg');
var dbCredentials = require('../public/javascripts/passwords.js');

var host = dbCredentials['host'];
var port = dbCredentials['port'];
var dbName = dbCredentials['dbName'];
var username = dbCredentials['dbUsername'];
var pass = dbCredentials['dbPassword'];

var connectionString = 'postgres://' + username + ':' + pass + '@' + host + ':' + port + '/' + dbName;

// Export the connection string for usage by the API
module.exports = connectionString;

var client = new pg.Client(connectionString);
