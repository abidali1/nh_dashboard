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



 



    res.send({ result: numbers, sources: sources,keywordsCat: keywordsCat,keywords: keywords });
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










module.exports = router;