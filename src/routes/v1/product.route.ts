import express, { Router } from 'express';
import { validate } from '../../modules/validate';
import { auth } from '../../modules/auth';
import { isProductOwner, isProfileOwner } from '../../modules/middleware';
import { productController, productValidation } from '../../modules/product';
import { upload } from '../../modules/utils';

const router: Router = express.Router();

router
  .route('/')
  .post(auth(), validate(productValidation.createProduct), upload.single('image'), productController.createProduct)
  .get(validate(productValidation.getProducts), productController.getProducts);

router
  .route('/reorder/:profileId')
  .patch(auth(), validate(productValidation.reorderProducts), isProfileOwner, productController.reorderProducts);

router
  .route('/:productId')
  .get(auth(), validate(productValidation.getProduct), productController.getProduct)
  .patch(
    auth(),
    validate(productValidation.updateProduct),
    isProductOwner,
    upload.single('image'),
    productController.updateProduct
  )
  .delete(auth(), validate(productValidation.deleteProduct), isProductOwner, productController.deleteProduct);

export default router;
