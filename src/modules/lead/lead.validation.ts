import Joi from 'joi';
import { objectId } from '../validate/custom.validation';
import { NewCreatedLead } from './lead.interfaces';

const createLeadBody: Record<keyof NewCreatedLead, any> = {
  user: Joi.string().custom(objectId),
  profile: Joi.string().custom(objectId),
  name: Joi.string(),
  email: Joi.string(),
  phone: Joi.string().allow(null, ''),
  jobTitle: Joi.string().allow(null, ''),
  company: Joi.string().allow(null, ''),
  notes: Joi.string().allow(null, ''),
  location: Joi.string().allow(null, ''),
  website: Joi.string().allow(null, ''),
  image: Joi.string().allow(null, ''),
  cover: Joi.string().allow(null, ''),
  logo: Joi.string().allow(null, ''),
  latitude: Joi.number().allow(null, ''),
  longitude: Joi.number().allow(null, ''),
};

export const createLead = {
  body: Joi.object().keys(createLeadBody),
};

export const getLeads = {
  query: Joi.object().keys({
    user: Joi.string(),
    sortBy: Joi.string(),
    projectBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

export const getLead = {
  params: Joi.object().keys({
    leadId: Joi.string().custom(objectId),
  }),
};

export const updateLead = {
  params: Joi.object().keys({
    leadId: Joi.required().custom(objectId),
  }),
  body: Joi.object().keys({
    name: Joi.string(),
    email: Joi.string(),
    phone: Joi.string().allow(null, ''),
    jobTitle: Joi.string().allow(null, ''),
    company: Joi.string().allow(null, ''),
    notes: Joi.string().allow(null, ''),
    location: Joi.string().allow(null, ''),
    website: Joi.string().allow(null, ''),
    image: Joi.string().allow(null, ''),
    cover: Joi.string().allow(null, ''),
    logo: Joi.string().allow(null, ''),
    latitude: Joi.number().allow(null, ''),
    longitude: Joi.number().allow(null, ''),
  }),
};

export const deleteLead = {
  params: Joi.object().keys({
    leadId: Joi.string().custom(objectId),
  }),
};

export const getContactCard = {
  params: Joi.object().keys({
    leadId: Joi.string().custom(objectId),
  }),
};
