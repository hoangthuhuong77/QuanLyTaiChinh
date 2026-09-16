const router=require('express').Router();const controller=require('../dieukhien/chuyentien');router.get('/',controller.list);router.post('/',controller.create);module.exports=router;
// Duong dan API chuyentien.
