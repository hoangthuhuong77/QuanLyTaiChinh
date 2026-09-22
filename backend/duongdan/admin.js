const router = require('express').Router();
const controller = require('../dieukhien/admin');
const accountController = require('../dieukhien/taikhoan');

router.get('/profile', accountController.profile);
router.put('/profile', accountController.updateProfile);
router.put('/change-password', accountController.changePassword);
router.get('/dashboard', controller.dashboard);
router.get('/statistics', controller.statistics);
router.get('/users', controller.listUsers);
router.get('/users/:id', controller.detailUser);
router.patch('/users/:id/status', controller.setUserStatus);
router.delete('/users/:id', controller.removeUser);
router.get('/categories', controller.listCategories);
router.post('/categories', controller.createCategory);
router.put('/categories/:id', controller.updateCategory);
router.delete('/categories/:id', controller.removeCategory);
router.get('/notifications', controller.listNotifications);
router.post('/notifications', controller.createNotification);
router.put('/notifications/:id', controller.updateNotification);
router.delete('/notifications/:id', controller.removeNotification);
router.get('/feedback', controller.listFeedback);
router.patch('/feedback/:id', controller.updateFeedback);

module.exports = router;