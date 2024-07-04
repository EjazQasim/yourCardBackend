import Joi from 'joi';
import { objectId, password, username } from '../validate/custom.validation';

export const createTeam = {
  query: Joi.object().keys({
    token: Joi.string(),
  }),
};

export const getTeams = {
  query: Joi.object().keys({
    search: Joi.string(),
    sortBy: Joi.string(),
    projectBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

export const getTeam = {
  params: Joi.object().keys({
    teamId: Joi.string().custom(objectId),
  }),
};

export const updateTeam = {
  body: Joi.object()
    .keys({
      admins: Joi.array().items(Joi.string()),
    })
    .min(1),
};

export const deleteTeam = {
  params: Joi.object().keys({
    teamId: Joi.string().custom(objectId),
  }),
};

export const inviteMembers = {
  params: Joi.object().keys({
    teamId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    emails: Joi.string().required(),
  }),
};

export const createMember = {
  params: Joi.object().keys({
    teamId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    username: Joi.string().required().custom(username),
  }),
};

export const joinTeam = {
  query: Joi.object().keys({
    token: Joi.string(),
  }),
};

export const getTeamMembers = {
  query: Joi.object().keys({
    search: Joi.string(),
    sortBy: Joi.string(),
    projectBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

export const getTeamLeads = {
  query: Joi.object().keys({
    search: Joi.string(),
    sortBy: Joi.string(),
    projectBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

export const removeMember = {
  params: Joi.object().keys({
    teamId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    user: Joi.string().required().custom(objectId),
  }),
};

export const updateMember = {
  params: Joi.object().keys({
    teamId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    user: Joi.string().required().custom(objectId),
    isLocked: Joi.boolean(),
  }),
};

export const cancelPlan = {
  params: Joi.object().keys({
    teamId: Joi.string().custom(objectId),
  }),
};
