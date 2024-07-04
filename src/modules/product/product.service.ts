import httpStatus from 'http-status';
import mongoose from 'mongoose';
import Product from './product.model';
import ApiError from '../errors/ApiError';
import { NewCreatedProduct, UpdateProductBody, IProductDoc } from './product.interfaces';
import { uploadFile } from '../utils';
import { IOptions, QueryResult } from '../paginate/paginate';
import { profileService } from '../profile';

/**
 * Create a product
 * @param {NewCreatedProduct} productBody
 * @param {any} file
 * @returns {Promise<IProductDoc>}
 */
export const createProduct = async (productBody: NewCreatedProduct, file: any): Promise<IProductDoc> => {
  const body = productBody;

  if (file) {
    body.image = await uploadFile(file, 'product');
  }

  return Product.create(body);
};

/**
 * Query for products
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @returns {Promise<QueryResult>}
 */
export const queryProducts = async (filter: Record<string, any>, options: IOptions): Promise<QueryResult> => {
  const products = await Product.paginate(filter, options);
  return products;
};

/**
 * Get product by id
 * @param {mongoose.Types.ObjectId} id
 * @returns {Promise<IProductDoc | null>}
 */
export const getProductById = async (id: mongoose.Types.ObjectId): Promise<IProductDoc | null> => Product.findById(id);

/**
 * Update product by id
 * @param {mongoose.Types.ObjectId} productId
 * @param {UpdateProductBody} updateBody
 * @param {any} files
 * @returns {Promise<IProductDoc | null>}
 */
export const updateProductById = async (
  productId: mongoose.Types.ObjectId,
  updateBody: UpdateProductBody,
  file: any
): Promise<IProductDoc | null> => {
  const body = updateBody;
  const product = await getProductById(productId);
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }

  if (file) {
    body.image = await uploadFile(file, 'product');
  }

  Object.assign(product, body);
  await product.save();
  return product;
};

/**
 * Delete product by id
 * @param {mongoose.Types.ObjectId} productId
 * @returns {Promise<IProductDoc | null>}
 */
export const deleteProductById = async (productId: mongoose.Types.ObjectId): Promise<IProductDoc | null> => {
  const product = await getProductById(productId);
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }
  await product.deleteOne();
  return product;
};

/**
 * Reorder profile's links
 * @param {mongoose.Types.ObjectId} profileId
 * @param {UpdateProfileBody} body
 * @returns {Promise<void>}
 */
export const reorderProducts = async (profileId: mongoose.Types.ObjectId, body: any): Promise<void> => {
  const profile = await profileService.getProfileById(profileId);
  if (!profile) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Profile not found');
  }
  await Promise.all(
    Array.from(body.orderedProducts, async (productId, i) => {
      const product = await Product.findById(productId);
      if (product && product.profile.toString() === profileId.toString()) {
        product.position = i;
        await product.save();
      }
    })
  );
};
