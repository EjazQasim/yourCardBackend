import Joi from 'joi';

export const createCheckoutSession = {
  body: Joi.object().keys({
    planId: Joi.string(),
    billingPeriod: Joi.string(),
  }),
};

export const getCustomer = {
  params: Joi.object().keys({
    customerId: Joi.string(),
  }),
};
