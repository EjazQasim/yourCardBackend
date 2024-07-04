import Joi from 'joi';
import { objectId } from '../validate/custom.validation';
import { NewCreatedPlatform } from './platform.interfaces';

const createPlatformBody: Record<keyof NewCreatedPlatform, any> = {
  category: Joi.required().custom(objectId),
  title: Joi.string().required(),
  headline: Joi.string().allow(null, ''),
  image: Joi.any(),
  webBaseURL: Joi.string().allow(null, ''),
  iOSBaseURL: Joi.string().allow(null, ''),
  androidBaseURL: Joi.string().allow(null, ''),
  type: Joi.string().required(),
};

export const getPlatforms = {
  query: Joi.object().keys({
    category: Joi.required().custom(objectId),
    search: Joi.string(),
    sortBy: Joi.string(),
    projectBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

export const createPlatform = {
  body: Joi.object().keys(createPlatformBody),
};

export const getPlatform = {
  params: Joi.object().keys({
    platformId: Joi.string().custom(objectId),
  }),
};

export const updatePlatform = {
  params: Joi.object().keys({
    platformId: Joi.required().custom(objectId),
  }),
  body: Joi.object().keys({
    title: Joi.string(),
    headline: Joi.string().allow(null, ''),
    image: Joi.any(),
    webBaseURL: Joi.string().allow(null, ''),
    iOSBaseURL: Joi.string().allow(null, ''),
    androidBaseURL: Joi.string().allow(null, ''),
    type: Joi.string(),
  }),
};

export const deletePlatform = {
  params: Joi.object().keys({
    platformId: Joi.string().custom(objectId),
  }),
};
