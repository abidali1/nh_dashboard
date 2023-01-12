const express=require('express');
const app=express();
const db=require("./models");
const Sequelize = require('sequelize');
var path = require('path');
const { json } = require('sequelize');
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
const query=require('./config/query');
const news=require('./routers/news.js');
const notes=require('./routers/notes.js');

app.use(express.json());

app.use('/',news);
app.use('/news',news);
app.use('/notes',notes);
app.post('/insert',(req,res)=>{


    async function addUser(){
    if(Object.keys(req.body).length === 0){
    res.send('no data provided');
    return;
   }
    const {name}=req.body;
    const {address}=req.body;
    const {role}=req.body;

   const newUser = await db.User.create({
name: name,
address: address,
role: role
    }).catch(err=>{
        console.log(err);
        res.status(500).send("server error");
    });

    res.send(newUser);
}

addUser();
});




app.post('/users/add',(req,res)=>{


    async function addUser(){
    if(Object.keys(req.body).length === 0){
    res.send('no data provided');
    return;
   }
    const {name}=req.body;
    const {password}=req.body;
    const {role}=req.body;

   const newUser = await db.User.create({
    name: name,
password: password,
role: role
    }).catch(err=>{
        console.log(err);
        res.status(500).send("server error");
    });

    res.send(newUser);
}

addUser();
});







// app.listen(3000,()=>{
//     console.log('server is running at 3000');
// });


db.sequelize.sync({alter:true}).then(()=>{
    app.listen(3000,()=>{
        console.log('server is running at 3000');
    });

});


