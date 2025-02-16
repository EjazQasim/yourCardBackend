import Joi from 'joi';
import { password, objectId, username } from '../validate/custom.validation';
import { NewCreatedUser } from './user.interfaces';

const createUserBody: Record<keyof NewCreatedUser, any> = {
  email: Joi.string().required().email(),
  password: Joi.string().required().custom(password),
  username: Joi.string().required().custom(username),
  role: Joi.string().required().valid('user', 'admin'),
};

export const createUser = {
  body: Joi.object().keys(createUserBody),
};

export const getUsers = {
  query: Joi.object().keys({
    search: Joi.string(),
    role: Joi.string(),
    sortBy: Joi.string(),
    projectBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

export const getUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

export const updateUserById = {
  params: Joi.object().keys({
    userId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      email: Joi.string().email(),
      password: Joi.string().custom(password),
      role: Joi.string().required().valid('user', 'admin'),
      username: Joi.string().custom(username),
      fcmToken: Joi.string(),
      isLocked: Joi.boolean(),
      live: Joi.string().custom(objectId),
    })
    .min(1),
};

export const deleteUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

export const updateUser = {
  body: Joi.object()
    .keys({
      email: Joi.string().email(),
      password: Joi.string().custom(password),
      username: Joi.string().custom(username),
      fcmToken: Joi.string(),
      isLocked: Joi.boolean(),
      live: Joi.string().custom(objectId),
    })
    .min(1),
};

export const exportLeads = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};
