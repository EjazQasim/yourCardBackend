import httpStatus from 'http-status';
import { Request, Response } from 'express';
import catchAsync from '../utils/catchAsync';
import ApiError from '../errors/ApiError';
import { userService } from '../user';
import * as stripeService from './stripe.service';

export const getCustomer = catchAsync(async (req: Request, res: Response) => {
  const customer = await stripeService.getStripeCustomer(req.user.stripeId);
  res.send(customer);
});

export const createCheckoutSession = catchAsync(async (req: Request, res: Response) => {
  const { billingPeriod } = req.body;
  if (req.user.team) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'You are already in a team.');
  }

  // Check if the user already has a Stripe customer ID
  let customer = await stripeService.getStripeCustomer(req.user.stripeId);

  // If the user doesn't have a Stripe customer ID, create a new customer
  if (!customer) {
    customer = await stripeService.createStripeCustomer(req.user.email);
    // Update the user's record with the Stripe customer ID
    await userService.updateUserById(req.user.id, { stripeId: customer.id });
  }

  // Check if the customer already has a subscription
  const subscription = await stripeService.getCustomerSubscription(customer.id);

  if (subscription && subscription.items.data[0]) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'You have already subscribed');
  }

  // Create a new checkout session for the user
  const session = await stripeService.createStripeCheckoutSession(customer.id, billingPeriod);

  res.send({
    sessionId: session.id,
  });
});
