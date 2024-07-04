import Stripe from 'stripe';
import config from '../../config/config';
import { tokenService } from '../token';

const stripe = new Stripe(config.stripe.secretKey, { apiVersion: '2023-08-16' });

const getPrice = (billingPeriod: string) => {
  let priceId = '';

  // Check if the billing period is annually
  if (billingPeriod === 'annually') {
    priceId = config.stripe.product1;
  } else {
    priceId = config.stripe.product2;
  }
  return priceId;
};

// Function to create a new Stripe customer
export const getStripeCustomer = async (stripeId?: string) => {
  if (!stripeId) {
    return null;
  }
  try {
    const customer = await stripe.customers.retrieve(stripeId);
    return customer;
  } catch (error) {
    return null;
  }
};

// Function to create a new Stripe customer
export const createStripeCustomer = async (email: string) => {
  return stripe.customers.create({ email });
};

// Function to get the customer's subscription
export const getCustomerSubscription = async (customerId: string) => {
  const subscriptions = await stripe.subscriptions.list({ customer: customerId });
  return subscriptions.data[0];
};

// Function to get the customer's subscription
export const cancelSubscription = async (customerId: string) => {
  const subscriptions = await stripe.subscriptions.list({ customer: customerId });

  if (subscriptions.data[0]) {
    await stripe.subscriptions.cancel(subscriptions.data[0].id);
  }
};

// Function to create a Stripe checkout session
export const createStripeCheckoutSession = async (customerId: string, billingPeriod: string) => {
  const teamToken = await tokenService.generateCreateTeamToken(customerId);
  return stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [
      {
        price: getPrice(billingPeriod),
      },
    ],
    mode: 'subscription',
    success_url: `${config.dashUrl}/create-team?token=${teamToken}`,
    cancel_url: `${config.dashUrl}/subscribe/`,
  });
};
