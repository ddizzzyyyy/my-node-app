const Router = require('@koa/router');
const UserController = require('../controllers/userController');
const {
  validate,
  createUserSchema,
  updateUserSchema,
  queryUsersSchema
} = require('../middleware');

const router = new Router({ prefix: '/api/users' });

router.get('/search', UserController.search);
router.get('/stats', UserController.stats);
router.get('/export', UserController.exportCsv);

router.get('/', validate(queryUsersSchema, 'query'), UserController.index);
router.get('/:id', UserController.show);
router.post('/', validate(createUserSchema, 'body'), UserController.create);
router.put('/:id', validate(updateUserSchema, 'body'), UserController.update);
router.delete('/:id', UserController.destroy);

module.exports = router;