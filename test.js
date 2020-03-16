
//sql = require('./Sql');
//import ('./Sql');
//import {} from './Sql';

 const Sql = require('./Sql');

Sql.SqlConnect();
// // let userData={
// //     fname:'Abid Hasan',
// //     username:'Abid',
// //     password:'1234',
// //     role: 1
// // }
// // Sql.SqlInsertUser(userData);

// // let userData={
// //     username:'Abid',
// //     password:'1234'
// // }

// // // let check = Sql.SqlLoginUser(userData,(r,results)=>{
// // //     console.log(r);
// // //     console.log(results);
// // // });
// // let check = Sql.SqlUsers((r,results)=>{
// //     console.log(r);
// //     console.log(results);
// // });

// Sql.SqlMsgFetch((msg)=>{
//     console.log(msg);
// });
// //console.log(check);
Sql.SqlMsgDelete((r)=>{
    console.log(r);
})
 Sql.SqlDisconnect();

