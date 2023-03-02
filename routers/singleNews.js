const express = require('express');
const router = express.Router();
const query = require('../config/query.js');
const db = require('../models');



router.get('/:user_id!:news_id', (req, res) => {
  notesPageData(req.params, (result) => {
          res.render('singleNews',{
            notesData: JSON.stringify(result)});
  });
});


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




  // return `select kn.news_id,title,description,url,n.pub_date, source, a.user_id,group_concat(word) key_words,news_folders.folder_id in_folder, note.notes  notes_news,n.body,n.summary, note.id note_id, n.media from (
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


    // return `select kn.news_id,title,description,url,n.pub_date, source, a.user_id,group_concat(word) key_words,news_folders.folder_id in_folder, note.notes  notes_news,n.body,n.summary, note.id note_id, n.media from (
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

  return `
  -- Start Query --
  select n.id as news_id,title,description,url,n.pub_date, source, ${params.user_id} ,group_concat(word) key_words,news_folders.folder_id in_folder,group_concat( note.news_id ) notes_news, n.media,n.body from news n 
       left join (select * from keyword_news where 1=1  order by pub_date desc ) kn on kn.news_id= n.id
       left join (select * from keywords where 1=1  ) k on k.id=kn.keyword_id
     left join keyword_category kc  on kc.id=k.keyword_catId
       left join user_keywords uk on uk.keyword_catId=kc.id     
     left join news_folders on n.id=news_folders.news_id and news_folders.user_id=   ${params.user_id} 
     left join (select distinct user_id, news_id from notes) note on n.id=note.news_id and note.user_id=    ${params.user_id} 
  where 1=1 and n.id in  (${params.news_id} ) group by n.id  
  -- End Query --`;

}


module.exports = router;
