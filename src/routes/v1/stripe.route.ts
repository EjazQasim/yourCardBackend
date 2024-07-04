import express, { Router } from 'express';
import { validate } from '../../modules/validate';
import { auth } from '../../modules/auth';
import { stripeController, stripeValidation } from '../../modules/stripe';

const router: Router = express.Router();

router
  .route('/create-checkout-session')
  .post(auth(), validate(stripeValidation.createCheckoutSession), stripeController.createCheckoutSession);
router.route('/customer/:customerId').get(auth(), validate(stripeValidation.getCustomer), stripeController.getCustomer);

export default router;
