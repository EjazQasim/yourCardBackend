import express, { Router } from 'express';
import { validate } from '../../modules/validate';
import { auth } from '../../modules/auth';
import { profileController, profileValidation } from '../../modules/profile';
import { isProfileOwner } from '../../modules/middleware';
import { upload } from '../../modules/utils';

const router: Router = express.Router();

router
  .route('/')
  .post(
    auth(),
    validate(profileValidation.createProfile),
    upload.fields([
      { name: 'image', maxCount: 1 },
      { name: 'cover', maxCount: 1 },
      { name: 'logo', maxCount: 1 },
    ]),
    profileController.createProfile
  )
  .get(auth('getProfiles'), validate(profileValidation.getProfiles), profileController.getProfiles);

router.route('/my-profiles').get(auth(), validate(profileValidation.getProfiles), profileController.getMyProfiles);

router.route('/public/:profileId').get(validate(profileValidation.getProfile), profileController.getProfile);
router.route('/contact-card/:profileId').get(validate(profileValidation.getContactCard), profileController.getContactCard);
router.route('/pkpass/:profileId').get(validate(profileValidation.getPkPass), profileController.getPkPass);

router
  .route('/:profileId')
  .get(auth(), validate(profileValidation.getProfile), profileController.getProfile)
  .patch(
    auth(),
    validate(profileValidation.updateProfile),
    isProfileOwner,
    upload.fields([
      { name: 'image', maxCount: 1 },
      { name: 'cover', maxCount: 1 },
      { name: 'logo', maxCount: 1 },
    ]),
    profileController.updateProfile
  )
  .delete(auth(), validate(profileValidation.deleteProfile), isProfileOwner, profileController.deleteProfile);

export default router;
