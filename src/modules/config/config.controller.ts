import { Request, Response } from 'express';
import catchAsync from '../utils/catchAsync';
import * as configService from './config.service';

export const getConfigs = catchAsync(async (_req: Request, res: Response) => {
  const configs = await configService.getConfigs();
  res.json(configs);
});

export const updateConfigs = catchAsync(async (req: Request, res: Response) => {
  const configs = await configService.updateConfigs(req.body);
  res.json(configs);
});
