import httpStatus from 'http-status';
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import catchAsync from '../utils/catchAsync';
import ApiError from '../errors/ApiError';
import * as leadService from './lead.service';
import { match, pick } from '../utils';
import { IOptions } from '../paginate/paginate';

export const createLead = catchAsync(async (req: Request, res: Response) => {
  const lead = await leadService.addLead(req.body);
  res.json({
    message: `${lead ? 'Connected' : 'Disconnected'} successfully`,
  });
});

export const getLeads = catchAsync(async (req: Request, res: Response) => {
  const filter = pick(req.query, ['user']);
  const options: IOptions = pick(req.query, ['sortBy', 'limit', 'page', 'projectBy']);
  const result = await leadService.queryLeads(filter, {
    ...options,
    populate: 'profile.direct.platform',
  });
  res.send(result);
});

export const getLead = catchAsync(async (req: Request, res: Response) => {
  if (typeof req.params['leadId'] === 'string') {
    const lead = await leadService.getLeadById(new mongoose.Types.ObjectId(req.params['leadId']));
    if (!lead) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Lead not found');
    }
    res.send(lead);
  }
});

export const updateLead = catchAsync(async (req: Request, res: Response) => {
  if (typeof req.params['leadId'] === 'string') {
    const lead = await leadService.updateLeadById(new mongoose.Types.ObjectId(req.params['leadId']), req.body, req.files);
    res.send(lead);
  }
});

export const deleteLead = catchAsync(async (req: Request, res: Response) => {
  if (typeof req.params['leadId'] === 'string') {
    await leadService.deleteLeadById(new mongoose.Types.ObjectId(req.params['leadId']));
    res.status(httpStatus.NO_CONTENT).send();
  }
});

export const getMyLeads = catchAsync(async (req: Request, res: Response) => {
  const filter = match(req.query, ['name']);
  const options: IOptions = pick(req.query, ['sortBy', 'limit', 'page', 'projectBy']);
  filter.user = req.user.id;
  const result = await leadService.queryLeads(filter, {
    ...options,
    populate: 'profile.direct.platform',
  });
  res.send(result);
});

export const getContactCard = catchAsync(async (req: Request, res: Response) => {
  if (typeof req.params['leadId'] === 'string') {
    const contactCard = await leadService.exportContactCard(new mongoose.Types.ObjectId(req.params['leadId']));
    res.set('Content-Type', `text/vcard; name="contact_card.vcf"`);
    res.set('Content-Disposition', `inline; filename="contact_card.vcf"`);
    res.send(contactCard);
  }
});
