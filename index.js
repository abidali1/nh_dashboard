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
const singleNews=require('./routers/singleNews.js');
const reportFilter=require('./routers/reportFilter.js');
const report=require('./routers/report.js');



app.use(express.json());

app.use('/',news);
app.use('/news',news);
app.use('/notes',notes);
app.use('/singleNews',singleNews);
app.use('/reportFilter',reportFilter);
app.use('/report',report);



// app.listen(3000,()=>{
//     console.log('server is running at 3000');
// });

db.sequelize.sync({alter:true}).then(()=>{
    app.listen(3000,()=>{
        console.log('server is running at 3000');
    });

});


