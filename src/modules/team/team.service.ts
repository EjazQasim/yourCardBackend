import httpStatus from 'http-status';
import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';
import Team from './team.model';
import ApiError from '../errors/ApiError';
import { ITeamDoc, UpdateTeamBody } from './team.interfaces';
import { IOptions, QueryResult } from '../paginate/paginate';
import { User, userService } from '../user';
import { emailService } from '../email';
import { tokenService, tokenTypes } from '../token';
import { getUserById } from '../user/user.service';
import { verifyToken } from '../token/token.service';
import { stripeService } from '../stripe';

const populate = [
  {
    path: 'profile',
    populate: {
      path: 'direct',
      populate: {
        path: 'platform',
      },
    },
  },
];

/**
 * Create a team
 * @param {string} createTeamToken
 * @param {UpdateTeamBody} teamBody
 * @returns {Promise<ITeamDoc>}
 */
export const createTeam = async (createTeamToken: any): Promise<ITeamDoc> => {
  const createTeamTokenDoc = await verifyToken(createTeamToken, tokenTypes.TEAM_CREATE);
  const user = await getUserById(new mongoose.Types.ObjectId(createTeamTokenDoc.user));
  if (!user || !user.stripeId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'You are not subscribed');
  }
  // Check if the customer has a subscription
  const subscription = await stripeService.getCustomerSubscription(user.stripeId);
  if (!subscription || !subscription.items.data[0]) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'You are not subscribed');
  }
  if (user.team) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'You are already in a team.');
  }
  const team = await Team.create({ superAdmin: user.id, admins: [user.id] }).then((t) => t.populate(populate));
  await User.findByIdAndUpdate(user.id, { team });

  return team;
};

/**
 * Query for teams
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @returns {Promise<QueryResult>}
 */
export const queryTeams = async (filter: Record<string, any>, options: IOptions): Promise<QueryResult> => {
  const teams = await Team.paginate(filter, options);
  return teams;
};

/**
 * Get team by id
 * @param {mongoose.Types.ObjectId} id
 * @returns {Promise<ITeamDoc | null>}
 */
export const getTeamById = async (id: mongoose.Types.ObjectId): Promise<ITeamDoc | null> =>
  Team.findById(id).populate(populate);

/**
 * Update team by id
 * @param {mongoose.Types.ObjectId} teamId
 * @param {UpdateTeamBody} updateBody
 * @returns {Promise<ITeamDoc | null>}
 */
export const updateTeamById = async (
  teamId: mongoose.Types.ObjectId,
  updateBody: UpdateTeamBody
): Promise<ITeamDoc | null> => {
  const body = updateBody;
  const team = await getTeamById(teamId);
  if (!team) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Team not found');
  }

  Object.assign(team, body);
  await team.save();
  return team;
};

/**
 * Delete team by id
 * @param {mongoose.Types.ObjectId} teamId
 * @returns {Promise<ITeamDoc | null>}
 */
export const deleteTeamById = async (teamId: mongoose.Types.ObjectId): Promise<ITeamDoc | null> => {
  const team = await getTeamById(teamId);
  if (!team) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Team not found');
  }
  await team.deleteOne();
  return team;
};

/**
 * invite users to the team
 * @param {mongoose.Types.ObjectId} teamId
 * @param {string} emails
 */
export const inviteMembers = async (teamId: mongoose.Types.ObjectId, emails: string) => {
  await Promise.allSettled(
    emails.split(',').map(async (email: string) => {
      const teamInviteToken = await tokenService.generateTeamInviteToken(`${teamId},${email}`);
      if (teamInviteToken !== null) {
        await emailService.sendTeamInviteEmail(email, teamInviteToken);
      }
    })
  );
};

/**
 * create member and add to the team
 * @param {mongoose.Types.ObjectId} teamId
 * @param {any} body
 */
export const createMember = async (teamId: mongoose.Types.ObjectId, body: any) => {
  const team = await getTeamById(teamId);
  if (!team) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Team not found');
  }
  const user = await userService.registerUser(body);
  await userService.updateUserById(user.id, { team: team.id });
};

/**
 * Join team
 * @param {string} token
 * @returns {Promise<string | null>}
 */
export const joinTeam = async (token: string): Promise<string | null> => {
  let payload;
  try {
    payload = await tokenService.verifyTeamToken(token);
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Link expired ask your admin to resend the invite.');
  }

  let resetPasswordToken = null;
  if (payload && typeof payload.sub === 'string') {
    const teamId = payload.sub.split(',')[0];
    const email = payload.sub.split(',')[1] || '';
    const team = await getTeamById(new mongoose.Types.ObjectId(teamId));
    if (!team) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Team not found');
    }
    let user = await userService.getUserByEmail(email);
    if (!user) {
      user = await userService.registerUser({ email, password: 'asdf1122', username: uuidv4() });
      resetPasswordToken = await tokenService.generateResetPasswordToken(email);
    }
    if (user.team) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'You are already in a team');
    }

    await userService.updateUserById(user.id, { team: team.id });
  } else {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid link, please check again!');
  }

  return resetPasswordToken;
};

/**
 * Leave team
 * @returns {Promise<void>}
 */
export const leaveTeam = async (userId: mongoose.Types.ObjectId) => {
  await User.findByIdAndUpdate(userId, { $unset: { team: 1 }, isLocked: false });
};

/**
 * Remove member from team
 * @param {mongoose.Types.ObjectId} teamId
 * @param {mongoose.Types.ObjectId} userId
 * @returns {Promise<void>}
 */
export const removeMember = async (teamId: mongoose.Types.ObjectId, userId: mongoose.Types.ObjectId) => {
  const user = await userService.getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (!user.team || ('id' in user.team && String(teamId) !== String(user.team.id))) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
  }
  await User.findByIdAndUpdate(user.id, { $unset: { team: 1 }, isLocked: false });
};

/**
 * Cancel plan
 * @param {mongoose.Types.ObjectId} teamId
 */
export const cancelPlan = async (teamId: mongoose.Types.ObjectId) => {
  const team = await getTeamById(teamId);
  if (!team) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Team not found');
  }
  const user = await userService.getUserById(new mongoose.Types.ObjectId(`${team.superAdmin}`));
  if (!user || !user.stripeId) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  await stripeService.cancelSubscription(user.stripeId);
  await team.deleteOne();
};
