const router=require('express').Router();const controller=require('../dieukhien/transferController');router.get('/',controller.list);router.post('/',controller.create);module.exports=router;
