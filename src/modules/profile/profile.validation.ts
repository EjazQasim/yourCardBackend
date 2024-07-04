import Joi from 'joi';
import { objectId } from '../validate/custom.validation';
import { NewCreatedProfile } from './profile.interfaces';

const createProfileBody: Record<keyof NewCreatedProfile, any> = {
  title: Joi.string().allow(null, ''),
  name: Joi.string().allow(null, ''),
  bio: Joi.string().allow(null, ''),
  themeColor: Joi.string(),
  location: Joi.string().allow(null, ''),
  jobTitle: Joi.string().allow(null, ''),
  company: Joi.string().allow(null, ''),
  image: Joi.string().allow(null, ''),
  cover: Joi.string().allow(null, ''),
  logo: Joi.string().allow(null, ''),
};

export const createProfile = {
  body: Joi.object().keys(createProfileBody),
};

export const getProfiles = {
  query: Joi.object().keys({
    search: Joi.string(),
    sortBy: Joi.string(),
    projectBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

export const getProfile = {
  params: Joi.object().keys({
    profileId: Joi.string(),
  }),
};

export const updateProfile = {
  params: Joi.object().keys({
    profileId: Joi.required().custom(objectId),
  }),
  body: Joi.object().keys({
    title: Joi.string().allow(null, ''),
    name: Joi.string().allow(null, ''),
    bio: Joi.string().allow(null, ''),
    themeColor: Joi.string(),
    location: Joi.string().allow(null, ''),
    jobTitle: Joi.string().allow(null, ''),
    company: Joi.string().allow(null, ''),
    image: Joi.string().allow(null, ''),
    cover: Joi.string().allow(null, ''),
    logo: Joi.string().allow(null, ''),
    category: Joi.string().allow(null, ''),
    leadCapture: Joi.boolean(),
    directOn: Joi.boolean(),
    direct: Joi.string().custom(objectId),
  }),
};

export const deleteProfile = {
  params: Joi.object().keys({
    profileId: Joi.string().custom(objectId),
  }),
};

export const getContactCard = {
  params: Joi.object().keys({
    profileId: Joi.string().custom(objectId),
  }),
};

export const getPkPass = {
  params: Joi.object().keys({
    profileId: Joi.string().custom(objectId),
  }),
};
