const r=require('express').Router(),c=require('../dieukhien/danhmuc');r.get('/',c.list);r.post('/',c.create);r.put('/:id',c.update);r.delete('/:id',c.remove);module.exports=r;
// Duong dan API danhmuc.
