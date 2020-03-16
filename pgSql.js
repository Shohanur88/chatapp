const { Client } = require('pg');
const md5 = require('md5');

const connection = new Client({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'admin',
  database:'chatapp'
});


connection.connect(err => {
    if (err) {
      console.error('connection error', err.stack)
    } else {
      console.log('connected');
    }
  });


  let SqlLoginUser = (userData,callBack)=>{
    
    let sql = 'SELECT * FROM \"user\" WHERE username = \''+userData.username+'\' AND password=\''+md5(userData.password)+'\'';
    
    connection.query(sql,(err,res)=>{

        let rows = res.rows;

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
      //console.log(res.rows);
    });
  }

//(\''+userData.fname+'\',\''+userData.username+'\',\''+md5(userData.password)+'\',\''+userData.role+'\',\'inactive\')';

let SqlInsertUser = (userData,callBack)=>{
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

//   SqlInsertUser({fname:'rem',username:'admin',password:'admin',role:1},(r)=>{
//       console.log(r);
//   })


  SqlLoginUser({username:'admin',password:'admin'},(r,json)=>{
    console.log(r);
    console.log(json);

  });



let SqlUsers = (callBack)=>{
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


//   SqlUsers((r,result)=>{
//     console.log(r);
//     console.log(result);
//   });

let SqlUserDelete = (uid,callBack)=>{
    let sql = "DELETE FROM \"user\" WHERE id = "+uid+'RETURNING *';
    
        connection.query(sql, function (err, result) {
            if (err) console.error(err.message);
            callBack(result.rows.length);
        });
    
}


// SqlUserDelete(6,(r)=>{
//     console.log(r);
// });

let SqlMsgFetch=(msgnumber,callBack)=>{
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

// SqlMsgFetch(30,(r)=>{
//     console.log(r);
// })

let SqlInsertMsg = (userData,callBack)=>{

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


let data ={
    uid:1,
    message:'fjfjgj',
    username:'admin'
}

// SqlInsertMsg(data,(r)=>{
//      console.log(r);
// })


let SqlMsgDelete = (callBack)=>{
    let sql = 'DELETE FROM chat';
    connection.query(sql, function (err, result) {
      if (err) console.error(err.message);
      result.rows > 0? callBack(false) : callBack(true);
    });
  }


// SqlMsgDelete((r)=>{
//     console.log(r);
// });


let SqlCheckUserExist = (username,callBack)=>{
    let sql = 'SELECT * FROM \"user\" WHERE username = \''+username+'\'';
    
    connection.query(sql,(err,res)=>{
      let rows = res.rows;
      if(err) return console.error(err.message);
      rows.length > 0?  callBack(true):callBack(false);
    
    });
  }

//   SqlCheckUserExist('1rem',e=>{
//       console.log(e);
//   })


let SqlDisconnect = ()=>{
    connection.end((err) => {
      console.log("SQL Connection End");
    });
  
} 

//SqlDisconnect();