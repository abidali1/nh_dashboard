const express = require('express');
const router = express.Router();
const query = require('../config/query.js');
const db = require('../models');
router.get('/', (req, res) => {
    res.render('statistics');
});


router.delete('/deleteNotes/:notes_id', async (req, res) => {
    const result = await deleteNotes(req, res);
    res.send(result);
});

router.get('/getNotes/:user_id!:news_id', async (req, res) => {
    const result = await query(`select * from notes where user_id=${req.params.user_id} and news_id=${req.params.news_id}`);
    res.send(result);
});

router.get('/getAllNotes/:user_id', async (req, res) => {
    const result = await query(`select notes.id,news.id news_id,user_id,notes,title,url,createdAt from notes  left join news 
           on notes.news_id=news.id 
           where user_id=${req.params.user_id}
           order by notes.id desc `);
    res.send(result);
});

router.get('/getAnalytics/:user_id', async (req, res) => {
    const numbers = await query(`
           select 
           (select count(*)  from user_country where user_id=${req.params.user_id}) county ,
           (select count(*)  from user_keywords  where user_id=${req.params.user_id}) keywords,
           (select count(*)  from user_opinion where user_id=${req.params.user_id} ) opinion,
           (select count(*)  from user_regions where user_id=${req.params.user_id}) regions,
           (select count(*)  from user_source where user_id=${req.params.user_id}) source,
           (select count(*)  from  folders where user_id=${req.params.user_id}) forlders,
           (select count(*)  from news_folders  where user_id=${req.params.user_id}) savenews,           
           (select count(*)  from notes  where user_id=${req.params.user_id}) notes`);

    const sources = await query(`
        select country.name, count(source.id) numbers, group_concat(source.source) sources from source 
        left join country on source.country_id=country.id
        where country_id in (select country_id from user_country where user_id=${req.params.user_id}) 
        group by country_id order by count(country_id) desc`);

    const keywordsCat = await query(`select count(keyword_catId) categories from user_keywords where user_id=${req.params.user_id}`);
    const keywords = await query(`select keyword_category.name, count(keywords.id) numbers, group_concat(keywords.word) keywords from user_keywords 
        left join keyword_category on user_keywords.keyword_catId=keyword_category.id
        left join keywords on keyword_category.id=keywords.keyword_catId
        where user_keywords.user_id = ${req.params.user_id}  group by user_keywords.keyword_catId order by  count(keywords.id) desc`);
    res.send({ result: numbers, sources: sources, keywordsCat: keywordsCat, keywords: keywords });
});


router.get('/getAnalyticsContents/:user_id!:start_date!:end_date!:keyword!:keywordCat', async (req, res) => {

    const start_date = req.params.start_date != '0' && req.params.start_date != undefined ? " AND date(pub_date)  >=  '" + req.params.start_date + "'" : "AND pub_date  >='2022-01-30'";
    const end_date = req.params.end_date != '0' && req.params.end_date != undefined ? " AND date(pub_date) <='" + req.params.end_date + "'" : '';
    const keyword = req.params.keyword != '0' && req.params.keyword != undefined ? " AND keywords.id   =  '" + req.params.keyword + "'" : '';
    const keywordCat = req.params.keywordCat != '0' && req.params.keywordCat != undefined ? " AND kc.id ='" + req.params.keywordCat + "'" : '';

    var myQuery = `select count(distinct news_id) numbers from keyword_news where
    keyword_id in (select id from keywords 
    where keyword_catid in (select keyword_catid from user_keywords where user_id=${req.params.user_id})
    ${start_date}  ${end_date})`;

    console.log(myQuery);
    const totalContents = await query(myQuery);


    myQuery = `select keyword_catid,name, count(news_id) numbers from (
        select distinct _a.news_id,keywords.keyword_catid, kc.name from (
		select  news_id, keyword_id from keyword_news where
        keyword_id in (select id from keywords 
        where keyword_catid in (select keyword_catid from user_keywords where user_id=${req.params.user_id}) 
        ${start_date}  ${end_date}
        )) _a left join keywords on _a.keyword_id=keywords.id 
        left join keyword_category kc on keywords.keyword_catid=kc.id
        ) combined group by keyword_catid,name;`;

    console.log(myQuery);

    const catContents = await query(myQuery);

    myQuery = `select keyword_catid,name,country,sum(source_count) numbers,group_concat(sources) sources  from (
        select keyword_catid,country,name,concat(source ,':<a style="float:right">',count(source),'</a>')sources,count(source) source_count from (
        select distinct _a.news_id,keywords.keyword_catid, news.country, kc.name,source.source from (
               select  news_id, keyword_id from keyword_news where
               keyword_id in (select id from keywords 
               where keyword_catid in (select keyword_catid from user_keywords where user_id=${req.params.user_id})  ${start_date}  ${end_date}
            
               )) _a inner join keywords on _a.keyword_id=keywords.id  ${keyword} 
               inner join keyword_category kc on keywords.keyword_catid=kc.id ${keywordCat} 
               inner join  news on _a.news_id=news.id
               inner join source on news.source_id=source.id
               )_source group by  keyword_catid,country,name,source
               ) combined group by keyword_catid,name,country order by numbers desc`;
    console.log(myQuery);
    const catCooutryContents = await query(myQuery);


    myQuery=`select keyword_catid,name,keyword_id, word, count(news_id) numbers from (
        select distinct _a.news_id,keywords.keyword_catid, kc.name,keyword_id,keywords.word from (
		select  news_id, keyword_id from keyword_news where
        keyword_id in (select id from keywords 
        where keyword_catid in (select keyword_catid from user_keywords where user_id=${req.params.user_id})  ${start_date}  ${end_date}
        )) _a left join keywords on _a.keyword_id=keywords.id 
        inner join keyword_category kc on keywords.keyword_catid=kc.id ${keywordCat} 
        ) combined group by keyword_catid,name,keyword_id,word;`;
        console.log(myQuery);
        const keywords = await query(myQuery);
    

    res.send({ result: totalContents, catContents: catContents, catCooutryContents: catCooutryContents, keywords:keywords });
});

async function deleteNotes(req, res) {
    try {
        const result = await db.notes.destroy({ where: { id: req.params.notes_id } });
        return result + '';

    } catch (err) {
        console.log(err);
        res.send(err);
    }
}


async function deleteNotes(req, res) {
    try {
        const result = await db.notes.destroy({ where: { id: req.params.notes_id } });
        return result + '';

    } catch (err) {
        console.log(err);
        res.send(err);
    }
}










module.exports = router;