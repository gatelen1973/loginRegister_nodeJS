var fs = require("fs");
var path = require('path');
var writePath = '/home/saurabh/Documents/react/cloudprint/filestobeprinted/';
var cmd = require('node-cmd');
var async = require('async');
var jsonfile = require('jsonfile');
var connection = require('.././connections/mysql_connection.js');
exports.fileretrieve = function (req, res) {
  console.log("retrieve hit");
  var filepath = './userdata/userid.json'
  jsonfile.readFile(filepath, function (err, obj) {
    if (err) {
      res.send({
        "code": 204,
        "result": "No files found"
      })
    }
    else {
      var userid = obj.userid;
      var swiftcommand = 'swift -A http://127.0.0.1:12345/auth/v1.0 -U test:tester -K testing list ' + userid;     
      cmd.get(
        swiftcommand,
        function (data) {
          var filenames = data.split('\n');
          var resfiles = [];
          for (var i = 0; i < filenames.length - 1; i++) {
            resfiles.push(
              { name: filenames[i] }
            )
          }
          res.send({
            "code": 200,
            "result": resfiles
          })
        }
      );
    }
  });
}
exports.fileprint = function (req, res) {  
  var filesArray = req.files;
  var filepath = './userdata/userid.json'
  jsonfile.readFile(filepath, function (err, obj) {
    var userid = obj.userid;
    connection.query('SELECT * FROM collegeusers WHERE userid = ?', [userid], function (error, results, fields) {
            if (error) {
              console.log("error ocurred", error);             
            } else {
              if (results.length > 0) {
                let printCount = results[0].printCount + filesArray.length;
                connection.query('UPDATE collegeusers SET printCount = ? WHERE userid = ?', [printCount, userid], function (error, results, fields) {
                  if (error) {
                    console.log("error", error);
                  }
                });
              }
            }
          });
  });
  async.each(filesArray, function (file, eachcallback) {
    async.waterfall([
      function (callback) {
        fs.readFile(file.path, (err, data) => {
          if (err) {
            console.log("err ocurred", err);
          }
          else {
            callback(null, data);
          }
        });
      },
      function (data, callback) {
        fs.writeFile(writePath + file.originalname, data, (err) => {
          if (err) {
            console.log("error occured", err);
          }
          else {
            callback(null, 'three');
          }
        });
      },
      function (arg1, callback) {
        var filepath = './userdata/userid.json'
        jsonfile.readFile(filepath, function (err, obj) {
          var userid = obj.userid;
          var swiftcommand = 'swift -A http://127.0.0.1:12345/auth/v1.0 -U test:tester -K testing upload --object-name ' + file.originalname + ' ' + userid + ' ' + '../filestobeprinted/' + file.originalname;
          cmd.get(
            swiftcommand,
            function (data) {
              console.log('the responses is : ', data)
              callback(null, 'done');
            }
          );
        })

      },
      function (arg2, callback) {
        callback(null, "done printing files");
      }
    ], function (err, result) {
      eachcallback();
    });
  }, function (err) {
    if (err) {
      console.log("error ocurred in each", err);
    }
    else {
      console.log("finished prcessing");
      res.send({
        "code": "200",
        "success": "files printed successfully"
      })
      cmd.run('rm -rf ./fileprint/*');
    }
  });
}