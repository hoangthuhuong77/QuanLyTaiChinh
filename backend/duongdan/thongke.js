const r=require('express').Router(),c=require('../dieukhien/thongke');r.get('/overview',c.overview);r.get('/category',c.category);r.get('/monthly',c.monthly);r.get('/tongquan',c.overview);r.get('/danhmuc',c.category);r.get('/hangthang',c.monthly);module.exports=r;
// Duong dan API thongke.
