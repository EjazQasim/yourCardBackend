import httpStatus from 'http-status';
import mongoose from 'mongoose';
import { json2csv } from 'json-2-csv';
import User from './user.model';
import ApiError from '../errors/ApiError';
import { IOptions, QueryResult } from '../paginate/paginate';
import { NewCreatedUser, UpdateUserBody, IUserDoc, NewRegisteredUser } from './user.interfaces';
import Lead from '../lead/lead.model';

const populate = [
  {
    path: 'live',
    populate: {
      path: 'direct',
      populate: {
        path: 'platform',
      },
    },
  },
  {
    path: 'team',
    populate: {
      path: 'profile',
      populate: {
        path: 'direct',
        populate: {
          path: 'platform',
        },
      },
    },
  },
];

/**
 * Create a user
 * @param {NewCreatedUser} userBody
 * @returns {Promise<IUserDoc>}
 */
export const createUser = async (userBody: NewCreatedUser): Promise<IUserDoc> => {
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  if (await User.isUsernameTaken(userBody.username)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Username already taken');
  }

  return User.create(userBody).then((t) => t.populate(populate));
};

/**
 * Register a user
 * @param {NewRegisteredUser} userBody
 * @returns {Promise<IUserDoc>}
 */
export const registerUser = async (userBody: NewRegisteredUser): Promise<IUserDoc> => {
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  if (await User.isUsernameTaken(userBody.username)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Username already taken');
  }

  return User.create(userBody).then((t) => t.populate(populate));
};

/**
 * Query for users
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @returns {Promise<QueryResult>}
 */
export const queryUsers = async (filter: Record<string, any>, options: IOptions): Promise<QueryResult> => {
  const users = await User.paginate(filter, { ...options, populate: 'live.direct.platform,team.profile.direct.platform' });
  return users;
};

/**
 * Get user by id
 * @param {mongoose.Types.ObjectId} id
 * @returns {Promise<IUserDoc | null>}
 */
export const getUserById = async (id: mongoose.Types.ObjectId): Promise<IUserDoc | null> =>
  User.findById(id).populate(populate);

/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<IUserDoc | null>}
 */
export const getUserByEmail = async (email: string): Promise<IUserDoc | null> => User.findOne({ email }).populate(populate);

/**
 * Get user by username
 * @param {string} username
 * @returns {Promise<IUserDoc | null>}
 */
export const getUserByUsername = async (username: string): Promise<IUserDoc | null> =>
  User.findOne({ username }).populate(populate);

/**
 * Update user by id
 * @param {mongoose.Types.ObjectId} userId
 * @param {UpdateUserBody} updateBody
 * @returns {Promise<IUserDoc | null>}
 */
export const updateUserById = async (
  userId: mongoose.Types.ObjectId,
  updateBody: UpdateUserBody
): Promise<IUserDoc | null> => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (updateBody.email && (await User.isEmailTaken(updateBody.email, userId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  if (updateBody.username && (await User.isUsernameTaken(updateBody.username, userId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Username already taken');
  }
  Object.assign(user, updateBody);
  await user.save().then((t) => t.populate(populate));
  return user;
};

/**
 * Delete user by id
 * @param {mongoose.Types.ObjectId} userId
 * @returns {Promise<IUserDoc | null>}
 */
export const deleteUserById = async (userId: mongoose.Types.ObjectId): Promise<IUserDoc | null> => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  await user.deleteOne();
  return user;
};

/**
 * Export users in csv
 * @returns {Promise<string | null>}
 */
export const exportUsers = async (): Promise<string | null> => {
  const users = await User.find({}).lean();
  const csvData = json2csv(users);

  return csvData;
};

/**
 * Export leads in csv
 * @param {ObjectId} user
 * @returns {Promise<string | null>}
 */
export const exportLeads = async (userId: mongoose.Types.ObjectId): Promise<string | null> => {
  const leads = await Lead.find({ user: userId }).populate({
    path: 'profile',
    populate: {
      path: 'user',
    },
  });

  const temp1 = leads.map((l: any) => {
    return {
      name: (l.profile ? l.profile.name : l.name) || '',
      email: (l.profile ? l.profile.user?.email : l.email) || '',
      phone: (l.profile ? l.profile.phone : l.phone) || '',
      website: (l.profile ? l.profile.website : l.website) || '',
      jobTitle: (l.profile ? l.profile.jobTitle : l.jobTitle) || '',
      company: (l.profile ? l.profile.company : l.company) || '',
    };
  });
  const csvData = json2csv(temp1);

  return csvData;
};
