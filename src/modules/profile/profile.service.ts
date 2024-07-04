import httpStatus from 'http-status';
import mongoose, { isValidObjectId } from 'mongoose';
import vCardsJS from 'vcards-js2';
import passkit from 'passkit-generator';
import fs from 'fs';
import ApiError from '../errors/ApiError';
import config from '../../config/config';
import Profile from './profile.model';
import Link from '../link/link.model';
import { IOptions, QueryResult } from '../paginate/paginate';
import { NewCreatedProfile, UpdateProfileBody, IProfileDoc } from './profile.interfaces';
import { getFileFromS3, toUrl, uploadFile } from '../utils';
import { IUser } from '../user/user.interfaces';
import { IPlatform } from '../platform/platform.interfaces';
import { userService } from '../user';
import { tagService } from '../tag';

const populate = [
  {
    path: 'direct',
    populate: {
      path: 'platform',
    },
  },
];

/**
 * Create a profile
 * @param {NewCreatedProfile} profileBody
 * * @param {any} files
 * @returns {Promise<IProfileDoc>}
 */
export const createProfile = async (profileBody: NewCreatedProfile, files: any): Promise<IProfileDoc> => {
  const body = profileBody;
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
  return Profile.create(profileBody).then((t) => t.populate(populate));
};

/**
 * Query for profiles
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @returns {Promise<QueryResult>}
 */
export const queryProfiles = async (filter: Record<string, any>, options: IOptions): Promise<QueryResult> => {
  const profiles = await Profile.paginate(filter, { ...options, populate: 'direct.platform' });
  return profiles;
};

/**
 * Get team profile
 * @param {mongoose.Types.ObjectId} id
 * @returns {Promise<IProfileDoc | null>}
 */
export const getTeamProfile = async (id: mongoose.Types.ObjectId): Promise<IProfileDoc | null> => {
  const profile: any = await Profile.findById(id).populate({
    path: 'user',
    populate: {
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
  });

  return profile?.user?.team?.profile;
};

/**
 * Get profile by id
 * @param {mongoose.Types.ObjectId} id
 * @returns {Promise<IProfileDoc | null>}
 */
export const getProfileById = async (id: mongoose.Types.ObjectId): Promise<IProfileDoc | null> => {
  const profile = await Profile.findById(id).populate(populate);
  const masterProfile = profile ? await getTeamProfile(new mongoose.Types.ObjectId(profile.id)) : null;

  if (profile && masterProfile) {
    const { company, themeColor, logo, cover } = masterProfile;
    profile.company = company || profile.company || '';
    profile.themeColor = themeColor || profile.themeColor || '';
    profile.logo = logo || profile.logo || '';
    profile.cover = cover || profile.cover || '';
  }

  return profile;
};

/**
 * Get profile
 * @param {any} id
 * @param {any} reqUserId
 * @returns {Promise<IProfileDoc | null>}
 */
export const getProfile = async (id: any, reqUserId: any): Promise<IProfileDoc | null> => {
  let isTapped = false;
  let profile = isValidObjectId(id) ? await getProfileById(id) : null;

  if (!profile) {
    let user = await (isValidObjectId(id) ? userService.getUserById(id) : userService.getUserByUsername(id));
    if (!user) {
      const tag = await (isValidObjectId(id) ? tagService.getTagById(id) : tagService.getTagByCustomId(id));
      if (tag && tag.user) {
        user = await userService.getUserById(new mongoose.Types.ObjectId(`${tag.user}`));
        isTapped = true;
      }
    }
    if (user && 'id' in user.live) {
      profile = await getProfileById(user.live.id);
    }
  }

  if (!profile) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Profile not found');
  }

  if (String(profile.user) !== String(reqUserId)) {
    profile.views = (profile.views || 0) + 1;
    if (isTapped) {
      profile.taps = (profile.taps || 0) + 1;
    }
    await profile.save().then((t) => t.populate(populate));
  }

  return profile;
};

/**
 * Update profile by id
 * @param {mongoose.Types.ObjectId} profileId
 * @param {UpdateProfileBody} updateBody
 * @param {any} files
 * @returns {Promise<IProfileDoc | null>}
 */
export const updateProfileById = async (
  profileId: mongoose.Types.ObjectId,
  updateBody: UpdateProfileBody,
  files: any
): Promise<IProfileDoc | null> => {
  const body = updateBody;
  const profile = await getProfileById(profileId);
  if (!profile) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Profile not found');
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

  Object.assign(profile, body);
  await profile.save().then((t) => t.populate(populate));
  return profile;
};

/**
 * Delete profile by id
 * @param {mongoose.Types.ObjectId} profileId
 */
export const deleteProfileById = async (profileId: mongoose.Types.ObjectId) => {
  const profile = await Profile.findById(profileId).populate<{ user: IUser }>('user');
  if (!profile) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Profile not found');
  }
  if (String(profile.user.live) === String(profileId)) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cannot delete an active profile');
  }

  await profile.deleteOne();
};

/**
 * Export contact card
 * @returns {Promise<any>}
 */
export const exportContactCard = async (profileId: mongoose.Types.ObjectId): Promise<any> => {
  const profile = await getProfileById(profileId);
  if (!profile) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Profile not found');
  }

  const vCard = vCardsJS();
  vCard.firstName = profile.name || '';
  vCard.nickname = profile.bio || '';

  const image = profile.image ? await getFileFromS3(profile.image) : '';
  if (image && image.Body) {
    vCard.photo.embedFromString(image.Body.toString('base64'), 'image/png');
  }

  const links = await Link.find({ profile: profile.id }).populate<{ platform: IPlatform }>('platform');

  const contactCard = links.find((link) => link.platform.type === 'contact');
  if (contactCard && contactCard.data && contactCard.data !== '') {
    const data = JSON.parse(contactCard.data);
    vCard.firstName = data.firstName;
    vCard.lastName = data.lastName;
    vCard.organization = data.company;
    vCard.workEmail = data.email;
    vCard.cellPhone = data.mobile;
    vCard.homePhone = data.homePhone;
    vCard.workPhone = data.workPhone;
    vCard.title = data.jobTitle;
    vCard.url = data.website;
    vCard.homeAddress.label = 'Address';
    vCard.homeAddress.street = data.address;
  }

  vCard.socialUrls['Your Card'] = `${config.clientUrl}/${profile.id}`;

  links.forEach((link) => {
    if ((link.isContact && link.platform.type !== 'contact') || !contactCard) {
      let url = `${link.platform.webBaseURL}${link.value}`;
      if (link.platform.type === 'url') {
        url = toUrl(url);
      } else if (link.platform.type === 'file') {
        url = `${link.platform.webBaseURL}${link.file}`;
      }
      vCard.socialUrls[link.title || link.platform.title] = url;
    }
  });

  return vCard.getFormattedString();
};

/**
 * Export pkpass
 * @returns {Promise<any>}
 */
export const exportPkPass = async (profileId: mongoose.Types.ObjectId): Promise<any> => {
  const profile = await getProfileById(profileId);
  if (!profile) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Profile not found');
  }

  const wwdr = fs.readFileSync('./src/keys/wwdr.pem', 'utf8');
  const signerCert = fs.readFileSync('./src/keys/signerCert.pem', 'utf8');
  const signerKey = fs.readFileSync('./src/keys/signerKey.pem', 'utf8');

  const image = profile.image ? await getFileFromS3(profile.image) : '';

  const response = await fetch('https://app.yourcard.au/logo-dark.png');
  const logo = await response.arrayBuffer();

  const pass = new passkit.PKPass(
    {
      'icon.png': Buffer.from(logo),
      'logo.png': Buffer.from(logo),
      'thumbnail.png': image?.Body,
      'pass.json': Buffer.from(
        JSON.stringify({
          formatVersion: 1,
          passTypeIdentifier: 'pass.com.devprotocols.yourcard',
          teamIdentifier: '57Q4B5NF7G',
          organizationName: 'Your Card',
          description: 'Business Card',
          foregroundColor: 'rgb(0, 0, 0)',
          backgroundColor: 'rgb(130, 184, 236)',
          generic: {
            primaryFields: [
              {
                key: 'name',
                value: profile.name || '',
              },
            ],
            secondaryFields: [
              {
                key: 'jobTitle',
                value: profile.jobTitle || '',
              },
            ],
            auxiliaryFields: [
              {
                key: 'company',
                value: profile.company || '',
              },
            ],
            headerFields: [
              {
                key: 'title',
                value: profile.title || '',
              },
            ],
          },
        })
      ),
    },
    {
      wwdr,
      signerCert,
      signerKey,
      signerKeyPassphrase: '8852',
    },
    {
      serialNumber: profile.id,
    }
  );
  pass.setBarcodes(`${config.clientUrl}/${profile.id}`);

  return pass.getAsBuffer();
};
