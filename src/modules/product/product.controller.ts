import httpStatus from 'http-status';
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import catchAsync from '../utils/catchAsync';
import ApiError from '../errors/ApiError';
import * as productService from './product.service';
import { pick } from '../utils';
import { IOptions } from '../paginate/paginate';
import { profileService } from '../profile';

export const createProduct = catchAsync(async (req: Request, res: Response) => {
  const product = await productService.createProduct(req.body, req.file);
  res.status(httpStatus.CREATED).send(product);
});

export const getProducts = catchAsync(async (req: Request, res: Response) => {
  const profile = await profileService.getTeamProfile(new mongoose.Types.ObjectId(`${req.query['profile']}`));
  const profileIds = profile ? [req.query['profile'], profile.id] : [req.query['profile']];
  const filter = { profile: { $in: profileIds } };
  const options: IOptions = pick(req.query, ['sortBy', 'limit', 'page', 'projectBy']);
  const result = await productService.queryProducts(filter, options);
  res.send(result);
});

export const getProduct = catchAsync(async (req: Request, res: Response) => {
  if (typeof req.params['productId'] === 'string') {
    const product = await productService.getProductById(new mongoose.Types.ObjectId(req.params['productId']));
    if (!product) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
    }
    res.send(product);
  }
});

export const updateProduct = catchAsync(async (req: Request, res: Response) => {
  if (typeof req.params['productId'] === 'string') {
    const product = await productService.updateProductById(
      new mongoose.Types.ObjectId(req.params['productId']),
      req.body,
      req.file
    );
    res.send(product);
  }
});

export const deleteProduct = catchAsync(async (req: Request, res: Response) => {
  if (typeof req.params['productId'] === 'string') {
    await productService.deleteProductById(new mongoose.Types.ObjectId(req.params['productId']));
    res.status(httpStatus.NO_CONTENT).send();
  }
});

export const reorderProducts = catchAsync(async (req: Request, res: Response) => {
  if (typeof req.params['profileId'] === 'string') {
    await productService.reorderProducts(new mongoose.Types.ObjectId(req.params['profileId']), req.body);
    res.send({ message: 'Products updated successfully' });
  }
});
