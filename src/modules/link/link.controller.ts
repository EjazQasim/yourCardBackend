import httpStatus from 'http-status';
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import catchAsync from '../utils/catchAsync';
import ApiError from '../errors/ApiError';
import * as linkService from './link.service';
import { pick } from '../utils';
import { IOptions } from '../paginate/paginate';
import { profileService } from '../profile';

export const createLink = catchAsync(async (req: Request, res: Response) => {
  const link = await linkService.createLink(req.body, req.files);
  res.status(httpStatus.CREATED).send(link);
});

export const getLinks = catchAsync(async (req: Request, res: Response) => {
  const profile = await profileService.getTeamProfile(new mongoose.Types.ObjectId(`${req.query['profile']}`));
  const profileIds = profile ? [req.query['profile'], profile.id] : [req.query['profile']];
  const filter = { profile: { $in: profileIds } };
  const options: IOptions = pick(req.query, ['sortBy', 'limit', 'page', 'projectBy']);
  const result = await linkService.queryLinks(filter, options);
  res.send(result);
});

export const getLink = catchAsync(async (req: Request, res: Response) => {
  if (typeof req.params['linkId'] === 'string') {
    const link = await linkService.getLinkById(new mongoose.Types.ObjectId(req.params['linkId']));
    if (!link) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Link not found');
    }
    res.send(link);
  }
});

export const updateLink = catchAsync(async (req: Request, res: Response) => {
  if (typeof req.params['linkId'] === 'string') {
    const link = await linkService.updateLinkById(new mongoose.Types.ObjectId(req.params['linkId']), req.body, req.files);
    res.send(link);
  }
});

export const deleteLink = catchAsync(async (req: Request, res: Response) => {
  if (typeof req.params['linkId'] === 'string') {
    await linkService.deleteLinkById(new mongoose.Types.ObjectId(req.params['linkId']));
    res.status(httpStatus.NO_CONTENT).send();
  }
});

export const reorderLinks = catchAsync(async (req: Request, res: Response) => {
  if (typeof req.params['profileId'] === 'string') {
    await linkService.reorderLinks(new mongoose.Types.ObjectId(req.params['profileId']), req.body);
    res.send({ message: 'Links updated successfully' });
  }
});
