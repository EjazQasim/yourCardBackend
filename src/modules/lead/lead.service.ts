import httpStatus from 'http-status';
import vCardsJS from 'vcards-js2';
import mongoose from 'mongoose';
import Lead from './lead.model';
import ApiError from '../errors/ApiError';
import { NewCreatedLead, UpdateLeadBody, ILeadDoc } from './lead.interfaces';
import { uploadFile } from '../utils';
import { IOptions, QueryResult } from '../paginate/paginate';
import User from '../user/user.model';
import Profile from '../profile/profile.model';

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
 * Create a lead
 * @param {NewCreatedLead} leadBody
 * @param {any} user
 * @param {any} profile
 * @returns {Promise<ILeadDoc>}
 */
export const createLead = async (leadBody: NewCreatedLead, user: any, profile: any): Promise<ILeadDoc> => {
  const body = { ...leadBody, user: user.id };

  if (profile) {
    body.profile = profile.id;
    await User.findByIdAndUpdate(user.id, { $push: { leads: profile.id } });
    // const message = {
    //   notification: {
    //     title: `${profile.name} added to connections`,
    //     body: 'Tap here to see the new connection',
    //   },
    // };
    // await sendNotification([fcmToken], message);
  }
  return Lead.create(body);
};

/**
 * Create a lead
 * @param {NewCreatedLead} leadBody
 * @returns {Promise<ILeadDoc | null>}
 */
export const addLead = async (leadBody: NewCreatedLead): Promise<ILeadDoc | null> => {
  const { user, profile } = leadBody;

  // Find the user and profile objects for the lead.
  const [currentUser, otherProfile] = await Promise.all([
    User.findById(user).populate('live'),
    Profile.findById(profile).populate('user'),
  ]);

  if (!currentUser) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Check if the lead already exists.
  const existingLead = await Lead.findOne({ user, profile });

  if (existingLead && profile) {
    // Remove the lead if it already exists.
    await existingLead.deleteOne();
    await User.findByIdAndUpdate(user, { $pull: { leads: profile } });

    return null;
  }

  // Create a new lead.
  const lead = await createLead(leadBody, currentUser, otherProfile);
  if (otherProfile) {
    const currentProfile: any = currentUser.live;
    const otherUser: any = otherProfile.user;

    // Check if the other user has lead capture mode on.
    if (otherProfile.leadCapture) {
      const existingReverseLead = await Lead.findOne({ user: otherUser.id, profile: currentProfile.id });

      if (!existingReverseLead) {
        // Create a reverse lead if it doesn't already exist.
        await createLead(leadBody, otherUser, currentProfile);
        // const message = {
        //   notification: {
        //     title: `${otherProfile.name} <> ${currentProfile.name}`,
        //     body: 'Tap here to see the new connection',
        //   },
        // };
        // await sendNotification([otherUser.fcmToken, currentUser.fcmToken], message);
      }
    } else if (otherUser) {
      // Send a notification to the other user if they have lead capture mode off.
      // const message = {
      //   notification: {
      //     title: `${otherProfile.name} added you as a connection`,
      //     body: 'Tap here to see the new connection',
      //   },
      // };
      // await sendNotification([otherUser.fcmToken], message);
    }
  }

  return lead;
};

/**
 * Query for leads
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @returns {Promise<QueryResult>}
 */
export const queryLeads = async (filter: Record<string, any>, options: IOptions): Promise<QueryResult> => {
  const leads = await Lead.paginate(filter, options);
  return leads;
};

/**
 * Get lead by id
 * @param {mongoose.Types.ObjectId} id
 * @returns {Promise<ILeadDoc | null>}
 */
export const getLeadById = async (id: mongoose.Types.ObjectId): Promise<ILeadDoc | null> =>
  Lead.findById(id).populate(populate);

/**
 * Update lead by id
 * @param {mongoose.Types.ObjectId} leadId
 * @param {UpdateLeadBody} updateBody
 * @param {any} files
 * @returns {Promise<ILeadDoc | null>}
 */
export const updateLeadById = async (
  leadId: mongoose.Types.ObjectId,
  updateBody: UpdateLeadBody,
  files: any
): Promise<ILeadDoc | null> => {
  const body = updateBody;
  const lead = await getLeadById(leadId);
  if (!lead) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Lead not found');
  }

  if (files) {
    const { cover, image, logo } = files;
    if (image) {
      body.image = await uploadFile(image[0], 'profile');
    }
    if (cover) {
      body.cover = await uploadFile(cover[0], 'profile');
    }
    if (logo) {
      body.logo = await uploadFile(logo[0], 'profile');
    }
  }

  Object.assign(lead, body);
  await lead.save().then((t) => t.populate(populate));
  return lead;
};

/**
 * Delete lead by id
 * @param {mongoose.Types.ObjectId} leadId
 * @returns {Promise<ILeadDoc | null>}
 */
export const deleteLeadById = async (leadId: mongoose.Types.ObjectId): Promise<ILeadDoc | null> => {
  const lead = await getLeadById(leadId);
  if (!lead) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Lead not found');
  }
  await lead.deleteOne();
  return lead;
};

/**
 * Export contact card
 * @returns {Promise<any>}
 */
export const exportContactCard = async (leadId: mongoose.Types.ObjectId): Promise<any> => {
  const lead = await getLeadById(leadId);
  if (!lead) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Lead not found');
  }
  const vCard = vCardsJS();

  vCard.firstName = lead.name;
  vCard.email = lead.email;
  vCard.cellPhone = lead.phone;

  vCard.organization = lead.company;
  vCard.title = lead.jobTitle;
  vCard.url = lead.website;

  vCard.homeAddress.label = 'Address';
  vCard.homeAddress.street = lead.location;
  vCard.note = lead.notes;
  return vCard.getFormattedString();
};
