import httpStatus from 'http-status';
import axios from 'axios';
import { Request, Response } from 'express';
import catchAsync from '../utils/catchAsync';
import { tokenService } from '../token';
import { userService } from '../user';
import * as authService from './auth.service';
import { emailService } from '../email';
import { stripeService } from '../stripe';
import { Team } from '../team';
import { logger } from '../logger';
import config from '../../config/config';
import { ApiError } from '../errors';

export const me = catchAsync(async (req: Request, res: Response) => {
  let user = await userService.getUserById(req.user.id);
  let isPro;
  if (user) {
    let customer = await stripeService.getStripeCustomer(user.stripeId);
    if (!customer) {
      customer = await stripeService.createStripeCustomer(user.email);
      await userService.updateUserById(req.user.id, { stripeId: customer.id });
    }
    // Check if the customer already has a subscription
    const subscription = await stripeService.getCustomerSubscription(customer.id);

    if (subscription && subscription.items.data[0]?.plan.active && !user.team) {
      const team = await Team.create({ superAdmin: user.id, admins: [user.id] });
      user = await userService.updateUserById(user.id, { team });
    }

    try {
      if (user) {
        const conf = {
          headers: { Authorization: `Bearer ${config.revenueCatApiKey}` },
        };
        const res1 = await axios.get(
          `https://api.revenuecat.com/v1/subscribers/${user.id}${config.env === 'production' ? '' : '-dev'}`,
          conf
        );
        isPro = !!res1.data.subscriber.entitlements.pro;
      }
    } catch (error: any) {
      logger.error(error?.message);
    }
  }
  res.send({ ...user?.toJSON(), isPro });
});

export const register = catchAsync(async (req: Request, res: Response) => {
  const user = await userService.registerUser(req.body);
  const tokens = await tokenService.generateAuthTokens(user);
  res.status(httpStatus.CREATED).send({ user, tokens });
});

export const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await authService.loginUserWithEmailAndPassword(email, password);
  const tokens = await tokenService.generateAuthTokens(user);
  res.send({ user, tokens });
});

export const logout = catchAsync(async (req: Request, res: Response) => {
  await authService.logout(req.body.refreshToken);
  res.status(httpStatus.NO_CONTENT).send();
});

export const refreshTokens = catchAsync(async (req: Request, res: Response) => {
  const userWithTokens = await authService.refreshAuth(req.body.refreshToken);
  res.send({ ...userWithTokens });
});

export const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  const user = await userService.getUserByEmail(req.body.email);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  const resetPasswordToken = await tokenService.generateResetPasswordToken(req.body.email);
  await emailService.sendResetPasswordEmail(req.body.email, resetPasswordToken);
  res.status(httpStatus.NO_CONTENT).send();
});

export const resetPassword = catchAsync(async (req: Request, res: Response) => {
  await authService.resetPassword(req.query['token'], req.body.password);
  res.status(httpStatus.NO_CONTENT).send();
});

export const sendVerificationEmail = catchAsync(async (req: Request, res: Response) => {
  const verifyEmailToken = await tokenService.generateVerifyEmailToken(req.user);
  await emailService.sendVerificationEmail(req.user.email, verifyEmailToken, req.user.username);
  res.status(httpStatus.NO_CONTENT).send();
});

export const verifyEmail = catchAsync(async (req: Request, res: Response) => {
  await authService.verifyEmail(req.query['token']);
  res.status(httpStatus.NO_CONTENT).send();
});
