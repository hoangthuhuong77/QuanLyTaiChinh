const router=require('express').Router();const controller=require('../dieukhien/thongbao');router.get('/',controller.list);router.put('/read-all',controller.markAllRead);router.put('/doctatca',controller.markAllRead);router.put('/:id/read',controller.markRead);router.put('/:id/dadoc',controller.markRead);router.delete('/:id',controller.remove);module.exports=router;
// Duong dan API thongbao.
