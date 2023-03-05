const express = require('express');
const router = express.Router();
const query = require('../config/query.js');
const db = require('../models');



router.get('/:user_id!:news_id', (req, res) => {
  notesPageData(req.params, (result) => {
          res.render('notes',{
            notesData: JSON.stringify(result)});
  });
});





router.post('/addNotes', async (req, res) => {
  const result = await addNotes(req, res);
  res.send(result);
});

router.delete('/deleteNotes/:notes_id', async (req, res) => {
  const result = await deleteNotes(req, res);
  res.send(result);
});



router.get('/getNotes/:user_id!:news_id', async (req, res) => {

  //   const result = await db.folder.findAll({ where: { user_id: req.params.id } });
 
         const result= await query(`select * from notes where user_id=${req.params.user_id } and news_id=${req.params.news_id }`);
     res.send(result);
 });
 
 
 router.get('/getAllNotes/:user_id', async (req, res) => {

  //   const result = await db.folder.findAll({ where: { user_id: req.params.id } });
 
         const result= await query(`select notes.id,news.id news_id,user_id,notes,title,url,createdAt from notes  left join news 
         on notes.news_id=news.id 
         where user_id=${req.params.user_id }
         order by notes.id desc `);
     res.send(result);
 });
 





 async function addNotes(req, res) {
  if (Object.keys(req.body).length === 0) {
    res.send('no data provided');
    return;
  }
  const { news_id } = req.body;
  const { user_id } = req.body;
  const { notes } = req.body;

  try {

    //      db.news_folder.destroy({ where: { user_id: user_id,  news_id: news_id } })     

    const isAlready = await db.notes.findOne({ where: { user_id: user_id, news_id: news_id } });
    if (isAlready)
      return await db.notes.update({ notes: notes }, { where: { user_id: user_id, news_id: news_id } });
    else
      return await db.notes.create({ user_id: user_id, news_id: news_id, notes: notes });


  } catch (err) {
    console.log(err);
    res.send(err);
  }
}






async function deleteNotes(req, res) {

   try {

         const result= await db.notes.destroy({ where: { id: req.params.notes_id } })    ;   
          return result+'';            
      
  } catch (err) {
      console.log(err);
      res.send(err);
  }
}




async function notesPageData(params, cb) {
  try {


      const myQuery = newsQuery(params);
      console.log(myQuery);
      var result = await query(myQuery);



      cb(result);
  }
  catch (err) {
      console.log(err);
      cb(null, null);;
  }
}


function newsQuery(params) {



  const user_id = params.user_id != '0' && params.user_id != undefined ? ' AND  uk.user_id =  ' + params.user_id : '';
  const keyword_id = params.news_id != '0' && params.news_id != undefined ? ' AND id=' + params.news_id : '';




  // return `select kn.news_id,title,description,url,n.pub_date, source, a.user_id,group_concat(word) key_words,news_folders.folder_id in_folder, note.notes  notes_news,n.body,n.summary, note.id note_id from (
  //   select   k.id,user_id, k.word  from user_keywords    uk
  //        inner join keyword_category kc  on kc.id=uk.keyword_catId AND  uk.user_id =  ${params.user_id}
  //        inner join (select * from keywords where 1=1 ) k  on k.keyword_catId=kc. id  ) a
  //        inner join ( select * from    keyword_news where news_id= ${params.news_id}  order by  pub_date desc limit 1 )  kn  on kn.keyword_id= a.id
  //        inner join news n on kn.news_id=n.id
  //        left join news_folders on n.id=news_folders.news_id and news_folders.user_id=   3
  //        left join (select distinct user_id, news_id, notes,id from notes) note on n.id=note.news_id and note.user_id=   3
         
  //        where 1=1
  //    and n.id=${params.news_id} 
  //    group by n.id
  //      order by n.id DESC`;


return `  select n.id as news_id,title,description,url,n.pub_date, source,  ${params.user_id},group_concat(word) key_words,news_folders.folder_id in_folder, notes.notes  notes_news,n.body,n.summary, notes.id note_id from news n
left join (select * from keyword_news where 1=1  order by pub_date desc ) kn on kn.news_id= n.id
left join (select * from keywords where 1=1  ) k on k.id=kn.keyword_id
left join keyword_category kc  on kc.id=k.keyword_catId
left join user_keywords uk on uk.keyword_catId=kc.id
left join news_folders on n.id=news_folders.news_id and news_folders.user_id=    ${params.user_id}
left join  notes on n.id=notes.news_id and notes.user_id=     ${params.user_id}
  where 1=1
and n.id=${params.news_id} 
group by n.id
order by n.id DESC`;



}


module.exports = router;
