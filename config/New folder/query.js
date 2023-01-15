//
const mysql = require('mysql2');
const util = require('util');
const config=require('./mySql.json');
const connection = mysql.createConnection(config);
const query = util.promisify(connection.query).bind(connection);
module.exports = query;
