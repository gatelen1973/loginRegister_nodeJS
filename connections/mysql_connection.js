var mysql = require('mysql');
var db_config = {
  host     : '107.180.48.116',
  user     : 'gatelen1973',
  password : 'Alye10oio',
  database : 'NodeJS_Services',
  insecureAuth: false,
  connectTimeout: 10000 //The milliseconds before a timeout occurs during
                         //the initial connection to the MySQL server.
};
var pool  = mysql.createPool(db_config);

pool.getConnection(function(err, connection) {
  // connected! (unless `err` is set)  
  console.log("Connected");
});

pool.on('error', function(err) {
  console.log(err.code); // 'ER_BAD_DB_ERROR' 
  // https://www.npmjs.com/package/mysql#error-handling 
});

module.exports = pool;