/********** Require module ***********/

const express = require("express");
const socketio = require('socket.io');
const http = require('http');
const path = require('path');

const sql = require('./Sql');
const cors = require('cors');

const port = process.env.PORT || 5000;  //Port 

const router = require('./router');

const app = express();

const server = http.createServer(app);
const io = socketio(server);


const md5 = require('md5');
var aes256 = require('aes256');

/********** End Require Module ***********/

/********** Session Configure ***********/

const session = require("express-session")({
  secret: "my-secret",
  resave: true,
  saveUninitialized: true
}),
sharedsession = require("express-socket.io-session");

app.use(session); // Attach session

io.use(sharedsession(session)); // Share session with io sockets

/********** End Session Configure ***********/

/********** Connected User ***********/
var connectedUser = 0;
/********** Connected User ***********/

/********** Socket Connection And Code Area ***********/

io.on('connection', function(socket) {

  let cipher;  //aes256 two way Encryption

  socket.handshake.session.userdata = {role:'',username:''};
  socket.handshake.session.save();
  sql.SqlConnect();
 
  connectedUser++;
  /********** Socket Login Page ***********/

  socket.on('login',(loginData)=>{
    const userData={
      username: loginData.username,
      password: loginData.password,
      key:loginData.key
    };
    sql.SqlLoginUser(userData,(check,result)=>{
        socket.emit('login',check);
        if(check === true){
          socket.handshake.session.userdata = result;
          socket.handshake.session.uid = result.uid;
          socket.handshake.session.save();
          //chatRoom();
          //console.log(userData.key);
          let key ;
          loginData.key == ''? key = 'secret123' : key = loginData.key;
          cipher = aes256.createCipher(key);

          // socket.on('goHome',(e)=>{
            
          // });

        }
        else{
          
          socket.emit('check_login',false);
        
        }
        
      });
  })

  /********** End Socket Login Page ***********/

  /********** End Socket Login Page ***********/

    socket.on('back_to_room',(r)=>{
      if (r === 'loginPage' && socket.handshake.session.uid > 0 && socket.handshake.session.uid != undefined) {
        socket.emit('back_to_room',true);
      }
    });

  /********** End Socket Login Page ***********/

  /********** Check If User Logged IN ***********/

  socket.on('stay_logged',()=>{
    if(socket.handshake.session.uid > 0 && socket.handshake.session.uid != undefined){
      socket.emit('stay_logged',true);
      console.log("Logged");
    }
    else{
      socket.emit('stay_logged',false);
      console.log("Not Logged");
    }
  })

  /********** End Check If User Logged IN ***********/


  // socket.on('check_login',(r)=>{
  //   //socket.emit('check_login','undefined');
  //   //chatRoom();
  //   if(socket.handshake.session.uid > 0){
  //     console.log('log in');
  //     chatRoom();
  //     socket.emit('check_login',true);
  //   }
  //   else {
  //     // socket.on('check_login',(r)=>{
  //     //   socket.emit('check_login','undefined');
        
  //     // });
  //     socket.emit('check_login',true);
  //     console.log('Not log');
  //   }

  // });



  /********** Chatroom Page Area ***********/

    /********** Fetch User Information For Admin Only ***********/

      userEmit=()=>{

        if (socket.handshake.session.uid > 0 && socket.handshake.session.uid != undefined && socket.handshake.session.userdata.role === 1) {

          sql.SqlUsers((ck,result)=>{
        
            socket.emit('user_information',result);
          
          });

        }

      }
    
    /********** End Fetch User Information For Admin Only ***********/

    /********** Fetch UserName & Role ***********/

      socket.on('check_login',(r)=>{
        console.log("Admin1");
          if (socket.handshake.session.uid > 0 && socket.handshake.session.uid != undefined) {

            socket.emit('check_login',{role:socket.handshake.session.userdata.role,username:socket.handshake.session.userdata.username});
            
          }
          
      });

    /********** End Fetch UserName & Role ***********/

    /********** Check if Chatroom Page ***********/

      socket.on('page_chatroom',(r)=>{

        if(r==='chatroom' && socket.handshake.session.uid > 0 && socket.handshake.session.uid != undefined){

          /********** Emit User Info for Admin ***********/
          console.log("Admin");
          userEmit(); //Emit user

          /********** End Emit User Info for Admin ***********/

          /********** Previous 100 Message fetch ***********/

          sql.SqlMsgFetch(30,(msg)=>{

            msg.forEach((row)=>{
              try {
                row.message = cipher.decrypt(row.message);
              } catch (error) {
                row.message = "(Data is Encrypted. Please Use the Right Key !!!)"
              }
              
            });
            socket.emit('msg_fetch_from_initial',msg);
          
          });

          /********** End Previous 100 Message fetch ***********/

        }  //End If 

      }); //Sock page on

    /********** Check if Chatroom Page ***********/

    

    /********** Msg Single Fwtch  ***********/

      socket.on('insert_msg',(msgframe)=>{

        if (socket.handshake.session.uid > 0 && socket.handshake.session.uid != undefined) {
          
          msgframe.uid = socket.handshake.session.uid;
          console.log(msgframe);
          msgframe.message = cipher.encrypt(msgframe.message);
          sql.SqlInsertMsg(msgframe,(check)=>{

            if(check === true){

              socket.emit('insert_msg',true,{username:msgframe.username,time:msgframe.time,message:cipher.decrypt(msgframe.message)});
              socket.broadcast.emit('broadcast_msg',{username:msgframe.username,time:msgframe.time,message:cipher.decrypt(msgframe.message)});
            
            }
            else {
              socket.emit('insert_msg',false);
            }

          });
        }
        
      });
  
    /********** End Msg Single Fwtch  ***********/

    /********** Remove User  ***********/

      socket.on('remove_user',(uid)=>{
        
        if (socket.handshake.session.uid > 0 && socket.handshake.session.uid != undefined) {

          sql.SqlUserDelete(uid,(result)=>{
            if(result){
              socket.emit("remove_user_back","User Deleted");
              console.log(uid);
              userEmit();
            }
            else{
              socket.emit("remove_user_back","User Deletion Failed");
              console.log(uid); 
              userEmit();
            }
          });
          
        }
        
        
      });
    
    /********** End Remove User  ***********/


  /********** End Check if Chatroom Page ***********/

    



  /********** Delete Msg ***********/
  
    socket.on('delete_Msg',(r)=>{
      if (socket.handshake.session.uid > 0 && socket.handshake.session.uid != undefined) {
        sql.SqlMsgDelete((r)=>{

            console.log(r);
            socket.emit('delete_msg',r);
          
        });  
      }

    });

  /********** End Delete Msg  ***********/

  /**********  Chatroom Logout ***********/

    socket.on("logout", function(r) {
      if (socket.handshake.session.uid > 0 && socket.handshake.session.uid != undefined) {
          delete socket.handshake.session.userdata;
          delete socket.handshake.session.uid;
          socket.handshake.session.save();
      }

    });

  /**********  Chatroom Logout ***********/
  
  // socket.on('user_information',()=>{
  //   sql.SqlUsers((ck,result)=>{
  //     socket.emit('user_information',result);
  //     console.log('Data transmitted');
  //   });
  // })

  /**********  Register ***********/

  socket.on('register',(req)=>{

    if (socket.handshake.session.uid > 0 && socket.handshake.session.uid != undefined) {
        const userData={
        fname: req.fname,
        username: req.username,
        password: req.password,
        role: req.role
      };
      sql.SqlCheckUserExist(userData.username,(r)=>{
        if (r===true) {

          socket.emit('register','exist');
        
        } else {

          sql.SqlInsertUser(userData,(e)=>{
            
            if(e>0){
              socket.emit('register',true);
            }

          });
        }
      });
      
    }
    
    //console.log(userData);
  
  });

  /**********  End Register ***********/
  
  console.log(connectedUser+' user connected');

  //Whenever someone disconnects this piece of code executed

    socket.on('disconnect', function () {
      delete socket.handshake.session.userdata;
      delete socket.handshake.session.uid;
      socket.handshake.session.save();
      connectedUser--;
      console.log('A user disconnected');
      sql.SqlDisconnect();
    }); 

  //Whenever someone disconnects this piece of code executed

});


/********** End Socket Connection And Code Area ***********/

/********** Access Area ***********/

app.use(
    cors({
      origin: 'http://localhost:3000',
      credentials: true,
    })
  );

/********** End Access Area ***********/
  // Parse URL-encoded bodies (as sent by HTML forms)
//app.use(express.urlencoded());

// Parse JSON bodies (as sent by API clients)

/********** App Use Area***********/

app.use(express.json());
//app.use(router);

if(process.env.NODE_ENV === 'devlopment'){
  app.use(express.static('client/build'));
  app.get('*',(req,res)=>{
    res.sendFile(path.join(__dirname,'client','build','index.html'));
  })
}


/********** End App Use Area ***********/

/********** Server Start ***********/

server.listen(port,()=> console.log("Server has started in port "+port));

/********** End Server Startt ***********/