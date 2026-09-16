const r=require('express').Router(),c=require('../dieukhien/vitien');r.get('/',c.list);r.get('/:id',c.detail);r.post('/',c.create);r.put('/:id',c.update);r.delete('/:id',c.remove);module.exports=r;
// Duong dan API vitien.
