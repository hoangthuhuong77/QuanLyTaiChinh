const router = require('express').Router();
const controller = require('../dieukhien/phanhoi');

router.get('/', controller.list);
router.post('/', controller.create);

module.exports = router;