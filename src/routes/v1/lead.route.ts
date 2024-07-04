import express, { Router } from 'express';
import { validate } from '../../modules/validate';
import { auth } from '../../modules/auth';
import { isLeadOwner } from '../../modules/middleware';
import { leadController, leadValidation } from '../../modules/lead';
import { upload } from '../../modules/utils';

const router: Router = express.Router();

router
  .route('/')
  .post(
    validate(leadValidation.createLead),
    upload.fields([
      { name: 'image', maxCount: 1 },
      { name: 'cover', maxCount: 1 },
      { name: 'logo', maxCount: 1 },
    ]),
    leadController.createLead
  )
  .get(auth('getLeads'), validate(leadValidation.getLeads), leadController.getLeads);

router.route('/my-leads').get(auth(), validate(leadController.getLeads), leadController.getMyLeads);

router.route('/contact-card/:leadId').get(validate(leadValidation.getContactCard), leadController.getContactCard);

router
  .route('/:leadId')
  .get(auth(), validate(leadValidation.getLead), isLeadOwner, leadController.getLead)
  .patch(
    auth(),
    validate(leadValidation.updateLead),
    isLeadOwner,
    upload.fields([
      { name: 'image', maxCount: 1 },
      { name: 'cover', maxCount: 1 },
      { name: 'logo', maxCount: 1 },
    ]),
    leadController.updateLead
  )
  .delete(auth(), validate(leadValidation.deleteLead), isLeadOwner, leadController.deleteLead);

export default router;
