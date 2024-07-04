import httpStatus from 'http-status';
import mongoose from 'mongoose';
import Link from './link.model';
import ApiError from '../errors/ApiError';
import { NewCreatedLink, UpdateLinkBody, ILinkDoc } from './link.interfaces';
import { uploadFile } from '../utils';
import { IOptions, QueryResult } from '../paginate/paginate';
import { profileService } from '../profile';

const populate = [
  {
    path: 'platform',
  },
];

/**
 * Create a link
 * @param {NewCreatedLink} linkBody
 * @param {any} files
 * @returns {Promise<ILinkDoc>}
 */
export const createLink = async (linkBody: NewCreatedLink, files: any): Promise<ILinkDoc> => {
  const body = linkBody;

  if (files) {
    const { image, file } = files || {};
    if (image) {
      body.image = await uploadFile(image[0], 'link');
    }
    if (file) {
      body.file = await uploadFile(file[0], 'file');
    }
  }

  return Link.create(body).then((t) => t.populate(populate));
};

/**
 * Query for links
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @returns {Promise<QueryResult>}
 */
export const queryLinks = async (filter: Record<string, any>, options: IOptions): Promise<QueryResult> => {
  const links = await Link.paginate(filter, { ...options, populate: 'platform' });
  return links;
};

/**
 * Get link by id
 * @param {mongoose.Types.ObjectId} id
 * @returns {Promise<ILinkDoc | null>}
 */
export const getLinkById = async (id: mongoose.Types.ObjectId): Promise<ILinkDoc | null> =>
  Link.findById(id).populate(populate);

/**
 * Update link by id
 * @param {mongoose.Types.ObjectId} linkId
 * @param {UpdateLinkBody} updateBody
 * @param {any} files
 * @returns {Promise<ILinkDoc | null>}
 */
export const updateLinkById = async (
  linkId: mongoose.Types.ObjectId,
  updateBody: UpdateLinkBody,
  files: any
): Promise<ILinkDoc | null> => {
  const body = updateBody;
  const link = await getLinkById(linkId);
  if (!link) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Link not found');
  }

  if (files) {
    const { image, file } = files || {};
    if (image) {
      body.image = await uploadFile(image[0], 'link');
    }
    if (file) {
      body.file = await uploadFile(file[0], 'file');
    }
  }

  Object.assign(link, body);
  await link.save().then((t) => t.populate(populate));
  return link;
};

/**
 * Delete link by id
 * @param {mongoose.Types.ObjectId} linkId
 * @returns {Promise<ILinkDoc | null>}
 */
export const deleteLinkById = async (linkId: mongoose.Types.ObjectId): Promise<ILinkDoc | null> => {
  const link = await getLinkById(linkId);
  if (!link) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Link not found');
  }
  await link.deleteOne();
  return link;
};

/**
 * Reorder profile's links
 * @param {mongoose.Types.ObjectId} profileId
 * @param {UpdateProfileBody} body
 * @returns {Promise<void>}
 */
export const reorderLinks = async (profileId: mongoose.Types.ObjectId, body: any): Promise<void> => {
  const profile = await profileService.getProfileById(profileId);
  if (!profile) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Profile not found');
  }
  await Promise.all(
    Array.from(body.orderedLinks, async (linkId, i) => {
      const link = await Link.findById(linkId);
      if (link && link.profile.toString() === profileId.toString()) {
        link.position = i;
        await link.save();
      }
    })
  );
};
