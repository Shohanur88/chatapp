const mysql = require('mysql');

var md5 = require('md5');
let connection;

const dbCredentials = {
    host     : 'localhost',
    user     : 'root',
    password : 'root',
    database : 'chatapp'
  }

module.exports.SqlConnect = ()=>{
  connection = mysql.createConnection(dbCredentials);
  connection.connect((err) => {
    if (err) {
      console.error('error connecting: ' + err.stack);
      return;
    }
      console.log("SQL Connected");
    });
} 
  

module.exports.SqlInsertUser = (userData,callBack)=>{
  let stmt = `INSERT INTO user(fname,username,password,role,status) VALUES(?,?,?,?,?)`;
  let user = [userData.fname,userData.username,md5(userData.password),userData.role,'inactive'];
  connection.query(stmt,user,(err, results, fields) => {
    if (err) {
      return console.error(err.message);
    }
    // get inserted id
    callBack(results.insertId);
  });

}


module.exports.SqlLoginUser = (userData,callBack)=>{
  let sql = 'SELECT * FROM user WHERE username = '+mysql.escape(userData.username)+' AND password = \''+md5(userData.password)+'\'';
  //let retVal;
  connection.query(sql,(err,rows)=>{
    if(err) return console.error(err.message);
    let userJson ={
      uid:'',
      fname:'',
      username:'',
      role:''
    };
    rows.forEach( (row) => {
      userJson = {
        uid:row.id,
        fname:row.fname,
        username:row.username,
        role:row.role
      }
    });

    rows.length > 0?  callBack(true,userJson):callBack(false,userJson);
  });
}

module.exports.SqlUsers = (callBack)=>{
  let sql = 'SELECT * FROM user';
  connection.query(sql,(err,rows)=>{
    if(err) return console.error(err.message);
    let users = [];
    let userJson ={
      fname:'',
      username:'',
      role:'',
      status:''
    };
    rows.forEach( (row) => {
      userJson = {
        userid:row.id,
        username:row.username,
        status:row.status
      };
      users.push(userJson);
    });

    users.length > 0?  callBack(true,users):callBack(false,users);
  });
}


module.exports.SqlUserDelete = (uid,callBack)=>{
    let sql = "DELETE FROM user WHERE id = "+mysql.escape(uid);
    connection.query(sql, function (err, result) {
      if (err) console.error(err.message);
      callBack(result.affectedRows);
    });
}



module.exports.SqlMsgFetch=(msgnumber,callBack)=>{
    let sql = "SELECT * FROM chat ORDER BY time DESC LIMIT "+msgnumber;
    connection.query(sql,(err,rows)=>{
      if(err) return console.error(err.message);
      let msg = [];
      let msgJson = {
        username:'',
        time:'',
        message:''
      }
      rows.forEach( (row) => {
          msgJson = {
            username:row.username,
            time:row.time,
            message:row.message
          };
          msg.push(msgJson);
          
      });
      callBack(msg.reverse());
    })
}



module.exports.SqlInsertMsg = (userData,callBack)=>{

  let stmt = `INSERT INTO chat(uid,message,username) VALUES(?,?,?)`;
  let user = [userData.uid,userData.message,userData.username];
  connection.query(stmt,user,(err, results, fields) => {
    if (err) {
      return console.error(err.message);
    }
    // get inserted id
    callBack(true);
  });

}


module.exports.SqlMsgDelete = (callBack)=>{
  let sql = 'DELETE FROM chat';
  connection.query(sql, function (err, result) {
    if (err) console.error(err.message);
    result.affectedRows > 0? callBack(true) : callBack(false);
  });
}



module.exports.SqlCheckUserExist = (username,callBack)=>{
  let sql = 'SELECT * FROM user WHERE username = '+mysql.escape(username);
  
  connection.query(sql,(err,rows)=>{
    
    if(err) return console.error(err.message);
    rows.length > 0?  callBack(true):callBack(false);
  
  });
}


module.exports.SqlDisconnect = ()=>{
    connection.end((err) => {
      console.log("SQL Connection End");
    });
  
} 




// SqlConnect();
// let userData={
//     fname:'Abid Hasan',
//     username:'Abid',
//     password:'1234',
//     role: 1
// };
//SqlInsertUser(userData);
//SqlDisconnect();
// class Sql {
//   constructor(){
//     let connection;
//     this.connection = mysql.createConnection(dbCredentials);
//     this.dbConnect();
    
//   }

//   dbConnect = ()=>{
//     this.connection.connect((err) => {
//       if (err) {
//         console.error('error connecting: ' + err.stack);
//         return;
//       }
//       //console.log('connected as id ' + connection.threadId);
//       console.log("SQL Connected");
//     });
//   }

//   dbDisconnect = ()=>{
//     this.connection.end((err) => {
//       console.log("SQL Connection End");
//       // The connection is terminated gracefully
//       // Ensures all previously enqueued queries are still
//       // before sending a COM_QUIT packet to the MySQL server.
//     });
//   }

// }

// module.exports.Sql = Sql; 


// export class User {
//   constructor(name) {
//     this.name = name;
//   }
// }

