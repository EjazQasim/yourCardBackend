import Joi from 'joi';
import { objectId } from '../validate/custom.validation';
import { NewCreatedLink } from './link.interfaces';

const createLinkBody: Record<keyof NewCreatedLink, any> = {
  profile: Joi.string().custom(objectId),
  platform: Joi.string().custom(objectId),
  title: Joi.string(),
  headline: Joi.string(),
  image: Joi.any(),
  file: Joi.any(),
  value: Joi.string(),
  data: Joi.string(),
};

export const createLink = {
  body: Joi.object().keys(createLinkBody),
};

export const getLinks = {
  query: Joi.object().keys({
    profile: Joi.string(),
    sortBy: Joi.string(),
    projectBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

export const getLink = {
  params: Joi.object().keys({
    linkId: Joi.string().custom(objectId),
  }),
};

export const updateLink = {
  params: Joi.object().keys({
    linkId: Joi.required().custom(objectId),
  }),
  body: Joi.object().keys({
    title: Joi.string(),
    headline: Joi.string(),
    image: Joi.any(),
    file: Joi.any(),
    value: Joi.string(),
    data: Joi.string(),
    status: Joi.boolean(),
    isContact: Joi.boolean(),
  }),
};

export const deleteLink = {
  params: Joi.object().keys({
    linkId: Joi.string().custom(objectId),
  }),
};

export const reorderLinks = {
  params: Joi.object().keys({
    profileId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    orderedLinks: Joi.array().items(Joi.string()),
  }),
};
