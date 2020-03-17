const dbCredentials = {
    host: 'ec2-3-234-169-147.compute-1.amazonaws.com',//'localhost',
    port: 5432,
    user: 'ouuqlybhjrimgi',//'postgres',
    password:  '814be1f462edd325f1c7f47665153ab668c24602b4fa7e08c83f893da9ac26ab',//'admin',
    database:'d8pd3rp6sp7god'//'chatapp'
}

const { Client } = require('pg');
const md5 = require('md5');
//const connection = new Client(dbCredentials);

let connection;
  
/*********  Postgress Database Connect *********/

module.exports.SqlConnect = ()=>{

  connection = new Client(dbCredentials);

  connection.connect(err => {

    if (err) {
  
      console.error('connection error', err.stack)
  
    } else {
  
      console.log('connected');
      
    }
      
  });

} 
  
/********* End  Postgress Database Connect *********/

/********* Postgress Database Login User *********/

module.exports.SqlLoginUser = (userData,callBack)=>{

  let sql = 'SELECT * FROM \"user\" WHERE username = \''+userData.username+'\' AND password=\''+md5(userData.password)+'\'';
    
    connection.query(sql,(err,res)=>{

        //let rows = res.rows;
      console.log(res.rows);
        if(err) return console.error(err.message);
        let userJson ={
            uid:'',
            fname:'',
            username:'',
            role:''
        };
        res.rows.forEach( (row) => {
            userJson = {
                uid:row.id,
                fname:row.fname,
                username:row.username,
                role:row.role
            }
        });
    
        res.rows.length > 0?  callBack(true,userJson):callBack(false,userJson);
      //console.log(res.rows);
    });

}

/********* End Postgress Database Login User *********/

/*********  Postgress Database Insert User *********/

module.exports.SqlInsertUser = (userData,callBack)=>{

  let stmt = 'INSERT INTO \"user\" (fname,username,password,role,status) VALUES($1,$2,$3,$4,$5) RETURNING *';
  let user = [userData.fname,userData.username,md5(userData.password),userData.role,'inactive'];
  connection.query(stmt,user,(err, res) => {
    if (err) {
      return console.error(err.message);
    }
    // get inserted id
    callBack(res.rows[0].id);
  });

}

/********* End Postgress Database Insert User *********/

/********* Postgress Fetch  User *********/

module.exports.SqlUsers = (callBack)=>{
  let sql = 'SELECT * FROM \"user\"';
    connection.query(sql,(err,res)=>{
      if(err) return console.error(err.message);
      let rows = res.rows;
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

/********* End Postgress Fetch  User *********/

/********* Postgress User Deletion *********/

module.exports.SqlUserDelete = (uid,callBack)=>{
  let sql = "DELETE FROM \"user\" WHERE id = "+uid+'RETURNING *';
    
  connection.query(sql, function (err, result) {
      if (err) console.error(err.message);
      callBack(result.rows.length);
  });
}

/********* End Postgress User Deletion *********/

/********* Postgress Fetch Initial Msg *********/

module.exports.SqlMsgFetch=(msgnumber,callBack)=>{
  let sql = "SELECT * FROM chat ORDER BY time DESC LIMIT "+msgnumber;
  connection.query(sql,(err,res)=>{
    if(err) return console.error(err.message);
    let rows = res.rows;
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

/********* End Postgress Fetch Initial Msg *********/

/********* Postgress Insert Msg *********/

module.exports.SqlInsertMsg = (userData,callBack)=>{

  var time = new Date();
  time = time.toISOString();
  let stmt = `INSERT INTO chat(uid,time,message,username) VALUES($1,$2,$3,$4)`;
  let user = [userData.uid,time,userData.message,userData.username];
  connection.query(stmt,user,(err, results, fields) => {
    if (err) {
      return console.error(err.message);
    }
    // get inserted id
    callBack(true);
  });

}

/********* End Postgress Insert Msg *********/

/********* Postgress Delete Msg *********/

module.exports.SqlMsgDelete = (callBack)=>{
  let sql = 'DELETE FROM chat';
  connection.query(sql, function (err, result) {
    if (err) console.error(err.message);
    result.rows > 0? callBack(false) : callBack(true);
  });
}

/********* End Postgress Delete Msg *********/

/********* Postgress User Exist *********/

module.exports.SqlCheckUserExist = (username,callBack)=>{
  let sql = 'SELECT * FROM \"user\" WHERE username = \''+username+'\'';
    
  connection.query(sql,(err,res)=>{
    let rows = res.rows;
    if(err) return console.error(err.message);
    rows.length > 0?  callBack(true):callBack(false);
    
  });
}

/********* End Postgress User Exist *********/

/********* Postgress Sql Termineted *********/

module.exports.SqlDisconnect = ()=>{
    connection.end((err) => {
      console.log("SQL Connection End");
    });
  
} 

/********* End Postgress Sql Termineted *********/


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

