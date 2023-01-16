const express = require('express');
const router = express.Router();
const query = require('../config/query.js');
const db = require('../models');


router.get('/', (req, res) => {
    homePageData(req.params, (keywords, countries, sources) => {
        if (keywords)
            res.render('allsites', {
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



router.post('/folder/add', async (req, res) => {
    const result = await addFolder(req, res);
    res.send(result);
});

router.delete('/folder/:folder_id', async (req, res) => {
    try {
        await db.news_folder.destroy({ where: { folder_id: req.params.folder_id } });
        const result = await db.folder.destroy({ where: { id: req.params.folder_id } });
        res.send(result + '');

    } catch (err) { console.log(err); res.send(err) }
});



router.post('/folder/addnews', async (req, res) => {
    const result = await addFolderNews(req, res);
    res.send(result);
});


router.post('/addNotes', async (req, res) => {
    const result = await addNotes(req, res);
    res.send(result);
});

router.delete('/deleteNotes/:notes_id', async (req, res) => {
    const result = await deleteNotes(req, res);
    res.send(result);
});



router.get('/folder/:id', async (req, res) => {

    //   const result = await db.folder.findAll({ where: { user_id: req.params.id } });

    const result = await query(`select folders.id,name, count(news_id) news from folders left join news_folders on folders.id=news_folders.folder_id
        where folders.user_id=${req.params.id}
        group by id,name`);
    res.send(result);
});



router.get('/getNotes/:user_id!:news_id', async (req, res) => {

    //   const result = await db.folder.findAll({ where: { user_id: req.params.id } });

    const result = await query(`select * from notes where user_id=${req.params.user_id} and news_id=${req.params.news_id}`);
    res.send(result);
});


router.get('/getAllNotes/:user_id', async (req, res) => {

    //   const result = await db.folder.findAll({ where: { user_id: req.params.id } });

    const result = await query(`select notes.id,news.id news_id,user_id,notes,title,url,createdAt from notes  left join news 
           on notes.news_id=news.id 
           where user_id=${req.params.user_id}
           order by notes.id desc `);
    res.send(result);
});



// Function -- will be moved to controllers


router.get('/getAnalytics/:user_id', async (req, res) => {

    //   const result = await db.folder.findAll({ where: { user_id: req.params.id } });

    const result = await query(`
           select 
           (select count(*)  from user_country where user_id=${req.params.user_id}) county ,
           (select count(*)  from user_keywords  where user_id=${req.params.user_id}) keywords,
           (select count(*)  from user_opinion where user_id=${req.params.user_id} ) opinion,
           (select count(*)  from user_regions where user_id=${req.params.user_id}) regions,
           (select count(*)  from user_source where user_id=${req.params.user_id}) source,
           (select count(*)  from  folders where user_id=${req.params.user_id}) forlders,
           (select count(*)  from news_folders  where user_id=${req.params.user_id}) savenews,           
           (select count(*)  from notes  where user_id=${req.params.user_id}) notes`);
    res.send(result);
});


router.get('/getAllNotes/:user_id', async (req, res) => {

    //   const result = await db.folder.findAll({ where: { user_id: req.params.id } });

    const result = await query(`select notes.id,news.id news_id,user_id,notes,title,url,createdAt from notes  left join news 
           on notes.news_id=news.id 
           where user_id=${req.params.user_id}
           order by notes.id desc `);
    res.send(result);
});





async function addFolderNews(req, res) {
    if (Object.keys(req.body).length === 0) {
        res.send('no data provided');
        return;
    }
    const { folder_id } = req.body;
    const { news_id } = req.body;
    const { user_id } = req.body;
    const { check_status } = req.body;


    // try {
    //     if (check_status == true) {
    //         const result = await db.news_folder.create({ user_id: user_id, folder_id: folder_id, news_id: news_id });
    //         return result;
    //     }
    //     else {

    //         db.news_folder.destroy({ where: { user_id: user_id, folder_id: folder_id, news_id: news_id } })
    //         return result;
    //     }


    try {

       const del = await db.news_folder.destroy({ where: { user_id: user_id, news_id: news_id } })

        if(folder_id!="0"){
        const result = await db.news_folder.create({ user_id: user_id, folder_id: folder_id, news_id: news_id });
        return result;
        }
        else return del+"";


    } catch (err) {
        console.log(err);
        res.send(err);
    }
}

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
        const result = await db.notes.create({ user_id: user_id, news_id: news_id, notes: notes });
        return result;

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


async function addFolder(req, res) {
    if (Object.keys(req.body).length === 0) {
        res.send('no data provided');
        return;
    }
    const { name } = req.body;
    const { user_id } = req.body;
    try {
        const result = await db.folder.create({ name: name, user_id: user_id });
        return result;
    } catch (err) {
        console.log(err);
        res.send(err);
    }
}

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



    const user_id = params.user_id != '0' && params.user_id != undefined ? ' AND  uk.user_id =  ' + params.user_id : '';
    const keyword_id = params.keyword_id != '0' && params.keyword_id != undefined ? ' AND id=' + params.keyword_id : '';
    const keyword_cat_id = params.keyword_cat_id != '0' && params.keyword_cat_id != undefined ? ' AND keyword_catId=' + params.keyword_cat_id : '';
    const start_date = params.start_date != '0' && params.start_date != undefined ? " AND pub_date  >=  '" + params.start_date + "'" : '';
    const end_date = params.end_date != '0' && params.end_date != undefined ? " AND pub_date <='" + params.end_date + "'" : '';
    const country = params.country != '0' && params.country != undefined ? " AND n.country='" + params.country + "'" : '';
    const source_id = params.source_id != '0' && params.source_id != undefined ? ' AND source_id=' + params.source_id : '';
    const folder_id = params.folder_id != '0' && params.folder_id != undefined ? ' AND  news_id  in (select news_id from news_folders where folder_id=' + params.folder_id+')' : '';


    const limit = params.limit != '0' && params.limit != undefined ? '' + params.limit : '20';
    const skip = params.skip != '0' && params.skip != undefined ? '' + params.skip : '0';



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