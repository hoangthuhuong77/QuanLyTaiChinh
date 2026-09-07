const r=require('express').Router(),c=require('../dieukhien/statisticsController');r.get('/overview',c.overview);r.get('/category',c.category);r.get('/monthly',c.monthly);module.exports=r;
