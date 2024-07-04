import Joi from 'joi';
import { objectId } from '../validate/custom.validation';
import { NewCreatedProduct } from './product.interfaces';

const createProductBody: Record<keyof NewCreatedProduct, any> = {
  profile: Joi.string().custom(objectId),
  title: Joi.string(),
  image: Joi.any(),
  description: Joi.string().allow('', null),
  url: Joi.string().allow('', null),
  price: Joi.string().allow('', null),
};

export const createProduct = {
  body: Joi.object().keys(createProductBody),
};

export const getProducts = {
  query: Joi.object().keys({
    profile: Joi.string(),
    sortBy: Joi.string(),
    projectBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

export const getProduct = {
  params: Joi.object().keys({
    productId: Joi.string().custom(objectId),
  }),
};

export const updateProduct = {
  params: Joi.object().keys({
    productId: Joi.required().custom(objectId),
  }),
  body: Joi.object().keys({
    title: Joi.string(),
    image: Joi.any(),
    description: Joi.string().allow('', null),
    url: Joi.string(),
    price: Joi.string().allow('', null),
  }),
};

export const deleteProduct = {
  params: Joi.object().keys({
    productId: Joi.string().custom(objectId),
  }),
};

export const reorderProducts = {
  params: Joi.object().keys({
    profileId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    orderedProducts: Joi.array().items(Joi.string()),
  }),
};
