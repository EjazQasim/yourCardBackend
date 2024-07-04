import httpStatus from 'http-status';
import mongoose from 'mongoose';
import Tag from './tag.model';
import ApiError from '../errors/ApiError';
import { NewCreatedTag, UpdateTagBody, ITagDoc } from './tag.interfaces';
import { IOptions, QueryResult } from '../paginate/paginate';

/**
 * Create a tag
 * @param {NewCreatedTag} tagBody
 * @returns {Promise<ITagDoc>}
 */
export const createTag = async (tagBody: NewCreatedTag): Promise<ITagDoc> => {
  return Tag.create(tagBody);
};

/**
 * Query for tags
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @returns {Promise<QueryResult>}
 */
export const queryTags = async (filter: Record<string, any>, options: IOptions): Promise<QueryResult> => {
  const tags = await Tag.paginate(filter, options);
  return tags;
};

/**
 * Get tag by id
 * @param {mongoose.Types.ObjectId} id
 * @returns {Promise<ITagDoc | null>}
 */
export const getTagById = async (id: mongoose.Types.ObjectId): Promise<ITagDoc | null> => Tag.findById(id);

/**
 * Get tag by customId
 * @param {mongoose.Types.ObjectId} customId
 * @returns {Promise<ITagDoc | null>}
 */
export const getTagByCustomId = async (customId: string): Promise<ITagDoc | null> => Tag.findOne({ customId });

/**
 * Update tag by id
 * @param {mongoose.Types.ObjectId} tagId
 * @param {UpdateTagBody} updateBody
 * @returns {Promise<ITagDoc | null>}
 */
export const updateTagById = async (tagId: mongoose.Types.ObjectId, updateBody: UpdateTagBody): Promise<ITagDoc | null> => {
  const tag = await getTagById(tagId);
  if (!tag) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Tag not found');
  }

  Object.assign(tag, updateBody);
  await tag.save();
  return tag;
};

/**
 * Delete tag by id
 * @param {mongoose.Types.ObjectId} tagId
 * @returns {Promise<ITagDoc | null>}
 */
export const deleteTagById = async (tagId: mongoose.Types.ObjectId): Promise<ITagDoc | null> => {
  const tag = await getTagById(tagId);
  if (!tag) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Tag not found');
  }
  await tag.deleteOne();
  return tag;
};

/**
 * Link tag by id
 * @param {mongoose.Types.ObjectId} tagId
 * @param {mongoose.Types.ObjectId} userId
 * @returns {Promise<ITagDoc | null>}
 */
export const linkTagById = async (
  tagId: mongoose.Types.ObjectId,
  userId: mongoose.Types.ObjectId
): Promise<ITagDoc | null> => {
  const tag = await getTagById(tagId);
  if (!tag) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Tag not found');
  }
  if (tag.user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'This device is already activated.');
  }
  Object.assign(tag, { user: userId });
  await tag.save();
  return tag;
};

/**
 * Unlink tag by id
 * @param {mongoose.Types.ObjectId} tagId
 * @returns {Promise<ITagDoc | null>}
 */
export const unlinkTagById = async (tagId: mongoose.Types.ObjectId): Promise<ITagDoc | null> => {
  return Tag.findByIdAndUpdate(tagId, { $unset: { user: 1 } });
};
