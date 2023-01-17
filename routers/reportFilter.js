const express = require('express');
const router = express.Router();
const query = require('../config/query.js');
const db = require('../models');


router.get('/', (req, res) => {
    homePageData(req.params, (keywords, countries, sources) => {
        if (keywords)
            res.render('reportFilter', {
                keywords: JSON.stringify(keywords),
                sources: JSON.stringify(sources),
                countries: JSON.stringify(countries)
            });
    });
});


router.get('/filter/:user_id!:keyword_id!:keyword_cat_id!:start_date!:end_date!:country!:source_id!:folder_id!:limit!:skip'

    , (req, res) => {

        homePageDataFilter(req.params, (result) => {
            if (result)
                res.send(result);
            //  res.render('allsites', { data: JSON.stringify(result)});
        });
    });












router.get('/folder/:id', async (req, res) => {

    //   const result = await db.folder.findAll({ where: { user_id: req.params.id } });

    const result = await query(`select folders.id,name, count(news_id) news from folders left join news_folders on folders.id=news_folders.folder_id
        where folders.user_id=${req.params.id}
        group by id,name`);
    res.send(result);
});





async function homePageData(params, cb) {
    try {
        const keywords_query = `select  kc.id cat_id,kc.name, k.id keyword_id,k.word,user_id from user_keywords    uk   
     inner join keyword_category kc  on kc.id=uk.keyword_catId and  uk.user_id =  3 
     inner join keywords  k on k.keyword_catId=kc.id`;

        var keywords = await query(keywords_query);
        var countries = await query("select name from country")
        var sources = await query("select id,source from source")

        cb(keywords, countries, sources);
    }
    catch (err) {
        console.log(err);
        cb(null, null, null);;
    }
}


async function homePageDataFilter(params, cb) {
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


    console.log('***********************************',params.folder_id );
    const user_id = params.user_id != '0' && params.user_id != undefined ? ' AND  uk.user_id =  ' + params.user_id : '';
    const keyword_id = params.keyword_id != '0' && params.keyword_id != undefined ? ' AND id=' + params.keyword_id : '';
    const keyword_cat_id = params.keyword_cat_id != '0' && params.keyword_cat_id != undefined ? ' AND keyword_catId=' + params.keyword_cat_id : '';
    const start_date = params.start_date != '0' && params.start_date != undefined ? " AND pub_date  >=  '" + params.start_date + "'" : '';
    const end_date = params.end_date != '0' && params.end_date != undefined ? " AND pub_date <='" + params.end_date + "'" : '';
    const country = params.country != '0' && params.country != undefined ? " AND n.country='" + params.country + "'" : '';
    const source_id = params.source_id != '0' && params.source_id != undefined ? ' AND source_id=' + params.source_id : '';
    const folder_id = params.folder_id != '0' && params.folder_id != undefined ? ' AND  news_id  in (select news_id from news_folders where folder_id in (' + params.folder_id+'))' : '';


    const limit = params.limit != '0' && params.limit != undefined ? '' + params.limit : '20';
    const skip = params.skip != '0' && params.skip != undefined ? '' + params.skip : '0';

console.log('***********************************',folder_id);

    return `
-- Start Query --
    select kn.news_id,title,description,url,n.pub_date, source, a.user_id,group_concat(word) key_words,news_folders.folder_id in_folder,group_concat( note.news_id ) notes_news from (
        select   k.id,user_id, k.word  from user_keywords    uk  
        inner join keyword_category kc  on kc.id=uk.keyword_catId ${user_id} 
        inner join (select * from keywords where 1=1  ${keyword_id}   ${keyword_cat_id}) k on k.keyword_catId=kc.id) a      
        inner join (select * from keyword_news where 1=1 ${folder_id} ${start_date} ${end_date} order by pub_date desc limit ${skip},${limit}) kn on kn.keyword_id= a.id 
        inner join news n on kn.news_id=n.id
        left join news_folders on n.id=news_folders.news_id and news_folders.user_id=   ${params.user_id} 
        left join (select distinct user_id, news_id from notes) note on n.id=note.news_id and note.user_id=   ${params.user_id} 
        where 1=1 ${country} ${source_id}  group by n.id  order by n.id DESC
-- End Query --`;


}



module.exports = router;