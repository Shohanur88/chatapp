const express = require('express');
const router = express.Router();
const axios = require('axios');

const session = require('express-session');

const sql = require('./Sql');

let sessio ;

router.get('/', (req, res) =>{
    res.sendFile(__dirname + 'client/build/index.html');
});

router.get('/ser',(req,res)=>{
    res.send('server is up and running');

});

// router.post("/loginroom", (req, res) => {
//    sessio = req.session;
   
//    sql.SqlConnect();
//    const userData={
//        username: req.body.username,
//        password: req.body.password
//    };
//    sql.SqlLoginUser(userData,(check,result)=>{
//        console.log(check);
//        console.log(result);
//        if(check === true){
//             // session.username = result.username;
//             // session.role = result.role;
//             // session.uid = result.uid;
//             // session.fname = result.fname;
//        }
//        res.send(result);
//    })
// //    sql.SqlLoginUser(userData,(check)=>{
// //        console.log(check);
// //    });
// //    //console.log(userData);
//    sql.SqlDisconnect();
//    //res.send({Msg:"Its login page"});
//    //console.log("rq accepted");
// });

router.post("/registerblock", (req, res) => {
    //sessio = req.session;
    //sessio.uid = 100;
    sql.SqlConnect();
    const userData={
        fname: req.body.fname,
        username: req.body.username,
        password: req.body.password,
        role: req.body.role
    };
    sql.SqlInsertUser(userData,(e)=>{
        console.log(e);
    });
    console.log(userData);
    sql.SqlDisconnect();
});

//

module.exports = router