const config = reqlib('config');

var router = module.exports = require('express').Router();

router.get('/', (req, res, next) => {
    res.render('index', config);
});