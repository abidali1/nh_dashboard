const express = require('express');
const router = express.Router();
const query = require('../config/query.js');
const db = require('../models');
router.get('/', (req, res) => {
    res.render('profile');
});

module.exports=router;