var mysql = require('mysql');
var db_config = {
  host     : 'us-cdbr-iron-east-02.cleardb.net',
  user     : 'b4712214937ad8',
  password : 'ac8fd8ec',
  database : 'heroku_ff8fd21eee89e9d',
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