import express, { Router } from 'express';
import { validate } from '../../modules/validate';
import { auth } from '../../modules/auth';
import { userController, userValidation } from '../../modules/user';
import { isOwner } from '../../modules/middleware';

const router: Router = express.Router();

router
  .route('/')
  .post(auth('manageUsers'), validate(userValidation.createUser), userController.createUser)
  .get(auth('getUsers'), validate(userValidation.getUsers), userController.getUsers)
  .patch(auth(), validate(userValidation.updateUser), userController.updateUser);

router.route('/export-csv').get(auth('getUsers'), userController.exportUsers);
router
  .route('/export-leads-csv/:userId')
  .get(auth(), validate(userValidation.exportLeads), isOwner, userController.exportLeads);

router
  .route('/:userId')
  .get(auth('manageUsers'), validate(userValidation.getUser), userController.getUser)
  .patch(auth('manageUsers'), validate(userValidation.updateUserById), userController.updateUserById)
  .delete(auth('manageUsers'), validate(userValidation.deleteUser), userController.deleteUser);

export default router;
