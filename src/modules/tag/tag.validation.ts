import Joi from 'joi';
import { objectId } from '../validate/custom.validation';
import { NewCreatedTag } from './tag.interfaces';

const createTagBody: Record<keyof NewCreatedTag, any> = {
  batch: Joi.required().custom(objectId),
  customId: Joi.string(),
};

export const createTag = {
  body: Joi.object().keys(createTagBody),
};

export const getTags = {
  query: Joi.object().keys({
    search: Joi.string(),
    batch: Joi.string(),
    user: Joi.string(),
    sortBy: Joi.string(),
    projectBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

export const getTag = {
  params: Joi.object().keys({
    tagId: Joi.string().custom(objectId),
  }),
};

export const updateTag = {
  params: Joi.object().keys({
    tagId: Joi.required().custom(objectId),
  }),
  body: Joi.object().keys({
    name: Joi.string(),
  }),
};

export const deleteTag = {
  params: Joi.object().keys({
    tagId: Joi.string().custom(objectId),
  }),
};

export const linkTag = {
  params: Joi.object().keys({
    tagId: Joi.string().custom(objectId),
  }),
  query: Joi.object().keys({
    user: Joi.string().custom(objectId),
  }),
};
