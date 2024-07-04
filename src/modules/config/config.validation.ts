import Joi from 'joi';
import { ConfigBody } from './config.interfaces';

const configBody: Record<keyof ConfigBody, any> = {
  appName: Joi.string(),
  androidMinimumVersion: Joi.string(),
  iOSMinimumVersion: Joi.string(),
  maintenance: Joi.boolean(),
  iOSAppUrl: Joi.string().allow(null, ''),
  androidAppUrl: Joi.string().allow(null, ''),
  privacyUrl: Joi.string().allow(null, ''),
  termsUrl: Joi.string().allow(null, ''),
  dashUrl: Joi.string().allow(null, ''),
  email: Joi.object().keys({
    smtp: Joi.object().keys({
      host: Joi.string().allow(null, ''),
      port: Joi.number().allow(null, ''),
      username: Joi.string().allow(null, ''),
      password: Joi.string().allow(null, ''),
    }),
    from: Joi.string().allow(null, ''),
  }),
  s3: Joi.object().keys({
    bucketName: Joi.string().allow(null, ''),
    bucketRegion: Joi.string().allow(null, ''),
    accessKey: Joi.string().allow(null, ''),
    secretKey: Joi.string().allow(null, ''),
  }),
  stripe: Joi.object().keys({
    publishableKey: Joi.string().allow(null, ''),
    secretKey: Joi.string().allow(null, ''),
    product1: Joi.string().allow(null, ''),
    product2: Joi.string().allow(null, ''),
  }),
};

// eslint-disable-next-line import/prefer-default-export
export const updateConfigs = {
  body: Joi.object().keys(configBody),
};
