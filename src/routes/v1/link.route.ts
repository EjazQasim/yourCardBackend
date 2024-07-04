import express, { Router } from 'express';
import { validate } from '../../modules/validate';
import { auth } from '../../modules/auth';
import { isLinkOwner, isProfileOwner } from '../../modules/middleware';
import { linkController, linkValidation } from '../../modules/link';
import { upload } from '../../modules/utils';

const router: Router = express.Router();

router
  .route('/')
  .post(
    auth(),
    validate(linkValidation.createLink),
    upload.fields([
      {
        name: 'image',
        maxCount: 1,
      },
      {
        name: 'file',
        maxCount: 1,
      },
    ]),
    linkController.createLink
  )
  .get(validate(linkValidation.getLinks), linkController.getLinks);

router
  .route('/reorder/:profileId')
  .patch(auth(), validate(linkValidation.reorderLinks), isProfileOwner, linkController.reorderLinks);

router
  .route('/:linkId')
  .get(auth(), validate(linkValidation.getLink), linkController.getLink)
  .patch(
    auth(),
    validate(linkValidation.updateLink),
    isLinkOwner,
    upload.fields([
      {
        name: 'image',
        maxCount: 1,
      },
      {
        name: 'file',
        maxCount: 1,
      },
    ]),
    linkController.updateLink
  )
  .delete(auth(), validate(linkValidation.deleteLink), isLinkOwner, linkController.deleteLink);

export default router;
