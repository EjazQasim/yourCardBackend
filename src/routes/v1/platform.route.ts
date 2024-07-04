import express, { Router } from 'express';
import { validate } from '../../modules/validate';
import { auth } from '../../modules/auth';
import { platformController, platformValidation } from '../../modules/platform';
import { upload } from '../../modules/utils';

const router: Router = express.Router();

router
  .route('/')
  .post(auth('managePlatforms'), upload.single('image'), platformController.createPlatform)
  .get(auth('getPlatforms'), validate(platformValidation.getPlatforms), platformController.getPlatforms);

router
  .route('/:platformId')
  .get(auth(), validate(platformValidation.getPlatform), platformController.getPlatform)
  .patch(
    auth('managePlatforms'),
    validate(platformValidation.updatePlatform),
    upload.single('image'),
    platformController.updatePlatform
  )
  .delete(auth('managePlatforms'), validate(platformValidation.deletePlatform), platformController.deletePlatform);

export default router;
