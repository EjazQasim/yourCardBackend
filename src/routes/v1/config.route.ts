import express, { Router } from 'express';
import { validate } from '../../modules/validate';
import { configController, configValidation } from '../../modules/config';
import { auth } from '../../modules/auth';

const router: Router = express.Router();

router
  .route('/')
  .get(configController.getConfigs)
  .post(auth('manageConfigs'), validate(configValidation.updateConfigs), configController.updateConfigs);

export default router;
